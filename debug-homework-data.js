const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function debugHomeworkData() {
  try {
    console.log('Checking homework collection structure...');
    
    // Get all homework documents
    const homeworkSnapshot = await db.collection('homework').get();
    
    if (homeworkSnapshot.empty) {
      console.log('No homework documents found.');
      return;
    }
    
    console.log(`Found ${homeworkSnapshot.size} homework documents.`);
    
    let issuesFound = 0;
    
    homeworkSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const docId = doc.id;
      
      console.log(`\n--- Document ${index + 1}: ${docId} ---`);
      console.log('classId:', data.classId);
      console.log('teacherUID:', data.teacherUID);
      console.log('dueDate:', data.dueDate);
      console.log('dueDate type:', typeof data.dueDate);
      
      // Check for issues
      if (!data.dueDate) {
        console.log('❌ ISSUE: Missing dueDate field');
        issuesFound++;
      } else if (typeof data.dueDate === 'string') {
        console.log('❌ ISSUE: dueDate is a string, should be Timestamp');
        issuesFound++;
      } else if (data.dueDate && data.dueDate.toDate) {
        console.log('✅ dueDate is a Firestore Timestamp');
        console.log('   Converted date:', data.dueDate.toDate());
      } else {
        console.log('❌ ISSUE: dueDate has unexpected type');
        issuesFound++;
      }
      
      if (!data.classId) {
        console.log('❌ ISSUE: Missing classId field');
        issuesFound++;
      }
      
      if (!data.teacherUID) {
        console.log('❌ ISSUE: Missing teacherUID field');
        issuesFound++;
      }
    });
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total documents: ${homeworkSnapshot.size}`);
    console.log(`Issues found: ${issuesFound}`);
    
    if (issuesFound > 0) {
      console.log('\n⚠️  Issues found in homework collection. These may cause the listHomeworkByClass function to fail.');
      console.log('Consider fixing the data or updating the query logic.');
    } else {
      console.log('\n✅ No obvious data issues found.');
    }
    
  } catch (error) {
    console.error('Error debugging homework data:', error);
  }
}

debugHomeworkData();
