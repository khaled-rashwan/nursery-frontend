# reCAPTCHA v3 Quick Reference

## For Frontend Developers

### Adding reCAPTCHA to a New Form

```typescript
import { loadRecaptchaScript, executeRecaptcha } from '../../../utils/recaptcha';

// 1. Load script on component mount
useEffect(() => {
  loadRecaptchaScript().catch(error => {
    console.error('Failed to load reCAPTCHA:', error);
  });
}, []);

// 2. Execute before form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // Get reCAPTCHA token with unique action name
    const recaptchaToken = await executeRecaptcha('your_action_name');
    
    // Include token in API request
    const response = await fetch('/api/your-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        recaptchaToken
      })
    });
    
    // Handle response
    if (response.ok) {
      // Success
    }
  } catch (error) {
    // Handle error
  }
};
```

### Action Naming Convention

Use descriptive action names in format: `verb_noun`

Examples:
- `submit_admission`
- `submit_feedback`
- `request_callback`
- `download_brochure`

## For Backend Developers

### Adding Verification to Firebase Functions

```javascript
const { verifyRecaptchaV3 } = require('../utils/recaptcha');

exports.yourFunction = functions.https.onRequest(async (req, res) => {
  // 1. Verify reCAPTCHA
  const recaptchaResult = await verifyRecaptchaV3(
    req.body.recaptchaToken,
    'your_action_name',  // Must match frontend
    0.5                   // Score threshold
  );
  
  // 2. Check result
  if (!recaptchaResult.success) {
    console.error('reCAPTCHA failed:', recaptchaResult.error);
    return res.status(400).json({ 
      error: 'reCAPTCHA verification failed' 
    });
  }
  
  // 3. Log score for monitoring
  console.log('reCAPTCHA score:', recaptchaResult.score);
  
  // 4. Continue with business logic
  // Store recaptchaResult.score if needed
  
  // 5. Remove token from data before storing
  delete req.body.recaptchaToken;
});
```

### Adjusting Score Threshold

| Threshold | Use Case |
|-----------|----------|
| 0.3 | Very permissive - use for low-risk actions |
| 0.5 | **Recommended** - good balance |
| 0.7 | Strict - may reject some humans |
| 0.9 | Very strict - testing only |

## Common Tasks

### Check if reCAPTCHA is Working

**Frontend** (Browser Console):
```javascript
// After form submission, you should see:
// "reCAPTCHA verification successful"
```

**Backend** (Terminal):
```bash
firebase functions:log --only yourFunctionName
# Look for: "reCAPTCHA verification: { success: true, score: 0.X }"
```

### View Recent Scores

Query Firestore:
```javascript
db.collection('yourCollection')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.data().recaptchaScore);
    });
  });
```

### Test Different Scenarios

**Test as Human** (expected: score 0.7-0.9):
1. Browse the site normally
2. Fill form naturally
3. Submit

**Test as Bot** (expected: score < 0.5):
1. Use automated scripts
2. Rapid form submission
3. Suspicious patterns

## Environment Setup

### Development

```bash
# .env.local
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM-fkrBM-fkrBM-fkrBM
```

### Production

**Hosting Platform** (Vercel/Netlify/etc):
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM-fkrBM-fkrBM-fkrBM
```

**Firebase Functions**:
```bash
firebase functions:config:set recaptcha.secret="YOUR_SECRET_KEY"
firebase deploy --only functions
```

## Debugging

### Frontend Issues

**Script not loading?**
```typescript
// Check in browser console
console.log(window.grecaptcha); // Should be defined

// Check script tag exists
document.querySelector('script[src*="recaptcha"]');
```

**Token generation failing?**
```typescript
try {
  const token = await executeRecaptcha('test_action');
  console.log('Token:', token.substring(0, 20) + '...');
} catch (error) {
  console.error('Error:', error);
}
```

### Backend Issues

**Verification failing?**
```javascript
// Add detailed logging
const result = await verifyRecaptchaV3(token, action, 0.5);
console.log('Full result:', result);
// Check: success, score, action, error
```

**Config missing?**
```bash
firebase functions:config:get
# Should show: { recaptcha: { secret: "..." } }
```

## Security Reminders

✅ **DO:**
- Use unique action names per form
- Log scores for monitoring
- Remove tokens before storing data
- Keep secret key in Firebase config only

❌ **DON'T:**
- Expose secret key in frontend code
- Store tokens in database
- Trust scores blindly without validation
- Use same action name for different forms

## Useful Links

- Full Guide: `RECAPTCHA_V3_GUIDE.md`
- Google Docs: https://developers.google.com/recaptcha/docs/v3
- Admin Console: https://www.google.com/recaptcha/admin

---

**Quick Help**: Check `RECAPTCHA_V3_GUIDE.md` for detailed documentation
