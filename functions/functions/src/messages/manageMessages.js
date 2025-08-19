const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate } = require('../utils/auth');

const db = admin.firestore();

// Utilities
const getUserRole = (decoded) => decoded.role || (decoded.customClaims && decoded.customClaims.role) || 'user';

const buildThreadId = ({ teacherId, enrollmentId }) => `${teacherId}_${enrollmentId}`;

const getEnrollmentById = async (enrollmentId) => {
  const snap = await db.collection('enrollments').doc(enrollmentId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
};

const getStudentById = async (studentId) => {
  const snap = await db.collection('students').doc(studentId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
};

const getTeacherAssignments = async (teacherId) => {
  const doc = await db.collection('teachers').doc(teacherId).get();
  const data = doc.exists ? doc.data() : null;
  return data?.classes || [];
};

const isTeacherAssignedToClassForYear = (assignments, classId, academicYear) => {
  return assignments?.some((a) => a.classId === classId && a.academicYear === academicYear);
};

const ensureParticipants = (thread, uid) => {
  // Check if user is a participant of the thread
  return thread.participantsUids && Array.isArray(thread.participantsUids) && thread.participantsUids.includes(uid);
};

// HTTPS Entrypoint
const manageMessages = functions.https.onRequest(async (req, res) => {
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
      case 'getOrCreateThread':
        return await getOrCreateThread(req, res, decoded, role);
      case 'listThreadsForTeacher':
        return await listThreadsForTeacher(req, res, decoded, role);
      case 'listThreadsForParent':
        return await listThreadsForParent(req, res, decoded, role);
      case 'listMessages':
        return await listMessages(req, res, decoded, role);
      case 'sendMessage':
        return await sendMessage(req, res, decoded, role);
      case 'markThreadRead':
        return await markThreadRead(req, res, decoded, role);
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
  } catch (err) {
    console.error('manageMessages error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Create or return existing thread (teacher-parent for a specific student enrollment/year)
const getOrCreateThread = async (req, res, decoded, role) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { teacherId: teacherIdRaw, parentId: parentIdRaw, studentId, academicYear, enrollmentId: enrollmentIdRaw, classId: classIdRaw, firstMessage } = req.body || {};

  // Resolve teacherId/parentId depending on role
  let teacherId = teacherIdRaw;
  let parentId = parentIdRaw;
  if (role === 'teacher') teacherId = decoded.uid;
  if (role === 'parent') parentId = decoded.uid;

  if (!teacherId || !parentId || !studentId) {
    return res.status(400).json({ error: 'teacherId, parentId and studentId are required' });
  }

  // Prefer enrollmentId if provided; otherwise compute from academicYear + studentId
  let enrollmentId = enrollmentIdRaw;
  if (!enrollmentId) {
    if (!academicYear) return res.status(400).json({ error: 'academicYear or enrollmentId is required' });
    enrollmentId = `${academicYear}_${studentId}`;
  }

  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.deleted) {
    return res.status(400).json({ error: 'Invalid or missing enrollment' });
  }

  // Validate student/parent relationship
  const student = await getStudentById(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (student.parentUID !== parentId) {
    return res.status(403).json({ error: 'Parent is not linked to this student' });
  }

  const classId = enrollment.classId || classIdRaw;
  const year = enrollment.academicYear || academicYear;
  if (!classId || !year) return res.status(400).json({ error: 'Enrollment missing classId/academicYear' });

  // Validate teacher assignment to the class for the year
  const assignments = await getTeacherAssignments(teacherId);
  if (!isTeacherAssignedToClassForYear(assignments, classId, year)) {
    return res.status(403).json({ error: 'Teacher is not assigned to this class for the academic year' });
  }

  const threadId = buildThreadId({ teacherId, enrollmentId });
  const threadRef = db.collection('threads').doc(threadId);
  const threadSnap = await threadRef.get();

  if (!threadSnap.exists) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const baseThread = {
      threadId,
      academicYear: year,
      classId,
      teacherId,
      parentId,
      studentId,
      enrollmentId,
      participantsUids: [teacherId, parentId],
      lastMessage: null,
      unreadCounts: { [teacherId]: 0, [parentId]: 0 },
      participantStates: {
        [teacherId]: { lastReadAt: null, muted: false },
        [parentId]: { lastReadAt: null, muted: false }
      },
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    // Create thread
    await threadRef.set(baseThread, { merge: false });
  }

  // Optionally send first message
  if (firstMessage && (firstMessage.text || firstMessage.title)) {
    await _sendMessageInternal({ threadId, senderId: decoded.uid, text: firstMessage.text || '', title: firstMessage.title });
  }

  const finalSnap = await threadRef.get();
  return res.json({ thread: { id: finalSnap.id, ...finalSnap.data() } });
};

const listThreadsForTeacher = async (req, res, decoded, role) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  let teacherId = req.query.teacherId || decoded.uid;
  const academicYear = req.query.academicYear;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  if (role === 'teacher') teacherId = decoded.uid; // enforce own
  if (!teacherId || !academicYear) return res.status(400).json({ error: 'teacherId and academicYear are required' });

  let query = db.collection('threads')
    .where('teacherId', '==', teacherId)
    .where('academicYear', '==', academicYear)
    .orderBy('updatedAt', 'desc')
    .limit(limit);

  const snap = await query.get();
  const threads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return res.json({ threads });
};

const listThreadsForParent = async (req, res, decoded, role) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  let parentId = req.query.parentId || decoded.uid;
  const academicYear = req.query.academicYear;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  if (role === 'parent') parentId = decoded.uid; // enforce own
  if (!parentId || !academicYear) return res.status(400).json({ error: 'parentId and academicYear are required' });

  let query = db.collection('threads')
    .where('parentId', '==', parentId)
    .where('academicYear', '==', academicYear)
    .orderBy('updatedAt', 'desc')
    .limit(limit);

  const snap = await query.get();
  const threads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return res.json({ threads });
};

const listMessages = async (req, res, decoded, role) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const threadId = req.query.threadId;
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);
  const direction = req.query.direction === 'desc' ? 'desc' : 'asc';

  if (!threadId) return res.status(400).json({ error: 'threadId is required' });
  const threadSnap = await db.collection('threads').doc(threadId).get();
  if (!threadSnap.exists) return res.status(404).json({ error: 'Thread not found' });
  const thread = { id: threadSnap.id, ...threadSnap.data() };
  if (!ensureParticipants(thread, decoded.uid)) return res.status(403).json({ error: 'Forbidden' });

  let query = db.collection('threads').doc(threadId).collection('messages')
    .orderBy('createdAt', direction)
    .limit(limit);

  const snap = await query.get();
  const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return res.json({ messages });
};

const _sendMessageInternal = async ({ threadId, senderId, text, title }) => {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const threadRef = db.collection('threads').doc(threadId);
  const msgRef = threadRef.collection('messages').doc();

  const msg = {
    messageId: msgRef.id,
    senderId,
    text: text || '',
    title: title || null,
    createdAt: now
  };

  await db.runTransaction(async (tx) => {
    const threadSnap = await tx.get(threadRef);
    if (!threadSnap.exists) throw new Error('Thread not found');
    const thread = threadSnap.data();
    const participants = thread.participantsUids || [];

    if (!participants.includes(senderId)) throw new Error('Sender not a participant');

    const receiverId = participants.find((u) => u !== senderId) || null;

    tx.set(msgRef, msg);

    const unreadCounts = Object.assign({}, thread.unreadCounts || {});
    if (receiverId) {
      unreadCounts[receiverId] = (unreadCounts[receiverId] || 0) + 1;
    }

    tx.update(threadRef, {
      lastMessage: { text: msg.text, senderId: msg.senderId, createdAt: now },
      updatedAt: now,
      unreadCounts
    });
  });

  return { ok: true };
};

const sendMessage = async (req, res, decoded, role) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { threadId, text, title } = req.body || {};
  if (!threadId || (!text && !title)) return res.status(400).json({ error: 'threadId and text/title are required' });

  const threadSnap = await db.collection('threads').doc(threadId).get();
  if (!threadSnap.exists) return res.status(404).json({ error: 'Thread not found' });
  const thread = threadSnap.data();
  if (!ensureParticipants(thread, decoded.uid)) return res.status(403).json({ error: 'Forbidden' });

  await _sendMessageInternal({ threadId, senderId: decoded.uid, text, title });
  return res.json({ message: 'Message sent' });
};

const markThreadRead = async (req, res, decoded, role) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { threadId } = req.body || {};
  if (!threadId) return res.status(400).json({ error: 'threadId is required' });

  const threadRef = db.collection('threads').doc(threadId);
  await db.runTransaction(async (tx) => {
    const threadSnap = await tx.get(threadRef);
    if (!threadSnap.exists) throw new Error('Thread not found');
    const thread = threadSnap.data();
    if (!ensureParticipants(thread, decoded.uid)) throw new Error('Forbidden');

    const unreadCounts = Object.assign({}, thread.unreadCounts || {});
    unreadCounts[decoded.uid] = 0;

    const participantStates = Object.assign({}, thread.participantStates || {});
    participantStates[decoded.uid] = Object.assign({}, participantStates[decoded.uid] || {}, { lastReadAt: admin.firestore.FieldValue.serverTimestamp() });

    tx.update(threadRef, { unreadCounts, participantStates });
  });

  return res.json({ message: 'Thread marked as read' });
};

module.exports = {
  manageMessages
};
