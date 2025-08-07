// Debug script to test user authentication and custom claims
// Run this in the browser console after logging in

const testUserAuth = async () => {
  console.log('=== Testing User Authentication ===');
  
  // Get current user
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  console.log('✅ User logged in:', user.email);
  console.log('🆔 User UID:', user.uid);
  
  try {
    // Get ID token with custom claims
    const tokenResult = await user.getIdTokenResult();
    console.log('🎟️ Token claims:', tokenResult.claims);
    
    const userRole = tokenResult.claims.role;
    console.log('👤 User role:', userRole);
    
    if (!userRole) {
      console.error('❌ No role found in custom claims!');
      console.log('💡 User needs custom claims set by admin');
      return;
    }
    
    if (['teacher', 'admin', 'superadmin'].includes(userRole)) {
      console.log('✅ User has teacher/admin access');
    } else {
      console.log('⚠️ User role is:', userRole, '- may not have teacher access');
    }
    
    // Test Firestore access
    console.log('=== Testing Firestore Access ===');
    
    const db = getFirestore();
    
    // Try to read a test enrollment
    try {
      const testEnrollmentId = '2024-2025_test';
      const enrollmentRef = doc(db, 'enrollments', testEnrollmentId);
      
      console.log('📋 Testing read access to enrollments...');
      const enrollmentSnap = await getDoc(enrollmentRef);
      
      if (enrollmentSnap.exists()) {
        console.log('✅ Can read enrollment document');
      } else {
        console.log('📄 Enrollment document does not exist (but access works)');
      }
      
      // Test attendance subcollection access
      console.log('📅 Testing attendance subcollection access...');
      const attendanceRef = doc(db, 'enrollments', testEnrollmentId, 'attendance', '2025-01-01');
      
      const testAttendanceData = {
        date: '2025-01-01',
        enrollmentId: testEnrollmentId,
        teacherUID: user.uid,
        records: [],
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      };
      
      await setDoc(attendanceRef, testAttendanceData);
      console.log('✅ Successfully wrote to attendance subcollection');
      
      // Try to read it back
      const readBack = await getDoc(attendanceRef);
      if (readBack.exists()) {
        console.log('✅ Successfully read from attendance subcollection');
        console.log('📊 Data:', readBack.data());
      }
      
    } catch (firestoreError) {
      console.error('❌ Firestore access error:', firestoreError);
      
      if (firestoreError.code === 'permission-denied') {
        console.log('🔒 Permission denied - Firestore security rules may need updating');
        console.log('💡 Make sure:');
        console.log('   1. User has correct role in custom claims');
        console.log('   2. Firestore rules allow this role to access enrollments/attendance');
        console.log('   3. Rules have been deployed to Firebase');
      }
    }
    
  } catch (error) {
    console.error('❌ Error getting token or testing access:', error);
  }
};

// Export for use in console
window.testUserAuth = testUserAuth;

console.log('🔧 Debug function loaded! Run testUserAuth() in console to test authentication and Firestore access.');
