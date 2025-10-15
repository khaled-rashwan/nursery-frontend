# reCAPTCHA v3 Implementation Guide

## Overview

This application uses Google reCAPTCHA v3 to protect form submissions from bots and spam. reCAPTCHA v3 is an invisible, score-based system that provides superior protection without interrupting legitimate users.

## Version Information

- **reCAPTCHA Version**: v3 (score-based, invisible)
- **Previous Version**: Migrated from v2 (checkbox) on [current date]
- **Implementation Date**: October 2025

## Why reCAPTCHA v3?

- **Better UX**: No checkboxes or visual challenges for users
- **Score-Based**: Provides a score (0.0-1.0) indicating likelihood of being human
- **Modern Best Practice**: Google's recommended version since 2018
- **Superior Protection**: More sophisticated bot detection algorithms

## Architecture

### Frontend (Next.js/React)

**Utility File**: `src/utils/recaptcha.ts`

Key functions:
- `loadRecaptchaScript()`: Loads the reCAPTCHA v3 script
- `executeRecaptcha(action)`: Executes reCAPTCHA and returns a token

**Implementation in Forms**:
- `src/app/[locale]/admissions/page.tsx` - Action: `submit_admission`
- `src/app/[locale]/careers/page.tsx` - Action: `submit_career`
- `src/app/[locale]/contact/page.tsx` - Action: `submit_contact`

### Backend (Firebase Functions)

**Utility File**: `functions/src/utils/recaptcha.js`

Key function:
- `verifyRecaptchaV3(token, expectedAction, minScore)`: Verifies token with Google's API

**Verification Endpoints**:
- `submitAdmission` - Verifies action: `submit_admission`
- `submitCareerForm` - Verifies action: `submit_career`
- `submitContactForm` - Verifies action: `submit_contact`

## Configuration

### Environment Variables

**Frontend** (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`):
```
# Replace with your actual reCAPTCHA v3 site key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=YOUR_SITE_KEY_HERE
```
> Note: This is the public site key, safe to expose in client-side code

**Backend** (Firebase Functions Config):
```bash
firebase functions:config:set recaptcha.secret="YOUR_SECRET_KEY_HERE"
```

### Score Threshold

**Current Setting**: 0.5

**Score Interpretation**:
- `1.0` = Very likely a human
- `0.5` = Balanced threshold (recommended)
- `0.0` = Very likely a bot

**Adjusting Threshold**:
To change the threshold, modify the third parameter in `verifyRecaptchaV3()` calls in:
- `functions/src/admissions/admissionCrud.js`
- `functions/src/careers/careerCrud.js`
- `functions/src/contact/contactCrud.js`

Example:
```javascript
const recaptchaResult = await verifyRecaptchaV3(
    submissionData.recaptchaToken,
    'submit_admission',
    0.7  // Stricter threshold
);
```

## How It Works

### Form Submission Flow

1. **User fills form** - No visible reCAPTCHA elements
2. **User clicks submit** - Form validation occurs
3. **reCAPTCHA execution** - `executeRecaptcha(action)` is called
   - Script loads if not already present
   - Google analyzes user behavior
   - Token is generated (valid for ~2 minutes)
4. **Form submission** - Token included in request body as `recaptchaToken`
5. **Backend verification** - `verifyRecaptchaV3()` is called
   - Token sent to Google's API
   - Score and action validated
   - Score stored in database for analysis
6. **Response** - Form accepted or rejected

### Action Names

Each form has a unique action name for tracking and analysis:

| Form | Action Name | Endpoint |
|------|-------------|----------|
| Admissions | `submit_admission` | `/submitAdmission` |
| Careers | `submit_career` | `/submitCareerForm` |
| Contact | `submit_contact` | `/submitContactForm` |

## Error Handling

### Frontend Errors

**Script Loading Failure**:
```typescript
// Handled in src/utils/recaptcha.ts
try {
  await loadRecaptchaScript();
} catch (error) {
  console.error('Failed to load reCAPTCHA:', error);
  // User sees generic error message
}
```

**Token Generation Failure**:
- User sees: "An unexpected error occurred. Please try again."
- Admin sees: Console error with details

### Backend Errors

**Common Error Cases**:

1. **Missing Token**:
   - Response: `400 Bad Request`
   - Message: "reCAPTCHA verification failed"

2. **Low Score**:
   - Response: `400 Bad Request`
   - Message: "reCAPTCHA verification failed"
   - Logged: Score value for analysis

3. **Action Mismatch**:
   - Response: `400 Bad Request`
   - Message: "reCAPTCHA verification failed"
   - Logged: Expected vs actual action

4. **Configuration Missing**:
   - Response: `400 Bad Request`
   - Logged: "reCAPTCHA secret key not configured"

## Monitoring & Analytics

### Viewing Scores

reCAPTCHA scores are stored in Firestore with each submission:

**Admissions**: `admissions/{id}` → `recaptchaScore`
**Careers**: `careerSubmissions/{id}` → `recaptchaScore`
**Contact**: `contactSubmissions/{id}` → `recaptchaScore`

### Firebase Functions Logs

View verification logs:
```bash
firebase functions:log --only submitAdmission,submitCareerForm,submitContactForm
```

Look for entries like:
```
reCAPTCHA verification successful: { score: 0.9, action: 'submit_admission' }
```

### Google reCAPTCHA Console

Access advanced analytics at:
https://www.google.com/recaptcha/admin

View:
- Request volume
- Score distribution
- Suspicious activity
- Per-action metrics

## Testing

### Testing as a Human User

1. Fill out any form normally
2. Submit the form
3. Should receive success message
4. Expected score: > 0.5 (typically 0.7-0.9)

### Testing Score Threshold

To test rejection scenarios, temporarily lower the threshold to 0.9 in the backend code:

```javascript
const recaptchaResult = await verifyRecaptchaV3(
    submissionData.recaptchaToken,
    'submit_admission',
    0.9  // Very strict - will reject most submissions
);
```

### Viewing Logs

**Frontend** (Browser Console):
```javascript
// Success log in src/utils/recaptcha.ts shows token generation
// Form submission shows "reCAPTCHA verification successful"
```

**Backend** (Firebase Functions):
```bash
firebase functions:log --only submitAdmission
```

## Troubleshooting

### Issue: "reCAPTCHA verification failed"

**Possible Causes**:
1. Score too low (< 0.5)
2. Action name mismatch
3. Token expired (> 2 minutes old)
4. Invalid token

**Solution**:
- Check Firebase Functions logs for specific error
- Verify action names match in frontend and backend
- Ensure token is sent in request body as `recaptchaToken`

### Issue: Script fails to load

**Possible Causes**:
1. Ad blocker blocking Google domains
2. Network connectivity issues
3. Invalid site key

**Solution**:
- Check browser console for errors
- Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- Try disabling ad blockers

### Issue: Forms work locally but fail in production

**Possible Causes**:
1. Environment variables not set in production
2. Firebase Functions config not deployed
3. CORS issues

**Solution**:
```bash
# Verify production environment variable
# Check in Vercel/hosting dashboard

# Verify Firebase config
firebase functions:config:get

# Deploy functions with config
firebase deploy --only functions
```

## Deployment Checklist

When deploying reCAPTCHA changes:

- [ ] Environment variable `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set in hosting platform
- [ ] Firebase Functions config set: `firebase functions:config:set recaptcha.secret="..."`
- [ ] Frontend code deployed (Next.js build)
- [ ] Backend functions deployed (`firebase deploy --only functions`)
- [ ] Test all three forms in production
- [ ] Monitor Firebase logs for verification success
- [ ] Check reCAPTCHA console for request volume

## Security Considerations

### Best Practices

1. **Never expose secret key**: Keep it in Firebase Functions config only
2. **Don't trust scores alone**: Use as part of overall security strategy
3. **Store scores**: Track patterns to identify evolving threats
4. **Monitor regularly**: Check reCAPTCHA console for anomalies
5. **Rate limiting**: Consider adding rate limits in addition to reCAPTCHA

### Token Security

- Tokens are single-use and expire after 2 minutes
- Tokens contain no sensitive user data
- Backend validates token authenticity with Google
- Tokens are NOT stored in the database

## Maintenance

### Regular Tasks

**Monthly**:
- Review reCAPTCHA console for trends
- Check average scores in Firestore
- Review Firebase logs for unusual patterns

**As Needed**:
- Adjust score threshold based on false positives/negatives
- Update action names if forms change
- Rotate keys if compromised (requires code update)

### Updating Keys

If keys need to be regenerated:

1. Generate new keys at https://www.google.com/recaptcha/admin
2. Update frontend: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
3. Update backend: `firebase functions:config:set recaptcha.secret="..."`
4. Deploy both frontend and functions
5. Test all forms

## Support & Resources

- **Google reCAPTCHA Docs**: https://developers.google.com/recaptcha/docs/v3
- **reCAPTCHA Admin Console**: https://www.google.com/recaptcha/admin
- **Firebase Functions Logs**: `firebase functions:log`
- **Repository Documentation**: See README.md

## Migration Notes (v2 → v3)

### What Changed

**Frontend**:
- ❌ Removed: `react-google-recaptcha` package
- ❌ Removed: Visible checkbox UI
- ✅ Added: `src/utils/recaptcha.ts` utility
- ✅ Added: Invisible script loading
- ✅ Added: Token generation in submission handlers

**Backend**:
- ✅ Added: `axios` package for API calls
- ✅ Added: `functions/src/utils/recaptcha.js` verification utility
- ✅ Added: Score-based validation (≥ 0.5)
- ✅ Added: Action name validation
- ✅ Added: Score logging and storage

### Backward Compatibility

This implementation is NOT backward compatible with v2. All forms now require v3 tokens.

### Rollback Plan

If rollback is needed:
1. Revert to previous commit before migration
2. Redeploy frontend and functions
3. Verify v2 keys are still active in reCAPTCHA console

## Performance Impact

- **Script Size**: ~25KB (loaded once per session)
- **Execution Time**: 100-300ms per form submission
- **Network Requests**: 1 additional request to Google per submission
- **Overall Impact**: Minimal - user experience unchanged

## Compliance & Privacy

- reCAPTCHA v3 collects anonymous behavioral data
- No PII is collected by reCAPTCHA
- Complies with GDPR when properly disclosed
- Include mention in privacy policy
- User consent for cookies may be required based on jurisdiction

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintained By**: Development Team
