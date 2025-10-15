const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

/**
 * Verify reCAPTCHA Enterprise token using Google Cloud Service Account Authentication
 * 
 * This uses the reCAPTCHA Enterprise API with the projects.assessments.create method.
 * Authentication is handled automatically via:
 * - Application Default Credentials (ADC) when running on Google Cloud (Cloud Functions, Cloud Run)
 * - GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account JSON key file
 * 
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} siteKey - The reCAPTCHA Enterprise site key
 * @param {string} expectedAction - The expected action name (e.g., 'submit_admission')
 * @param {string} projectId - Google Cloud project ID
 * @param {Object} options - Optional parameters
 * @param {string} options.userIpAddress - User's IP address for improved risk assessment
 * @param {string} options.userAgent - User's user agent string
 * @param {number} options.minScore - Minimum acceptable score threshold (default: 0.5)
 * @returns {Promise<{success: boolean, score?: number, reasons?: string[], error?: string}>}
 */
async function verifyRecaptchaEnterprise(
  token,
  siteKey,
  expectedAction,
  projectId,
  options = {}
) {
  const {
    userIpAddress,
    userAgent,
    minScore = 0.5
  } = options;

  try {
    // Validate required parameters
    if (!token) {
      console.error('[reCAPTCHA Enterprise] Token not provided');
      return {
        success: false,
        error: 'reCAPTCHA token missing'
      };
    }

    if (!siteKey) {
      console.error('[reCAPTCHA Enterprise] Site key not provided');
      return {
        success: false,
        error: 'reCAPTCHA site key missing'
      };
    }

    if (!projectId) {
      console.error('[reCAPTCHA Enterprise] Project ID not provided');
      return {
        success: false,
        error: 'Google Cloud project ID missing'
      };
    }

    console.log('[reCAPTCHA Enterprise] Creating assessment');
    console.log('[reCAPTCHA Enterprise] Project:', projectId);
    console.log('[reCAPTCHA Enterprise] Site Key:', siteKey);
    console.log('[reCAPTCHA Enterprise] Expected Action:', expectedAction);

    // Initialize the reCAPTCHA Enterprise client
    // Authentication is automatic via ADC or GOOGLE_APPLICATION_CREDENTIALS
    const client = new RecaptchaEnterpriseServiceClient();

    // Build the project path
    const projectPath = client.projectPath(projectId);

    // Create the assessment request
    const request = {
      parent: projectPath,
      assessment: {
        event: {
          token: token,
          siteKey: siteKey,
          expectedAction: expectedAction,
        },
      },
    };

    // Add optional fields if provided
    if (userIpAddress) {
      request.assessment.event.userIpAddress = userIpAddress;
    }

    if (userAgent) {
      request.assessment.event.userAgent = userAgent;
    }

    console.log('[reCAPTCHA Enterprise] Calling createAssessment API');

    // Call the createAssessment API
    const [response] = await client.createAssessment(request);

    console.log('[reCAPTCHA Enterprise] Assessment created successfully');

    // Extract the token properties
    const tokenProperties = response.tokenProperties;

    // Check if the token is valid
    if (!tokenProperties.valid) {
      console.warn('[reCAPTCHA Enterprise] Token is invalid');
      console.warn('[reCAPTCHA Enterprise] Invalid reason:', tokenProperties.invalidReason);
      return {
        success: false,
        error: `reCAPTCHA token invalid: ${tokenProperties.invalidReason}`
      };
    }

    // Validate the action matches
    if (tokenProperties.action !== expectedAction) {
      console.warn('[reCAPTCHA Enterprise] Action mismatch');
      console.warn('[reCAPTCHA Enterprise] Expected:', expectedAction);
      console.warn('[reCAPTCHA Enterprise] Received:', tokenProperties.action);
      return {
        success: false,
        error: 'reCAPTCHA action mismatch'
      };
    }

    // Get the risk score (0.0 to 1.0)
    const score = response.riskAnalysis?.score || 0;
    const reasons = response.riskAnalysis?.reasons || [];

    console.log('[reCAPTCHA Enterprise] Risk Score:', score);
    console.log('[reCAPTCHA Enterprise] Risk Reasons:', reasons);

    // Check if score meets minimum threshold
    if (score < minScore) {
      console.warn('[reCAPTCHA Enterprise] Score too low:', score, '(minimum:', minScore + ')');
      return {
        success: false,
        score,
        reasons,
        error: `reCAPTCHA score too low: ${score}`
      };
    }

    // All checks passed
    console.log('[reCAPTCHA Enterprise] Verification successful');
    return {
      success: true,
      score,
      reasons
    };

  } catch (error) {
    console.error('[reCAPTCHA Enterprise] Verification error:', error);
    console.error('[reCAPTCHA Enterprise] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    
    return {
      success: false,
      error: 'reCAPTCHA verification service error: ' + error.message
    };
  }
}

module.exports = {
  verifyRecaptchaEnterprise
};
