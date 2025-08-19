const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: This script requires proper Firebase Admin credentials to be configured
// You can either:
// 1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable to point to service account JSON
// 2. Use Application Default Credentials if running on Google Cloud
// 3. Provide the service account JSON file path
try {
  admin.initializeApp();
} catch (error) {
  console.error('Failed to initialize Firebase Admin. Please ensure you have proper credentials configured.');
  console.error('Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

const migrateTeachersData = async () => {
  console.log('=== Teachers Data Migration Analysis ===');
  
  try {
    // Step 1: Analyze current teachers collection
    console.log('\n1. Analyzing current teachers collection...');
    const teachersSnapshot = await db.collection('teachers').get();
    
    if (teachersSnapshot.empty) {
      console.log('No teachers found in collection.');
      return;
    }

    console.log(`Found ${teachersSnapshot.size} teacher records:`);
    const currentTeachers = [];
    teachersSnapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      currentTeachers.push(data);
      console.log(`- ID: ${doc.id}, Name: ${data.name}, Email: ${data.email}`);
    });

    // Step 2: Analyze Firebase Auth users with teacher role
    console.log('\n2. Analyzing Firebase Auth users with teacher role...');
    const listUsers = await admin.auth().listUsers();
    const teacherUsers = listUsers.users.filter(user => 
      user.customClaims && user.customClaims.role === 'teacher'
    );
    
    console.log(`Found ${teacherUsers.length} users with teacher role:`);
    teacherUsers.forEach(user => {
      console.log(`- UID: ${user.uid}, Name: ${user.displayName}, Email: ${user.email}`);
    });

    // Step 3: Identify mapping opportunities
    console.log('\n3. Attempting to map teachers collection to Auth users...');
    const mappingResults = [];
    
    for (const teacher of currentTeachers) {
      const matchingUser = teacherUsers.find(user => 
        user.email === teacher.email || user.displayName === teacher.name
      );
      
      if (matchingUser) {
        mappingResults.push({
          teacherCollectionId: teacher.id,
          authUID: matchingUser.uid,
          email: teacher.email,
          name: teacher.name,
          classes: teacher.classes || []
        });
        console.log(`✅ Mapped: ${teacher.email} -> ${matchingUser.uid}`);
      } else {
        console.log(`❌ No match found for: ${teacher.email}`);
        mappingResults.push({
          teacherCollectionId: teacher.id,
          authUID: null,
          email: teacher.email,
          name: teacher.name,
          classes: teacher.classes || [],
          needsManualReview: true
        });
      }
    }

    // Step 4: Check for Auth users without teacher collection records
    console.log('\n4. Checking for Auth users without teacher collection records...');
    for (const user of teacherUsers) {
      const hasTeacherRecord = currentTeachers.some(teacher => 
        teacher.email === user.email || teacher.name === user.displayName
      );
      
      if (!hasTeacherRecord) {
        console.log(`⚠️ Auth user without teacher record: ${user.email} (${user.uid})`);
        mappingResults.push({
          teacherCollectionId: null,
          authUID: user.uid,
          email: user.email,
          name: user.displayName,
          classes: [],
          needsCreation: true
        });
      }
    }

    // Step 5: Generate migration plan
    console.log('\n5. Migration Plan:');
    console.log('================');
    
    const toMigrate = mappingResults.filter(r => r.authUID && r.teacherCollectionId);
    const toCreate = mappingResults.filter(r => r.needsCreation);
    const toReview = mappingResults.filter(r => r.needsManualReview);
    
    console.log(`Records to migrate: ${toMigrate.length}`);
    console.log(`Records to create: ${toCreate.length}`);
    console.log(`Records needing manual review: ${toReview.length}`);
    
    if (toReview.length > 0) {
      console.log('\n⚠️ Manual Review Required:');
      toReview.forEach(item => {
        console.log(`- Teacher collection ID: ${item.teacherCollectionId}, Email: ${item.email}`);
      });
    }

    return {
      currentTeachers,
      teacherUsers,
      mappingResults,
      stats: {
        toMigrate: toMigrate.length,
        toCreate: toCreate.length,
        toReview: toReview.length
      }
    };

  } catch (error) {
    console.error('Error during migration analysis:', error);
    throw error;
  }
};

const performMigration = async () => {
  console.log('\n=== Performing Teachers Data Migration ===');
  
  try {
    const analysisResult = await migrateTeachersData();
    
    if (!analysisResult) {
      console.log('No data to migrate.');
      return;
    }

    const { mappingResults } = analysisResult;
    
    // Create backup of current teachers collection
    console.log('\n1. Creating backup of current teachers collection...');
    const backupBatch = db.batch();
    const teachersSnapshot = await db.collection('teachers').get();
    
    teachersSnapshot.forEach(doc => {
      const backupRef = db.collection('teachers_backup').doc(doc.id);
      backupBatch.set(backupRef, { ...doc.data(), backupTimestamp: admin.firestore.FieldValue.serverTimestamp() });
    });
    
    await backupBatch.commit();
    console.log('✅ Backup created in teachers_backup collection');

    // Migrate data to new structure
    console.log('\n2. Migrating to new structure...');
    const migrationBatch = db.batch();
    
    for (const mapping of mappingResults) {
      if (mapping.authUID && !mapping.needsManualReview) {
        // Create new teacher record with UID as document ID
        const newTeacherRef = db.collection('teachers_new').doc(mapping.authUID);
        const teacherData = {
          classes: mapping.classes || [],
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        migrationBatch.set(newTeacherRef, teacherData);
        console.log(`✅ Prepared migration for: ${mapping.email} -> ${mapping.authUID}`);
      }
    }
    
    await migrationBatch.commit();
    console.log('✅ Migration completed to teachers_new collection');
    
    console.log('\n3. Migration Summary:');
    console.log('====================');
    console.log('- Original data backed up to: teachers_backup collection');
    console.log('- Migrated data available in: teachers_new collection');
    console.log('- Original teachers collection preserved for safety');
    console.log('\nNext steps:');
    console.log('1. Test the new structure with updated functions');
    console.log('2. When ready, rename teachers_new -> teachers');
    console.log('3. Delete teachers_backup when migration is confirmed successful');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

// Export functions for use
module.exports = { migrateTeachersData, performMigration };

// Run analysis if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--migrate')) {
    performMigration()
      .then(() => {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
      });
  } else {
    migrateTeachersData()
      .then(() => {
        console.log('\n✅ Analysis completed successfully!');
        console.log('\nTo perform the actual migration, run:');
        console.log('node migrate-teachers-data.js --migrate');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Analysis failed:', error);
        process.exit(1);
      });
  }
}
