// seed-database.js
const admin = require('firebase-admin');
const { homePageContent } = require('./homePageContent.js');

// IMPORTANT: Make sure the path to your service account key is correct.
// You should have this file in the root of your project.
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('Starting to seed homepage content...');
    
    // The data is structured with locales as top-level keys.
    // We will set the entire object to the 'homePage' document.
    await db.collection('websiteContent').doc('homePage').set(homePageContent);
    
    console.log('✅ Success! The homepage content has been seeded to Firestore.');
    console.log("Navigate to Firestore > websiteContent > homePage to see the data.");
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1); // Exit with an error code
  }
}

seedDatabase();