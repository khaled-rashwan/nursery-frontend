const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireAdmin } = require('../utils/auth');
const { canManageEnrollments } = require('../utils/permissions');

const db = admin.firestore();

// Validation function for class data
const validateClassData = (classData) => {
  const errors = [];
  
  if (!classData.name || typeof classData.name !== 'string' || classData.name.trim().length < 1) {
    errors.push('Class name is required');
  }
  
  if (!classData.level || typeof classData.level !== 'string') {
    errors.push('Class level is required');
  }
  
  if (!classData.academicYear || !classData.academicYear.match(/^\d{4}-\d{4}$/)) {
    errors.push('Academic year is required and must be in format YYYY-YYYY');
  }
  
  if (!classData.teachers || !Array.isArray(classData.teachers) || classData.teachers.length === 0) {
    errors.push('At least one teacher must be assigned to the class');
  } else {
    classData.teachers.forEach((teacher, index) => {
      if (!teacher.teacherId || typeof teacher.teacherId !== 'string') {
        errors.push(`Teacher ID is required for teacher at index ${index}`);
      }
      if (!teacher.subjects || !Array.isArray(teacher.subjects) || teacher.subjects.length === 0) {
        errors.push(`At least one subject is required for teacher at index ${index}`);
      }
    });
  }
  
  if (classData.capacity !== undefined && (typeof classData.capacity !== 'number' || classData.capacity < 1 || classData.capacity > 50)) {
    errors.push('Capacity must be a number between 1 and 50');
  }
  
  if (classData.notes && typeof classData.notes !== 'string') {
    errors.push('Notes must be a string');
  }
  
  const validLevels = ['Pre-KG', 'KG1', 'KG2'];
  if (!validLevels.includes(classData.level)) {
    errors.push(`Level must be one of: ${validLevels.join(', ')}`);
  }
  
  return errors;
};

// Helper function to verify teacher exists and has teacher role
const verifyTeacherRole = async (teacherUID) => {
  try {
    const userRecord = await admin.auth().getUser(teacherUID);
    const customClaims = userRecord.customClaims || {};
    const userRole = customClaims.role;
    
    if (userRole !== 'teacher') {
      return { 
        isValid: false, 
        error: `User ${teacherUID} does not have teacher role. Current role: ${userRole || 'none'}` 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return { isValid: false, error: 'Teacher UID does not exist' };
    }
    return { isValid: false, error: `Error verifying teacher: ${error.message}` };
  }
};

// Helper function to get teacher information
const getTeacherInfo = async (teacherUID) => {
  try {
    const userRecord = await admin.auth().getUser(teacherUID);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email.split('@')[0],
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
      role: 'teacher'
    };
  }
};

// Single CRUD function for class management
const manageClasses = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const { operation } = req.query;
  
  // For list and get operations, allow teachers to view classes
  if (operation === 'list' || operation === 'get') {
    // Teachers can view classes, but let's validate they have teacher role
    const userRole = authResult.decodedToken.role;
    if (!['admin', 'superadmin', 'teacher'].includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions to view classes' });
    }
    
    try {
      switch (operation) {
        case 'list':
          return await listClasses(req, res, authResult);
        case 'get':
          return await getClass(req, res, authResult);
        default:
          return res.status(400).json({ error: 'Invalid operation' });
      }
    } catch (error) {
      console.error('Error in class operation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // For create, update, delete operations, require admin permissions
  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage classes' });
  }

  try {
    switch (operation) {
      case 'create':
        return await createClass(req, res, authResult);
      case 'update':
        return await updateClass(req, res, authResult);
      case 'delete':
        return await deleteClass(req, res, authResult);
      default:
        return res.status(400).json({ 
          error: 'Invalid operation. Must be one of: list, get, create, update, delete' 
        });
    }
  } catch (error) {
    console.error('Error in manageClasses:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// List all classes
const listClasses = async (req, res, authResult) => {
  try {
    const { academicYear, level } = req.query;
    
    let query = db.collection('classes');
    
    // Apply filters if provided
    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }
    
    if (level) {
      query = query.where('level', '==', level);
    }
    
    // Order by name
    query = query.orderBy('name');
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({ 
        classes: [],
        totalCount: 0
      });
    }
    
    // Collect teacher UIDs for batch fetching
    const teacherUIDs = new Set();
    const classDocs = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      classDocs.push({ id: doc.id, data });
      if (data.teachers && Array.isArray(data.teachers)) {
        data.teachers.forEach(t => teacherUIDs.add(t.teacherId));
      }
    });
    
    // Batch fetch teacher information
    const teacherInfoMap = new Map();
    const teacherPromises = Array.from(teacherUIDs).map(async (teacherUID) => {
      try {
        const teacherInfo = await getTeacherInfo(teacherUID);
        teacherInfoMap.set(teacherUID, teacherInfo);
      } catch (error) {
        console.warn(`Failed to get teacher info for ${teacherUID}:`, error.message);
      }
    });
    
    await Promise.all(teacherPromises);
    
    // Build response with teacher info
    const classes = classDocs.map(({ id, data }) => {
      const teacherInfo = data.teachers ? data.teachers.map(t => teacherInfoMap.get(t.teacherId) || {
        uid: t.teacherId,
        email: 'Unknown',
        displayName: 'Unknown Teacher',
        phoneNumber: null,
        role: 'teacher'
      }) : [];
      
      return {
        id,
        name: data.name,
        level: data.level,
        academicYear: data.academicYear,
        teachers: data.teachers,
        teacherInfo: teacherInfo,
        capacity: data.capacity || 25,
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    });
    
    res.json({
      classes,
      totalCount: classes.length,
      filters: {
        academicYear: academicYear || null,
        level: level || null
      }
    });
    
  } catch (error) {
    console.error('Error listing classes:', error);
    res.status(500).json({ 
      error: 'Internal server error while listing classes',
      details: error.message 
    });
  }
};

// Get single class
const getClass = async (req, res, authResult) => {
  try {
    const { classId } = req.query;
    
    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }
    
    const classDoc = await db.collection('classes').doc(classId).get();
    
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    const data = classDoc.data();
    
    // Get teacher information
    const teacherInfoPromises = data.teachers.map(t => getTeacherInfo(t.teacherId));
    const teacherInfo = await Promise.all(teacherInfoPromises);
    
    const classData = {
      id: classDoc.id,
      name: data.name,
      level: data.level,
      academicYear: data.academicYear,
      teachers: data.teachers,
      teacherInfo: teacherInfo,
      capacity: data.capacity || 25,
      notes: data.notes || '',
      createdAt: data.createdAt?.toDate()?.toISOString(),
      updatedAt: data.updatedAt?.toDate()?.toISOString(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    };
    
    res.json({ class: classData });
    
  } catch (error) {
    console.error('Error getting class:', error);
    res.status(500).json({ 
      error: 'Internal server error while getting class',
      details: error.message 
    });
  }
};

// Create new class
const createClass = async (req, res, authResult) => {
  try {
    const { classData } = req.body;
    
    if (!classData) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    // Validate class data
    const validationErrors = validateClassData(classData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    // Verify each teacher exists and has correct role
    for (const teacher of classData.teachers) {
      const teacherVerification = await verifyTeacherRole(teacher.teacherId);
      if (!teacherVerification.isValid) {
        return res.status(400).json({
          error: 'Invalid teacher',
          details: teacherVerification.error
        });
      }
    }
    
    // Check for duplicate class name in the same academic year
    const existingClassQuery = await db.collection('classes')
      .where('name', '==', classData.name.trim())
      .where('academicYear', '==', classData.academicYear)
      .get();
    
    if (!existingClassQuery.empty) {
      return res.status(400).json({ 
        error: 'A class with this name already exists for this academic year' 
      });
    }
    
    // Create class document
    const classRef = db.collection('classes').doc();
    const classDoc = {
      name: classData.name.trim(),
      level: classData.level,
      academicYear: classData.academicYear,
      teachers: classData.teachers,
      capacity: classData.capacity || 25,
      notes: classData.notes?.trim() || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authResult.decodedToken.uid
    };
    
    await classRef.set(classDoc);

    // Update teachers collection
    const batch = db.batch();
    classData.teachers.forEach(teacher => {
      const teacherRef = db.collection('teachers').doc(teacher.teacherId);
      batch.update(teacherRef, {
        classes: admin.firestore.FieldValue.arrayUnion({
          classId: classRef.id,
          className: classData.name,
          subjects: teacher.subjects
        })
      });
    });
    await batch.commit();
    
    // Get created class data with teacher information
    const createdClass = await classRef.get();
    const data = createdClass.data();
    const teacherInfoPromises = data.teachers.map(t => getTeacherInfo(t.teacherId));
    const teacherInfo = await Promise.all(teacherInfoPromises);
    
    const responseClass = {
      id: createdClass.id,
      name: data.name,
      level: data.level,
      academicYear: data.academicYear,
      teachers: data.teachers,
      teacherInfo: teacherInfo,
      capacity: data.capacity,
      notes: data.notes,
      createdAt: data.createdAt?.toDate()?.toISOString(),
      updatedAt: data.updatedAt?.toDate()?.toISOString(),
      createdBy: data.createdBy
    };
    
    res.status(201).json({ 
      message: 'Class created successfully',
      class: responseClass 
    });
    
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating class',
      details: error.message 
    });
  }
};

// Update existing class
const updateClass = async (req, res, authResult) => {
  try {
    const { classId, classData } = req.body;
    
    if (!classId || !classData) {
      return res.status(400).json({ error: 'Class ID and data are required' });
    }
    
    // Check if class exists
    const classRef = db.collection('classes').doc(classId);
    const existingClass = await classRef.get();
    
    if (!existingClass.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Validate class data
    const validationErrors = validateClassData(classData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    const existingData = existingClass.data();
    
    // Verify each teacher exists and has correct role
    for (const teacher of classData.teachers) {
      const teacherVerification = await verifyTeacherRole(teacher.teacherId);
      if (!teacherVerification.isValid) {
        return res.status(400).json({ 
          error: 'Invalid teacher',
          details: teacherVerification.error 
        });
      }
    }
    
    // Check for duplicate class name if name or academic year is being updated  
    if (classData.name.trim() !== existingData.name || 
        classData.academicYear !== existingData.academicYear) {
      const duplicateQuery = await db.collection('classes')
        .where('name', '==', classData.name.trim())
        .where('academicYear', '==', classData.academicYear)
        .get();
      
      const hasDuplicate = duplicateQuery.docs.some(doc => doc.id !== classId);
      if (hasDuplicate) {
        return res.status(400).json({ 
          error: 'A class with this name already exists for this academic year' 
        });
      }
    }
    
    // Update class document
    const updateData = {
      name: classData.name.trim(),
      level: classData.level,
      academicYear: classData.academicYear,
      teachers: classData.teachers,
      capacity: classData.capacity || 25,
      notes: classData.notes?.trim() || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: authResult.decodedToken.uid
    };
    
    await classRef.update(updateData);

    // Update teachers collection
    const oldTeachers = existingData.teachers.map(t => t.teacherId);
    const newTeachers = classData.teachers.map(t => t.teacherId);
    const addedTeachers = classData.teachers.filter(t => !oldTeachers.includes(t.teacherId));
    const removedTeachers = existingData.teachers.filter(t => !newTeachers.includes(t.teacherId));
    const updatedTeachers = classData.teachers.filter(t => oldTeachers.includes(t.teacherId));

    const batch = db.batch();

    // Add new teachers
    addedTeachers.forEach(teacher => {
      const teacherRef = db.collection('teachers').doc(teacher.teacherId);
      batch.update(teacherRef, {
        classes: admin.firestore.FieldValue.arrayUnion({
          classId: classRef.id,
          className: classData.name,
          subjects: teacher.subjects
        })
      });
    });

    // Remove old teachers
    await Promise.all(removedTeachers.map(async teacher => {
      const teacherRef = db.collection('teachers').doc(teacher.teacherId);
      const teacherDoc = await teacherRef.get();
      if (teacherDoc.exists) {
        const teacherData = teacherDoc.data();
        const updatedClasses = teacherData.classes.filter(c => c.classId !== classId);
        batch.update(teacherRef, { classes: updatedClasses });
      }
    }));

    // Update existing teachers
    await Promise.all(updatedTeachers.map(async teacher => {
        const teacherRef = db.collection('teachers').doc(teacher.teacherId);
        const teacherDoc = await teacherRef.get();
        if (teacherDoc.exists) {
            const teacherData = teacherDoc.data();
            const updatedClasses = teacherData.classes.map(c => {
                if (c.classId === classId) {
                    return { ...c, subjects: teacher.subjects, className: classData.name };
                }
                return c;
            });
            batch.update(teacherRef, { classes: updatedClasses });
        }
    }));

    await batch.commit();
    
    // Get updated class data with teacher information
    const updatedClass = await classRef.get();
    const data = updatedClass.data();
    const teacherInfoPromises = data.teachers.map(t => getTeacherInfo(t.teacherId));
    const teacherInfo = await Promise.all(teacherInfoPromises);
    
    const responseClass = {
      id: updatedClass.id,
      name: data.name,
      level: data.level,
      academicYear: data.academicYear,
      teachers: data.teachers,
      teacherInfo: teacherInfo,
      capacity: data.capacity,
      notes: data.notes,
      createdAt: data.createdAt?.toDate()?.toISOString(),
      updatedAt: data.updatedAt?.toDate()?.toISOString(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    };
    
    res.json({ 
      message: 'Class updated successfully',
      class: responseClass 
    });
    
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating class',
      details: error.message 
    });
  }
};

// Delete class
const deleteClass = async (req, res, authResult) => {
  try {
    const { classId } = req.body;
    
    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }
    
    // Check if class exists
    const classRef = db.collection('classes').doc(classId);
    const classDoc = await classRef.get();
    
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    const data = classDoc.data();
    
    // Check if class has active enrollments
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('class', '==', data.name)
      .where('status', '==', 'enrolled')
      .get();
    
    if (!enrollmentsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete class with active enrollments',
        details: 'Please transfer or withdraw all students from this class first.',
        activeEnrollments: enrollmentsSnapshot.size
      });
    }
    
    // Check if class has any historical enrollments
    const allEnrollmentsSnapshot = await db.collection('enrollments')
      .where('class', '==', data.name)
      .get();
    
    const hasHistoricalData = !allEnrollmentsSnapshot.empty;
    
    // Get teacher information for response
    const teacherInfoPromises = data.teachers.map(t => getTeacherInfo(t.teacherId));
    const teacherInfo = await Promise.all(teacherInfoPromises);
    
    // Store comprehensive class info for response
    const deletedClassInfo = {
      id: classDoc.id,
      name: data.name,
      level: data.level,
      academicYear: data.academicYear,
      teachers: data.teachers,
      teacherInfo: teacherInfo,
      capacity: data.capacity,
      notes: data.notes,
      createdAt: data.createdAt?.toDate()?.toISOString(),
      hadHistoricalEnrollments: hasHistoricalData,
      totalHistoricalEnrollments: allEnrollmentsSnapshot.size
    };

    // Remove class from teachers' documents
    const batch = db.batch();
    await Promise.all(data.teachers.map(async teacher => {
        const teacherRef = db.collection('teachers').doc(teacher.teacherId);
        const teacherDoc = await teacherRef.get();
        if (teacherDoc.exists) {
            const teacherData = teacherDoc.data();
            const updatedClasses = teacherData.classes.filter(c => c.classId !== classId);
            batch.update(teacherRef, { classes: updatedClasses });
        }
    }));
    await batch.commit();
    
    // If class has historical data, mark as deleted instead of hard delete
    if (hasHistoricalData) {
      await classRef.update({
        deleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: authResult.decodedToken.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json({ 
        message: 'Class marked as deleted (preserved due to historical data)',
        deletedClass: deletedClassInfo,
        softDelete: true
      });
    } else {
      // Hard delete if no historical data
      await classRef.delete();
      
      res.json({ 
        message: 'Class deleted successfully',
        deletedClass: deletedClassInfo,
        softDelete: false
      });
    }
    
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ 
      error: 'Internal server error while deleting class',
      details: error.message 
    });
  }
};

module.exports = {
  manageClasses
};
