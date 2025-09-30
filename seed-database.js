// seed-database.js
const admin = require('firebase-admin');
const { homePageContent } = require('./homePageContent.js');
const { aboutUsPageContent } = require('./aboutUsPageContent.js');
const { contactUsPageContent } = require('./contactUsPageContent.js');
const { academicProgramPageContent } = require('./academicProgramPageContent.js');
const { careersPageContent } = require('./careersPageContent.js');
const { admissionsPageContent } = require('./admissionsPageContent.js');
const { galleryPageContent } = require('./galleryPageContent.js');
const { footerContent } = require('./footerContent.js');

// ✅ Smart initialization: use serviceAccount locally, ADC in Cloud
let app;
try {
  // Try local service account key
  const serviceAccount = require('./serviceAccountKey.json');
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Initialized Firebase Admin with local serviceAccountKey.json');
} catch (err) {
  // Fallback: Application Default Credentials (for Cloud Build / Cloud Functions)
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log('Initialized Firebase Admin with applicationDefault()');
}

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('Starting to seed homepage content...');
    await db.collection('websiteContent').doc('homePage').set(homePageContent, { merge: true });
    console.log('✅ Homepage content seeded');

    console.log('Starting to seed about us page content...');
    await db.collection('websiteContent').doc('aboutUsPage').set(aboutUsPageContent, { merge: true });
    console.log('✅ About us content seeded');

    console.log('Starting to seed contact us page content...');
    await db.collection('websiteContent').doc('contactUsPage').set(contactUsPageContent, { merge: true });
    console.log('✅ Contact us content seeded');

    console.log('Starting to seed academic program page content...');
    await db.collection('websiteContent').doc('academicProgramPage').set(academicProgramPageContent, { merge: true });
    console.log('✅ Academic program content seeded');

    console.log('Starting to seed careers page content...');
    await db.collection('websiteContent').doc('careersPage').set(careersPageContent, { merge: true });
    console.log('✅ Careers content seeded');

    console.log('Starting to seed admissions page content...');
    await db.collection('websiteContent').doc('admissionsPage').set(admissionsPageContent, { merge: true });
    console.log('✅ Admissions content seeded');

    console.log('Starting to seed gallery page content...');
    await db.collection('websiteContent').doc('galleryPage').set(galleryPageContent, { merge: true });
    console.log('✅ Gallery content seeded');

    console.log('Starting to seed footer content...');
    await db.collection('websiteContent').doc('footer').set(footerContent, { merge: true });
    console.log('✅ Footer content seeded');

    console.log("🎉 Seeding complete. Check Firestore > websiteContent collection.");
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
