const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function checkEnrollmentData() {
  try {
    console.log('📊 Checking enrollment data structure...\n');

    // Check a few enrollment documents
    const enrollmentsSnapshot = await db.collection('enrollments').limit(3).get();
    
    console.log(`Found ${enrollmentsSnapshot.size} enrollment documents:`);
    enrollmentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nEnrollment ${doc.id}:`);
      console.log(`  - teacherUID: ${data.teacherUID || 'MISSING'}`);
      console.log(`  - class: ${data.class || 'MISSING'}`);
      console.log(`  - academicYear: ${data.academicYear || 'MISSING'}`);
      console.log(`  - status: ${data.status || 'MISSING'}`);
    });

    // Check teachers collection
    const teachersSnapshot = await db.collection('teachers').limit(2).get();
    
    console.log(`\nFound ${teachersSnapshot.size} teacher documents:`);
    teachersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nTeacher ${doc.id}:`);
      console.log(`  - classes: ${JSON.stringify(data.classes || [], null, 2)}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkEnrollmentData();
