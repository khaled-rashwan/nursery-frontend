const axios = require('axios');
const functions = require('firebase-functions');

/**
 * Verify reCAPTCHA v3 token
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} expectedAction - The expected action name
 * @param {number} minScore - Minimum score threshold (default: 0.5)
 * @returns {Promise<{success: boolean, score?: number, action?: string, error?: string}>}
 */
const verifyRecaptchaV3 = async (token, expectedAction, minScore = 0.5) => {
  try {
    // Get secret key from Firebase config
    const secretKey = functions.config().recaptcha?.secret;
    
    if (!secretKey) {
      console.error('reCAPTCHA secret key not configured');
      return {
        success: false,
        error: 'reCAPTCHA configuration missing'
      };
    }

    if (!token) {
      console.error('reCAPTCHA token not provided');
      return {
        success: false,
        error: 'reCAPTCHA token missing'
      };
    }

    // Call Google's reCAPTCHA verification API
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token
        }
      }
    );

    const { success, score, action, 'error-codes': errorCodes } = response.data;

    // Log the verification attempt
    console.log('reCAPTCHA verification:', {
      success,
      score,
      action,
      expectedAction,
      errorCodes
    });

    // Check if verification was successful
    if (!success) {
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${errorCodes?.join(', ') || 'Unknown error'}`
      };
    }

    // Validate score threshold
    if (score < minScore) {
      console.warn(`reCAPTCHA score too low: ${score} (minimum: ${minScore})`);
      return {
        success: false,
        score,
        error: `reCAPTCHA score too low: ${score}`
      };
    }

    // Validate action matches expected
    if (action !== expectedAction) {
      console.warn(`reCAPTCHA action mismatch: expected "${expectedAction}", got "${action}"`);
      return {
        success: false,
        action,
        error: `reCAPTCHA action mismatch`
      };
    }

    // All checks passed
    return {
      success: true,
      score,
      action
    };

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: 'reCAPTCHA verification service error'
    };
  }
};

module.exports = {
  verifyRecaptchaV3
};
