# reCAPTCHA Implementation Guide

This document explains the reCAPTCHA implementation for the contact form submission.

## Overview

The contact form uses Google reCAPTCHA v3 to prevent spam and abuse. reCAPTCHA v3 is invisible and doesn't require user interaction.

## Setup Instructions

### 1. Obtain reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register a new site with reCAPTCHA v3
3. Add your domain(s) to the allowed domains list
4. You will receive:
   - **Site Key** (for frontend)
   - **Secret Key** (for backend)

### 2. Configure Frontend

Set the reCAPTCHA site key as an environment variable:

```bash
# For local development, create .env.local file
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
```

For production deployment, add this to your hosting platform's environment variables.

**Note**: If not configured, the code will fall back to the test key `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` which always passes validation (for testing only).

### 3. Configure Backend

Set the reCAPTCHA secret key in Firebase Functions configuration:

#### Option A: Using Firebase CLI
```bash
firebase functions:config:set recaptcha.secret_key="your_secret_key_here"
```

#### Option B: Using Environment Variables
Add to your Cloud Functions environment:
```bash
export RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 4. Deploy

Deploy both frontend and backend:

```bash
# Deploy functions
cd functions/functions
npm install
firebase deploy --only functions

# Build and deploy frontend
npm run build
# Deploy to your hosting platform
```

## How It Works

### Frontend (contact/page.tsx)

1. The reCAPTCHA v3 script is loaded via Next.js Script component
2. When the form is submitted, a token is generated with action `submit_contact_form`
3. The token is included in the POST request body as `recaptchaToken`
4. If token generation fails, the form submits without it (backend will handle gracefully)

### Backend (functions/src/contact/contactCrud.js)

1. The `submitContactForm` function receives the request
2. If `recaptchaToken` is present, it's validated with Google's API
3. For reCAPTCHA v3, tokens are scored from 0.0 (bot) to 1.0 (human)
4. A score > 0.5 is considered valid
5. If validation fails, returns 400 error: "reCAPTCHA verification failed"
6. If no secret key is configured, validation is skipped (for development)

## Testing

### Test Keys (provided by Google)

For testing purposes, you can use Google's test keys:

- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

These test keys will always pass validation and should only be used in development/testing environments.

### Local Testing

1. Use test keys for local development
2. Test form submission with valid and invalid scenarios
3. Check browser console for any reCAPTCHA errors
4. Verify backend logs for validation results

## Troubleshooting

### "reCAPTCHA verification failed" Error

**Causes**:
1. Invalid or expired token
2. Incorrect secret key configuration
3. Domain not whitelisted in reCAPTCHA admin
4. Network issues communicating with Google's API

**Solutions**:
1. Verify environment variables are set correctly
2. Check Firebase Functions logs: `firebase functions:log`
3. Ensure domain is added to reCAPTCHA console
4. Test with Google's test keys first

### Token Not Generated

**Causes**:
1. reCAPTCHA script failed to load
2. Site key not configured or incorrect
3. Browser blocking third-party scripts

**Solutions**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
3. Check browser network tab for failed script loads
4. Disable ad blockers temporarily for testing

### Backend Accepts Invalid Submissions

**Cause**: Secret key not configured in Firebase Functions

**Solution**: Set the secret key using one of the methods in step 3 above

## Security Considerations

1. **Never commit keys to version control**: Use environment variables
2. **Use different keys for dev/prod**: Separate environments prevent abuse
3. **Monitor reCAPTCHA analytics**: Check the admin console for abuse patterns
4. **Adjust score threshold**: Default is 0.5, but you can adjust based on your needs
5. **Implement rate limiting**: Consider additional backend rate limiting for extra protection

## Additional Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Firebase Functions Configuration](https://firebase.google.com/docs/functions/config-env)
