// functions/functions/src/content/contentManagement.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { corsMiddleware, setCorsHeaders, handleCorsOptions } = require('../utils/cors');

/**
 * @name getHomePageContent
 * @description Fetches the content for the "Home" page.
 */
exports.getHomePageContent = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    console.log('getHomePageContent function triggered for diagnostics.'); // Diagnostic log
    try {
      const db = admin.firestore();
      const docRef = db.collection('websiteContent').doc('homePage');
      const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).send({ error: 'Homepage content not found.' });
      return;
    }
    res.status(200).json({ data: doc.data() });
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      res.status(500).send({ error: 'Internal server error.' });
    }
  });
});

/**
 * @name saveHomePageContent
 * @description Updates the content for the "Home" page.
 */
exports.saveHomePageContent = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      res.status(401).send({ error: 'Unauthorized. No token provided.' });
      return;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userRole = decodedToken.role;

    if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'content-manager') {
      res.status(403).send({ error: 'Permission denied.' });
      return;
    }

    const content = req.body;
    if (!content || typeof content !== 'object') {
      res.status(400).send({ error: 'Invalid request body.' });
      return;
    }

    console.log(`User ${decodedToken.uid} is authorized to save homepage content.`);
    const db = admin.firestore();
    const docRef = db.collection('websiteContent').doc('homePage');

    console.log('Attempting to save the following content to homePage:', JSON.stringify(content, null, 2));
    await docRef.set(content, { merge: true });
    console.log('Firestore set operation complete for homePage.');

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
});

/**
 * @name getAboutUsPageContent
 * @description Fetches the content for the "About Us" page.
 */
exports.getAboutUsPageContent = functions.https.onRequest((req, res) => {
    corsMiddleware(req, res, async () => {
        try {
            const db = admin.firestore();
            const docRef = db.collection('websiteContent').doc('aboutUsPage');
            const doc = await docRef.get();

        if (!doc.exists) {
            res.status(404).send({ error: 'About Us page content not found.' });
            return;
        }
        res.status(200).json({ data: doc.data() });
        } catch (error) {
            console.error('Error fetching About Us page content:', error);
            res.status(500).send({ error: 'Internal server error.' });
        }
    });
});

/**
 * @name saveAboutUsPageContent
 * @description Updates the content for the "About Us" page.
 */
exports.saveAboutUsPageContent = functions.https.onRequest((req, res) => {
    corsMiddleware(req, res, async () => {
        const idToken = req.headers.authorization?.split('Bearer ')[1];
        if (!idToken) {
            res.status(401).send({ error: 'Unauthorized. No token provided.' });
            return;
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userRole = decodedToken.role;

        if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'content-manager') {
            res.status(403).send({ error: 'Permission denied.' });
            return;
        }

        const content = req.body;
        if (!content || typeof content !== 'object') {
            res.status(400).send({ error: 'Invalid request body.' });
            return;
        }

    console.log(`User ${decodedToken.uid} is authorized to save About Us page content.`);
        const db = admin.firestore();
        const docRef = db.collection('websiteContent').doc('aboutUsPage');

    console.log('Attempting to save the following content to aboutUsPage:', JSON.stringify(content, null, 2));
        await docRef.set(content, { merge: true });
    console.log('Firestore set operation complete for aboutUsPage.');

        res.status(200).send({ success: true, message: 'About Us page content updated successfully.' });

        } catch (error) {
            console.error('Error updating About Us page content:', error);
            if (error.code === 'auth/id-token-expired') {
                res.status(401).send({ error: 'Token expired. Please log in again.' });
            } else {
                res.status(500).send({ error: 'Internal server error.' });
            }
        }
    });
});

/**
 * @name getContactUsPageContent
 * @description Fetches the content for the "Contact Us" page.
 */
exports.getContactUsPageContent = functions.https.onRequest((req, res) => {
    corsMiddleware(req, res, async () => {
        try {
            const db = admin.firestore();
            const docRef = db.collection('websiteContent').doc('contactUsPage');
            const doc = await docRef.get();

            if (!doc.exists) {
                res.status(404).send({ error: 'Contact Us page content not found.' });
                return;
            }
            res.status(200).json({ data: doc.data() });
        } catch (error) {
            console.error('Error fetching Contact Us page content:', error);
            res.status(500).send({ error: 'Internal server error.' });
        }
    });
});

/**
 * @name saveContactUsPageContent
 * @description Updates the content for the "Contact Us" page.
 */
exports.saveContactUsPageContent = functions.https.onRequest((req, res) => {
    corsMiddleware(req, res, async () => {
        const idToken = req.headers.authorization?.split('Bearer ')[1];
        if (!idToken) {
            res.status(401).send({ error: 'Unauthorized. No token provided.' });
            return;
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userRole = decodedToken.role;

            if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'content-manager') {
                res.status(403).send({ error: 'Permission denied.' });
                return;
            }

            const content = req.body;
            if (!content || typeof content !== 'object') {
                res.status(400).send({ error: 'Invalid request body.' });
                return;
            }

            console.log(`User ${decodedToken.uid} is authorized to save Contact Us page content.`);
            const db = admin.firestore();
            const docRef = db.collection('websiteContent').doc('contactUsPage');

            console.log('Attempting to save the following content to contactUsPage:', JSON.stringify(content, null, 2));
            await docRef.set(content, { merge: true });
            console.log('Firestore set operation complete for contactUsPage.');

            res.status(200).send({ success: true, message: 'Contact Us page content updated successfully.' });

        } catch (error) {
            console.error('Error updating Contact Us page content:', error);
            if (error.code === 'auth/id-token-expired') {
                res.status(401).send({ error: 'Token expired. Please log in again.' });
            } else {
                res.status(500).send({ error: 'Internal server error.' });
            }
        }
    });
});
