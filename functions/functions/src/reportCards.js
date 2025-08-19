const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('./utils/cors');
const { authenticate, requireRole } = require('./utils/auth');

const db = admin.firestore();

// Helper: Check if parent has access to student
async function parentHasAccessToStudent(parentUID, studentId) {
  const parentDoc = await db.collection('parents').doc(parentUID).get();
  if (!parentDoc.exists) return false;
  const children = parentDoc.data().children || [];
  return children.includes(studentId);
}

// CREATE or UPDATE report card (teacher only)
exports.saveReportCard = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  try {
    const { user, decodedToken } = await authenticate(req, res);
    requireRole(decodedToken, ['teacher', 'admin', 'superadmin']);
    const { studentId, academicYear, period, grades, overallPerformance, comments } = req.body;
    if (!studentId || !academicYear || !period || !grades) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const docId = `${academicYear}_${studentId}_${period}`;
    await db.collection('reportCards').doc(docId).set({
      studentId,
      academicYear,
      period,
      grades,
      overallPerformance: overallPerformance || '',
      comments: comments || '',
      createdBy: decodedToken.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

// READ report card (teacher, admin, superadmin, parent)
exports.getReportCard = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  try {
    const { user, decodedToken } = await authenticate(req, res);
    const { studentId, academicYear, period } = req.query;
    if (!studentId || !academicYear || !period) {
      return res.status(400).json({ error: 'Missing required query params' });
    }
    const docId = `${academicYear}_${studentId}_${period}`;
    const doc = await db.collection('reportCards').doc(docId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    // Role-based access
    const role = decodedToken.role;
    if (role === 'parent') {
      const hasAccess = await parentHasAccessToStudent(decodedToken.uid, studentId);
      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });
    }
    res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

// LIST report cards for a student (teacher, admin, superadmin, parent)
exports.listReportCards = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;
    const { studentId, academicYear } = req.query;
    if (!studentId || !academicYear) {
      return res.status(400).json({ error: 'Missing required query params' });
    }
    // Role-based access
    const role = decodedToken.role;
    if (role === 'parent') {
      const hasAccess = await parentHasAccessToStudent(decodedToken.uid, studentId);
      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });
    }

    // Logging for debugging
    console.log('listReportCards request:', { studentId, academicYear, role });

    // Query Firestore
    let query = db.collection('reportCards')
      .where('studentId', '==', studentId)
      .where('academicYear', '==', academicYear);

    // TODO: Add pagination support if needed (startAfter, limit)
    const snapshot = await query.get();
    let reportCards = snapshot.docs.map(doc => doc.data());

    // Filter out soft-deleted cards if you use a deleted flag
    reportCards = reportCards.filter(rc => !rc.deleted);

    const count = reportCards.length;
    const totalCount = count; // No pagination yet

    // Log result
    console.log('listReportCards result:', { count, totalCount });

    return res.json({
      reportCards,
      count,
      totalCount,
      filters: { studentId, academicYear },
      success: true
    });
  } catch (error) {
    console.error('Error listing report cards:', error);
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied accessing report cards' });
    }
    if (error.code === 'unavailable') {
      return res.status(503).json({ error: 'Firestore service temporarily unavailable' });
    }
    if (error.code === 'failed-precondition') {
      return res.status(400).json({
        error: 'Query requires an index. Please check Firestore indexes.',
        details: error.message
      });
    }
    return res.status(500).json({
      error: 'Internal server error while listing report cards',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// DELETE report card (teacher, admin, superadmin)
exports.deleteReportCard = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  try {
    const { user, decodedToken } = await authenticate(req, res);
    requireRole(decodedToken, ['teacher', 'admin', 'superadmin']);
    const { studentId, academicYear, period } = req.body;
    if (!studentId || !academicYear || !period) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const docId = `${academicYear}_${studentId}_${period}`;
    await db.collection('reportCards').doc(docId).delete();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});
