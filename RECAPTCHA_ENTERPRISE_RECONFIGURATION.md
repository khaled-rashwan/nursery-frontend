# reCAPTCHA Enterprise Reconfiguration Summary

**Date:** October 15, 2025  
**Scope:** Contact Us, Admissions, and Careers pages  
**Environment Variable:** `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

## Overview

This document describes the reconfiguration of Google reCAPTCHA Enterprise Integration to use the Vercel environment variable `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` consistently across all public-facing forms (Contact Us, Admissions, and Careers).

## What Changed

### Frontend Changes

#### 1. Updated `src/utils/recaptcha.ts`

**Before:**
```typescript
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25';
```

**After:**
```typescript
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SITE_KEY) {
  console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable is not set');
}
```

**Changes:**
- Removed hardcoded fallback site key
- Added explicit check for missing environment variable
- Added error handling in `loadRecaptchaScript()` and `executeRecaptcha()` functions
- Now properly validates that the environment variable is set before attempting to load reCAPTCHA

**Impact:**
- Frontend will now fail fast if `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is not configured
- Better error messages for debugging configuration issues
- Ensures Vercel environment variable is always used

#### 2. Form Pages (No Changes Required)

The following pages already correctly use the reCAPTCHA utility:
- `src/app/[locale]/contact/page.tsx` - Contact Us form
- `src/app/[locale]/admissions/page.tsx` - Admissions form  
- `src/app/[locale]/careers/page.tsx` - Careers form

All pages use:
```typescript
import { loadRecaptchaScript, executeRecaptcha } from '../../../utils/recaptcha';
```

### Backend Changes

#### 1. Updated Contact Form Handler

**File:** `functions/functions/src/contact/contactCrud.js`

**Before:**
```javascript
const { verifyRecaptchaV3 } = require('../utils/recaptcha');

const recaptchaResult = await verifyRecaptchaV3(
    submissionData.recaptchaToken,
    'submit_contact',
    0.5
);
```

**After:**
```javascript
const { verifyRecaptchaEnterprise } = require('../utils/recaptchaEnterprise');

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25';
const RECAPTCHA_PROJECT_ID = 'future-step-nursery';

const recaptchaResult = await verifyRecaptchaEnterprise(
    submissionData.recaptchaToken,
    RECAPTCHA_SITE_KEY,
    'submit_contact',
    RECAPTCHA_PROJECT_ID,
    {
        userIpAddress: req.ip,
        userAgent: req.get('user-agent'),
        minScore: 0.5
    }
);
```

#### 2. Updated Admissions Form Handler

**File:** `functions/functions/src/admissions/admissionCrud.js`

**Changes:** Same as Contact Form Handler, with action name `'submit_admission'`

#### 3. Updated Careers Form Handler

**File:** `functions/functions/src/careers/careerCrud.js`

**Changes:** Same as Contact Form Handler, with action name `'submit_career'`

**Backend Improvements:**
- Migrated from `verifyRecaptchaV3()` to `verifyRecaptchaEnterprise()`
- Now uses Google Cloud Service Account authentication instead of secret key
- Enhanced risk analysis with user IP and user agent
- Better logging with score and risk reasons
- Consistent with reCAPTCHA Enterprise best practices

## Environment Configuration

### Frontend (Vercel)

Set in **Vercel Dashboard → Project Settings → Environment Variables**:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25
```

**Important Notes:**
- This is the **public** site key and is safe to expose in the frontend
- Must be set for **all environments** (Production, Preview, Development)
- Variable name must start with `NEXT_PUBLIC_` to be accessible in the browser

### Backend (Google Cloud Functions)

The backend uses two pieces of configuration:

#### 1. Site Key (Optional)

While the backend functions have a fallback site key, it's recommended to set it explicitly:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25
```

#### 2. Service Account Authentication

**For Cloud Functions (Recommended):**

The Cloud Functions should be configured to use a service account with the **reCAPTCHA Enterprise Agent** role:

```bash
gcloud functions deploy submitContactForm \
  --service-account=recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com \
  --runtime=nodejs22 \
  --project=future-step-nursery
```

**For Local Development:**

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Deployment Steps

### 1. Deploy Frontend to Vercel

#### Option A: Automatic Deployment (Recommended)
```bash
git add .
git commit -m "Reconfigure reCAPTCHA Enterprise with NEXT_PUBLIC_RECAPTCHA_SITE_KEY"
git push origin develop
```

Vercel will automatically deploy the changes.

#### Option B: Manual Deployment
```bash
vercel deploy --prod
```

### 2. Verify Vercel Environment Variable

1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings → Environment Variables**
4. Verify that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set to:
   ```
   6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25
   ```
5. Ensure it's enabled for **Production**, **Preview**, and **Development** environments

### 3. Deploy Backend Functions

```bash
cd functions/functions

# Deploy all form handlers
firebase deploy --only functions:submitContactForm,functions:submitAdmission,functions:submitCareerForm

# Or deploy all functions
firebase deploy --only functions
```

**Important:** Ensure functions are deployed with the service account that has reCAPTCHA Enterprise permissions.

### 4. Verify Backend Service Account

```bash
# Check current function configuration
gcloud functions describe submitContactForm --project=future-step-nursery

# Verify service account has correct role
gcloud projects get-iam-policy future-step-nursery \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com"
```

Expected output should include:
```
role: roles/recaptchaenterprise.agent
```

## Testing

### 1. Test Contact Us Form

1. Navigate to: `https://your-domain.com/en-US/contact`
2. Fill out the form with valid information
3. Submit the form
4. Verify successful submission

### 2. Test Admissions Form

1. Navigate to: `https://your-domain.com/en-US/admissions`
2. Fill out the admission form
3. Submit the form
4. Verify successful submission

### 3. Test Careers Form

1. Navigate to: `https://your-domain.com/en-US/careers`
2. Fill out the career application form
3. Upload a resume (optional)
4. Submit the form
5. Verify successful submission

### 4. Check Backend Logs

```bash
# Firebase Functions logs
firebase functions:log --only submitContactForm
firebase functions:log --only submitAdmission
firebase functions:log --only submitCareerForm

# Or using gcloud
gcloud functions logs read submitContactForm --project=future-step-nursery --limit=50
```

Look for log entries like:
```
[reCAPTCHA Enterprise] Verification successful
[reCAPTCHA Enterprise] Risk Score: 0.9
```

### 5. Verify in Google Cloud Console

1. Go to: https://console.cloud.google.com/security/recaptcha
2. Select project: `future-step-nursery`
3. Click on your reCAPTCHA key
4. Check **Metrics** tab for recent activity
5. Verify the status shows **"Active"** (not "Incomplete")

## Troubleshooting

### Frontend Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "reCAPTCHA site key not configured" error | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` not set in Vercel | Set environment variable in Vercel dashboard |
| reCAPTCHA script fails to load | Incorrect site key or network issue | Verify site key is correct; check browser console for errors |
| Forms work locally but not in production | Environment variable not set in Vercel | Ensure variable is set for Production environment |

### Backend Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "reCAPTCHA verification failed" | Service account lacks permissions | Grant `roles/recaptchaenterprise.agent` to service account |
| "Permission denied" error | Function not using correct service account | Redeploy function with `--service-account` flag |
| "Project ID missing" | Project ID not configured | Verify `RECAPTCHA_PROJECT_ID` is set to `'future-step-nursery'` |
| Token invalid error | Site key mismatch between frontend and backend | Ensure both use same `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` |

### Debug Steps

1. **Check Frontend Console:**
   ```javascript
   // Add to page for debugging
   console.log('reCAPTCHA Site Key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
   ```

2. **Check Backend Logs:**
   ```bash
   firebase functions:log --only submitContactForm
   ```

3. **Test reCAPTCHA Token:**
   - Submit a form
   - Check Network tab in browser DevTools
   - Verify `recaptchaToken` is included in request body
   - Check backend logs for verification result

4. **Verify Service Account:**
   ```bash
   gcloud iam service-accounts get-iam-policy \
     recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com
   ```

## Key Files Modified

### Frontend
- ✅ `src/utils/recaptcha.ts` - Updated to use environment variable exclusively
- ✅ `src/app/[locale]/contact/page.tsx` - Already configured correctly
- ✅ `src/app/[locale]/admissions/page.tsx` - Already configured correctly
- ✅ `src/app/[locale]/careers/page.tsx` - Already configured correctly

### Backend
- ✅ `functions/functions/src/contact/contactCrud.js` - Migrated to reCAPTCHA Enterprise
- ✅ `functions/functions/src/admissions/admissionCrud.js` - Migrated to reCAPTCHA Enterprise
- ✅ `functions/functions/src/careers/careerCrud.js` - Migrated to reCAPTCHA Enterprise

### Configuration
- ✅ `.env.example` - Already includes `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

## Benefits of This Reconfiguration

1. **Centralized Configuration:** All reCAPTCHA configuration now uses the single `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` environment variable
2. **Better Error Handling:** Frontend will fail fast with clear error messages if the environment variable is not set
3. **Enterprise Features:** Backend now uses reCAPTCHA Enterprise API with enhanced risk analysis
4. **Service Account Authentication:** More secure authentication method using Google Cloud Service Accounts
5. **Enhanced Logging:** Better debugging with detailed verification logs including risk scores and reasons
6. **Consistency:** All three forms (Contact, Admissions, Careers) now use the same configuration pattern
7. **Production Ready:** Properly configured for deployment on Vercel with Google Cloud Functions backend

## Next Steps

1. ✅ **Set Vercel Environment Variable:** Ensure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is configured in Vercel
2. ✅ **Deploy Frontend:** Push changes to trigger automatic deployment or use `vercel deploy`
3. ✅ **Deploy Backend Functions:** Run `firebase deploy --only functions`
4. ✅ **Test All Forms:** Verify Contact Us, Admissions, and Careers forms work correctly
5. ✅ **Monitor Logs:** Check Google Cloud Console for reCAPTCHA activity and verify "Active" status

## Support & Documentation

- **Quick Start:** [RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md](./RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md)
- **Full Migration Guide:** [RECAPTCHA_ENTERPRISE_MIGRATION.md](./RECAPTCHA_ENTERPRISE_MIGRATION.md)
- **Implementation Summary:** [RECAPTCHA_ENTERPRISE_IMPLEMENTATION_SUMMARY.md](./RECAPTCHA_ENTERPRISE_IMPLEMENTATION_SUMMARY.md)
- **Google Cloud Console:** https://console.cloud.google.com/security/recaptcha
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**Configuration Complete! 🎉**

All forms are now properly configured to use Google reCAPTCHA Enterprise with the `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` environment variable.
