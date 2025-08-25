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
    // The httpsCallable client SDK expects the response to be an object with a 'data' key.
    res.status(200).json({ data: content });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

/**
 * @name updateHomePageContent
 * @description An HTTP-callable function to update the homepage content in Firestore.
 * This function is protected and can only be called by authenticated users with
 * the 'manage_content' permission.
 *
 * @param {object} data - The data sent to the function, containing the updated content.
 * @param {object} context - The authentication context of the user calling the function.
 * @returns {Promise<{success: boolean, message: string}>} A promise that resolves with a success message or rejects with an error.
 */
exports.updateHomePageContent = functions.https.onCall(async (data, context) => {
  // Check for authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to update content.');
  }

  // Check for 'manage_content' permission
  const userRole = context.auth.token.role;
  if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'content-manager') {
    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to update content.');
  }

  // Basic data validation (a more robust validation could be added here)
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a data object.');
  }

  try {
    const db = admin.firestore();
    const docRef = db.collection('websiteContent').doc('homePage');

    // The data received should be the full document content.
    // We use 'set' with merge: true to be safe, which will update fields or create the doc if it doesn't exist.
    await docRef.set(data, { merge: true });

    console.log(`Homepage content updated by ${context.auth.uid}`);
    return { success: true, message: 'Homepage content updated successfully.' };

  } catch (error) {
    console.error('Error updating homepage content:', error);
    throw new functions.https.HttpsError('internal', 'An internal error occurred while updating the content.');
  }
});
