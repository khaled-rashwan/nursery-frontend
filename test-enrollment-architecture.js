const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json'); // Adjust path as needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Test Script: Check current enrollment structure and run migration
 */

async function testEnrollmentStructure() {
  try {
    console.log('🔍 Checking current enrollment structure...');

    // Check a few enrollments
    const enrollmentsSnapshot = await db.collection('enrollments')
      .limit(5)
      .get();

    console.log(`\n📊 Found ${enrollmentsSnapshot.size} enrollments (showing first 5):`);

    enrollmentsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📋 Enrollment ${index + 1}: ${doc.id}`);
      console.log(`   Student: ${data.studentUID}`);
      console.log(`   Academic Year: ${data.academicYear}`);
      console.log(`   Class: ${data.class}`);
      console.log(`   ClassId: ${data.classId || 'MISSING ❌'}`);
      console.log(`   TeacherUID: ${data.teacherUID || 'REMOVED ✅'}`);
      console.log(`   Status: ${data.status}`);
    });

    // Check if migration is needed
    const needsMigration = enrollmentsSnapshot.docs.some(doc => {
      const data = doc.data();
      return !data.classId || data.teacherUID;
    });

    if (needsMigration) {
      console.log('\n⚠️  Migration needed! Some enrollments missing classId or have teacherUID');
      console.log('Run: node migrate-enrollment-architecture.js');
    } else {
      console.log('\n✅ Migration appears complete! All enrollments have proper structure');
    }

    // Test student retrieval for teacher portal
    console.log('\n🧪 Testing student retrieval for teacher portal...');
    
    // Get a teacher with assigned classes
    const teachersSnapshot = await db.collection('teachers')
      .where('classes', '!=', [])
      .limit(1)
      .get();

    if (!teachersSnapshot.empty) {
      const teacherDoc = teachersSnapshot.docs[0];
      const teacherData = teacherDoc.data();
      const teacherUID = teacherDoc.id;
      
      console.log(`\n👨‍🏫 Testing with teacher: ${teacherUID}`);
      console.log(`   Assigned classes: ${JSON.stringify(teacherData.classes)}`);

      // Test new architecture student retrieval
      for (const classAssignment of teacherData.classes) {
        console.log(`\n📚 Testing class: ${classAssignment.className} (${classAssignment.classId})`);
        
        // Get current academic year
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;
        
        // Try to get students by classId (new architecture)
        const studentsByClassId = await db.collection('enrollments')
          .where('academicYear', '==', academicYear)
          .where('classId', '==', classAssignment.classId)
          .where('status', '==', 'enrolled')
          .get();

        console.log(`   Students by classId: ${studentsByClassId.size}`);

        // Try to get students by className (fallback)
        const studentsByClassName = await db.collection('enrollments')
          .where('academicYear', '==', academicYear)
          .where('class', '==', classAssignment.className)
          .where('status', '==', 'enrolled')
          .get();

        console.log(`   Students by className: ${studentsByClassName.size}`);

        if (studentsByClassId.size === 0 && studentsByClassName.size === 0) {
          console.log(`   ⚠️  No students found for this class in ${academicYear}`);
        } else {
          console.log(`   ✅ Students found!`);
        }
      }
    } else {
      console.log('   ℹ️  No teachers with assigned classes found');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run test
if (require.main === module) {
  testEnrollmentStructure()
    .then(() => {
      console.log('\n🏁 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnrollmentStructure };
