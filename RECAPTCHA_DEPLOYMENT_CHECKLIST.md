# reCAPTCHA Enterprise Deployment Checklist

Use this checklist to ensure proper deployment of the reCAPTCHA Enterprise migration.

## Pre-Deployment Checklist

### 1. Google Cloud Configuration

- [ ] **Verify reCAPTCHA Enterprise key exists**
  - Go to: https://console.cloud.google.com/security/recaptcha
  - Project: `future-step-nursery`
  - Site key: `6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25`
  - Key type: Website
  - Domain: Includes your production domain

- [ ] **Create Service Account**
  ```bash
  gcloud iam service-accounts create recaptcha-verifier \
    --display-name="reCAPTCHA Enterprise Verifier" \
    --project=future-step-nursery
  ```

- [ ] **Grant reCAPTCHA Enterprise Agent Role**
  ```bash
  gcloud projects add-iam-policy-binding future-step-nursery \
    --member="serviceAccount:recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com" \
    --role="roles/recaptchaenterprise.agent"
  ```

- [ ] **Verify Service Account Permissions**
  ```bash
  gcloud projects get-iam-policy future-step-nursery \
    --flatten="bindings[].members" \
    --filter="bindings.members:recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com"
  ```

### 2. Local Testing (Optional)

- [ ] **Generate Service Account Key** (if testing locally)
  ```bash
  gcloud iam service-accounts keys create recaptcha-sa-key.json \
    --iam-account=recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com
  ```

- [ ] **Set Environment Variable** (local testing only)
  ```bash
  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/recaptcha-sa-key.json
  ```

- [ ] **Test Firebase Emulator** (optional)
  ```bash
  cd functions/functions
  npm run serve
  ```

### 3. Frontend Configuration

- [ ] **Set Environment Variable in Vercel**
  - Go to Vercel Dashboard → Project → Settings → Environment Variables
  - Add: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
  - Value: `6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25`
  - Environments: Production, Preview, Development (as needed)

- [ ] **Verify Environment Variable**
  - Check Vercel deployment logs
  - Look for environment variable in build output

## Deployment Steps

### 4. Deploy Backend (Firebase Functions)

- [ ] **Install Dependencies**
  ```bash
  cd functions/functions
  npm install
  ```

- [ ] **Verify Package Installation**
  ```bash
  npm list @google-cloud/recaptcha-enterprise
  ```
  Expected: `@google-cloud/recaptcha-enterprise@^6.3.1`

- [ ] **Remove Old Configuration** (optional cleanup)
  ```bash
  firebase functions:config:unset recaptcha.secret
  ```

- [ ] **Deploy Function with Service Account**
  
  Option A: Firebase CLI
  ```bash
  firebase deploy --only functions:submitPublicForm
  ```
  
  Option B: gcloud CLI (with service account)
  ```bash
  gcloud functions deploy submitPublicForm \
    --runtime nodejs22 \
    --trigger-http \
    --allow-unauthenticated \
    --service-account=recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com \
    --project=future-step-nursery \
    --entry-point=submitPublicForm
  ```

- [ ] **Verify Function Deployment**
  ```bash
  # Check function exists
  gcloud functions list --project=future-step-nursery | grep submitPublicForm
  
  # Check service account
  gcloud functions describe submitPublicForm --project=future-step-nursery | grep serviceAccount
  ```

### 5. Deploy Frontend (Vercel)

- [ ] **Commit and Push Changes**
  ```bash
  git add .
  git commit -m "Migrate to reCAPTCHA Enterprise"
  git push
  ```

- [ ] **Verify Vercel Auto-Deploy**
  - Check Vercel dashboard for deployment status
  - Wait for build to complete

- [ ] **Or Manual Deploy** (if needed)
  ```bash
  vercel deploy --prod
  ```

## Post-Deployment Verification

### 6. Test Form Submissions

- [ ] **Test Admissions Form**
  - URL: `https://your-domain.com/en-US/admissions`
  - Fill out form completely
  - Submit and verify success message
  - Check Firestore for new document in `admissions` collection

- [ ] **Test Careers Form**
  - URL: `https://your-domain.com/en-US/careers`
  - Fill out form completely
  - Upload resume (if applicable)
  - Submit and verify success message
  - Check Firestore for new document in `careerSubmissions` collection

- [ ] **Test Contact Form**
  - URL: `https://your-domain.com/en-US/contact`
  - Fill out form completely
  - Submit and verify success message
  - Check Firestore for new document in `contactSubmissions` collection

### 7. Verify Logs

- [ ] **Check Firebase Functions Logs**
  ```bash
  firebase functions:log --only submitPublicForm --limit 50
  ```
  
  Look for:
  - `[reCAPTCHA Enterprise] Assessment created successfully`
  - `[reCAPTCHA Enterprise] Verification successful`
  - `[reCAPTCHA Enterprise] Risk Score: 0.X`

- [ ] **Check for Errors**
  ```bash
  firebase functions:log --only submitPublicForm --limit 50 | grep -i error
  ```
  Should return no errors (or only old errors before deployment)

### 8. Verify reCAPTCHA Enterprise Console

- [ ] **Check Key Status**
  - Go to: https://console.cloud.google.com/security/recaptcha
  - Find key: `6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25`
  - Status should be: **Active** (not "Incomplete")

- [ ] **Check Metrics**
  - View request count (should increase after form submissions)
  - View score distribution
  - Check for any suspicious activity

- [ ] **Review Assessment Details**
  - Click on key to view details
  - Check "Assessments" tab
  - Verify recent assessments exist with:
    - Valid tokens
    - Expected actions (submit_admission, submit_career, submit_contact)
    - Reasonable scores (typically 0.5-1.0)

## Troubleshooting

### If Forms Fail to Submit

- [ ] Check browser console for JavaScript errors
- [ ] Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly in Vercel
- [ ] Check Network tab for failed API calls
- [ ] Verify reCAPTCHA Enterprise script loads successfully

### If Backend Verification Fails

- [ ] Check Firebase Functions logs for errors
- [ ] Verify service account has correct permissions
- [ ] Ensure Cloud Function is using the service account
- [ ] Check that project ID is correct (`future-step-nursery`)

### If Key Status Remains "Incomplete"

- [ ] Ensure at least one successful assessment was created
- [ ] Wait 5-10 minutes for status to update
- [ ] Verify the correct site key is being used in both frontend and backend
- [ ] Check that assessments are visible in the reCAPTCHA console

## Rollback Plan (If Needed)

If issues occur and you need to rollback:

- [ ] **Revert Git Changes**
  ```bash
  git revert <commit-hash>
  git push
  ```

- [ ] **Redeploy Previous Version**
  ```bash
  # Frontend
  vercel deploy --prod
  
  # Backend
  firebase deploy --only functions:submitPublicForm
  ```

- [ ] **Restore Old Configuration** (if using old implementation)
  ```bash
  firebase functions:config:set recaptcha.secret="OLD_SECRET_KEY"
  ```

## Success Criteria

All items must be checked for successful deployment:

- [ ] Service account created with correct permissions
- [ ] Cloud Function deployed with service account attached
- [ ] Frontend deployed with correct environment variable
- [ ] All three forms submit successfully
- [ ] Firebase Functions logs show successful verifications
- [ ] reCAPTCHA Enterprise console shows "Active" status
- [ ] Assessments visible in reCAPTCHA console with correct actions and scores
- [ ] No errors in production logs
- [ ] Forms correctly save data to Firestore

## Additional Notes

- **Service Account Key Security**: If you created a JSON key for local testing, ensure it's stored securely and not committed to Git
- **Monitoring**: Set up alerts for failed reCAPTCHA verifications or unusual score patterns
- **Score Threshold**: Current threshold is 0.5. Adjust in `recaptchaEnterprise.js` if needed
- **Rate Limiting**: Consider implementing additional rate limiting if spam becomes an issue

## Documentation References

- [RECAPTCHA_ENTERPRISE_MIGRATION.md](./RECAPTCHA_ENTERPRISE_MIGRATION.md) - Complete migration guide
- [RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md](./RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md) - Quick reference
- [Google Cloud reCAPTCHA Enterprise Docs](https://cloud.google.com/recaptcha-enterprise/docs)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/production)

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Notes**: _____________________________________________________________
