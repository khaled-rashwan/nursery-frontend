const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate } = require('../utils/auth');

const db = admin.firestore();

// Utilities
const getUserRole = (decoded) => decoded.role || (decoded.customClaims && decoded.customClaims.role) || 'user';

const hasTeacherRole = (decoded) => {
    return decoded.role === 'teacher' || (decoded.customClaims && decoded.customClaims.role === 'teacher');
};

const createAnnouncement = async (req, res, decoded) => {
    if (!hasTeacherRole(decoded)) {
        return res.status(403).json({ error: 'Forbidden. Only teachers can create announcements.' });
    }

    const { title, content, classId, academicYear } = req.body;

    if (!title || !content || !classId || !academicYear) {
        return res.status(400).json({ error: 'Missing required fields: title, content, classId, academicYear' });
    }

    try {
        const announcementRef = db.collection('announcements').doc();
        const announcement = {
            id: announcementRef.id,
            title,
            content,
            classId,
            academicYear,
            authorId: decoded.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await announcementRef.set(announcement);
        return res.status(201).json(announcement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getAuthorName = async (authorId) => {
    try {
        const userRecord = await admin.auth().getUser(authorId);
        return userRecord.displayName || 'Unknown Author';
    } catch (error) {
        console.error(`Error fetching user data for ID ${authorId}:`, error);
        return 'Unknown Author';
    }
};

const listAnnouncements = async (req, res, decoded, role) => {
    const { academicYear, classId } = req.query;

    if (!academicYear) {
        return res.status(400).json({ error: 'Missing required field: academicYear' });
    }

    try {
        let announcementsData = [];
        if (role === 'teacher') {
            if (!classId) {
                return res.status(400).json({ error: 'Missing required field for teacher: classId' });
            }
            const query = db.collection('announcements')
                .where('academicYear', '==', academicYear)
                .where('classId', '==', classId);

            const snapshot = await query.get();
            announcementsData = snapshot.docs.map(doc => doc.data());

        } else if (role === 'parent') {
            const enrollmentsSnapshot = await db.collection('enrollments')
                .where('parentUID', '==', decoded.uid)
                .where('academicYear', '==', academicYear)
                .get();

            if (enrollmentsSnapshot.empty) {
                return res.json([]);
            }

            const enrolledClassIds = [...new Set(enrollmentsSnapshot.docs.map(doc => doc.data().classId))];

            if (enrolledClassIds.length === 0) {
                return res.json([]);
            }

            const announcementsPromises = enrolledClassIds.map(cid => {
                return db.collection('announcements')
                    .where('academicYear', '==', academicYear)
                    .where('classId', '==', cid)
                    .get();
            });

            const announcementsSnapshots = await Promise.all(announcementsPromises);
            announcementsSnapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    announcementsData.push(doc.data());
                });
            });
        } else {
            return res.status(403).json({ error: 'Forbidden. User role not permitted.' });
        }

        const announcementsWithAuthors = await Promise.all(
            announcementsData.map(async (announcement) => {
                const authorName = await getAuthorName(announcement.authorId);
                return { ...announcement, authorName };
            })
        );

        return res.json(announcementsWithAuthors);

    } catch (error) {
        console.error('Error listing announcements:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const updateAnnouncement = async (req, res, decoded) => {
    if (!hasTeacherRole(decoded)) {
        return res.status(403).json({ error: 'Forbidden. Only teachers can update announcements.' });
    }

    const { announcementId, title, content } = req.body;

    if (!announcementId || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields: announcementId, title, content' });
    }

    try {
        const announcementRef = db.collection('announcements').doc(announcementId);
        const doc = await announcementRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        if (doc.data().authorId !== decoded.uid) {
            return res.status(403).json({ error: 'Forbidden. You are not the author of this announcement.' });
        }

        await announcementRef.update({
            title,
            content,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).json({ message: 'Announcement updated successfully' });
    } catch (error) {
        console.error('Error updating announcement:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteAnnouncement = async (req, res, decoded) => {
    if (!hasTeacherRole(decoded)) {
        return res.status(403).json({ error: 'Forbidden. Only teachers can delete announcements.' });
    }

    const { announcementId } = req.body;

    if (!announcementId) {
        return res.status(400).json({ error: 'Missing required field: announcementId' });
    }

    try {
        const announcementRef = db.collection('announcements').doc(announcementId);
        const doc = await announcementRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        if (doc.data().authorId !== decoded.uid) {
            return res.status(403).json({ error: 'Forbidden. You are not the author of this announcement.' });
        }

        await announcementRef.delete();

        return res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// HTTPS Entrypoint
const manageAnnouncements = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const decoded = authResult.decodedToken;
  const role = getUserRole(decoded);
  const { operation } = req.query;

  try {
    switch (operation) {
      case 'createAnnouncement':
        return await createAnnouncement(req, res, decoded);
      case 'listAnnouncements':
        return await listAnnouncements(req, res, decoded, role);
      case 'updateAnnouncement':
        return await updateAnnouncement(req, res, decoded);
      case 'deleteAnnouncement':
        return await deleteAnnouncement(req, res, decoded);
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
  } catch (err) {
    console.error('manageAnnouncements error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = {
  manageAnnouncements
};
