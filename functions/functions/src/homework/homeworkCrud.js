const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');
const { validateHomeworkData } = require('../utils/validation');

const db = admin.firestore();

// Helper function to verify teacher's access to a class
const verifyTeacherClassAccess = async (teacherUID, classId) => {
  try {
    const teacherDoc = await db.collection('teachers').doc(teacherUID).get();
    if (!teacherDoc.exists) {
      return { isValid: false, error: 'Teacher profile not found' };
    }
    
    const teacherData = teacherDoc.data();
    const assignedClasses = teacherData.classes || [];
    const hasAccess = assignedClasses.some(classAssignment => classAssignment.classId === classId);
    
    if (!hasAccess) {
      return { isValid: false, error: 'Teacher is not assigned to this class' };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Error verifying teacher class access:', error);
    return { isValid: false, error: 'Failed to verify class access' };
  }
};

// Helper function to verify class exists (subject validation removed for simplicity)
const verifyClassAndSubject = async (classId, subjectId) => {
  try {
    // Verify class exists
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return { isValid: false, error: 'Class does not exist' };
    }
    
    // Subject validation removed - allow any subject for any class
    // This provides more flexibility without the complexity of managing subjects per class
    const classData = classDoc.data();
    
    return { isValid: true, classData };
  } catch (error) {
    console.error('Error verifying class:', error);
    return { isValid: false, error: 'Failed to verify class' };
  }
};

// Helper function to get teacher info
const getTeacherInfo = async (teacherUID) => {
  try {
    const userRecord = await admin.auth().getUser(teacherUID);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'Unknown Teacher',
      phoneNumber: userRecord.phoneNumber
    };
  } catch (error) {
    console.warn(`Failed to get teacher info for ${teacherUID}:`, error.message);
    return {
      uid: teacherUID,
      email: 'Unknown',
      displayName: 'Unknown Teacher',
      phoneNumber: null
    };
  }
};

// CREATE homework
const createHomework = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Role validation - only teachers, admins, and superadmins can create homework
    const roleResult = requireRole(decodedToken, ['teacher', 'admin', 'superadmin']);
    if (roleResult.error) {
      return res.status(roleResult.error.status).json({ error: roleResult.error.message });
    }

    const { homeworkData } = req.body;
    if (!homeworkData) {
      return res.status(400).json({ error: 'Homework data is required' });
    }

    // Set the teacher UID from the authenticated user for teachers
    if (roleResult.role === 'teacher') {
      homeworkData.teacherUID = decodedToken.uid;
    }

    // Validate homework data
    const validationErrors = validateHomeworkData(homeworkData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }

    // Verify class and subject exist
    const classSubjectResult = await verifyClassAndSubject(homeworkData.classId, homeworkData.subjectId);
    if (!classSubjectResult.isValid) {
      return res.status(400).json({ error: classSubjectResult.error });
    }

    // For teachers, verify they are assigned to this class
    if (roleResult.role === 'teacher') {
      const accessResult = await verifyTeacherClassAccess(decodedToken.uid, homeworkData.classId);
      if (!accessResult.isValid) {
        return res.status(403).json({ error: accessResult.error });
      }
    }

    // For admins/superadmins, verify the specified teacher exists and is assigned to the class
    if (['admin', 'superadmin'].includes(roleResult.role)) {
      const accessResult = await verifyTeacherClassAccess(homeworkData.teacherUID, homeworkData.classId);
      if (!accessResult.isValid) {
        return res.status(400).json({ error: `Specified teacher is not assigned to this class: ${accessResult.error}` });
      }
    }

    // Create homework document
    const homeworkRef = db.collection('homework').doc();
    const homeworkDoc = {
      classId: homeworkData.classId,
      subjectId: homeworkData.subjectId,
      teacherUID: homeworkData.teacherUID,
      title: homeworkData.title.trim(),
      description: homeworkData.description.trim(),
      dueDate: homeworkData.dueDate,
      attachments: homeworkData.attachments || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await homeworkRef.set(homeworkDoc);

    // Get teacher info for response
    const teacherInfo = await getTeacherInfo(homeworkData.teacherUID);

    res.status(201).json({ 
      message: 'Homework created successfully',
      homework: {
        id: homeworkRef.id,
        ...homeworkDoc,
        teacherInfo
      }
    });
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET homework by ID
const getHomework = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    const { homeworkId } = req.query;
    if (!homeworkId) {
      return res.status(400).json({ error: 'Homework ID is required' });
    }

    // Get homework document
    const homeworkDoc = await db.collection('homework').doc(homeworkId).get();
    if (!homeworkDoc.exists) {
      return res.status(404).json({ error: 'Homework not found' });
    }

    const homeworkData = homeworkDoc.data();
    const userRole = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);

    // Access control: Teachers can only see their own homework, admins/superadmins can see all
    if (userRole === 'teacher' && homeworkData.teacherUID !== decodedToken.uid) {
      return res.status(403).json({ error: 'Teachers can only access their own homework' });
    }

    // Parents can see homework for classes their children are enrolled in
    if (userRole === 'parent') {
      // Check if any of the parent's children are enrolled in this class
      const enrollmentsQuery = await db.collection('enrollments')
        .where('classId', '==', homeworkData.classId)
        .get();
      
      let hasAccess = false;
      for (const enrollmentDoc of enrollmentsQuery.docs) {
        const enrollment = enrollmentDoc.data();
        const studentDoc = await db.collection('students').doc(enrollment.studentUID).get();
        if (studentDoc.exists && studentDoc.data().parentUID === decodedToken.uid) {
          hasAccess = true;
          break;
        }
      }
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Parents can only access homework for their children\'s classes' });
      }
    }

    // Get teacher info
    const teacherInfo = await getTeacherInfo(homeworkData.teacherUID);

    res.status(200).json({ 
      homework: {
        id: homeworkDoc.id,
        ...homeworkData,
        teacherInfo
      }
    });
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LIST homework by class
const listHomeworkByClass = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    const { classId, teacherUID } = req.query;
    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    const userRole = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);
    let query = db.collection('homework').where('classId', '==', classId);

    // Role-based filtering
    if (userRole === 'teacher') {
      // Teachers can only see their own homework
      query = query.where('teacherUID', '==', decodedToken.uid);
    } else if (userRole === 'parent') {
      // Verify parent has children in this class
      const enrollmentsQuery = await db.collection('enrollments')
        .where('classId', '==', classId)
        .get();
      
      let hasAccess = false;
      for (const enrollmentDoc of enrollmentsQuery.docs) {
        const enrollment = enrollmentDoc.data();
        const studentDoc = await db.collection('students').doc(enrollment.studentUID).get();
        if (studentDoc.exists && studentDoc.data().parentUID === decodedToken.uid) {
          hasAccess = true;
          break;
        }
      }
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Parents can only access homework for their children\'s classes' });
      }
    } else if (teacherUID && ['admin', 'superadmin'].includes(userRole)) {
      // Admins can filter by specific teacher
      query = query.where('teacherUID', '==', teacherUID);
    }

    // Add ordering by due date (temporarily commented out for debugging)
    // query = query.orderBy('dueDate', 'asc');

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.status(200).json({ homework: [] });
    }

    // Get homework with teacher info
    const homework = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const homeworkData = doc.data();
        const teacherInfo = await getTeacherInfo(homeworkData.teacherUID);
        
        return {
          id: doc.id,
          ...homeworkData,
          teacherInfo
        };
      })
    );

    res.status(200).json({ homework });
  } catch (error) {
    console.error('Error listing homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE homework
const updateHomework = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Role validation
    const roleResult = requireRole(decodedToken, ['teacher', 'admin', 'superadmin']);
    if (roleResult.error) {
      return res.status(roleResult.error.status).json({ error: roleResult.error.message });
    }

    const { homeworkId, homeworkData } = req.body;
    if (!homeworkId || !homeworkData) {
      return res.status(400).json({ error: 'Homework ID and homework data are required' });
    }

    // Get existing homework
    const homeworkDoc = await db.collection('homework').doc(homeworkId).get();
    if (!homeworkDoc.exists) {
      return res.status(404).json({ error: 'Homework not found' });
    }

    const existingHomework = homeworkDoc.data();

    // Authorization: Teachers can only edit their own homework
    if (roleResult.role === 'teacher' && existingHomework.teacherUID !== decodedToken.uid) {
      return res.status(403).json({ error: 'Teachers can only edit their own homework' });
    }

    // For updates, preserve the original teacherUID unless admin/superadmin explicitly changes it
    if (roleResult.role === 'teacher') {
      homeworkData.teacherUID = existingHomework.teacherUID;
    } else if (!homeworkData.teacherUID) {
      homeworkData.teacherUID = existingHomework.teacherUID;
    }

    // Validate updated homework data
    const validationErrors = validateHomeworkData(homeworkData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }

    // Verify class and subject exist (only if changed)
    if (homeworkData.classId !== existingHomework.classId || homeworkData.subjectId !== existingHomework.subjectId) {
      const classSubjectResult = await verifyClassAndSubject(homeworkData.classId, homeworkData.subjectId);
      if (!classSubjectResult.isValid) {
        return res.status(400).json({ error: classSubjectResult.error });
      }
    }

    // Verify teacher has access to the class (only if teacher or class changed)
    if (homeworkData.teacherUID !== existingHomework.teacherUID || homeworkData.classId !== existingHomework.classId) {
      const accessResult = await verifyTeacherClassAccess(homeworkData.teacherUID, homeworkData.classId);
      if (!accessResult.isValid) {
        return res.status(400).json({ error: accessResult.error });
      }
    }

    // Update homework document
    const updateDoc = {
      classId: homeworkData.classId,
      subjectId: homeworkData.subjectId,
      teacherUID: homeworkData.teacherUID,
      title: homeworkData.title.trim(),
      description: homeworkData.description.trim(),
      dueDate: homeworkData.dueDate,
      attachments: homeworkData.attachments || [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await homeworkDoc.ref.update(updateDoc);

    // Get teacher info for response
    const teacherInfo = await getTeacherInfo(homeworkData.teacherUID);

    res.status(200).json({ 
      message: 'Homework updated successfully',
      homework: {
        id: homeworkId,
        ...updateDoc,
        createdAt: existingHomework.createdAt,
        teacherInfo
      }
    });
  } catch (error) {
    console.error('Error updating homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE homework
const deleteHomework = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Role validation
    const roleResult = requireRole(decodedToken, ['teacher', 'admin', 'superadmin']);
    if (roleResult.error) {
      return res.status(roleResult.error.status).json({ error: roleResult.error.message });
    }

    const { homeworkId } = req.query;
    if (!homeworkId) {
      return res.status(400).json({ error: 'Homework ID is required' });
    }

    // Get existing homework
    const homeworkDoc = await db.collection('homework').doc(homeworkId).get();
    if (!homeworkDoc.exists) {
      return res.status(404).json({ error: 'Homework not found' });
    }

    const homeworkData = homeworkDoc.data();

    // Authorization: Teachers can only delete their own homework
    if (roleResult.role === 'teacher' && homeworkData.teacherUID !== decodedToken.uid) {
      return res.status(403).json({ error: 'Teachers can only delete their own homework' });
    }

    // Delete homework document
    await homeworkDoc.ref.delete();

    res.status(200).json({ 
      message: 'Homework deleted successfully',
      deletedHomeworkId: homeworkId
    });
  } catch (error) {
    console.error('Error deleting homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = {
  createHomework,
  getHomework,
  listHomeworkByClass,
  updateHomework,
  deleteHomework
};
