# reCAPTCHA Enterprise Migration - Implementation Summary

## What Was Changed

### Frontend Changes

#### File: `src/utils/recaptcha.ts`

**Before:**
```typescript
// reCAPTCHA v3 utility
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM-fkrBM-fkrBM-fkrBM';

// Load script
script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;

// Execute
window.grecaptcha.ready(async () => {
  const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
});
```

**After:**
```typescript
// reCAPTCHA Enterprise utility
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25';

// Load Enterprise script
script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;

// Execute Enterprise
window.grecaptcha.enterprise.ready(async () => {
  const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
});
```

**Impact:** Forms (admissions, careers, contact) automatically use the new implementation since they import from this utility.

---

### Backend Changes

#### File: `functions/functions/src/utils/recaptchaEnterprise.js` (NEW)

New module created using Google Cloud client library:

```javascript
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

async function verifyRecaptchaEnterprise(token, siteKey, expectedAction, projectId, options) {
  // Initialize client with automatic authentication
  const client = new RecaptchaEnterpriseServiceClient();
  
  // Create assessment request
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
  
  // Call createAssessment API
  const [response] = await client.createAssessment(request);
  
  // Validate token, action, and score
  // Return detailed results
}
```

**Features:**
- Uses `@google-cloud/recaptcha-enterprise` client library
- Automatic authentication via ADC or GOOGLE_APPLICATION_CREDENTIALS
- Calls `projects.assessments.create` API
- Returns detailed risk analysis with score and reasons
- Validates token validity, action match, and score threshold

---

#### File: `functions/functions/src/publicForms.js`

**Before:**
```javascript
const axios = require('axios');

const verifyRecaptcha = async (token, secretKey) => {
  const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
    params: { secret: secretKey, response: token }
  });
  return response.data;
};

// In handler:
const recaptchaSecret = functions.config().recaptcha?.secret;
const verificationResult = await verifyRecaptcha(recaptchaToken, recaptchaSecret);
```

**After:**
```javascript
const { verifyRecaptchaEnterprise } = require('./utils/recaptchaEnterprise');

// In handler:
const projectId = process.env.GCLOUD_PROJECT || 'future-step-nursery';
const siteKey = process.env.RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25';
const userIpAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
const userAgent = req.headers['user-agent'];

const verificationResult = await verifyRecaptchaEnterprise(
  recaptchaToken,
  siteKey,
  expectedAction,
  projectId,
  { userIpAddress, userAgent, minScore: 0.5 }
);
```

**Key Differences:**
- ❌ Removed: axios HTTP calls to siteverify endpoint
- ❌ Removed: Secret key configuration requirement
- ✅ Added: Google Cloud Service Account authentication
- ✅ Added: Enhanced risk assessment with IP and user agent
- ✅ Added: Detailed logging for debugging

---

### Configuration Changes

#### File: `.env.example`

**Before:**
```bash
# Google reCAPTCHA v3 Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Backend - Secret Key (private, set in Firebase Functions config)
# firebase functions:config:set recaptcha.secret_key="your_secret_key_here"
```

**After:**
```bash
# Google reCAPTCHA Enterprise Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25

# Backend Authentication:
# - On Google Cloud: Uses Application Default Credentials (ADC)
# - Outside Google Cloud: Set GOOGLE_APPLICATION_CREDENTIALS to service account JSON key
```

---

### Dependency Changes

#### File: `functions/functions/package.json`

**Added:**
```json
{
  "dependencies": {
    "@google-cloud/recaptcha-enterprise": "^6.3.1"
  }
}
```

**Note:** axios is still used by other functions, so it remains in dependencies.

---

## Architecture Comparison

### Old Architecture (v2/v3 with Secret Key)

```
┌─────────────────┐
│   Frontend      │
│  grecaptcha.    │
│   execute()     │
└────────┬────────┘
         │ token
         ▼
┌─────────────────┐
│  Cloud Function │
│   - Get secret  │
│   - axios POST  │
│   - siteverify  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google API     │
│  siteverify     │
└─────────────────┘
```

### New Architecture (Enterprise with Service Account)

```
┌─────────────────┐
│   Frontend      │
│  grecaptcha.    │
│  enterprise.    │
│   execute()     │
└────────┬────────┘
         │ token
         ▼
┌─────────────────┐
│  Cloud Function │
│  - Service Acct │
│  - Client lib   │
│  - createAssess │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ reCAPTCHA       │
│ Enterprise API  │
│ (IAM auth)      │
└─────────────────┘
```

---

## Security Improvements

| Aspect | Old | New |
|--------|-----|-----|
| Authentication | Secret key (shared secret) | Service Account (IAM) |
| Key Management | Manual config in functions | IAM roles and permissions |
| Key Rotation | Requires code/config update | Update service account only |
| Audit Trail | Limited | Full Cloud Audit Logs |
| Least Privilege | Single key with full access | Scoped IAM permissions |

---

## API Comparison

### Old API Call (siteverify)

**Endpoint:** `POST https://www.google.com/recaptcha/api/siteverify`

**Request:**
```
secret: YOUR_SECRET_KEY
response: TOKEN_FROM_FRONTEND
```

**Response:**
```json
{
  "success": true,
  "challenge_ts": "2025-10-15T14:00:00Z",
  "hostname": "example.com"
}
```

### New API Call (createAssessment)

**Method:** `client.createAssessment()`

**Request:**
```javascript
{
  parent: "projects/future-step-nursery",
  assessment: {
    event: {
      token: TOKEN_FROM_FRONTEND,
      siteKey: "6Lc1Y-orAAAAAB...",
      expectedAction: "submit_admission",
      userIpAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0..."
    }
  }
}
```

**Response:**
```javascript
{
  tokenProperties: {
    valid: true,
    action: "submit_admission",
    createTime: "2025-10-15T14:00:00Z"
  },
  riskAnalysis: {
    score: 0.9,
    reasons: []
  }
}
```

---

## Deployment Differences

### Old Deployment

```bash
# Set secret key
firebase functions:config:set recaptcha.secret="SECRET_KEY"

# Deploy
firebase deploy --only functions
```

### New Deployment

```bash
# Create service account
gcloud iam service-accounts create recaptcha-verifier

# Grant permissions
gcloud projects add-iam-policy-binding future-step-nursery \
  --member="serviceAccount:recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com" \
  --role="roles/recaptchaenterprise.agent"

# Deploy with service account
gcloud functions deploy submitPublicForm \
  --service-account=recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com
```

---

## Breaking Changes

### None for End Users

The migration is **transparent to end users**:
- Forms work exactly the same way
- No visual changes
- No additional user interaction required

### For Developers/Admins

1. **Old secret key configuration is no longer used**
   - Can be removed: `firebase functions:config:unset recaptcha.secret`

2. **Service account must be configured**
   - Required for Cloud Functions deployment
   - Must have `roles/recaptchaenterprise.agent` role

3. **Site key is now hardcoded**
   - Site key: `6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25`
   - Set as default in code, can be overridden with env var

---

## Testing Verification

### What to Test

1. ✅ **Admissions Form** (`/en-US/admissions`)
   - Fill form → Submit → Verify success
   - Check Firestore `admissions` collection

2. ✅ **Careers Form** (`/en-US/careers`)
   - Fill form → Upload resume → Submit → Verify success
   - Check Firestore `careerSubmissions` collection

3. ✅ **Contact Form** (`/en-US/contact`)
   - Fill form → Submit → Verify success
   - Check Firestore `contactSubmissions` collection

4. ✅ **Backend Logs**
   ```bash
   firebase functions:log --only submitPublicForm
   ```
   Look for: `[reCAPTCHA Enterprise] Verification successful`

5. ✅ **reCAPTCHA Console**
   - https://console.cloud.google.com/security/recaptcha
   - Status should be: **Active** (not "Incomplete")
   - Assessments should be visible

---

## Rollback Instructions

If issues occur:

```bash
# 1. Revert git changes
git revert HEAD~3  # Revert last 3 commits
git push

# 2. Restore old secret key
firebase functions:config:set recaptcha.secret="OLD_SECRET_KEY"

# 3. Redeploy
firebase deploy --only functions:submitPublicForm
vercel deploy --prod
```

---

## Files Modified

1. ✅ `src/utils/recaptcha.ts` - Frontend utility
2. ✅ `functions/functions/src/publicForms.js` - Backend handler
3. ✅ `.env.example` - Configuration template
4. ✅ `README.md` - Updated documentation references

## Files Created

1. ✅ `functions/functions/src/utils/recaptchaEnterprise.js` - New backend utility
2. ✅ `RECAPTCHA_ENTERPRISE_MIGRATION.md` - Migration guide
3. ✅ `RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md` - Quick reference
4. ✅ `RECAPTCHA_DEPLOYMENT_CHECKLIST.md` - Deployment steps
5. ✅ `RECAPTCHA_ENTERPRISE_IMPLEMENTATION_SUMMARY.md` - This file

## Files Not Modified

- Forms (`admissions/page.tsx`, `careers/page.tsx`, `contact/page.tsx`) - No changes needed, they use the utility
- `useRecaptchaForm.ts` hook - No changes needed
- Other Cloud Functions - Not affected by this change

---

## Success Metrics

After successful deployment:

- [ ] All three forms submit successfully
- [ ] reCAPTCHA key status is "Active" in Google Cloud Console
- [ ] Assessments appear in reCAPTCHA Enterprise console
- [ ] Function logs show successful verifications
- [ ] Risk scores are recorded (typically 0.5-1.0 for legitimate users)
- [ ] No authentication errors in logs
- [ ] Forms save data correctly to Firestore

---

**Migration Completed:** October 15, 2025
**Deployed By:** GitHub Copilot
**Status:** Ready for Deployment
