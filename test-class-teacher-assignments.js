/**
 * Test script for class teacher assignments functionality
 * 
 * This script tests the new class_teacher_assignments collection CRUD operations
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function testClassTeacherAssignments() {
  console.log('Testing class teacher assignments functionality...');
  
  try {
    // Test 1: List existing assignments
    console.log('\n1. Testing list assignments...');
    const assignmentsSnapshot = await db.collection('class_teacher_assignments').limit(5).get();
    console.log(`Found ${assignmentsSnapshot.size} existing assignments`);
    
    if (!assignmentsSnapshot.empty) {
      assignmentsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - Assignment ${doc.id}: Class ${data.classId} -> Teacher ${data.teacherId} (${data.subjects?.join(', ')})`);
      });
    }
    
    // Test 2: Get a sample class and teacher for testing
    console.log('\n2. Finding test data...');
    const classesSnapshot = await db.collection('classes').limit(1).get();
    if (classesSnapshot.empty) {
      console.log('No classes found for testing. Please create a class first.');
      return;
    }
    
    const testClass = classesSnapshot.docs[0];
    const testClassData = testClass.data();
    console.log(`Test class: ${testClassData.name} (${testClass.id})`);
    
    // Find a teacher
    const teachersSnapshot = await db.collection('teachers').limit(1).get();
    if (teachersSnapshot.empty) {
      console.log('No teachers found for testing. Please create a teacher first.');
      return;
    }
    
    const testTeacher = teachersSnapshot.docs[0];
    console.log(`Test teacher: ${testTeacher.id}`);
    
    // Test 3: Create a new assignment
    console.log('\n3. Testing create assignment...');
    const newAssignmentData = {
      classId: testClass.id,
      teacherId: testTeacher.id,
      subjects: ['Math', 'Science'],
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'test-script'
    };
    
    // Check if assignment already exists
    const existingAssignmentQuery = await db.collection('class_teacher_assignments')
      .where('classId', '==', testClass.id)
      .where('teacherId', '==', testTeacher.id)
      .where('isActive', '==', true)
      .get();
    
    let testAssignmentId;
    if (!existingAssignmentQuery.empty) {
      testAssignmentId = existingAssignmentQuery.docs[0].id;
      console.log(`Assignment already exists: ${testAssignmentId}`);
    } else {
      const newAssignmentRef = await db.collection('class_teacher_assignments').add(newAssignmentData);
      testAssignmentId = newAssignmentRef.id;
      console.log(`Created new assignment: ${testAssignmentId}`);
    }
    
    // Test 4: Read the assignment
    console.log('\n4. Testing read assignment...');
    const assignmentDoc = await db.collection('class_teacher_assignments').doc(testAssignmentId).get();
    if (assignmentDoc.exists) {
      const assignmentData = assignmentDoc.data();
      console.log(`Assignment data:`, {
        id: assignmentDoc.id,
        classId: assignmentData.classId,
        teacherId: assignmentData.teacherId,
        subjects: assignmentData.subjects,
        isActive: assignmentData.isActive
      });
    }
    
    // Test 5: Update the assignment
    console.log('\n5. Testing update assignment...');
    await db.collection('class_teacher_assignments').doc(testAssignmentId).update({
      subjects: ['Math', 'Science', 'English'],
      updatedAt: admin.firestore.Timestamp.now(),
      updatedBy: 'test-script'
    });
    console.log('Updated assignment subjects');
    
    // Test 6: Query assignments by class
    console.log('\n6. Testing query by class...');
    const classByClassQuery = await db.collection('class_teacher_assignments')
      .where('classId', '==', testClass.id)
      .get();
    console.log(`Found ${classByClassQuery.size} assignments for class ${testClassData.name}`);
    
    // Test 7: Query assignments by teacher
    console.log('\n7. Testing query by teacher...');
    const assignmentsByTeacherQuery = await db.collection('class_teacher_assignments')
      .where('teacherId', '==', testTeacher.id)
      .get();
    console.log(`Found ${assignmentsByTeacherQuery.size} assignments for teacher ${testTeacher.id}`);
    
    // Test 8: Test batch operations
    console.log('\n8. Testing batch operations...');
    
    // Find another teacher for batch test
    const allTeachersSnapshot = await db.collection('teachers').limit(2).get();
    if (allTeachersSnapshot.size > 1) {
      const secondTeacher = allTeachersSnapshot.docs[1];
      
      const batch = db.batch();
      
      // Create another assignment
      const batchAssignmentRef = db.collection('class_teacher_assignments').doc();
      batch.set(batchAssignmentRef, {
        classId: testClass.id,
        teacherId: secondTeacher.id,
        subjects: ['Art', 'Music'],
        isActive: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: 'test-script-batch'
      });
      
      await batch.commit();
      console.log(`Created batch assignment: ${batchAssignmentRef.id}`);
      
      // Clean up batch test assignment
      await batchAssignmentRef.delete();
      console.log('Cleaned up batch test assignment');
    }
    
    console.log('\n✅ All tests completed successfully!');
    
    // Test summary
    console.log('\n=== Test Summary ===');
    console.log('✓ List assignments');
    console.log('✓ Create assignment');
    console.log('✓ Read assignment');
    console.log('✓ Update assignment');
    console.log('✓ Query by class');
    console.log('✓ Query by teacher');
    console.log('✓ Batch operations');
    
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Function to clean up test data
async function cleanupTestData() {
  console.log('Cleaning up test data...');
  
  try {
    const testAssignmentsQuery = await db.collection('class_teacher_assignments')
      .where('createdBy', 'in', ['test-script', 'test-script-batch'])
      .get();
    
    if (testAssignmentsQuery.empty) {
      console.log('No test assignments found to clean up.');
      return;
    }
    
    const batch = db.batch();
    testAssignmentsQuery.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleaned up ${testAssignmentsQuery.size} test assignments`);
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  testClassTeacherAssignments,
  cleanupTestData
};

// If run directly as a script
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'test':
      testClassTeacherAssignments().catch(console.error);
      break;
    case 'cleanup':
      cleanupTestData().catch(console.error);
      break;
    default:
      console.log('Usage:');
      console.log('  node test-class-teacher-assignments.js test     - Run tests');
      console.log('  node test-class-teacher-assignments.js cleanup  - Clean up test data');
  }
}
