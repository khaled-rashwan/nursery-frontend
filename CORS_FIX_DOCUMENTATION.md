# CORS Fix for Payment Tracking

## Issue Description
The payment tracking feature was experiencing CORS errors when the frontend tried to access the `getPaymentSummaryByParent` endpoint:

```
Access to fetch at 'https://us-central1-future-step-nursery.cloudfunctions.net/managePayments/getPaymentSummaryByParent?academicYear=2025-2026' 
from origin 'https://nursery-frontend-hb12.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
The Express app in `functions/functions/src/payments/paymentCrud.js` was missing global CORS middleware. While individual routes were calling `setCorsHeaders(res)` and `handleCorsOptions(req, res)`, the preflight OPTIONS requests weren't being handled properly at the application level.

## Solution
Added global CORS middleware to the Express app that:
1. Sets CORS headers for all requests
2. Handles OPTIONS preflight requests before they reach individual route handlers
3. Eliminates the need for redundant CORS calls in each route

## Changes Made

### Before (Problematic):
```javascript
const app = express();
const db = admin.firestore();

// Each route had to handle CORS individually
app.get('/getPaymentSummaryByParent', async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  // ... rest of route handler
});
```

### After (Fixed):
```javascript
const app = express();
const db = admin.firestore();

// Global CORS middleware
app.use((req, res, next) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) {
    return;
  }
  next();
});

// Routes no longer need individual CORS handling
app.get('/getPaymentSummaryByParent', async (req, res) => {
  // ... route handler logic
});
```

## Files Modified
- `functions/functions/src/payments/paymentCrud.js`: Added global CORS middleware and removed redundant CORS calls from individual routes

## Testing
The fix ensures that:
- All payment API endpoints have proper CORS headers
- OPTIONS preflight requests are handled correctly
- The frontend can successfully make requests to payment endpoints
- No functionality is broken in existing payment operations

## CORS Headers Set
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

This fix resolves the CORS error and allows the payment tracking feature to work properly across all supported origins.