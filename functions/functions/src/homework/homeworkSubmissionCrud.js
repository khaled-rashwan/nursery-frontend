const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');

const db = admin.firestore();

// Helper: Validate submission data
function validateSubmissionData(data) {
  const errors = [];
  if (!data.homeworkId) errors.push('Homework ID is required');
  if (!data.studentId) errors.push('Student ID is required');
  if (!data.status || !['submitted', 'confirmed'].includes(data.status)) errors.push('Status must be submitted or confirmed');
  if (data.attachments && !Array.isArray(data.attachments)) errors.push('Attachments must be an array');
  return errors;
}

// Helper: Check parent owns student
async function parentOwnsStudent(parentUID, studentId) {
  const studentDoc = await db.collection('students').doc(studentId).get();
  return studentDoc.exists && studentDoc.data().parentUID === parentUID;
}

// CREATE/UPDATE submission (parent)
const submitHomework = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authResult = await authenticate(req, res);
    if (authResult.error) return res.status(authResult.error.status).json({ error: authResult.error.message });
    const { decodedToken } = authResult;
    if (decodedToken.role !== 'parent') return res.status(403).json({ error: 'Only parents can submit homework' });
    const data = req.body;
    const errors = validateSubmissionData(data);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
    if (!(await parentOwnsStudent(decodedToken.uid, data.studentId))) return res.status(403).json({ error: 'Parent does not own this student' });
    const submissionRef = db.collection('homework').doc(data.homeworkId).collection('submissions').doc(data.studentId);
    const submissionDoc = {
      studentId: data.studentId,
      parentUID: decodedToken.uid,
      homeworkId: data.homeworkId,
      status: data.status,
      attachments: data.attachments || [],
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      comment: data.comment || '',
    };
    await submissionRef.set(submissionDoc, { merge: true });
    res.status(200).json({ message: 'Homework submitted', submission: submissionDoc });
  } catch (error) {
    console.error('Error submitting homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LIST submissions for a homework (teacher)
const listHomeworkSubmissions = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authResult = await authenticate(req, res);
    if (authResult.error) return res.status(authResult.error.status).json({ error: authResult.error.message });
    const { decodedToken } = authResult;
    if (!['teacher', 'admin', 'superadmin'].includes(decodedToken.role)) return res.status(403).json({ error: 'Only teachers/admins can view submissions' });
    const { homeworkId } = req.query;
    if (!homeworkId) return res.status(400).json({ error: 'Homework ID is required' });
    // Optionally: check teacher owns this homework
    const submissionsSnap = await db.collection('homework').doc(homeworkId).collection('submissions').get();
    const submissions = submissionsSnap.docs.map(doc => doc.data());
    res.status(200).json({ submissions });
  } catch (error) {
    console.error('Error listing submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET a single submission (parent or teacher)
const getHomeworkSubmission = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authResult = await authenticate(req, res);
    if (authResult.error) return res.status(authResult.error.status).json({ error: authResult.error.message });
    const { decodedToken } = authResult;
    const { homeworkId, studentId } = req.query;
    if (!homeworkId || !studentId) return res.status(400).json({ error: 'Homework ID and Student ID are required' });
    const submissionRef = db.collection('homework').doc(homeworkId).collection('submissions').doc(studentId);
    const submissionDoc = await submissionRef.get();
    if (!submissionDoc.exists) return res.status(404).json({ error: 'Submission not found' });
    const data = submissionDoc.data();
    // Only parent of student or teacher/admin can view
    if (decodedToken.role === 'parent' && data.parentUID !== decodedToken.uid) return res.status(403).json({ error: 'Forbidden' });
    res.status(200).json({ submission: data });
  } catch (error) {
    console.error('Error getting submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE submission (teacher: comment/grade)
const updateHomeworkSubmission = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authResult = await authenticate(req, res);
    if (authResult.error) return res.status(authResult.error.status).json({ error: authResult.error.message });
    const { decodedToken } = authResult;
    if (!['teacher', 'admin', 'superadmin'].includes(decodedToken.role)) return res.status(403).json({ error: 'Only teachers/admins can update submissions' });
    const { homeworkId, studentId, comment, grade } = req.body;
    if (!homeworkId || !studentId) return res.status(400).json({ error: 'Homework ID and Student ID are required' });
    const submissionRef = db.collection('homework').doc(homeworkId).collection('submissions').doc(studentId);
    const submissionDoc = await submissionRef.get();
    if (!submissionDoc.exists) return res.status(404).json({ error: 'Submission not found' });
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (comment !== undefined) updateData.teacherComment = comment;
    if (grade !== undefined) updateData.grade = grade;
    await submissionRef.update(updateData);
    res.status(200).json({ message: 'Submission updated', update: updateData });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE submission (parent can delete their own, teacher/admin can delete any)
const deleteHomeworkSubmission = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authResult = await authenticate(req, res);
    if (authResult.error) return res.status(authResult.error.status).json({ error: authResult.error.message });
    const { decodedToken } = authResult;
    const { homeworkId, studentId } = req.query;
    if (!homeworkId || !studentId) return res.status(400).json({ error: 'Homework ID and Student ID are required' });
    const submissionRef = db.collection('homework').doc(homeworkId).collection('submissions').doc(studentId);
    const submissionDoc = await submissionRef.get();
    if (!submissionDoc.exists) return res.status(404).json({ error: 'Submission not found' });
    const data = submissionDoc.data();
    if (decodedToken.role === 'parent' && data.parentUID !== decodedToken.uid) return res.status(403).json({ error: 'Forbidden' });
    await submissionRef.delete();
    res.status(200).json({ message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = {
  submitHomework,
  listHomeworkSubmissions,
  getHomeworkSubmission,
  updateHomeworkSubmission,
  deleteHomeworkSubmission
};
