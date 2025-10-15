const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const { setCorsHeaders } = require('./utils/cors');

const db = admin.firestore();

/**
 * Verify reCAPTCHA token with Google's API
 */
const verifyRecaptcha = async (token, secretKey) => {
    try {
        console.log('[reCAPTCHA Debug] Verifying token with Google API...');
        console.log('[reCAPTCHA Debug] Token length:', token?.length || 0);
        console.log('[reCAPTCHA Debug] Secret key configured:', secretKey ? 'YES (length: ' + secretKey.length + ')' : 'NO');
        
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: secretKey,
                response: token,
            },
        });

        console.log('[reCAPTCHA Debug] Google API response received');
        console.log('[reCAPTCHA Debug] Verification success:', response.data.success);
        if (response.data['error-codes']) {
            console.log('[reCAPTCHA Debug] Error codes:', response.data['error-codes']);
        }
        if (response.data.score !== undefined) {
            console.log('[reCAPTCHA Debug] Score detected (v3):', response.data.score);
            console.warn('[reCAPTCHA WARNING] This appears to be a v3 response, but implementation expects v2!');
        }
        if (response.data.challenge_ts) {
            console.log('[reCAPTCHA Debug] Challenge timestamp:', response.data.challenge_ts);
        }

        return response.data;
    } catch (error) {
        console.error('[reCAPTCHA Debug] Error verifying reCAPTCHA:', error);
        throw new Error('Failed to verify reCAPTCHA');
    }
};

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
 * Generic function to handle all public form submissions with reCAPTCHA verification
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

    console.log('[reCAPTCHA Debug] Form submission received');
    console.log('[reCAPTCHA Debug] Implementation type: reCAPTCHA v2 (Checkbox expected)');

    const { formData, recaptchaToken, formType } = req.body;

    // Validate required parameters
    if (!formData || !recaptchaToken || !formType) {
        console.log('[reCAPTCHA Debug] Missing parameters - formData:', !!formData, 'token:', !!recaptchaToken, 'formType:', formType);
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('[reCAPTCHA Debug] Form type:', formType);
    console.log('[reCAPTCHA Debug] Token received (first 20 chars):', recaptchaToken.substring(0, 20) + '...');

    if (!['admission', 'career', 'contact'].includes(formType)) {
        return res.status(400).json({ error: 'Invalid form type' });
    }

    try {
        // Check if secret key is configured
        const recaptchaSecret = functions.config().recaptcha?.secret;
        console.log('[reCAPTCHA Debug] Secret key found in config:', recaptchaSecret ? 'YES' : 'NO');
        
        if (!recaptchaSecret) {
            console.error('[reCAPTCHA Debug] Secret key not configured! Run: firebase functions:config:set recaptcha.secret="YOUR_SECRET"');
            return res.status(500).json({ error: 'reCAPTCHA not configured on server' });
        }

        // Verify reCAPTCHA token
        const verificationResult = await verifyRecaptcha(recaptchaToken, recaptchaSecret);

        if (!verificationResult.success) {
            console.error('reCAPTCHA verification failed:', verificationResult['error-codes']);
            return res.status(400).json({ 
                error: 'reCAPTCHA verification failed. Please try again.' 
            });
        }

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
