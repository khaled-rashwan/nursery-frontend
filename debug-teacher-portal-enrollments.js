const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function debugTeacherPortalEnrollments() {
  try {
    console.log('🔍 Debugging Teacher Portal Enrollment Issues...\n');

    // 1. Check current academic year logic
    const getCurrentAcademicYear = () => {
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      
      if (currentMonth <= 7) {
        return `${currentYear - 1}-${currentYear}`;
      } else {
        return `${currentYear}-${currentYear + 1}`;
      }
    };

    const currentAcademicYear = getCurrentAcademicYear();
    console.log(`📅 Current Academic Year: ${currentAcademicYear}`);

    // 2. Check enrollment documents structure
    console.log('\n📊 Analyzing Enrollment Documents...');
    const enrollmentsSnapshot = await db.collection('enrollments').limit(5).get();
    
    if (enrollmentsSnapshot.empty) {
      console.log('❌ No enrollment documents found!');
      return;
    }

    console.log(`✅ Found ${enrollmentsSnapshot.size} enrollment documents (showing first 5):`);
    enrollmentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n   📋 Enrollment ID: ${doc.id}`);
      console.log(`      Student UID: ${data.studentUID || 'MISSING'}`);
      console.log(`      Academic Year: ${data.academicYear || 'MISSING'}`);
      console.log(`      Class: ${data.class || 'MISSING'}`);
      console.log(`      Class ID: ${data.classId || 'MISSING (using legacy system)'}`);
      console.log(`      Teacher UID: ${data.teacherUID || 'MISSING (new architecture)'}`);
      console.log(`      Status: ${data.status || 'MISSING'}`);
      console.log(`      Created: ${data.createdAt?.toDate()?.toLocaleDateString() || 'MISSING'}`);
    });

    // 3. Check for enrollments in current academic year
    console.log(`\n📅 Checking enrollments for ${currentAcademicYear}...`);
    const currentYearEnrollments = await db.collection('enrollments')
      .where('academicYear', '==', currentAcademicYear)
      .limit(10)
      .get();

    console.log(`✅ Found ${currentYearEnrollments.size} enrollments for ${currentAcademicYear}`);

    // 4. Check teachers collection structure
    console.log('\n👩‍🏫 Analyzing Teachers Collection...');
    const teachersSnapshot = await db.collection('teachers').limit(3).get();
    
    if (teachersSnapshot.empty) {
      console.log('❌ No teacher documents found!');
    } else {
      console.log(`✅ Found ${teachersSnapshot.size} teacher documents (showing first 3):`);
      teachersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\n   👩‍🏫 Teacher ID: ${doc.id}`);
        console.log(`      Email: ${data.email || 'MISSING'}`);
        console.log(`      Classes: ${JSON.stringify(data.classes || [], null, 2)}`);
      });
    }

    // 5. Check classes collection structure
    console.log('\n🏫 Analyzing Classes Collection...');
    const classesSnapshot = await db.collection('classes')
      .where('academicYear', '==', currentAcademicYear)
      .limit(5)
      .get();

    if (classesSnapshot.empty) {
      console.log(`❌ No class documents found for ${currentAcademicYear}!`);
    } else {
      console.log(`✅ Found ${classesSnapshot.size} classes for ${currentAcademicYear}:`);
      classesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\n   🏫 Class ID: ${doc.id}`);
        console.log(`      Name: ${data.name || 'MISSING'}`);
        console.log(`      Level: ${data.level || 'MISSING'}`);
        console.log(`      Academic Year: ${data.academicYear || 'MISSING'}`);
        console.log(`      Legacy Teachers: ${JSON.stringify(data.teachers || [], null, 2)}`);
      });
    }

    // 6. Test the new filtering logic
    console.log('\n🔧 Testing New Teacher Filtering Logic...');
    
    // Get a sample teacher
    const sampleTeacher = teachersSnapshot.docs[0];
    if (sampleTeacher) {
      const teacherData = sampleTeacher.data();
      const teacherUID = sampleTeacher.id;
      const teacherAssignedClasses = (teacherData.classes || []).map(classAssignment => classAssignment.className);
      
      console.log(`\n   👩‍🏫 Testing with Teacher: ${teacherUID}`);
      console.log(`      Assigned Classes: ${JSON.stringify(teacherAssignedClasses)}`);

      // Get all enrollments for current year
      const allCurrentEnrollments = await db.collection('enrollments')
        .where('academicYear', '==', currentAcademicYear)
        .get();

      let enrollments = [];
      allCurrentEnrollments.forEach(doc => {
        const data = doc.data();
        enrollments.push({
          id: doc.id,
          studentUID: data.studentUID,
          academicYear: data.academicYear,
          class: data.class,
          teacherUID: data.teacherUID,
          status: data.status
        });
      });

      console.log(`      Total enrollments in ${currentAcademicYear}: ${enrollments.length}`);

      // Apply new filtering logic
      const filteredEnrollments = enrollments.filter(enrollment => 
        teacherAssignedClasses.includes(enrollment.class)
      );

      console.log(`      Enrollments after class-based filtering: ${filteredEnrollments.length}`);
      
      if (filteredEnrollments.length > 0) {
        console.log('      ✅ New filtering logic working!');
        filteredEnrollments.slice(0, 3).forEach(enrollment => {
          console.log(`         - Student: ${enrollment.studentUID}, Class: ${enrollment.class}`);
        });
      } else {
        console.log('      ❌ New filtering logic returned no results');
        
        // Try legacy filtering as fallback
        const legacyFiltered = enrollments.filter(enrollment => enrollment.teacherUID === teacherUID);
        console.log(`      Legacy filtering (teacherUID): ${legacyFiltered.length} results`);
      }
    }

    console.log('\n🎯 Summary and Recommendations:');
    console.log('   1. Check if enrollments have proper academic year values');
    console.log('   2. Verify teacher class assignments in teachers.classes[] field');
    console.log('   3. Ensure enrollment documents reference correct class names');
    console.log('   4. Consider data migration if teacherUID field is needed for legacy support');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug function
debugTeacherPortalEnrollments()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
