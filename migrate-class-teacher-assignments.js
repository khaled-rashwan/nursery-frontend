/**
 * Migration script to extract teacher assignments from classes collection
 * and create them in the new class_teacher_assignments collection
 * 
 * This script should be run once to migrate existing data to the new architecture
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Add your project config here if needed
  });
}

const db = admin.firestore();

async function migrateTeacherAssignments() {
  console.log('Starting migration of teacher assignments...');
  
  try {
    // Get all classes with teacher assignments
    const classesSnapshot = await db.collection('classes').get();
    
    if (classesSnapshot.empty) {
      console.log('No classes found to migrate.');
      return;
    }
    
    const migrationResults = {
      totalClasses: classesSnapshot.size,
      classesWithTeachers: 0,
      assignmentsCreated: 0,
      errors: [],
      duplicatesSkipped: 0
    };
    
    // Process classes in batches
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 400; // Firestore batch limit is 500
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classId = classDoc.id;
      
      console.log(`Processing class: ${classData.name} (${classId})`);
      
      // Skip classes without teachers
      if (!classData.teachers || !Array.isArray(classData.teachers) || classData.teachers.length === 0) {
        console.log(`  - Skipping class ${classData.name}: No teachers assigned`);
        continue;
      }
      
      migrationResults.classesWithTeachers++;
      
      // Create assignments for each teacher
      for (const teacher of classData.teachers) {
        try {
          // Check if assignment already exists
          const existingAssignmentQuery = await db.collection('class_teacher_assignments')
            .where('classId', '==', classId)
            .where('teacherId', '==', teacher.teacherId)
            .limit(1)
            .get();
          
          if (!existingAssignmentQuery.empty) {
            console.log(`  - Skipping duplicate assignment for teacher ${teacher.teacherId} in class ${classData.name}`);
            migrationResults.duplicatesSkipped++;
            continue;
          }
          
          // Validate teacher data
          if (!teacher.teacherId) {
            migrationResults.errors.push({
              classId,
              className: classData.name,
              error: 'Missing teacherId',
              teacher
            });
            continue;
          }
          
          // Create new assignment document
          const assignmentRef = db.collection('class_teacher_assignments').doc();
          const assignmentData = {
            classId: classId,
            teacherId: teacher.teacherId,
            subjects: Array.isArray(teacher.subjects) ? teacher.subjects : 
                     (typeof teacher.subjects === 'string' ? [teacher.subjects] : []),
            isActive: true,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            createdBy: 'migration-script',
            migratedFrom: 'class-document'
          };
          
          batch.set(assignmentRef, assignmentData);
          batchCount++;
          migrationResults.assignmentsCreated++;
          
          console.log(`  - Created assignment for teacher ${teacher.teacherId} with subjects: ${assignmentData.subjects.join(', ')}`);
          
          // Commit batch if it's getting full
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            console.log(`Committed batch of ${batchCount} assignments`);
            batchCount = 0;
          }
          
        } catch (error) {
          migrationResults.errors.push({
            classId,
            className: classData.name,
            teacherId: teacher.teacherId,
            error: error.message
          });
          console.error(`  - Error creating assignment for teacher ${teacher.teacherId}:`, error.message);
        }
      }
    }
    
    // Commit any remaining batch operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} assignments`);
    }
    
    // Print migration summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total classes processed: ${migrationResults.totalClasses}`);
    console.log(`Classes with teachers: ${migrationResults.classesWithTeachers}`);
    console.log(`Assignments created: ${migrationResults.assignmentsCreated}`);
    console.log(`Duplicates skipped: ${migrationResults.duplicatesSkipped}`);
    console.log(`Errors encountered: ${migrationResults.errors.length}`);
    
    if (migrationResults.errors.length > 0) {
      console.log('\n=== Errors ===');
      migrationResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. Class: ${error.className} (${error.classId})`);
        console.log(`   Teacher: ${error.teacherId || 'N/A'}`);
        console.log(`   Error: ${error.error}`);
      });
    }
    
    console.log('\nMigration completed successfully!');
    
    // Verify migration results
    const verificationSnapshot = await db.collection('class_teacher_assignments').get();
    console.log(`\nVerification: Found ${verificationSnapshot.size} assignments in class_teacher_assignments collection`);
    
    return migrationResults;
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Rollback function to remove migrated assignments
async function rollbackMigration() {
  console.log('Starting rollback of migrated teacher assignments...');
  
  try {
    const assignmentsQuery = await db.collection('class_teacher_assignments')
      .where('migratedFrom', '==', 'class-document')
      .get();
    
    if (assignmentsQuery.empty) {
      console.log('No migrated assignments found to rollback.');
      return;
    }
    
    console.log(`Found ${assignmentsQuery.size} migrated assignments to rollback`);
    
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 400;
    
    for (const assignmentDoc of assignmentsQuery.docs) {
      batch.delete(assignmentDoc.ref);
      batchCount++;
      
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`Deleted batch of ${batchCount} assignments`);
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Deleted final batch of ${batchCount} assignments`);
    }
    
    console.log('Rollback completed successfully!');
    
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

// Function to verify data integrity after migration
async function verifyMigration() {
  console.log('Verifying migration results...');
  
  try {
    // Get all classes with teachers
    const classesSnapshot = await db.collection('classes').get();
    const classesWithTeachers = [];
    
    classesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.teachers && Array.isArray(data.teachers) && data.teachers.length > 0) {
        classesWithTeachers.push({
          id: doc.id,
          name: data.name,
          teacherCount: data.teachers.length,
          teachers: data.teachers
        });
      }
    });
    
    // Get all assignments
    const assignmentsSnapshot = await db.collection('class_teacher_assignments').get();
    const assignmentsByClass = new Map();
    
    assignmentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!assignmentsByClass.has(data.classId)) {
        assignmentsByClass.set(data.classId, []);
      }
      assignmentsByClass.get(data.classId).push(data);
    });
    
    console.log('\n=== Verification Results ===');
    console.log(`Classes with teachers: ${classesWithTeachers.length}`);
    console.log(`Total assignments: ${assignmentsSnapshot.size}`);
    
    let mismatches = 0;
    for (const classInfo of classesWithTeachers) {
      const assignments = assignmentsByClass.get(classInfo.id) || [];
      if (assignments.length !== classInfo.teacherCount) {
        console.log(`MISMATCH: Class "${classInfo.name}" has ${classInfo.teacherCount} teachers but ${assignments.length} assignments`);
        mismatches++;
      }
    }
    
    if (mismatches === 0) {
      console.log('✓ All classes have matching assignment counts');
    } else {
      console.log(`✗ Found ${mismatches} mismatches`);
    }
    
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

// Export functions for use
module.exports = {
  migrateTeacherAssignments,
  rollbackMigration,
  verifyMigration
};

// If run directly as a script
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'migrate':
      migrateTeacherAssignments().catch(console.error);
      break;
    case 'rollback':
      rollbackMigration().catch(console.error);
      break;
    case 'verify':
      verifyMigration().catch(console.error);
      break;
    default:
      console.log('Usage:');
      console.log('  node migrate-class-teacher-assignments.js migrate   - Run migration');
      console.log('  node migrate-class-teacher-assignments.js rollback  - Rollback migration');
      console.log('  node migrate-class-teacher-assignments.js verify    - Verify migration');
  }
}
