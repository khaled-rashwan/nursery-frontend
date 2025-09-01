const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const careersPageContent = require('./careersPageContent.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testCareersPage() {
  console.log('--- Starting Careers Page Test ---');

  try {
    // 1. Seed careers page content
    console.log('\n[Test 1/3] Seeding careers page content...');
    await db.collection('websiteContent').doc('careers').set(careersPageContent);
    console.log('  ✅ Seeded careers page content successfully.');

    // 2. Fetch careers page content
    console.log('\n[Test 2/3] Fetching careers page content...');
    const careersPageRef = db.collection('websiteContent').doc('careers');
    const careersPageDoc = await careersPageRef.get();
    if (!careersPageDoc.exists) {
      throw new Error('Careers page content document does not exist.');
    }
    const careersPageData = careersPageDoc.data();
    console.log('  ✅ Fetched careers page data successfully.');

    // 3. Validate careers page content
    console.log('\n[Test 3/3] Validating careers page content...');
    if (!careersPageData.heroSection || !careersPageData.heroSection.title) {
      throw new Error('Careers page data is missing expected fields (e.g., heroSection.title).');
    }
    console.log(`  > Hero Title: ${careersPageData.heroSection.title}`);
    if (!careersPageData.jobListings || careersPageData.jobListings.length === 0) {
        throw new Error('Careers page data is missing job listings.');
    }
    console.log(`  > Found ${careersPageData.jobListings.length} job listings.`);

    console.log('\n--- ✅ Careers Page Test Passed ---');
    process.exit(0);
  } catch (error) {
    console.error('\n--- ❌ Careers Page Test Failed ---');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testCareersPage();
