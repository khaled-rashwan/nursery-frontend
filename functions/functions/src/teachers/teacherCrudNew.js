const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireAdmin } = require('../utils/auth');
const { canManageEnrollments } = require('../utils/permissions');

const db = admin.firestore();

const manageTeachers = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);
    if (handleCorsOptions(req, res)) return;

    const authResult = await authenticate(req, res);
    if (authResult.error) {
        return res.status(authResult.error.status).json({ error: authResult.error.message });
    }

    const { canViewEnrollments, canManageEnrollments } = require('../utils/permissions');
    const decoded = authResult.decodedToken;
    const userRole = decoded.role || (decoded.customClaims && decoded.customClaims.role) || 'user';
    const { operation } = req.query;

    try {
        switch (operation) {
            case 'get': {
                let teacherId = req.query.teacherId;
                // Teachers can fetch their own record
                if (userRole === 'teacher') {
                    teacherId = decoded.uid;
                    if (!canViewEnrollments(userRole)) {
                        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
                    }
                }
                // Admins/superadmins can fetch any teacher
                if ((userRole === 'admin' || userRole === 'superadmin')) {
                    if (!canViewEnrollments(userRole)) {
                        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
                    }
                }
                if (!teacherId) {
                    return res.status(400).json({ error: 'Missing teacherId' });
                }
                return await getTeacher({ ...req, query: { teacherId } }, res, authResult);
            }
            case 'list': {
                // Only admin/superadmin can list all teachers
                if (!canManageEnrollments(userRole)) {
                    return res.status(403).json({ error: 'Forbidden: Only administrators can list teachers' });
                }
                return await listTeachers(req, res, authResult);
            }
            case 'update': {
                // Only admin/superadmin can update teachers
                if (!canManageEnrollments(userRole)) {
                    return res.status(403).json({ error: 'Forbidden: Only administrators can update teachers' });
                }
                return await updateTeacher(req, res, authResult);
            }
            default:
                return res.status(400).json({ error: 'Invalid operation. Supported: list, update, get' });
        }
    } catch (error) {
        console.error('Error in manageTeachers:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * List all teachers by combining Firebase Auth user data with teachers collection data
 */
const listTeachers = async (req, res, authResult) => {
    try {
        // Get all users with teacher role from Firebase Auth
        const listUsersResult = await admin.auth().listUsers();
        const teacherUsers = listUsersResult.users.filter(user => 
            user.customClaims && user.customClaims.role === 'teacher'
        );

        if (teacherUsers.length === 0) {
            return res.json({ teachers: [] });
        }

        // Get teacher-specific data from teachers collection
        const teacherUIDs = teacherUsers.map(user => user.uid);
        const teachersData = {};
        
        // Batch get teacher documents
        const teacherDocs = await Promise.all(
            teacherUIDs.map(uid => db.collection('teachers').doc(uid).get())
        );

        teacherDocs.forEach((doc, index) => {
            const uid = teacherUIDs[index];
            teachersData[uid] = doc.exists ? doc.data() : { classes: [] };
        });

        // Combine Auth data with teacher-specific data
        const teachers = teacherUsers.map(user => ({
            id: user.uid,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            disabled: user.disabled,
            emailVerified: user.emailVerified,
            createdAt: user.metadata.creationTime,
            lastSignIn: user.metadata.lastSignInTime,
            // Teacher-specific data
            classes: teachersData[user.uid]?.classes || [],
            assignedAt: teachersData[user.uid]?.assignedAt,
            updatedAt: teachersData[user.uid]?.updatedAt
        }));

        res.json({ teachers });
    } catch (error) {
        console.error('Error listing teachers:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

/**
 * Get a specific teacher by UID
 */
const getTeacher = async (req, res, authResult) => {
    try {
        const { teacherId } = req.query;
        
        if (!teacherId) {
            return res.status(400).json({ error: 'Teacher ID is required' });
        }

        // Get user data from Firebase Auth
        const userRecord = await admin.auth().getUser(teacherId);
        
        // Verify user has teacher role
        if (!userRecord.customClaims || userRecord.customClaims.role !== 'teacher') {
            return res.status(404).json({ error: 'Teacher not found or user is not a teacher' });
        }

        // Get teacher-specific data
        const teacherDoc = await db.collection('teachers').doc(teacherId).get();
        const teacherData = teacherDoc.exists ? teacherDoc.data() : { classes: [] };

        const teacher = {
            id: userRecord.uid,
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            phoneNumber: userRecord.phoneNumber,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            emailVerified: userRecord.emailVerified,
            createdAt: userRecord.metadata.creationTime,
            lastSignIn: userRecord.metadata.lastSignInTime,
            // Teacher-specific data
            classes: teacherData.classes || [],
            assignedAt: teacherData.assignedAt,
            updatedAt: teacherData.updatedAt
        };

        res.json({ teacher });
    } catch (error) {
        console.error('Error getting teacher:', error);
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

/**
 * Update teacher-specific data (classes, subjects, etc.)
 * Note: User profile data (name, email) should be updated via user management API
 */
const updateTeacher = async (req, res, authResult) => {
    try {
        const { teacherId, teacherData } = req.body;
        
        if (!teacherId || !teacherData) {
            return res.status(400).json({ error: 'Teacher ID and data are required' });
        }

        // Verify user exists and has teacher role
        const userRecord = await admin.auth().getUser(teacherId);
        if (!userRecord.customClaims || userRecord.customClaims.role !== 'teacher') {
            return res.status(404).json({ error: 'Teacher not found or user is not a teacher' });
        }

        // Prepare update data (only teacher-specific fields)
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Only update allowed teacher-specific fields
        if (teacherData.classes !== undefined) {
            updateData.classes = teacherData.classes;
        }

        // Update teacher document
        const teacherRef = db.collection('teachers').doc(teacherId);
        const teacherDoc = await teacherRef.get();
        
        if (!teacherDoc.exists) {
            // Create teacher record if it doesn't exist
            updateData.assignedAt = admin.firestore.FieldValue.serverTimestamp();
            updateData.createdBy = 'manual_update';
            if (!updateData.classes) {
                updateData.classes = [];
            }
        }

        await teacherRef.set(updateData, { merge: true });

        res.json({ 
            message: 'Teacher updated successfully',
            teacherId: teacherId,
            updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = {
    manageTeachers
};
