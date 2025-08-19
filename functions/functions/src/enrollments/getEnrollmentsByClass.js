const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');

const db = admin.firestore();

// Helper function to get student information
const getStudentInfo = async (studentUID) => {
  try {
    const studentDoc = await db.collection('students').doc(studentUID).get();
    if (!studentDoc.exists) {
      return {
        uid: studentUID,
        fullName: 'Unknown Student',
        dateOfBirth: null,
        gender: 'Unknown',
        parentUID: null,
        parentInfo: null
      };
    }
    
    const studentData = studentDoc.data();
    let parentInfo = null;
    
    if (studentData.parentUID) {
      parentInfo = await getParentInfo(studentData.parentUID);
    }
    
    return {
      uid: studentUID,
      fullName: studentData.fullName || 'Unknown Student',
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender || 'Unknown',
      parentUID: studentData.parentUID,
      parentInfo: parentInfo,
      createdAt: studentData.createdAt && studentData.createdAt.toDate ? studentData.createdAt.toDate().toISOString() : null,
      updatedAt: studentData.updatedAt && studentData.updatedAt.toDate ? studentData.updatedAt.toDate().toISOString() : null
    };
  } catch (error) {
    console.warn(`Failed to get student info for ${studentUID}:`, error.message);
    return {
      uid: studentUID,
      fullName: 'Unknown Student',
      dateOfBirth: null,
      gender: 'Unknown',
      parentUID: null,
      parentInfo: null
    };
  }
};

// Helper function to get parent information
const getParentInfo = async (parentUID) => {
  try {
    const userRecord = await admin.auth().getUser(parentUID);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'Unknown Parent',
      phoneNumber: userRecord.phoneNumber,
      role: userRecord.customClaims?.role || 'user'
    };
  } catch (error) {
    console.warn(`Failed to get parent info for ${parentUID}:`, error.message);
    return {
      uid: parentUID,
      email: 'Unknown',
      displayName: 'Unknown Parent',
      phoneNumber: null,
      role: 'user'
    };
  }
};

// Helper function to get teacher information
const getTeacherInfo = async (teacherUID) => {
  try {
    const userRecord = await admin.auth().getUser(teacherUID);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'Unknown Teacher',
      phoneNumber: userRecord.phoneNumber,
      role: userRecord.customClaims?.role || 'user'
    };
  } catch (error) {
    console.warn(`Failed to get teacher info for ${teacherUID}:`, error.message);
    return {
      uid: teacherUID,
      email: 'Unknown',
      displayName: 'Unknown Teacher',
      phoneNumber: null,
      role: 'user'
    };
  }
};

// Helper function to verify class access and get class information
const verifyClassAccess = async (academicYear, classId, decodedToken) => {
  try {
    // Get class information by classId
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return { isValid: false, error: 'Class does not exist' };
    }
    const classData = classDoc.data();

    // Role-based access control
    const userRole = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);

    // Superadmin and admin can access all classes
    if (["superadmin", "admin"].includes(userRole)) {
      return { isValid: true, classData: { ...classData, id: classDoc.id } };
    }

    // Teachers can only access their assigned classes
    if (userRole === "teacher") {
      // Check if teacher's classes array contains this classId
      const teacherDoc = await db.collection("teachers").doc(decodedToken.uid).get();
      if (!teacherDoc.exists) {
        return { isValid: false, error: "Teacher profile not found" };
      }
      const teacherData = teacherDoc.data();
      const assignedClass = (teacherData.classes || []).find(c => c.classId === classId);
      if (assignedClass) {
        return { isValid: true, classData: { ...classData, id: classDoc.id } };
      } else {
        return { isValid: false, error: "Teachers can only access enrollments for their assigned classes" };
      }
    }

    return { isValid: false, error: "Insufficient permissions" };
  } catch (error) {
    console.error('Error verifying class access:', error);
    return { isValid: false, error: 'Failed to verify class access' };
  }
};

exports.getEnrollmentsByClass = functions.https.onRequest(async (req, res) => {
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

    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ error: 'classId is required' });
    }

    // Verify class access - this checks if teacher is assigned to this specific class
    const accessResult = await verifyClassAccess(null, classId, decodedToken);
    if (!accessResult.isValid) {
      return res.status(403).json({ error: accessResult.error });
    }

    const enrollmentsRef = db.collection('enrollments');
    const query = enrollmentsRef.where('classId', '==', classId);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json({ enrollments: [] });
    }

    // Get basic enrollment data
    const enrollments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Populate student and teacher info for each enrollment
    const populatedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentInfo = await getStudentInfo(enrollment.studentUID);
        const teacherInfo = await getTeacherInfo(enrollment.teacherUID);
        
        return {
          ...enrollment,
          studentInfo,
          teacherInfo
        };
      })
    );

    res.status(200).json({ enrollments: populatedEnrollments });
  } catch (error) {
    console.error('Error fetching enrollments by class:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
