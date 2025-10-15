# reCAPTCHA Enterprise Migration Guide

## Overview

This document describes the migration from the old reCAPTCHA v2/v3 "secret key" method to **reCAPTCHA Enterprise** using **Google Cloud Service Account authentication**. This addresses the "Incomplete" status issue in the Google Cloud Console and implements the modern, recommended approach for reCAPTCHA Enterprise.

## What Changed

### Previous Implementation (❌ Old)
- Used reCAPTCHA v2 or v3 with a secret key
- Backend verified tokens using `https://www.google.com/recaptcha/api/siteverify`
- Secret key stored in Firebase Functions config
- Manual HTTP requests via axios

### New Implementation (✅ New)
- Uses **reCAPTCHA Enterprise**
- Backend uses **Google Cloud Service Account authentication**
- Calls `projects.assessments.create` API via `@google-cloud/recaptcha-enterprise` client library
- Automatic authentication via Application Default Credentials (ADC) or service account JSON key
- Enhanced risk analysis with scores and detailed reasons

## Architecture

### Frontend Changes

**File: `src/utils/recaptcha.ts`**

- Updated to load reCAPTCHA Enterprise script: `https://www.google.com/recaptcha/enterprise.js?render={SITE_KEY}`
- Uses `grecaptcha.enterprise.execute()` instead of `grecaptcha.execute()`
- Site key: `6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25`

### Backend Changes

**File: `functions/functions/src/utils/recaptchaEnterprise.js`** (NEW)

New utility module that:
- Uses `@google-cloud/recaptcha-enterprise` client library
- Calls `createAssessment()` API with proper request structure
- Validates token, action, and score
- Returns detailed risk analysis

**File: `functions/functions/src/publicForms.js`** (UPDATED)

- Removed old `verifyRecaptcha()` function using axios
- Now uses `verifyRecaptchaEnterprise()` from new utility
- Passes user IP and user agent for enhanced risk assessment
- No longer requires secret key configuration

## Configuration

### Frontend Configuration

**Environment Variable (Vercel):**
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25
```

This is the **public** site key from the reCAPTCHA Enterprise console.

### Backend Configuration

The backend now uses **Google Cloud Service Account authentication** instead of a secret key.

#### Option 1: Running on Google Cloud (Recommended)

When running on Google Cloud (Cloud Functions, Cloud Run, etc.), authentication is **automatic** via Application Default Credentials (ADC):

1. **Create a Service Account** in Google Cloud project `future-step-nursery`:
   - Name: `recaptcha-verifier` (or any descriptive name)
   - Role: **reCAPTCHA Enterprise Agent** (or **reCAPTCHA Enterprise User**)

2. **Configure Cloud Function to use the service account**:
   ```bash
   gcloud functions deploy submitPublicForm \
     --service-account=recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com
   ```

3. **No additional configuration needed** - ADC handles authentication automatically.

#### Option 2: Running Outside Google Cloud (e.g., Local Development, Vercel)

If running outside Google Cloud, you need a service account JSON key:

1. **Create a Service Account** (same as above)

2. **Generate a JSON key file**:
   - Go to Google Cloud Console → IAM & Admin → Service Accounts
   - Find the service account
   - Click "Keys" → "Add Key" → "Create new key" → JSON
   - Download the JSON key file (e.g., `recaptcha-service-account.json`)

3. **Store the key securely**:
   - DO NOT commit to source control
   - Store in a secure location on the server
   - For local development: Store outside the repository directory

4. **Set environment variable**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/recaptcha-service-account.json
   ```

   Or in `.env` file (for local development):
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/recaptcha-service-account.json
   ```

### Required IAM Role

The service account needs the **reCAPTCHA Enterprise Agent** role, which includes the permission:
- `recaptchaenterprise.assessments.create`

## Deployment Steps

### 1. Update Dependencies

```bash
cd functions/functions
npm install @google-cloud/recaptcha-enterprise
```

### 2. Remove Old Configuration (Optional Cleanup)

The old secret key configuration is no longer needed. You can remove it:

```bash
firebase functions:config:unset recaptcha.secret
```

### 3. Set Up Service Account

**For Cloud Functions deployment:**

```bash
# Create service account
gcloud iam service-accounts create recaptcha-verifier \
  --display-name="reCAPTCHA Enterprise Verifier" \
  --project=future-step-nursery

# Grant reCAPTCHA Enterprise role
gcloud projects add-iam-policy-binding future-step-nursery \
  --member="serviceAccount:recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com" \
  --role="roles/recaptchaenterprise.agent"
```

### 4. Deploy Functions

```bash
cd functions/functions

# Deploy with service account
firebase deploy --only functions:submitPublicForm
```

Or if deploying via gcloud:

```bash
gcloud functions deploy submitPublicForm \
  --runtime nodejs22 \
  --trigger-http \
  --service-account=recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com \
  --project=future-step-nursery
```

### 5. Update Frontend Environment Variable

Make sure Vercel has the correct site key:

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25
```

### 6. Deploy Frontend

```bash
# Vercel will automatically deploy on push, or manually:
vercel deploy --prod
```

## Testing

### 1. Test Form Submission

Visit each form and submit:
- `/en-US/admissions`
- `/en-US/careers`
- `/en-US/contact`

### 2. Check Logs

```bash
# Firebase Functions logs
firebase functions:log --only submitPublicForm

# Look for:
# [reCAPTCHA Enterprise] Assessment created successfully
# [reCAPTCHA Enterprise] Verification successful
# [reCAPTCHA Enterprise] Risk Score: 0.9
```

### 3. Verify reCAPTCHA Enterprise Console

Go to: https://console.cloud.google.com/security/recaptcha

Check that:
- The key status changes from "Incomplete" to "Active"
- Request metrics are being recorded
- Assessments are being created

## Troubleshooting

### Issue: "reCAPTCHA configuration missing"

**Cause:** Service account authentication not configured.

**Solution:**
- Ensure service account exists and has the `recaptchaenterprise.agent` role
- For Cloud Functions: Configure the function to use the service account
- For local/external: Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Issue: "Permission denied" error

**Cause:** Service account lacks required permissions.

**Solution:**
```bash
gcloud projects add-iam-policy-binding future-step-nursery \
  --member="serviceAccount:recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com" \
  --role="roles/recaptchaenterprise.agent"
```

### Issue: Frontend shows "Failed to load reCAPTCHA Enterprise"

**Cause:** Site key not configured or incorrect.

**Solution:**
- Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25`
- Redeploy frontend after setting the variable

### Issue: "Token invalid" error in backend

**Cause:** Token might be expired or site key mismatch.

**Solution:**
- Ensure frontend is using the same site key as backend
- Check that token is being sent immediately after generation (tokens expire after ~2 minutes)

## Security Best Practices

1. **Never commit service account keys** - Add `*service-account*.json` to `.gitignore`
2. **Use ADC when possible** - Prefer running on Google Cloud with service account attached
3. **Rotate keys periodically** - If using JSON keys, rotate them every 90 days
4. **Monitor usage** - Regularly check reCAPTCHA Enterprise console for unusual activity
5. **Set appropriate score thresholds** - Current default is 0.5, adjust based on your needs

## Benefits of This Migration

✅ **Proper reCAPTCHA Enterprise Integration** - No more "Incomplete" status
✅ **Enhanced Security** - Service account auth is more secure than secret keys
✅ **Better Risk Analysis** - Detailed risk scores and reasons
✅ **Improved Monitoring** - Full visibility in Google Cloud Console
✅ **Scalability** - Leverages Google Cloud infrastructure
✅ **Best Practices** - Follows Google's recommended approach

## References

- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Create Assessment API](https://cloud.google.com/recaptcha-enterprise/docs/create-assessment)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/production)
- [Node.js Client Library](https://googleapis.dev/nodejs/recaptcha-enterprise/latest/)

## Support

For issues or questions:
1. Check Firebase Functions logs: `firebase functions:log`
2. Check reCAPTCHA Enterprise console: https://console.cloud.google.com/security/recaptcha
3. Review service account permissions in IAM
4. Verify environment variables are set correctly
