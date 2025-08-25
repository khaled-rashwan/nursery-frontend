// functions/functions/src/content/contentManagement.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');

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
  setCorsHeaders(res);

  if (handleCorsOptions(req, res)) {
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
 */
exports.updateHomePageContent = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (handleCorsOptions(req, res)) {
    return;
  }

  // Verify Firebase ID token
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    res.status(401).send({ error: 'Unauthorized. No token provided.' });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userRole = decodedToken.role;

    // Check for 'manage_content' permission
    if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'content-manager') {
      res.status(403).send({ error: 'Permission denied.' });
      return;
    }

    const content = req.body;
    if (!content || typeof content !== 'object') {
      res.status(400).send({ error: 'Invalid request body.' });
      return;
    }

    const db = admin.firestore();
    const docRef = db.collection('websiteContent').doc('homePage');
    await docRef.set(content, { merge: true });

    console.log(`Homepage content updated by ${decodedToken.uid}`);
    res.status(200).send({ success: true, message: 'Homepage content updated successfully.' });

  } catch (error) {
    console.error('Error updating homepage content:', error);
    if (error.code === 'auth/id-token-expired') {
      res.status(401).send({ error: 'Token expired. Please log in again.' });
    } else {
      res.status(500).send({ error: 'Internal server error.' });
    }
  }
});
