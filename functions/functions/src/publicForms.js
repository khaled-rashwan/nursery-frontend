const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders } = require('./utils/cors');
const { verifyRecaptchaEnterprise } = require('./utils/recaptchaEnterprise');

const db = admin.firestore();

/**
 * Validate admission form data
 */
const validateAdmissionData = (data) => {
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

/**
 * Validate career form data
 */
const validateCareerData = (data) => {
    const requiredFields = ['fullName', 'phoneNumber', 'emailAddress', 'jobTitle', 'message'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return { isValid: false, message: `Missing required field: ${field}` };
        }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emailAddress)) {
        return { isValid: false, message: 'Invalid email address format' };
    }
    return { isValid: true };
};

/**
 * Validate contact form data
 */
const validateContactData = (data) => {
    const requiredFields = ['fullName', 'phoneNumber', 'message'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return { isValid: false, message: `Missing required field: ${field}` };
        }
    }
    return { isValid: true };
};

/**
 * Generic function to handle all public form submissions with reCAPTCHA Enterprise verification
 */
const submitPublicForm = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log('[reCAPTCHA Enterprise] Form submission received');

    const { formData, recaptchaToken, formType } = req.body;

    // Validate required parameters
    if (!formData || !recaptchaToken || !formType) {
        console.log('[reCAPTCHA Enterprise] Missing parameters - formData:', !!formData, 'token:', !!recaptchaToken, 'formType:', formType);
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('[reCAPTCHA Enterprise] Form type:', formType);
    console.log('[reCAPTCHA Enterprise] Token received (first 20 chars):', recaptchaToken.substring(0, 20) + '...');

    if (!['admission', 'career', 'contact'].includes(formType)) {
        return res.status(400).json({ error: 'Invalid form type' });
    }

    try {
        // Get configuration for reCAPTCHA Enterprise
        const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'future-step-nursery';
        const siteKey = process.env.RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25';
        
        console.log('[reCAPTCHA Enterprise] Using project ID:', projectId);
        console.log('[reCAPTCHA Enterprise] Using site key:', siteKey);

        // Determine expected action based on form type
        let expectedAction;
        switch (formType) {
            case 'admission':
                expectedAction = 'submit_admission';
                break;
            case 'career':
                expectedAction = 'submit_career';
                break;
            case 'contact':
                expectedAction = 'submit_contact';
                break;
        }

        // Get user IP address for enhanced risk assessment (optional)
        const userIpAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
        const userAgent = req.headers['user-agent'];

        // Verify reCAPTCHA Enterprise token
        const verificationResult = await verifyRecaptchaEnterprise(
            recaptchaToken,
            siteKey,
            expectedAction,
            projectId,
            {
                userIpAddress,
                userAgent,
                minScore: 0.5
            }
        );

        if (!verificationResult.success) {
            console.error('[reCAPTCHA Enterprise] Verification failed:', verificationResult.error);
            return res.status(400).json({ 
                error: 'reCAPTCHA verification failed. Please try again.' 
            });
        }

        console.log('[reCAPTCHA Enterprise] Verification successful. Score:', verificationResult.score);

        // Validate form data based on type
        let validation;
        let collectionName;
        let successMessage;

        switch (formType) {
            case 'admission':
                validation = validateAdmissionData(formData);
                collectionName = 'admissions';
                successMessage = 'Admission submitted successfully';
                break;

            case 'career':
                validation = validateCareerData(formData);
                collectionName = 'careerSubmissions';
                successMessage = 'Career application submitted successfully';
                break;

            case 'contact':
                validation = validateContactData(formData);
                collectionName = 'contactSubmissions';
                successMessage = 'Contact form submitted successfully';
                break;
        }

        if (!validation.isValid) {
            return res.status(400).json({ error: validation.message });
        }

        // Save to appropriate Firestore collection
        const docRef = db.collection(collectionName).doc();
        const newSubmission = {
            id: docRef.id,
            ...formData,
            status: 'new',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await docRef.set(newSubmission);

        return res.status(201).json({ 
            message: successMessage, 
            submissionId: docRef.id 
        });

    } catch (error) {
        console.error('Error processing form submission:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = {
    submitPublicForm,
};
