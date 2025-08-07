const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./future-step-nursery-firebase-adminsdk-g1y72-4ad8c7b5f6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://future-step-nursery-default-rtdb.firebaseio.com"
});

async function createTeacherUser() {
  try {
    // Create the user
    const userRecord = await admin.auth().createUser({
      email: 'teacher@futurestep.edu',
      password: 'Teacher123!',
      displayName: 'Sarah Ahmed',
      emailVerified: true
    });

    console.log('Successfully created teacher user:', userRecord.uid);

    // Set custom claims for teacher role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'teacher',
      permissions: ['view_students', 'manage_attendance', 'send_messages']
    });

    console.log('Successfully set teacher role for user:', userRecord.uid);

    // Create another teacher user
    const userRecord2 = await admin.auth().createUser({
      email: 'teacher2@futurestep.edu', 
      password: 'Teacher123!',
      displayName: 'Ahmed Ali',
      emailVerified: true
    });

    console.log('Successfully created second teacher user:', userRecord2.uid);

    await admin.auth().setCustomUserClaims(userRecord2.uid, {
      role: 'teacher',
      permissions: ['view_students', 'manage_attendance', 'send_messages']
    });

    console.log('Successfully set teacher role for second user:', userRecord2.uid);

    console.log('\nTeacher accounts created successfully!');
    console.log('=====================================');
    console.log('IMPORTANT: Only users with "teacher" role can access the teacher portal.');
    console.log('Admins have their own separate admin portal at /admin');
    console.log('=====================================');
    console.log('You can now login to the teacher portal with:');
    console.log('Email: teacher@futurestep.edu');
    console.log('Password: Teacher123!');
    console.log('OR');
    console.log('Email: teacher2@futurestep.edu');
    console.log('Password: Teacher123!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating teacher user:', error);
    process.exit(1);
  }
}

createTeacherUser();
