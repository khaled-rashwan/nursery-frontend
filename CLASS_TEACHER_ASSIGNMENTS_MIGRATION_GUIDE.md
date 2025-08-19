# Class-Teacher Assignments Migration Guide

## Overview

This document outlines the transition from embedded teacher assignments within class documents to a separate `class_teacher_assignments` collection as the single source of truth for teacher-class relationships.

## Architecture Change

### Before (Current/Legacy)
```
Classes Collection:
{
  id: "class_id",
  name: "KG1-A",
  teachers: [
    {
      teacherId: "teacher_uid",
      subjects: ["Math", "Science"]
    }
  ],
  teacherInfo: [/* populated teacher data */]
}

Teachers Collection (in teacher management):
{
  id: "teacher_id", 
  classes: [
    {
      classId: "class_id",
      className: "KG1-A", 
      subjects: ["Math", "Science"]
    }
  ]
}
```

### After (New Architecture)
```
Classes Collection:
{
  id: "class_id",
  name: "KG1-A",
  // NO teachers field
  // NO teacherInfo field
}

class_teacher_assignments Collection:
{
  id: "assignment_id",
  classId: "class_document_id",
  teacherId: "teacher_uid",
  subjects: ["Math", "Science"],
  assignedDate: "2024-01-15",
  isActive: true,
  academicYear: "2024-2025",
  assignmentType: "primary" | "substitute" | "assistant",
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "admin_uid"
}

Teachers Collection:
{
  id: "teacher_id",
  // NO classes field
}
```

## Migration Progress

### ✅ Completed - Class Management Component

**File:** `src/app/[locale]/admin/components/class-management/ClassManagement.tsx`

**Changes Made:**

1. **Interface Updates:**
   - Commented out `teachers` and `teacherInfo` fields from `Class` interface
   - Added comprehensive TODO comments for future removal

2. **Form Handling:**
   - Removed teacher assignment form fields
   - Added informational box explaining teacher assignments are managed elsewhere
   - Simplified form validation (no teacher validation)
   - Updated form submission to pass empty teachers array

3. **Display Logic:**
   - Updated teacher display in table to show migration message
   - Commented out existing teacher display logic for future removal

4. **API Integration:**
   - Modified class creation to pass empty teachers array (temporary fix)
   - Updated class submission to exclude teacher data

**Benefits Achieved:**
- ✅ Single source of truth for teacher assignments
- ✅ Eliminated data duplication
- ✅ Improved data consistency
- ✅ Cleaner separation of concerns
- ✅ Better user experience (no confusion about where to assign teachers)

### 🔄 Next Steps

#### 1. Backend API Updates
**Priority: High**

**Files to Update:**
- `functions/src/classes/classCrud.js`
- `functions/src/classes/classCrudNew.js`

**Changes Needed:**
- Remove `teachers` field requirement from class creation
- Remove `teachers` field from class updates
- Update class listing to not populate teacher info
- Create new `class_teacher_assignments` collection CRUD operations

#### 2. Create Class-Teacher Assignment Management
**Priority: High**

**New Collection Structure:**
```javascript
// Firebase collection: class_teacher_assignments
{
  id: auto-generated,
  classId: "class_document_id",
  teacherId: "teacher_uid", 
  subjects: ["Math", "Science"],
  assignedDate: "2024-01-15",
  isActive: true,
  academicYear: "2024-2025",
  assignmentType: "primary", // primary, substitute, assistant
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  createdBy: "admin_uid"
}
```

**New API Endpoints Needed:**
```javascript
// functions/src/assignments/assignmentCrud.js
- createAssignment(classId, teacherId, subjects, assignmentType)
- updateAssignment(assignmentId, updateData)
- deleteAssignment(assignmentId)
- getAssignmentsByClass(classId)
- getAssignmentsByTeacher(teacherId)
- getAssignmentsByAcademicYear(academicYear)
```

#### 3. Update Teacher Management Component
**Priority: Medium**

**File:** `src/app/[locale]/admin/components/teacher-management/TeacherManagement.tsx`

**Changes Needed:**
- Update teacher assignment modal to use new assignment API
- Remove `classes` field from teacher interface
- Update display logic to fetch assignments from new collection
- Modify assignment creation/updates to use assignment endpoints

#### 4. Update Display Logic Throughout App
**Priority: Medium**

**Files to Update:**
- Teacher Portal dashboard
- Class displays in enrollment forms
- Attendance management teacher filtering
- Any reports showing teacher-class relationships

**Changes Needed:**
- Replace direct teacher field access with assignment lookups
- Update queries to join with assignment collection
- Modify caching strategies for assignment data

#### 5. Data Migration Script
**Priority: High** (Before deployment)

**Create:** `migrate-teacher-assignments.js`

**Purpose:**
- Extract existing teacher assignments from class documents
- Create new assignment documents in `class_teacher_assignments` collection
- Verify data integrity
- Provide rollback capability

**Migration Steps:**
1. Backup existing data
2. Create assignment documents from existing class.teachers arrays
3. Create assignment documents from existing teacher.classes arrays
4. Resolve conflicts and duplicates
5. Verify all assignments are migrated
6. Update class documents to remove teachers field (after verification)
7. Update teacher documents to remove classes field (after verification)

#### 6. Testing Strategy
**Priority: High**

**Test Cases:**
- Class creation without teachers works
- Teacher assignment through Teacher Management works
- Class displays show correct teacher info from assignments
- Teacher displays show correct class info from assignments
- Assignment CRUD operations work correctly
- Data consistency across all components
- Migration script works correctly
- Rollback procedures work

#### 7. Security Rules Update
**Priority: High**

**File:** `functions/firestore.rules`

**Add Rules for:**
```javascript
match /class_teacher_assignments/{assignmentId} {
  allow read: if request.auth != null && 
    (resource.data.teacherId == request.auth.uid || 
     hasRole(['admin', 'superadmin']));
  
  allow write: if request.auth != null && 
    hasRole(['admin', 'superadmin']);
}
```

## Implementation Timeline

### Phase 1: Infrastructure (Week 1)
- [ ] Create `class_teacher_assignments` collection structure
- [ ] Implement assignment CRUD API endpoints
- [ ] Update Firestore security rules
- [ ] Create data migration script

### Phase 2: Backend Integration (Week 2)
- [ ] Update class APIs to remove teacher requirements
- [ ] Test assignment APIs thoroughly
- [ ] Run migration script on development data
- [ ] Verify data integrity

### Phase 3: Frontend Updates (Week 3)
- [ ] Update Teacher Management component
- [ ] Update all display components to use assignments
- [ ] Update attendance and enrollment components
- [ ] Test all teacher-class relationship features

### Phase 4: Testing & Deployment (Week 4)
- [ ] Comprehensive testing of all features
- [ ] Performance testing of assignment queries
- [ ] UAT with stakeholders
- [ ] Production migration
- [ ] Monitor and verify production data

## Risk Mitigation

### Data Loss Prevention
- Complete backup before migration
- Rollback script ready
- Migration verification at each step
- Gradual rollout with monitoring

### Performance Considerations
- Index optimization for assignment queries
- Caching strategy for frequently accessed assignments
- Query optimization for teacher-class lookups
- Consider denormalization for high-frequency reads

### User Experience
- Clear communication about changes
- Training for admin users
- Fallback UI states during migration
- Help documentation updates

## Success Metrics

1. **Data Consistency:** 100% match between old and new data structures
2. **Performance:** Assignment queries < 500ms response time
3. **User Adoption:** 0 user-reported issues related to teacher assignments
4. **System Reliability:** 99.9% uptime during migration
5. **Data Integrity:** 0 orphaned assignments or missing relationships

## Rollback Plan

In case of issues:

1. **Immediate Rollback:**
   - Restore teacher fields in class documents from backup
   - Disable assignment collection access
   - Revert frontend to use embedded teacher data

2. **Data Recovery:**
   - Restore from pre-migration backup
   - Verify data integrity
   - Re-deploy previous version

3. **Communication:**
   - Notify stakeholders immediately
   - Provide timeline for resolution
   - Document lessons learned

## Contact & Support

- **Technical Lead:** [Name]
- **Database Admin:** [Name]  
- **QA Lead:** [Name]
- **Product Owner:** [Name]

---

*This document will be updated as migration progresses.*
