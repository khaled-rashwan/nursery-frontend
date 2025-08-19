const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate } = require('../utils/auth');

const db = admin.firestore();

// Get children for a parent with their current class enrollment information
exports.getChildrenWithEnrollments = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication - but also allow fallback to body parentUID for compatibility
    let parentUID = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        parentUID = decodedToken.uid;
        
        // Verify parent role if authenticated
        const userRole = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);
        if (userRole && userRole !== 'parent') {
          return res.status(403).json({ error: 'Only parents can access children information' });
        }
      } catch (authError) {
        console.warn('Authentication failed, falling back to body parentUID:', authError.message);
      }
    }

    // Fallback to body parentUID if no valid token
    if (!parentUID) {
      parentUID = req.body.parentUID;
      if (!parentUID) {
        return res.status(400).json({ error: 'Parent UID is required' });
      }
    }

    // Get children for this parent
    const studentsSnapshot = await db.collection('students')
      .where('parentUID', '==', parentUID)
      .where('deleted', '!=', true)
      .get();

    if (studentsSnapshot.empty) {
      return res.status(200).json({ children: [] });
    }

    const children = [];

    // For each child, get their current enrollment and class information
    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data();
      const studentId = studentDoc.id;

      // Get current enrollment for this student using the pattern: academicYear_studentId
      // Try current academic year first, then fallback to any enrollment
      const currentAcademicYear = '2024-2025'; // TODO: Make this dynamic
      const enrollmentId = `${currentAcademicYear}_${studentId}`;
      
      let enrollmentData = null;
      let classInfo = null;

      // Try to get enrollment by the specific ID pattern first
      try {
        const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
        if (enrollmentDoc.exists && !enrollmentDoc.data().deleted) {
          enrollmentData = enrollmentDoc.data();
        }
      } catch (error) {
        console.warn(`Failed to get enrollment by ID ${enrollmentId}:`, error);
      }

      // Fallback: search for any active enrollment for this student
      if (!enrollmentData) {
        const enrollmentSnapshot = await db.collection('enrollments')
          .where('studentUID', '==', studentId)
          .where('deleted', '!=', true)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        
        if (!enrollmentSnapshot.empty) {
          enrollmentData = enrollmentSnapshot.docs[0].data();
        }
      }

      // Get class information if we have enrollment data
      if (enrollmentData && enrollmentData.classId) {
        try {
          const classDoc = await db.collection('classes').doc(enrollmentData.classId).get();
          if (classDoc.exists && !classDoc.data().deleted) {
            const classData = classDoc.data();
            classInfo = {
              id: classDoc.id,
              name: classData.name,
              nameAr: classData.nameAr || classData.name,
              level: classData.level,
              academicYear: classData.academicYear
            };
          }
        } catch (error) {
          console.warn(`Failed to get class info for classId ${enrollmentData.classId}:`, error);
        }
      }
      
      // Fallback to class name from enrollment if no classId but has class name
      if (!classInfo && enrollmentData && enrollmentData.class) {
        classInfo = {
          id: enrollmentData.class, // Use class name as ID for backward compatibility
          name: enrollmentData.class,
          nameAr: enrollmentData.class,
          level: enrollmentData.class.includes('Pre-KG') ? 'Pre-KG' : 
                 enrollmentData.class.includes('KG1') ? 'KG1' : 
                 enrollmentData.class.includes('KG2') ? 'KG2' : 'Unknown',
          academicYear: enrollmentData.academicYear || currentAcademicYear
        };
      }

      // Compute age from birthDate
      let age = null;
      if (studentData.dateOfBirth) {
        try {
          const dob = new Date(studentData.dateOfBirth);
          const now = new Date();
          let years = now.getFullYear() - dob.getFullYear();
          const mDiff = now.getMonth() - dob.getMonth();
          if (mDiff < 0 || (mDiff === 0 && now.getDate() < dob.getDate())) years--;
          age = years >= 0 ? years : null;
        } catch (error) {
          console.warn('Error computing age:', error);
        }
      }

      // Build child object
      const child = {
        id: studentId,
        name: studentData.fullName || studentData.name || 'Unknown',
        nameEn: studentData.fullNameEn || studentData.nameEn || studentData.fullName || studentData.name || 'Unknown',
        birthDate: studentData.dateOfBirth,
        age: age,
        gender: studentData.gender,
        parentUID: studentData.parentUID,
        photo: studentData.gender === 'Female' ? '👧' : '👦',
        class: classInfo ? classInfo.name : null,
        classEn: classInfo ? classInfo.name : null,
        classId: classInfo ? classInfo.id : null,
        classLevel: classInfo ? classInfo.level : null,
        academicYear: classInfo ? classInfo.academicYear : null
      };

      children.push(child);
    }

    res.status(200).json({ children });
  } catch (error) {
    console.error('Error fetching children with enrollments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
