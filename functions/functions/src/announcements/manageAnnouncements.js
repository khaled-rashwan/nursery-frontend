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

// Helper function to validate downloads array
const validateDownloads = (downloads) => {
    if (!Array.isArray(downloads)) {
        return { isValid: false, error: 'Validation failed: downloads must be an array.' };
    }
    for (const download of downloads) {
        if (!download.name || typeof download.name !== 'string' || !download.link || typeof download.link !== 'string') {
            return { isValid: false, error: 'Validation failed: each download must have a name and a link, both strings.' };
        }
        try {
            new URL(download.link);
        } catch (_) {
            return { isValid: false, error: `Validation failed: invalid URL format for link "${download.link}".` };
        }
    }
    return { isValid: true };
};

const createAnnouncement = async (req, res, decoded) => {
    if (!hasTeacherRole(decoded)) {
        return res.status(403).json({ error: 'Forbidden. Only teachers can create announcements.' });
    }

    const { title, content, classId, academicYear, downloads } = req.body;

    if (!title || !content || !classId || !academicYear) {
        return res.status(400).json({ error: 'Missing required fields: title, content, classId, academicYear' });
    }

    if (downloads) {
        const validation = validateDownloads(downloads);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }
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
            downloads: downloads || [],
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
            const { classId } = req.query;
            if (!classId) {
                return res.status(400).json({ error: 'Missing required field for parent role: classId' });
            }

            // 1. Find all students associated with this parent to verify authorization.
            const studentsSnapshot = await db.collection('students')
                .where('parentUID', '==', decoded.uid)
                .get();

            if (studentsSnapshot.empty) {
                return res.json([]); // No students, so no announcements.
            }
            const studentUIDs = studentsSnapshot.docs.map(doc => doc.id);

            // 2. Check if any of the parent's children are in the requested class.
            const enrollmentCheckSnapshot = await db.collection('enrollments')
                .where('classId', '==', classId)
                .where('academicYear', '==', academicYear)
                .where('studentUID', 'in', studentUIDs)
                .limit(1)
                .get();

            if (enrollmentCheckSnapshot.empty) {
                // This parent is not authorized to view announcements for this class.
                // We still proceed to fetch global announcements.
                announcementsData = [];
            } else {
                // 3a. If authorized, fetch announcements for that specific class.
                const classAnnouncementsSnapshot = await db.collection('announcements')
                    .where('academicYear', '==', academicYear)
                    .where('classId', '==', classId)
                    .get();
                announcementsData = classAnnouncementsSnapshot.docs.map(doc => doc.data());
            }

            // 3b. Fetch global announcements.
            const globalAnnouncementsSnapshot = await db.collection('announcements')
                .where('academicYear', '==', academicYear)
                .where('classId', '==', 'all')
                .get();

            const globalAnnouncements = globalAnnouncementsSnapshot.docs.map(doc => doc.data());

            // 4. Combine and de-duplicate announcements.
            const allAnnouncements = [...announcementsData, ...globalAnnouncements];
            const uniqueAnnouncements = Array.from(new Map(allAnnouncements.map(item => [item.id, item])).values());
            announcementsData = uniqueAnnouncements;

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

    const { announcementId, title, content, downloads } = req.body;

    if (!announcementId || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields: announcementId, title, content' });
    }

    if (downloads) {
        const validation = validateDownloads(downloads);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }
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
            downloads: downloads || [],
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
