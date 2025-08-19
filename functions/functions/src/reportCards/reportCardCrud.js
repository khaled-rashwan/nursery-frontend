const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');

const db = admin.firestore();


const manageReportCards = functions.https.onRequest(async (req, res) => {
    console.log('manageReportCards called', req.method, req.query, req.body);
    setCorsHeaders(res);
    if (handleCorsOptions(req, res)) return;

    const authResult = await authenticate(req, res);
    if (authResult.error) {
        return res.status(authResult.error.status).json({ error: authResult.error.message });
    }


    // Allow teachers, admins, superadmins for all, parents for list only
    const allowedRoles = ['admin', 'superadmin', 'teacher', 'parent'];
    const roleResult = requireRole(authResult.decodedToken, allowedRoles);
    if (roleResult.error) {
        return res.status(roleResult.error.status).json({ error: roleResult.error.message });
    }

    const { operation } = req.query;

    try {
        switch (operation) {
            case 'list':
                return await listReportCards(req, res, authResult, roleResult.role);
            case 'create':
            case 'update':
            case 'delete':
                if (roleResult.role === 'parent') {
                    return res.status(403).json({ error: 'Parents cannot modify report cards' });
                }
                if (operation === 'create') return await createReportCard(req, res, authResult);
                if (operation === 'update') return await updateReportCard(req, res, authResult);
                if (operation === 'delete') return await deleteReportCard(req, res, authResult);
                break;
            default:
                return res.status(400).json({ error: 'Invalid operation' });
        }
    } catch (error) {
        console.error('Error in manageReportCards:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

const listReportCards = async (req, res, authResult, role) => {
    try {
        const { studentId, academicYear } = req.query;
        if (!studentId || !academicYear) {
            return res.status(400).json({ error: 'Missing required query params' });
        }
        // If parent, only allow access to their own children
        if (role === 'parent') {
            // Get the student doc and check parentUID
            const studentDoc = await db.collection('students').doc(studentId).get();
            if (!studentDoc.exists || studentDoc.data().parentUID !== authResult.decodedToken.uid) {
                return res.status(403).json({ error: 'Forbidden: You can only view your own child\'s report cards' });
            }
        }
        const snapshot = await db.collection('reportCards')
            .where('studentId', '==', studentId)
            .where('academicYear', '==', academicYear)
            .get();
        const reportCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ reportCards });
    } catch (error) {
        console.error('Error listing report cards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createReportCard = async (req, res, authResult) => {
    try {
        const { studentId, academicYear, period, grades, overallPerformance, comments } = req.body;
        if (!studentId || !academicYear || !period || !grades) {
            console.error('Missing required fields in createReportCard:', req.body);
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const docId = `${academicYear}_${studentId}_${period}`;
        await db.collection('reportCards').doc(docId).set({
            studentId,
            academicYear,
            period,
            grades,
            overallPerformance: overallPerformance || '',
            comments: comments || '',
            createdBy: authResult.decodedToken.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error creating report card:', error, req.body);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const updateReportCard = async (req, res, authResult) => {
    try {
        const { studentId, academicYear, period, grades, overallPerformance, comments } = req.body;
        if (!studentId || !academicYear || !period || !grades) {
            console.error('Missing required fields in updateReportCard:', req.body);
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const docId = `${academicYear}_${studentId}_${period}`;
        await db.collection('reportCards').doc(docId).update({
            grades,
            overallPerformance: overallPerformance || '',
            comments: comments || '',
            updatedBy: authResult.decodedToken.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating report card:', error, req.body);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const deleteReportCard = async (req, res, authResult) => {
    try {
        const { studentId, academicYear, period } = req.body;
        if (!studentId || !academicYear || !period) {
            console.error('Missing required fields in deleteReportCard:', req.body);
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const docId = `${academicYear}_${studentId}_${period}`;
        await db.collection('reportCards').doc(docId).delete();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting report card:', error, req.body);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = { manageReportCards };
