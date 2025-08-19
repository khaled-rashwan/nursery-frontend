const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Cloud Function HTTP endpoint for handling custom claims changes
 * This ensures teacher records are created/removed when roles change
 * Call this endpoint after updating user roles to sync teacher collection
 */
exports.onCustomClaimsChange = functions.https.onRequest(async (req, res) => {
  try {
    const { uid, oldClaims, newClaims } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }
    
    const oldRole = oldClaims?.role;
    const newRole = newClaims?.role;
    
    console.log(`Role change for user ${uid}: ${oldRole} -> ${newRole}`);
    
    // If user became a teacher
    if (newRole === 'teacher' && oldRole !== 'teacher') {
      console.log(`Creating teacher record for newly assigned teacher: ${uid}`);
      
      // Check if teacher record already exists
      const teacherDoc = await db.collection('teachers').doc(uid).get();
      
      if (!teacherDoc.exists) {
        await db.collection('teachers').doc(uid).set({
          classes: [],
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'system_role_change'
        });
        console.log(`Teacher record created for user: ${uid}`);
      } else {
        console.log(`Teacher record already exists for user: ${uid}`);
      }
    }
    
    // If user is no longer a teacher
    if (oldRole === 'teacher' && newRole !== 'teacher') {
      console.log(`Removing teacher record for user no longer a teacher: ${uid}`);
      
      const teacherDoc = await db.collection('teachers').doc(uid).get();
      
      if (teacherDoc.exists) {
        // Archive the record instead of deleting to preserve history
        await db.collection('teachers_archived').doc(uid).set({
          ...teacherDoc.data(),
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          archivedReason: 'role_removed'
        });
        
        // Remove from active teachers collection
        await db.collection('teachers').doc(uid).delete();
        console.log(`Teacher record archived for user: ${uid}`);
      }
    }
    
    res.json({ message: 'Custom claims change processed successfully' });
    
  } catch (error) {
    console.error('Error in onCustomClaimsChange:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = {
  onCustomClaimsChange: exports.onCustomClaimsChange
};
