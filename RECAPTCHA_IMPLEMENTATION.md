# Google reCAPTCHA Integration - Implementation Summary

## Overview
This document provides a technical summary of the Google reCAPTCHA v2 integration implemented for the public forms (Admissions, Careers, Contact Us).

## Architecture

### Component Hierarchy
```
Form Page (admissions/careers/contact)
  ├── useRecaptchaForm Hook
  │   ├── recaptchaRef (ReCAPTCHA widget reference)
  │   ├── isSubmitting (loading state)
  │   ├── formError (error message)
  │   ├── formSuccess (success message)
  │   └── submitForm() (form submission handler)
  └── ReCAPTCHA Component (from react-google-recaptcha)
```

### Data Flow

1. **User fills out form** → Form state updates
2. **User completes reCAPTCHA** → Token generated and stored in ReCAPTCHA widget
3. **User clicks Submit** → `submitForm()` called
4. **Frontend validation** → Hook retrieves token from ReCAPTCHA widget
5. **API call** → POST to `/submitPublicForm` with:
   ```json
   {
     "formData": { ...form fields... },
     "recaptchaToken": "...",
     "formType": "admission|career|contact"
   }
   ```
6. **Backend verification** → Firebase Function:
   - Verifies token with Google reCAPTCHA API
   - Validates form data
   - Routes to correct Firestore collection
7. **Response** → Success/error message displayed to user
8. **Reset** → ReCAPTCHA widget reset for new submissions

## Implementation Details

### Frontend Hook (`useRecaptchaForm`)

**Location**: `src/hooks/useRecaptchaForm.ts`

**Purpose**: Centralized reCAPTCHA logic for all public forms

**Key Features**:
- Manages reCAPTCHA widget reference
- Handles token retrieval and validation
- Makes API call to unified backend function
- Provides loading/error/success states
- Resets reCAPTCHA after each submission
- Supports custom success/error callbacks

**Usage Example**:
```typescript
const { 
  recaptchaRef, 
  isSubmitting, 
  formError, 
  formSuccess, 
  submitForm, 
  resetForm 
} = useRecaptchaForm({
  onSuccess: (message) => {
    // Handle successful submission
    setFormData(initialState);
  }
});
```

### Backend Function (`submitPublicForm`)

**Location**: `functions/functions/src/publicForms.js`

**Purpose**: Single endpoint for all public form submissions with reCAPTCHA verification

**Process Flow**:
1. Receive request with form data, token, and form type
2. Verify reCAPTCHA token with Google API
3. Validate form data based on type
4. Save to appropriate Firestore collection
5. Return success/error response

**Collections Mapping**:
- `admission` → `admissions` collection
- `career` → `careerSubmissions` collection
- `contact` → `contactSubmissions` collection

**Dependencies**:
- `firebase-functions` - Cloud Functions framework
- `firebase-admin` - Firestore database access
- `axios` - HTTP client for reCAPTCHA API calls

### Form Integrations

#### Admissions Form
**File**: `src/app/[locale]/admissions/page.tsx`

**Changes**:
- Added ReCAPTCHA widget before submit button
- Replaced direct API call with `useRecaptchaForm` hook
- Updated state management to use hook's states
- Removed duplicate loading/error state logic

#### Careers Form
**File**: `src/app/[locale]/careers/page.tsx`

**Changes**:
- Added ReCAPTCHA widget before submit button
- Integrated with `useRecaptchaForm` hook
- Preserved resume upload functionality
- Upload happens before reCAPTCHA submission
- Combined upload URL with form data in submission

#### Contact Form
**File**: `src/app/[locale]/contact/page.tsx`

**Changes**:
- Added ReCAPTCHA widget before submit button
- Replaced direct API call with `useRecaptchaForm` hook
- Updated bilingual success/error messages
- Streamlined submission logic

## Security Considerations

### Token Validation
- **Single-use tokens**: Each reCAPTCHA token can only be used once
- **Time-limited**: Tokens expire after a few minutes
- **Server-side verification**: Token verification happens on backend only
- **Secret key protection**: Secret key never exposed to client

### API Endpoints
- **CORS enabled**: Uses existing CORS configuration
- **Public access**: No authentication required (by design)
- **Rate limiting**: Relies on reCAPTCHA to prevent abuse
- **Input validation**: All form fields validated before database write

### Environment Variables
- **Frontend**: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (public, safe to expose)
- **Backend**: `functions.config().recaptcha.secret` (private, server-only)

## Testing Strategy

### Manual Testing Checklist
- [ ] reCAPTCHA widget appears on all three forms
- [ ] Submit without completing reCAPTCHA shows error
- [ ] Form validates required fields
- [ ] Successful submission saves to correct Firestore collection
- [ ] Success message displays after submission
- [ ] Form resets after successful submission
- [ ] reCAPTCHA resets after each submission
- [ ] Error messages display for verification failures
- [ ] Works in production environment
- [ ] Works with local Firebase emulators

### Error Scenarios
1. **Missing reCAPTCHA token**: "Please complete the reCAPTCHA verification"
2. **Invalid token**: "reCAPTCHA verification failed. Please try again."
3. **Missing form data**: "Missing required field: [fieldName]"
4. **Invalid email**: "Invalid email format"
5. **Network errors**: "An unexpected error occurred"

## Performance Considerations

### Frontend
- **Lazy loading**: reCAPTCHA scripts loaded only when needed
- **Single request**: One API call per submission
- **Minimal re-renders**: Hook optimized to prevent unnecessary updates

### Backend
- **Parallel operations**: Form validation runs concurrently with reCAPTCHA verification
- **Connection pooling**: Axios reuses HTTP connections
- **Firestore batching**: Single write operation per submission

## Maintenance

### Updating reCAPTCHA Keys
1. Generate new keys in Google reCAPTCHA admin console
2. Update Vercel environment variable
3. Update Firebase Functions config
4. Redeploy both frontend and backend

### Monitoring
- Check Firebase Functions logs for verification failures
- Monitor Firestore for submission success rates
- Review reCAPTCHA admin console for traffic patterns

### Common Issues
- **Widget not loading**: Check domain whitelist in reCAPTCHA admin
- **Verification always failing**: Verify secret key is correct
- **CORS errors**: Ensure CORS headers are set in backend function

## Future Enhancements

### Potential Improvements
1. **reCAPTCHA v3**: Consider upgrading to invisible reCAPTCHA
2. **Analytics**: Track reCAPTCHA completion rates
3. **A/B Testing**: Test impact on conversion rates
4. **Admin dashboard**: View blocked submissions
5. **Email notifications**: Alert on failed verifications
6. **Custom error messages**: Localized error messages per form

## Dependencies

### NPM Packages (Frontend)
```json
{
  "react-google-recaptcha": "^3.1.0",
  "@types/react-google-recaptcha": "^2.1.9"
}
```

### NPM Packages (Backend)
```json
{
  "axios": "^1.6.0"
}
```

## Related Files

### Source Code
- `src/hooks/useRecaptchaForm.ts` - Custom React hook
- `functions/functions/src/publicForms.js` - Backend function
- `functions/functions/index.js` - Function exports
- `src/app/[locale]/admissions/page.tsx` - Admissions form
- `src/app/[locale]/careers/page.tsx` - Careers form
- `src/app/[locale]/contact/page.tsx` - Contact form

### Configuration
- `.env.example` - Frontend environment variables template
- `functions/functions/.runtimeconfig.example.json` - Backend config template
- `.gitignore` - Ignore sensitive configuration files

### Documentation
- `RECAPTCHA_SETUP_GUIDE.md` - Setup and configuration guide
- `RECAPTCHA_IMPLEMENTATION.md` - This file

## Support

For issues or questions:
1. Check `RECAPTCHA_SETUP_GUIDE.md` for configuration help
2. Review Firebase Functions logs for errors
3. Verify environment variables are set correctly
4. Check Google reCAPTCHA admin console for domain issues
