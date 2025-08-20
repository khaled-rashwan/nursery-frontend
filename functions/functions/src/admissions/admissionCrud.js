const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, isAuthorized } = require('../utils/auth');

const db = admin.firestore();

const validateSubmission = (data) => {
    const requiredFields = ['parentName', 'email', 'phone', 'relationship'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return { isValid: false, message: `Missing required field: ${field}` };
        }
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        return { isValid: false, message: 'Invalid email format' };
    }
    return { isValid: true };
};

const submitAdmission = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);
    if (handleCorsOptions(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const submissionData = req.body;
    const validation = validateSubmission(submissionData);
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.message });
    }

    try {
        const admissionRef = db.collection('admissions').doc();
        const newSubmission = {
            id: admissionRef.id,
            ...submissionData,
            status: 'new',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await admissionRef.set(newSubmission);
        return res.status(201).json({ message: 'Admission submitted successfully', submissionId: admissionRef.id });
    } catch (error) {
        console.error('Error submitting admission:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const listAdmissions = async () => {
    const snapshot = await db.collection('admissions').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
};

const updateAdmissionStatus = async (id, status) => {
    if (!id || !status) {
        throw new Error('Missing id or status');
    }
    const validStatuses = ['new', 'contacted', 'enrolled', 'rejected'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
    }
    await db.collection('admissions').doc(id).update({ status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { id, status };
};

const deleteAdmission = async (id) => {
    if (!id) {
        throw new Error('Missing id');
    }
    await db.collection('admissions').doc(id).delete();
    return { id };
};

const manageAdmissions = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);
    if (handleCorsOptions(req, res)) return;

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!isAuthorized(authResult.decodedToken, ['admin', 'superadmin'])) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { operation, id, status } = req.body;

    try {
        switch (req.method) {
            case 'GET':
                const admissions = await listAdmissions();
                return res.status(200).json({ admissions });
            case 'POST':
                 switch (operation) {
                    case 'updateStatus':
                        const updated = await updateAdmissionStatus(id, status);
                        return res.status(200).json(updated);
                    case 'delete':
                        const deleted = await deleteAdmission(id);
                        return res.status(200).json(deleted);
                    default:
                        return res.status(400).json({ error: 'Invalid operation' });
                }
            default:
                return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error managing admissions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = {
    submitAdmission,
    manageAdmissions,
};
