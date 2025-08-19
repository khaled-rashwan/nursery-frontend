# Teacher Portal Debug Guide

## Check if Teacher Has Class Assignments

### Step 1: Open Browser Console
1. Login as a teacher
2. Go to Teacher Portal 
3. Open Browser Developer Tools (F12)
4. Look for console logs starting with 🔍, 📡, 📋, etc.

### Step 2: Analyze Console Output

#### Expected Output - Working Case:
```
🔍 Fetching teacher assignments for: teacher@example.com (abc123)
📡 API Response Status: 200 OK
📋 Raw teacher API response: { teacher: { classes: [...] } }
📋 Teacher assignments extracted: { assignmentCount: 2, assignments: [...] }
🔍 Found 2 class assignments for teacher
🏫 Available classes in system: [{ id: "class1", name: "KG1-A" }]
🎯 Matching logic results:
   - Assignment class1 → FOUND (KG1-A)
✅ Found 1 classes for teacher teacher@example.com
```

#### Problem Case 1 - No Teacher Record:
```
🔍 Fetching teacher assignments for: teacher@example.com (abc123)
📡 API Response Status: 404 Not Found
❌ Teacher API call failed: HTTP 404
⚠️ Failed to fetch teacher assignments: HTTP 404: Teacher not found
🔄 No assignments found, using legacy teacherUID filtering method
```

#### Problem Case 2 - Empty Assignments:
```
🔍 Fetching teacher assignments for: teacher@example.com (abc123)
📡 API Response Status: 200 OK
📋 Raw teacher API response: { teacher: { classes: [] } }
📋 Teacher assignments extracted: { assignmentCount: 0, assignments: [] }
🔄 No assignments found, using legacy teacherUID filtering method
```

#### Problem Case 3 - ID Mismatch:
```
🔍 Found 2 class assignments for teacher
📋 Assigned classes data: [{ classId: "old-id-123", className: "KG1-A" }]
🏫 Available classes in system: [{ id: "new-id-456", name: "KG1-A" }]
🎯 Matching logic results:
   - Assignment old-id-123 → NOT FOUND (KG1-A)
📚 No classes found for teacher
```

## Solutions Based on Console Output

### Solution 1: Teacher Record Missing
**Symptoms**: 404 error, "Teacher not found"
**Fix**: Create teacher record in Admin → Teacher Management → Assign Classes

### Solution 2: No Class Assignments
**Symptoms**: Empty assignments array, assignmentCount: 0
**Fix**: Assign classes to teacher in Admin → Teacher Management → Assign Classes

### Solution 3: Class ID Mismatch
**Symptoms**: Assignments exist but no matches found
**Fix**: Re-assign classes to update with correct class IDs

### Solution 4: Legacy teacherUID Method Working
**Symptoms**: Falls back to legacy method, finds classes
**Result**: System working but using old architecture

## Quick Fix Commands

### Check Teacher Record Exists:
```javascript
// Run in browser console
fetch('/api/manageTeachersNew?operation=get&teacherId=TEACHER_UID', {
  headers: { 'Authorization': 'Bearer ' + await firebase.auth().currentUser.getIdToken() }
}).then(r => r.json()).then(console.log)
```

### Check Available Classes:
```javascript
// Run in browser console  
fetch('/api/manageClasses?operation=list', {
  headers: { 'Authorization': 'Bearer ' + await firebase.auth().currentUser.getIdToken() }
}).then(r => r.json()).then(data => console.log('Classes:', data.classes.map(c => ({id: c.id, name: c.name}))))
```

## Common Issues

1. **Teacher UID Mismatch**: User UID doesn't match teacher record UID
2. **Stale Class IDs**: Assignments point to old/deleted class IDs  
3. **Missing Teacher Collection**: Teacher user exists but no teacher document
4. **API Permissions**: Teacher doesn't have permission to access manageTeachersNew endpoint

## Next Steps

1. **Examine Console Logs**: Identify which case matches your output
2. **Apply Corresponding Solution**: Follow the fix for your specific case
3. **Test Assignment Process**: Try assigning classes through Admin panel
4. **Verify Data Consistency**: Ensure class IDs match between collections
