const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./future-step-nursery-firebase-adminsdk-g1y72-4ad8c7b5f6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://future-step-nursery-default-rtdb.firebaseio.com"
});

async function testUserRoles() {
  try {
    console.log('Testing user roles and access permissions...\n');

    // List all users and their roles
    const listUsersResult = await admin.auth().listUsers();
    
    console.log('Current users in Firebase Auth:');
    console.log('================================');
    
    for (const userRecord of listUsersResult.users) {
      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'no-role';
      
      console.log(`Email: ${userRecord.email}`);
      console.log(`UID: ${userRecord.uid}`);
      console.log(`Role: ${role}`);
      console.log(`Teacher Portal Access: ${role === 'teacher' ? '✅ ALLOWED' : '❌ DENIED'}`);
      console.log(`Admin Portal Access: ${(role === 'admin' || role === 'superadmin') ? '✅ ALLOWED' : '❌ DENIED'}`);
      console.log('---');
    }

    console.log('\nRole-based access summary:');
    console.log('=========================');
    console.log('Teacher Portal: ONLY users with role="teacher"');
    console.log('Admin Portal: Users with role="admin" or role="superadmin"');
    console.log('Parent Portal: Users with role="parent"');

  } catch (error) {
    console.error('Error testing user roles:', error);
  }
}

testUserRoles();
