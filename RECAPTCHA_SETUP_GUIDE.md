# Google reCAPTCHA Integration Setup Guide

This guide explains how to set up Google reCAPTCHA v2 for the public forms in this application.

## Prerequisites

1. A Google account
2. Access to Google reCAPTCHA Admin Console: https://www.google.com/recaptcha/admin

## Step 1: Create reCAPTCHA Keys

1. Go to https://www.google.com/recaptcha/admin
2. Click on the "+" button to create a new site
3. Fill in the following:
   - **Label**: Future Step Nursery Forms (or any descriptive name)
   - **reCAPTCHA type**: Select "reCAPTCHA v2" and then "I'm not a robot" Checkbox
   - **Domains**: Add your domains:
     - For production: `your-production-domain.com` (e.g., `nursery.vercel.app`)
     - For local development: `localhost`
4. Accept the reCAPTCHA Terms of Service
5. Click **Submit**
6. You will receive two keys:
   - **Site Key** (public key - used in the frontend)
   - **Secret Key** (private key - used in the backend)

## Step 2: Configure Frontend Environment Variables (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following environment variable:
   ```
   Key: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
   Value: <Your Site Key from Step 1>
   ```
4. Make sure to add it for all environments (Production, Preview, Development) as needed
5. Redeploy your application for the changes to take effect

### Local Development (.env.local)

For local development, create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
```

**Note**: The `.env.local` file is gitignored and should never be committed to version control.

## Step 3: Configure Firebase Functions Secret Key

The secret key must be stored in Firebase Functions configuration using Firebase CLI.

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Set the reCAPTCHA secret in Firebase Functions config:
   ```bash
   firebase functions:config:set recaptcha.secret="YOUR_SECRET_KEY_HERE"
   ```

4. Verify the configuration:
   ```bash
   firebase functions:config:get
   ```

   You should see:
   ```json
   {
     "recaptcha": {
       "secret": "YOUR_SECRET_KEY_HERE"
     }
   }
   ```

5. Deploy the functions:
   ```bash
   cd functions/functions
   firebase deploy --only functions
   ```

   Or deploy specific function:
   ```bash
   firebase deploy --only functions:submitPublicForm
   ```

### Local Testing with Firebase Emulator

For local testing with Firebase emulators:

1. Create a `.runtimeconfig.json` file in the `functions/functions` directory:
   ```json
   {
     "recaptcha": {
       "secret": "YOUR_SECRET_KEY_HERE"
     }
   }
   ```

2. Run the emulators:
   ```bash
   firebase emulators:start
   ```

**Note**: The `.runtimeconfig.json` file is gitignored and should never be committed.

## Step 4: Verify Integration

After deployment, test the integration:

1. Visit each form page:
   - `/en-US/admissions`
   - `/en-US/careers`
   - `/en-US/contact`

2. Fill out a form and verify:
   - The reCAPTCHA widget appears above the submit button
   - Clicking submit without completing reCAPTCHA shows an error
   - After completing reCAPTCHA, the form submits successfully
   - Check Firestore to confirm data was saved

## Architecture Overview

### Frontend (`useRecaptchaForm` hook)
- Manages reCAPTCHA widget state
- Obtains reCAPTCHA token when form is submitted
- Sends token along with form data to backend
- Handles success/error states

### Backend (`submitPublicForm` function)
- Receives form data, reCAPTCHA token, and form type
- Verifies token with Google reCAPTCHA API
- On successful verification, saves data to appropriate Firestore collection:
  - `admission` → `admissions` collection
  - `career` → `careerSubmissions` collection
  - `contact` → `contactSubmissions` collection
- Returns error if verification fails

## Troubleshooting

### "Please complete the reCAPTCHA verification" error
- Make sure the Site Key is correctly set in Vercel environment variables
- Verify the environment variable name is exactly: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Redeploy the application after adding the variable

### "reCAPTCHA verification failed" error
- Verify the Secret Key is correctly set in Firebase Functions config
- Check Firebase Functions logs for detailed error messages:
  ```bash
  firebase functions:log
  ```
- Make sure you're using the correct keys (Site Key for frontend, Secret Key for backend)

### reCAPTCHA widget not appearing
- Check browser console for JavaScript errors
- Verify the `react-google-recaptcha` package is installed
- Check that the domain is registered in Google reCAPTCHA admin console

### "Error verifying reCAPTCHA" in logs
- Ensure the `axios` package is installed in Firebase Functions
- Verify Firebase Functions has internet access to reach Google's API
- Check that the reCAPTCHA keys are valid and not expired

## Security Considerations

1. **Never commit secret keys** - Use environment variables and config
2. **Site Key is public** - It's safe to expose in client-side code (must start with `NEXT_PUBLIC_` in Next.js)
3. **Secret Key is private** - Only used in backend, never exposed to clients
4. **Domain restrictions** - Always configure allowed domains in reCAPTCHA admin console
5. **Token expiration** - reCAPTCHA tokens expire after a few minutes; they're single-use

## References

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [react-google-recaptcha Library](https://github.com/dozoisch/react-google-recaptcha)
- [Firebase Functions Environment Configuration](https://firebase.google.com/docs/functions/config-env)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
