const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');

const db = admin.firestore();
const storage = admin.storage().bucket();
const app = express();

// Use express.json middleware to parse JSON bodies.
app.use(express.json());

app.use((req, res, next) => {
    setCorsHeaders(res);
    if (handleCorsOptions(req, res)) {
        return;
    }
    next();
});

// Middleware for authentication
const authMiddleware = async (req, res, next) => {
    try {
        const { decodedToken } = await authenticate(req, res);
        requireRole(decodedToken, ['admin', 'superadmin', 'content-manager']);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Forbidden: ' + error.message });
    }
};

// GET / - List all media
app.get('/', authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection('media').orderBy('uploadedAt', 'desc').get();
        const media = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: media });
    } catch (error) {
        console.error('Error listing media:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST / - Create a new media metadata document in Firestore
app.post('/', authMiddleware, async (req, res) => {
    try {
        const { filename, url, path: filePath } = req.body;
        if (!filename || !url || !filePath) {
            return res.status(400).json({ error: 'Missing required metadata fields: filename, url, path' });
        }

        const docRef = await db.collection('media').add({
            filename,
            url,
            path: filePath,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            uploadedBy: req.user.uid,
        });

        res.status(201).json({ success: true, id: docRef.id });
    } catch (error) {
        console.error('Error creating media document:', error);
        res.status(500).json({ error: 'Failed to create media document.' });
    }
});


// DELETE /:id - Delete media
app.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = db.collection('media').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Media not found.' });
        }

        const { path: filePath } = doc.data();
        if (filePath) {
            await storage.file(filePath).delete();
        }

        await docRef.delete();

        res.status(200).json({ success: true, message: 'Media deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting media ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


exports.mediaApi = functions.https.onRequest(app);
