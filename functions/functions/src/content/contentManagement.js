// functions/functions/src/content/contentManagement.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * @name getHomePageContent
 * @description An HTTP-callable function to fetch the homepage content from Firestore.
 * This function is designed to be called from the frontend application.
 * It retrieves the 'homePage' document from the 'websiteContent' collection.
 *
 * @returns {Promise<void>} A promise that resolves when the function is complete.
 * On success, it sends a JSON object with the homepage content.
 * On error, it sends an appropriate HTTP error status and message.
 */
exports.getHomePageContent = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for preflight requests and for the main request.
  // This allows the frontend to call this function from a different origin.
  res.set('Access-Control-Allow-Origin', '*'); // In production, you should restrict this to your app's domain.
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // End request for preflight requests
    res.status(204).send('');
    return;
  }

  try {
    const db = admin.firestore();
    const docRef = db.collection('websiteContent').doc('homePage');
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error('Homepage content document not found.');
      res.status(404).send({ error: 'Homepage content not found.' });
      return;
    }

    const content = doc.data();
    res.status(200).json(content);
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).send({ error: 'Internal server error.' });
  }
});
