# reCAPTCHA Enterprise Quick Setup Guide

## Summary

This project uses **reCAPTCHA Enterprise** with **Google Cloud Service Account authentication** for backend verification.

## Site Key (Frontend)

```
6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25
```

## Environment Variables

### Frontend (Vercel)

Set in Vercel dashboard → Project Settings → Environment Variables:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25
```

### Backend (Cloud Functions)

#### Running on Google Cloud

1. Create service account with reCAPTCHA Enterprise Agent role
2. Deploy function with service account attached
3. Authentication is automatic via ADC

#### Running Locally or Outside Google Cloud

1. Generate service account JSON key
2. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```

## Quick Deployment

### Deploy Functions

```bash
cd functions/functions

# Option 1: Firebase deploy
firebase deploy --only functions:submitPublicForm

# Option 2: gcloud deploy (with service account)
gcloud functions deploy submitPublicForm \
  --runtime nodejs22 \
  --trigger-http \
  --service-account=recaptcha-verifier@future-step-nursery.iam.gserviceaccount.com \
  --project=future-step-nursery
```

### Deploy Frontend

```bash
# Vercel (automatic on git push)
git push

# Or manual
vercel deploy --prod
```

## Testing

1. Visit forms:
   - `/en-US/admissions`
   - `/en-US/careers`
   - `/en-US/contact`

2. Submit a form

3. Check logs:
   ```bash
   firebase functions:log --only submitPublicForm
   ```

4. Verify in Google Cloud Console:
   - https://console.cloud.google.com/security/recaptcha
   - Status should be "Active" (not "Incomplete")

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "reCAPTCHA configuration missing" | Service account not configured or lacks permissions |
| "Permission denied" | Grant `roles/recaptchaenterprise.agent` to service account |
| Frontend script fails to load | Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly |
| Token invalid | Check site key matches between frontend and backend |

## Key Files

- Frontend: `src/utils/recaptcha.ts`
- Backend: `functions/functions/src/utils/recaptchaEnterprise.js`
- Forms handler: `functions/functions/src/publicForms.js`

## Documentation

For detailed information, see:
- [RECAPTCHA_ENTERPRISE_MIGRATION.md](./RECAPTCHA_ENTERPRISE_MIGRATION.md) - Complete migration guide
- [Google Cloud reCAPTCHA Enterprise Docs](https://cloud.google.com/recaptcha-enterprise/docs)

## What Changed from Old Implementation

| Aspect | Old (v2/v3) | New (Enterprise) |
|--------|-------------|------------------|
| Authentication | Secret key | Service Account |
| API Endpoint | siteverify | createAssessment |
| Script URL | `/api.js` | `/enterprise.js` |
| Configuration | `functions.config().recaptcha.secret` | Service account with IAM role |
| Client Library | axios (manual) | @google-cloud/recaptcha-enterprise |

## Action Names

- Admissions form: `submit_admission`
- Careers form: `submit_career`
- Contact form: `submit_contact`

## Security Notes

- ✅ Service account keys should NEVER be committed to Git
- ✅ Use ADC when running on Google Cloud (preferred)
- ✅ Rotate service account keys every 90 days if using JSON keys
- ✅ Monitor reCAPTCHA Enterprise console for unusual activity
- ✅ Default score threshold: 0.5 (adjustable)
