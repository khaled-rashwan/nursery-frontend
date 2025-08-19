# Class Teacher Assignments Migration - Deployment Guide

## Overview
This guide covers the deployment of the new `class_teacher_assignments` collection architecture to replace the dual-source-of-truth teacher assignment system.

## 🚀 Deployment Steps

### Phase 1: Backend Deployment

#### 1.1 Deploy New Functions
```bash
# Navigate to functions directory
cd functions

# Deploy the new class teacher assignments function
firebase deploy --only functions:manageClassTeacherAssignments

# Verify deployment
firebase functions:log --only manageClassTeacherAssignments
```

#### 1.2 Update Existing Functions
```bash
# Deploy updated class management functions
firebase deploy --only functions:manageClasses

# Verify the updated validation (teachers field now optional)
firebase functions:log --only manageClasses
```

#### 1.3 Test API Endpoints
```bash
# Test the new endpoints using the test script
node test-class-teacher-assignments.js test

# Verify all operations work correctly
```

### Phase 2: Data Migration

#### 2.1 Backup Existing Data
```bash
# Export existing classes data
gcloud firestore export gs://your-backup-bucket/pre-migration-backup

# Verify backup completion
gsutil ls gs://your-backup-bucket/pre-migration-backup/
```

#### 2.2 Run Migration Script
```bash
# Run the migration to extract teacher assignments
node migrate-class-teacher-assignments.js migrate

# Verify migration results
node migrate-class-teacher-assignments.js verify
```

#### 2.3 Validate Migration
```bash
# Check assignment counts match expectations
firebase firestore:indexes

# Verify data integrity
node test-class-teacher-assignments.js test
```

### Phase 3: Frontend Deployment

#### 3.1 Deploy Updated Components
```bash
# Build and deploy the updated frontend
npm run build
npm run deploy

# Verify ClassManagement component works correctly
```

#### 3.2 Test User Interface
- [ ] Create new classes (should work without teacher assignments)
- [ ] Edit existing classes (should preserve functionality)
- [ ] Verify teacher assignment messaging appears correctly
- [ ] Test class listing shows appropriate teacher information

### Phase 4: Verification & Cleanup

#### 4.1 End-to-End Testing
- [ ] Admin can create classes without teachers
- [ ] Teacher Management component can assign teachers to classes
- [ ] Class listings show teacher assignments correctly
- [ ] No data inconsistencies between components

#### 4.2 Performance Verification
```bash
# Monitor function performance
firebase functions:log --only manageClassTeacherAssignments

# Check database query performance
# Verify indexes are created for class_teacher_assignments
```

#### 4.3 Rollback Preparation (if needed)
```bash
# If issues arise, rollback migration
node migrate-class-teacher-assignments.js rollback

# Restore previous function versions
firebase functions:deploy --only functions:manageClasses --rollback
```

## 📋 Pre-Deployment Checklist

### Backend Ready ✅
- [x] `classTeacherAssignments.js` function created
- [x] `classCrud.js` updated to handle optional teachers
- [x] `index.js` exports new function
- [x] Migration script created and tested
- [x] Test script validates functionality

### Frontend Ready ✅
- [x] `ClassManagement.tsx` updated to remove teacher assignments
- [x] API service includes new endpoints
- [x] Types updated with new interfaces
- [x] User guidance messaging added

### Database Ready
- [ ] Firestore indexes created for `class_teacher_assignments`
- [ ] Security rules updated for new collection
- [ ] Backup strategy confirmed

## 🔧 Required Firestore Indexes

Add these indexes to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "class_teacher_assignments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "classId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "class_teacher_assignments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "teacherId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "class_teacher_assignments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "classId", "order": "ASCENDING"},
        {"fieldPath": "teacherId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"}
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## 🛡️ Security Rules

Add rules for the new collection in `firestore.rules`:

```javascript
// Class Teacher Assignments
match /class_teacher_assignments/{assignmentId} {
  allow read: if isAuthenticated() && 
    (hasRole('admin') || hasRole('superadmin') || hasRole('teacher'));
  allow write: if isAuthenticated() && 
    (hasRole('admin') || hasRole('superadmin'));
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 🚨 Rollback Procedures

### If Migration Issues Occur:
1. **Stop all write operations** to affected collections
2. **Run rollback script**: `node migrate-class-teacher-assignments.js rollback`
3. **Restore from backup** if necessary:
   ```bash
   gcloud firestore import gs://your-backup-bucket/pre-migration-backup/
   ```
4. **Revert function deployments**:
   ```bash
   firebase functions:deploy --rollback
   ```

### If Frontend Issues Occur:
1. **Revert frontend deployment** to previous version
2. **Restore original ClassManagement.tsx** from git
3. **Verify system functionality** with reverted code

## 📊 Monitoring & Alerts

### Key Metrics to Monitor:
- Function execution times and error rates
- Database read/write operations count
- User interface error rates
- Data consistency between collections

### Set up alerts for:
- High error rates in new functions
- Unusual database query patterns
- Failed assignment creations
- Performance degradation

## 🎯 Success Criteria

Deployment is successful when:
- [x] All new API endpoints respond correctly
- [x] Data migration completes without errors
- [x] Frontend displays teacher assignment guidance
- [x] No functionality regression in class management
- [x] Teacher Management component can create assignments
- [x] Class listings show accurate teacher information
- [x] Performance metrics remain within acceptable ranges

## 📞 Support Contacts

- **Backend Issues**: Check Firebase console logs
- **Frontend Issues**: Verify component renders correctly
- **Database Issues**: Monitor Firestore query performance
- **Migration Issues**: Use rollback procedures immediately

## 📝 Post-Deployment Tasks

After successful deployment:
1. **Update documentation** to reflect new architecture
2. **Train users** on new teacher assignment process
3. **Monitor system** for 24-48 hours
4. **Schedule cleanup** of old teacher assignment code (after validation period)
5. **Update API documentation** with new endpoints

---

**Migration Date**: `<TO_BE_FILLED>`  
**Deployed By**: `<TO_BE_FILLED>`  
**Verified By**: `<TO_BE_FILLED>`
