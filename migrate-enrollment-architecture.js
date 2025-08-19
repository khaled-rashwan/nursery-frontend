const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Migration Script: Fix Enrollment Collection Architecture
 * 
 * Purpose: Add classId field and remove teacherUID field from enrollments
 * 
 * Changes:
 * - Add classId: References classes collection document ID
 * - Remove teacherUID: Meaningless field (teacher assignments in teachers.classes[])
 * - Keep className: For backward compatibility and human readability
 */

async function migrateEnrollmentArchitecture() {
  try {
    console.log('🚀 Starting enrollment architecture migration...');

    // Step 1: Get all classes to build className -> classId mapping
    console.log('📋 Building class name to ID mapping...');
    const classesSnapshot = await db.collection('classes')
      .where('deleted', '!=', true)
      .get();

    const classNameToIdMap = {};
    classesSnapshot.forEach(doc => {
      const classData = doc.data();
      if (classData.name) {
        classNameToIdMap[classData.name] = doc.id;
        console.log(`   📌 ${classData.name} → ${doc.id}`);
      }
    });

    console.log(`✅ Found ${Object.keys(classNameToIdMap).length} classes`);

    // Step 2: Get all enrollments
    console.log('\n📚 Fetching all enrollments...');
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('deleted', '!=', true)
      .get();

    console.log(`📊 Found ${enrollmentsSnapshot.size} enrollments to migrate`);

    // Step 3: Process each enrollment
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const doc of enrollmentsSnapshot.docs) {
      const enrollmentData = doc.data();
      const enrollmentId = doc.id;

      try {
        console.log(`\n🔄 Processing enrollment: ${enrollmentId}`);
        console.log(`   Student: ${enrollmentData.studentUID}`);
        console.log(`   Class: ${enrollmentData.class}`);
        console.log(`   Current teacherUID: ${enrollmentData.teacherUID || 'none'}`);

        // Check if migration already done
        if (enrollmentData.classId && !enrollmentData.teacherUID) {
          console.log(`   ⏭️  Already migrated, skipping...`);
          skippedCount++;
          continue;
        }

        // Find corresponding class ID
        const className = enrollmentData.class;
        const classId = classNameToIdMap[className];

        if (!classId) {
          console.log(`   ❌ Class "${className}" not found in classes collection`);
          errorCount++;
          continue;
        }

        // Prepare update object
        const updateData = {
          classId: classId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Remove teacherUID field
        if (enrollmentData.teacherUID) {
          updateData.teacherUID = admin.firestore.FieldValue.delete();
          console.log(`   🗑️  Removing teacherUID: ${enrollmentData.teacherUID}`);
        }

        // Update the enrollment document
        await doc.ref.update(updateData);

        console.log(`   ✅ Added classId: ${classId}`);
        console.log(`   ✅ Migration successful!`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error migrating enrollment ${enrollmentId}:`, error.message);
        errorCount++;
      }
    }

    // Step 4: Summary
    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Already migrated (skipped): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${successCount + errorCount + skippedCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log(`\n⚠️  Migration completed with ${errorCount} errors. Please review and fix manually.`);
    }

    // Step 5: Verification
    console.log('\n🔍 Verification: Checking migrated data...');
    const verificationSnapshot = await db.collection('enrollments')
      .where('deleted', '!=', true)
      .limit(5)
      .get();

    verificationSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   📋 ${doc.id}:`);
      console.log(`      classId: ${data.classId || 'MISSING'}`);
      console.log(`      className: ${data.class}`);
      console.log(`      teacherUID: ${data.teacherUID || 'REMOVED ✅'}`);
    });

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

/**
 * Rollback function (if needed)
 */
async function rollbackEnrollmentMigration() {
  console.log('🔄 Rolling back enrollment migration...');
  
  // This would restore teacherUID fields if we stored the mapping
  // For now, we'll just log what would need to be done
  console.log('⚠️  Rollback not implemented - teacherUID data was deleted');
  console.log('   To rollback: would need to restore teacherUID fields from backup');
}

// Run migration
if (require.main === module) {
  migrateEnrollmentArchitecture()
    .then(() => {
      console.log('🏁 Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateEnrollmentArchitecture,
  rollbackEnrollmentMigration
};
