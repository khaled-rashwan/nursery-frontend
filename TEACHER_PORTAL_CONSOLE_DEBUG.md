# Teacher Portal Debugging Commands

## Quick Debug Commands for Browser Console

### 1. Check Teacher Record in Firestore
```javascript
// Copy and paste in browser console while logged in as teacher
(async function checkTeacherRecord() {
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  const { getAuth } = await import('firebase/auth');
  
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  console.log('🔍 Checking teacher record for:', user.email, user.uid);
  
  const teacherRef = doc(db, 'teachers', user.uid);
  const teacherSnap = await getDoc(teacherRef);
  
  if (teacherSnap.exists()) {
    const data = teacherSnap.data();
    console.log('✅ Teacher record found:', data);
    console.log('📚 Class assignments:', data.classes || []);
  } else {
    console.log('❌ Teacher record NOT found in Firestore');
    console.log('💡 Solution: Create teacher record in Admin → Teacher Management');
  }
})();
```

### 2. Check Available Classes
```javascript
// Check all classes in system
(async function checkClasses() {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  const token = await user.getIdToken();
  const response = await fetch('https://us-central1-future-step-nursery.cloudfunctions.net/manageClasses?operation=list', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('🏫 Available classes:', data.classes?.map(c => ({
    id: c.id,
    name: c.name,
    level: c.level,
    teacherUID: c.teacherUID
  })));
})();
```

### 3. Test Teacher API Call
```javascript
// Test the teacher API endpoint
(async function testTeacherAPI() {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  console.log('🔍 Testing teacher API for:', user.email, user.uid);
  
  try {
    const token = await user.getIdToken();
    const response = await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/manageTeachersNew?operation=get&teacherId=${user.uid}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Teacher API response:', data);
      console.log('📚 Class assignments:', data.teacher?.classes || []);
    } else {
      const errorText = await response.text();
      console.error('❌ API failed:', errorText);
    }
  } catch (error) {
    console.error('❌ API error:', error);
  }
})();
```

### 4. Manual Class Assignment Check
```javascript
// Manually check if teacher should see specific classes
(async function manualCheck() {
  const { getAuth } = await import('firebase/auth');
  const { doc, getDoc, collection, getDocs } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  console.log('🔍 Manual assignment check for:', user.email);
  
  // Get teacher assignments
  const teacherRef = doc(db, 'teachers', user.uid);
  const teacherSnap = await getDoc(teacherRef);
  
  if (!teacherSnap.exists()) {
    console.log('❌ No teacher record found');
    return;
  }
  
  const teacherData = teacherSnap.data();
  const assignments = teacherData.classes || [];
  
  console.log('📋 Teacher assignments:', assignments);
  
  // Get all classes
  const classesRef = collection(db, 'classes');
  const classesSnap = await getDocs(classesRef);
  const allClasses = [];
  
  classesSnap.forEach(doc => {
    allClasses.push({ id: doc.id, ...doc.data() });
  });
  
  console.log('🏫 All classes:', allClasses.map(c => ({ id: c.id, name: c.name })));
  
  // Check matches
  console.log('🎯 Assignment matches:');
  assignments.forEach(assignment => {
    const match = allClasses.find(cls => cls.id === assignment.classId);
    console.log(`   ${assignment.classId} (${assignment.className}) → ${match ? '✅ FOUND' : '❌ NOT FOUND'}`);
  });
  
  // Check legacy method
  const legacyMatches = allClasses.filter(cls => cls.teacherUID === user.uid);
  console.log('🔄 Legacy teacherUID matches:', legacyMatches.map(c => ({ id: c.id, name: c.name })));
})();
```

## How to Use These Commands

1. **Login as a teacher** in the application
2. **Open Browser Developer Tools** (F12)
3. **Go to Console tab**
4. **Copy and paste any of the commands above**
5. **Press Enter to run**
6. **Analyze the output** to identify the issue

## Common Issues and Solutions

### Issue 1: "Teacher record NOT found"
**Solution**: Go to Admin → Teacher Management → Find the teacher → Assign Classes

### Issue 2: "Class assignments: []" (empty array)
**Solution**: Teacher exists but has no assignments. Use Admin panel to assign classes.

### Issue 3: Assignment matches show "NOT FOUND"
**Solution**: Class IDs in assignments don't match actual classes. Re-assign classes to fix.

### Issue 4: API fails with 403/404
**Solution**: Check user permissions and API endpoint access.

### Issue 5: Legacy method works
**Result**: System is working but using old architecture (acceptable).

## Expected Working Output

When working correctly, you should see:
```
✅ Teacher record found: { classes: [...] }
📚 Class assignments: [{ classId: "abc123", className: "KG1-A", subjects: [...] }]
🎯 Assignment matches:
   abc123 (KG1-A) → ✅ FOUND
```
