# 🖼️ Image Upload Deployment Fix

## Problem Solved
Fixed the issue where image uploads would disappear after deployment for all pages except home and academic programs.

## Root Cause
The `seed-database.js` script was using `set()` operations without merge, which completely overwrote Firestore documents, losing any user-uploaded images stored via the CMS.

## Changes Made

### 1. **Fixed seed-database.js** ✅
```javascript
// Before: Complete overwrite
await db.collection('websiteContent').doc('homePage').set(homePageContent);

// After: Merge to preserve existing content
await db.collection('websiteContent').doc('homePage').set(homePageContent, { merge: true });
```

### 2. **Fixed Firebase Storage URLs** ✅
- Converted invalid `gs://` URLs to proper HTTPS URLs in `admissionsPageContent.js`
- Updated frontend components to handle proper URLs directly

### 3. **Enhanced Storage Service** ✅
- Added optional `customFileName` parameter to `uploadImage()` function for better file management

## Deployment Instructions

### For New Deployments:
```bash
# Deploy Firebase functions (if needed)
cd functions
firebase deploy --only functions

# Seed database (now safe for image preservation)
node seed-database.js

# Deploy frontend
npm run build
npm start
```

### For Existing Deployments:
The fix is automatically applied. No manual intervention required for existing uploaded images.

## Technical Details

### Why Some Pages Worked Before:
- **Home page**: Used static image path `/her-image.png`
- **Academic programs**: Used static image filenames like `prekg.avif`
- These static references survived database reseeding

### Why Other Pages Failed:
- **Gallery, Careers, Contact, etc.**: Relied on dynamic image URLs stored in Firestore
- These URLs were lost when `set()` overwrote the documents completely

### The Fix:
- Using `merge: true` preserves existing dynamic content while updating static content
- All uploaded images now persist across deployments

## Verification

To verify the fix works:
1. Upload images via CMS on any page
2. Run `node seed-database.js`
3. Check that uploaded images are still accessible
4. Deploy and verify images persist

## Backend Changes Required: ❌ None
- No Firebase function changes needed
- No database migration required
- Existing uploaded images remain intact

The fix is minimal, surgical, and backward-compatible.