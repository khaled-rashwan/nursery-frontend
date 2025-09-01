const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders } = require('../utils/cors');

const db = admin.firestore();

/**
 * @typedef {object} Application
 * @property {string} name
 * @property {string} email
 * @property {string} jobTitle
 * @property {string} resumeUrl
 * @property {admin.firestore.Timestamp} submittedAt
 */

exports.submitApplication = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { name, email, jobTitle, resumeUrl } = req.body;

    if (!name || !email || !jobTitle || !resumeUrl) {
      return res.status(400).send('Missing required fields.');
    }

    /** @type {Application} */
    const applicationData = {
      name,
      email,
      jobTitle,
      resumeUrl,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('applications').add(applicationData);

    res.status(201).send({ message: 'Application submitted successfully.' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).send('Internal Server Error');
  }
});
