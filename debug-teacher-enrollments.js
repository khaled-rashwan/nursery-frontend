const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function debugTeacherEnrollments() {
  try {
    console.log('🔍 Debugging Teacher Portal Enrollment Data...\n');

    // Get current academic year
    const getCurrentAcademicYear = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (currentMonth <= 7) {
        return `${currentYear - 1}-${currentYear}`;
      } else {
        return `${currentYear}-${currentYear + 1}`;
      }
    };

    const currentAcademicYear = getCurrentAcademicYear();
    console.log(`📅 Current Academic Year: ${currentAcademicYear}\n`);

    // 1. Check teachers collection structure
    console.log('👩‍🏫 Checking Teachers Collection...');
    const teachersSnapshot = await db.collection('teachers').limit(2).get();
    
    if (teachersSnapshot.empty) {
      console.log('❌ No teacher documents found!\n');
      return;
    }

    let sampleTeacherUID = null;
    teachersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n   Teacher ID: ${doc.id}`);
      console.log(`   Email: ${data.email || 'MISSING'}`);
      console.log(`   Classes array: ${JSON.stringify(data.classes || [], null, 2)}`);
      
      if (!sampleTeacherUID && data.classes && data.classes.length > 0) {
        sampleTeacherUID = doc.id;
      }
    });

    if (!sampleTeacherUID) {
      console.log('\n❌ No teachers with class assignments found!');
      return;
    }

    // 2. Test the enrollment filtering logic for the sample teacher
    console.log(`\n🧪 Testing enrollment filtering for teacher: ${sampleTeacherUID}`);
    
    // Get teacher's class assignments
    const teacherDoc = await db.collection('teachers').doc(sampleTeacherUID).get();
    const teacherData = teacherDoc.data();
    const classAssignments = teacherData.classes || [];
    
    console.log(`\n   Teacher's class assignments:`, classAssignments);
    
    // Get class names from class IDs
    if (classAssignments.length > 0) {
      const classIds = classAssignments.map(assignment => assignment.classId);
      console.log(`   Class IDs: ${classIds.join(', ')}`);
      
      // Fetch class documents
      const classPromises = classIds.map(classId => db.collection('classes').doc(classId).get());
      const classDocs = await Promise.all(classPromises);
      
      const classNames = classDocs
        .filter(doc => doc.exists())
        .map(doc => ({ id: doc.id, name: doc.data().name, academicYear: doc.data().academicYear }));
      
      console.log(`   Classes found:`, classNames);
      
      const currentYearClassNames = classNames
        .filter(cls => cls.academicYear === currentAcademicYear)
        .map(cls => cls.name);
      
      console.log(`   Current year class names: ${currentYearClassNames.join(', ')}`);
      
      // 3. Check enrollments for these classes
      console.log(`\n📊 Checking enrollments for current academic year...`);
      
      const enrollmentsSnapshot = await db.collection('enrollments')
        .where('academicYear', '==', currentAcademicYear)
        .get();
      
      console.log(`   Total enrollments in ${currentAcademicYear}: ${enrollmentsSnapshot.size}`);
      
      if (enrollmentsSnapshot.size > 0) {
        // Show sample enrollments
        console.log(`\n   Sample enrollments (first 3):`);
        enrollmentsSnapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`     - ID: ${doc.id}`);
          console.log(`       Class: ${data.class}`);
          console.log(`       Student UID: ${data.studentUID}`);
          console.log(`       Status: ${data.status}`);
        });
        
        // Filter enrollments by teacher's classes
        const teacherEnrollments = [];
        enrollmentsSnapshot.forEach(doc => {
          const data = doc.data();
          if (currentYearClassNames.includes(data.class) && data.status === 'enrolled') {
            teacherEnrollments.push({
              id: doc.id,
              class: data.class,
              studentUID: data.studentUID,
              status: data.status
            });
          }
        });
        
        console.log(`\n   ✅ Enrollments matching teacher's classes: ${teacherEnrollments.length}`);
        teacherEnrollments.forEach(enrollment => {
          console.log(`     - Class: ${enrollment.class}, Student: ${enrollment.studentUID}`);
        });
        
        if (teacherEnrollments.length === 0) {
          console.log(`\n   ❌ No enrollments found for teacher's classes!`);
          console.log(`   Possible issues:`);
          console.log(`     1. No students enrolled in teacher's classes for ${currentAcademicYear}`);
          console.log(`     2. Class names don't match between classes and enrollments`);
          console.log(`     3. All enrollments have status other than 'enrolled'`);
        }
      } else {
        console.log(`\n   ❌ No enrollments found for ${currentAcademicYear}!`);
      }
    }

    console.log(`\n✅ Debug completed. Check the logs above for issues.`);

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugTeacherEnrollments()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Debug failed:', error);
    process.exit(1);
  });
