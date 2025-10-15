const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');
const { verifyRecaptchaV3 } = require('../utils/recaptcha');

const db = admin.firestore();

/**
 * Verify reCAPTCHA token with Google's API
 * @param {string} token - The reCAPTCHA token to verify
 * @returns {Promise<boolean>} - True if verification succeeds, false otherwise
 */
const verifyRecaptcha = async (token) => {
    if (!token) {
        return false;
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY || functions.config().recaptcha?.secret_key;
    
    if (!secretKey) {
        console.warn('reCAPTCHA secret key not configured, skipping verification');
        return true; // Allow submission if secret not configured
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${token}`,
        });

        const data = await response.json();
        
        // For reCAPTCHA v3, check both success and score (score > 0.5 is generally acceptable)
        if (data.success && data.score !== undefined) {
            return data.score > 0.5;
        }
        
        return data.success || false;
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return false;
    }
};

const validateSubmission = (data) => {
    const requiredFields = ['fullName', 'phoneNumber', 'message'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return { isValid: false, message: `Missing required field: ${field}` };
        }
    }
    return { isValid: true };
};

const submitContactForm = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const submissionData = req.body;
    
    // Verify reCAPTCHA v3
    const recaptchaResult = await verifyRecaptchaV3(
        submissionData.recaptchaToken,
        'submit_contact',
        0.5
    );
    
    if (!recaptchaResult.success) {
        console.error('reCAPTCHA verification failed:', recaptchaResult.error);
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }
    
    console.log('reCAPTCHA verification successful:', {
        score: recaptchaResult.score,
        action: recaptchaResult.action
    });
    
    const validation = validateSubmission(submissionData);
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.message });
    }

    try {
        const contactRef = db.collection('contactSubmissions').doc();
        
        // Prepare data for storage, excluding recaptchaToken
        const dataToStore = { ...submissionData };
        delete dataToStore.recaptchaToken;
        
        const newSubmission = {
            id: contactRef.id,
            ...submissionData,
            recaptchaScore: recaptchaResult.score,
            status: 'new',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // Remove recaptchaToken from stored data
        delete newSubmission.recaptchaToken;
        
        await contactRef.set(newSubmission);
        return res.status(201).json({ message: 'Contact form submitted successfully', submissionId: contactRef.id });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const listContactSubmissions = async () => {
    const snapshot = await db.collection('contactSubmissions').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
};

const updateContactSubmissionStatus = async (id, status) => {
    if (!id || !status) {
        throw new Error('Missing id or status');
    }
    const validStatuses = ['new', 'replied', 'resolved', 'archived'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
    }
    await db.collection('contactSubmissions').doc(id).update({ 
        status, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
    return { id, status };
};

const deleteContactSubmission = async (id) => {
    if (!id) {
        throw new Error('Missing id');
    }
    await db.collection('contactSubmissions').doc(id).delete();
    return { id };
};

const manageContactSubmissions = functions.https.onRequest(async (req, res) => {
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
            const contactSubmissions = await listContactSubmissions();
            return res.status(200).json({ contactSubmissions });
        }

        if (req.method === 'POST') {
            const { operation, id, status } = req.body;
            switch (operation) {
                case 'updateStatus':
                    const updated = await updateContactSubmissionStatus(id, status);
                    return res.status(200).json(updated);
                case 'delete':
                    const deleted = await deleteContactSubmission(id);
                    return res.status(200).json(deleted);
                default:
                    return res.status(400).json({ error: 'Invalid operation' });
            }
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Error managing contact submissions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = {
    submitContactForm,
    manageContactSubmissions,
};