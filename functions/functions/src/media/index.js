const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');

const db = admin.firestore();
const storage = admin.storage().bucket();
const app = express();

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
        requireRole(decodedToken, ['admin', 'superadmin']);
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

// POST / - Upload new media
app.post('/', authMiddleware, (req, res) => {
    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const uploads = {};
    const fileWrites = [];

    busboy.on('file', (fieldname, file, { filename, mimeType }) => {
        const filepath = path.join(tmpdir, filename);
        const upload = { file: filepath, mimeType };
        uploads[fieldname] = upload;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
                writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fileWrites.push(promise);
    });

    busboy.on('finish', async () => {
        await Promise.all(fileWrites);

        // Assuming single file upload for simplicity
        const fileUpload = uploads.file;
        if (!fileUpload) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const { file, mimeType } = fileUpload;
        const uniqueId = uuidv4();
        const destination = `media/${uniqueId}-${path.basename(file)}`;

        try {
            const [uploadedFile] = await storage.upload(file, {
                destination,
                metadata: {
                    contentType: mimeType,
                    cacheControl: 'public, max-age=31536000',
                },
            });

            fs.unlinkSync(file); // Clean up temporary file

            const [url] = await uploadedFile.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });

            const docRef = await db.collection('media').add({
                filename: path.basename(file),
                url,
                path: destination,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                uploadedBy: req.user.uid,
            });

            res.status(201).json({ success: true, id: docRef.id, url });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file.' });
        }
    });

    busboy.end(req.rawBody);
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
