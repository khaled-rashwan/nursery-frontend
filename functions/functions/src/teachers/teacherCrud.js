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

    const roleResult = requireAdmin(authResult.decodedToken);
    if (roleResult.error) {
        return res.status(roleResult.error.status).json({ error: roleResult.error.message });
    }

    if (!canManageEnrollments(roleResult.role)) {
        return res.status(403).json({ error: 'Forbidden: Only administrators can manage teachers' });
    }

    const { operation } = req.query;

    try {
        switch (operation) {
            case 'list':
                return await listTeachers(req, res, authResult);
            case 'create':
                return await createTeacher(req, res, authResult);
            case 'update':
                return await updateTeacher(req, res, authResult);
            default:
                return res.status(400).json({ error: 'Invalid operation' });
        }
    } catch (error) {
        console.error('Error in manageTeachers:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

const listTeachers = async (req, res, authResult) => {
    try {
        const snapshot = await db.collection('teachers').get();
        if (snapshot.empty) {
            return res.json({ teachers: [] });
        }
        const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ teachers });
    } catch (error) {
        console.error('Error listing teachers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createTeacher = async (req, res, authResult) => {
    try {
        const { teacherData } = req.body;
        if (!teacherData || !teacherData.email || !teacherData.displayName) {
            return res.status(400).json({ error: 'Email and display name are required' });
        }

        const userRecord = await admin.auth().createUser({
            email: teacherData.email,
            displayName: teacherData.displayName,
            password: 'password123' // A temporary password
        });

        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'teacher' });

        const teacherDoc = {
            name: teacherData.displayName,
            email: teacherData.email,
            classes: []
        };
        await db.collection('teachers').doc(userRecord.uid).set(teacherDoc);

        res.status(201).json({ message: 'Teacher created successfully', teacher: { id: userRecord.uid, ...teacherDoc } });
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateTeacher = async (req, res, authResult) => {
    try {
        const { teacherId, teacherData } = req.body;
        if (!teacherId || !teacherData) {
            return res.status(400).json({ error: 'Teacher ID and data are required' });
        }

        const teacherRef = db.collection('teachers').doc(teacherId);
        await teacherRef.update(teacherData);

        res.json({ message: 'Teacher updated successfully' });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    manageTeachers
};
