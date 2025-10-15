const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');
const { verifyRecaptchaEnterprise } = require('../utils/recaptchaEnterprise');

const db = admin.firestore();

// reCAPTCHA Enterprise configuration
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25';
const RECAPTCHA_PROJECT_ID = 'future-step-nursery';

const validateSubmission = (data) => {
    const requiredFields = ['fullName', 'phoneNumber', 'emailAddress', 'jobTitle', 'message'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return { isValid: false, message: `Missing required field: ${field}` };
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emailAddress)) {
        return { isValid: false, message: 'Invalid email address format' };
    }
    
    return { isValid: true };
};

const submitCareerForm = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const submissionData = req.body;
    
    // Verify reCAPTCHA Enterprise
    const recaptchaResult = await verifyRecaptchaEnterprise(
        submissionData.recaptchaToken,
        RECAPTCHA_SITE_KEY,
        'submit_career',
        RECAPTCHA_PROJECT_ID,
        {
            userIpAddress: req.ip,
            userAgent: req.get('user-agent'),
            minScore: 0.5
        }
    );
    
    if (!recaptchaResult.success) {
        console.error('reCAPTCHA Enterprise verification failed:', recaptchaResult.error);
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }
    
    console.log('reCAPTCHA Enterprise verification successful:', {
        score: recaptchaResult.score,
        reasons: recaptchaResult.reasons
    });
    
    const validation = validateSubmission(submissionData);
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.message });
    }

    try {
        const careerRef = db.collection('careerSubmissions').doc();
        const newSubmission = {
            id: careerRef.id,
            fullName: submissionData.fullName,
            phoneNumber: submissionData.phoneNumber,
            emailAddress: submissionData.emailAddress,
            jobTitle: submissionData.jobTitle,
            message: submissionData.message,
            resumeUrl: submissionData.resumeUrl || null, // Optional file upload
            recaptchaScore: recaptchaResult.score,
            status: 'new',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        await careerRef.set(newSubmission);
        return res.status(201).json({ 
            message: 'Career application submitted successfully', 
            submissionId: careerRef.id 
        });
    } catch (error) {
        console.error('Error submitting career form:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const listCareerSubmissions = async () => {
    const snapshot = await db.collection('careerSubmissions').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
};

const updateCareerSubmissionStatus = async (id, status) => {
    if (!id || !status) {
        throw new Error('Missing id or status');
    }
    const validStatuses = ['new', 'reviewed', 'interviewed', 'hired', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
    }
    await db.collection('careerSubmissions').doc(id).update({ 
        status, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
    return { id, status };
};

const deleteCareerSubmission = async (id) => {
    if (!id) {
        throw new Error('Missing id');
    }
    await db.collection('careerSubmissions').doc(id).delete();
    return { id };
};

const manageCareerSubmissions = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const authResult = await authenticate(req, res);
    if (authResult.error) {
        return res.status(authResult.error.status).json({ error: authResult.error.message });
    }

    const roleResult = requireRole(authResult.decodedToken, ['admin', 'superadmin']);
    if (roleResult.error) {
        return res.status(roleResult.error.status).json({ error: roleResult.error.message });
    }

    try {
        if (req.method === 'GET') {
            const careerSubmissions = await listCareerSubmissions();
            return res.status(200).json({ careerSubmissions });
        }

        if (req.method === 'POST') {
            const { operation, id, status } = req.body;
            switch (operation) {
                case 'updateStatus':
                    const updated = await updateCareerSubmissionStatus(id, status);
                    return res.status(200).json(updated);
                case 'delete':
                    const deleted = await deleteCareerSubmission(id);
                    return res.status(200).json(deleted);
                default:
                    return res.status(400).json({ error: 'Invalid operation' });
            }
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Error managing career submissions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = {
    submitCareerForm,
    manageCareerSubmissions,
};