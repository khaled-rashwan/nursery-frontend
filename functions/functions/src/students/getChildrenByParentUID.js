const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Ensure Firebase is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get children for a parent by parentUID
exports.getChildrenByParentUID = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  // Allow Authorization header now to enable secure calls
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // If Authorization header present, prefer using authenticated uid rather than trusting body
    let parentUIDFromAuth = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        parentUIDFromAuth = decoded.uid;
      } catch (e) {
        console.warn('Token verification failed, falling back to body parentUID');
      }
    }

    const bodyParentUID = req.body.parentUID;
    const parentUID = parentUIDFromAuth || bodyParentUID;
    if (!parentUID) {
      res.status(400).json({ error: 'Missing parentUID' });
      return;
    }
    
    const studentsRef = admin.firestore().collection('students');
    const snapshot = await studentsRef.where('parentUID', '==', parentUID).get();
    const children = [];
    
    // For each child, also get their enrollment information
    for (const doc of snapshot.docs) {
      const studentData = doc.data();
      const studentId = doc.id;
      
      // Get the most recent enrollment for this student
      let enrollmentInfo = null;
      try {
        const enrollmentSnapshot = await admin.firestore().collection('enrollments')
          .where('studentUID', '==', studentId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
          
        if (!enrollmentSnapshot.empty) {
          const enrollmentData = enrollmentSnapshot.docs[0].data();
          enrollmentInfo = {
            classId: enrollmentData.classId || enrollmentData.class,
            className: enrollmentData.class || enrollmentData.className,
            academicYear: enrollmentData.academicYear
          };
        }
      } catch (error) {
        console.warn(`Failed to get enrollment for student ${studentId}:`, error.message);
      }
      
      children.push({ 
        id: studentId, 
        ...studentData,
        enrollment: enrollmentInfo
      });
    }
    
    res.status(200).json({ children, usedAuth: !!parentUIDFromAuth });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
