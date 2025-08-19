const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireAdmin } = require('../utils/auth');
const { canManageEnrollments } = require('../utils/permissions');

const db = admin.firestore();

// Validation function for class teacher assignment data
const validateAssignmentData = (assignmentData) => {
  const errors = [];
  
  if (!assignmentData.classId || typeof assignmentData.classId !== 'string') {
    errors.push('Class ID is required');
  }
  
  if (!assignmentData.teacherId || typeof assignmentData.teacherId !== 'string') {
    errors.push('Teacher ID is required');
  }
  
  if (!assignmentData.subjects || !Array.isArray(assignmentData.subjects) || assignmentData.subjects.length === 0) {
    errors.push('At least one subject is required');
  }
  
  if (assignmentData.isActive !== undefined && typeof assignmentData.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
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

// Helper function to verify class exists
const verifyClassExists = async (classId) => {
  try {
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return { isValid: false, error: 'Class does not exist' };
    }
    return { isValid: true, classData: classDoc.data() };
  } catch (error) {
    return { isValid: false, error: `Error verifying class: ${error.message}` };
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

// Single CRUD function for class teacher assignments
const manageClassTeacherAssignments = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const { operation } = req.query;

  // For list operation, allow teachers and admins
  if (operation === 'list') {
    const decoded = authResult.decodedToken;
    const userRole = decoded.role || (decoded.customClaims && decoded.customClaims.role) || 'user';
    let teacherId = req.query.teacherId;
    // Only allow teachers to view their own assignments
    if (userRole === 'teacher') {
      teacherId = decoded.uid;
      // Permission check for viewing enrollments
      const { canViewEnrollments } = require('../utils/permissions');
      if (!canViewEnrollments(userRole)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
    }
    // Admins can view any teacher
    if (userRole === 'admin' || userRole === 'superadmin') {
      // Permission check for viewing enrollments
      const { canViewEnrollments } = require('../utils/permissions');
      if (!canViewEnrollments(userRole)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
    }
    if (!teacherId) {
      return res.status(400).json({ error: 'Missing teacherId' });
    }
    try {
      const teacherDoc = await db.collection('teachers').doc(teacherId).get();
      if (!teacherDoc.exists) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      const teacherData = teacherDoc.data();
      const classes = Array.isArray(teacherData.classes) ? teacherData.classes : [];
      // Optionally fetch class details
      let classDetails = [];
      if (classes.length > 0) {
        const classDocs = await Promise.all(classes.map(cid => db.collection('classes').doc(cid).get()));
        classDetails = classDocs.map(doc => doc.exists ? { id: doc.id, ...doc.data() } : { id: doc.id, name: 'Unknown Class' });
      }
      return res.json({
        teacherId,
        classes,
        classDetails,
        totalCount: classes.length
      });
    } catch (error) {
      console.error('Error listing teacher classes:', error);
      return res.status(500).json({ error: 'Failed to list teacher classes', details: error.message });
    }
  }

  // For create, update, delete operations, require admin permissions
  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage assignments' });
  }

  try {
    switch (operation) {
      case 'create':
        return await createAssignment(req, res, authResult);
      case 'update':
        return await updateAssignment(req, res, authResult);
      case 'delete':
        return await deleteAssignment(req, res, authResult);
      case 'bulk-create':
        return await bulkCreateAssignments(req, res, authResult);
      case 'bulk-delete':
        return await bulkDeleteAssignments(req, res, authResult);
      default:
        return res.status(400).json({ 
          error: 'Invalid operation. Must be one of: list, get, create, update, delete, bulk-create, bulk-delete' 
        });
    }
  } catch (error) {
    console.error('Error in manageClassTeacherAssignments:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// List assignments
const listAssignments = async (req, res, authResult) => {
  try {
    const { classId, teacherId, academicYear, isActive } = req.query;
    
    let query = db.collection('class_teacher_assignments');
    
    // Apply filters if provided
    if (classId) {
      query = query.where('classId', '==', classId);
    }
    
    if (teacherId) {
      query = query.where('teacherId', '==', teacherId);
    }
    
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }
    
    // Order by creation date only when no filters are applied
    // This avoids requiring a composite Firestore index when combining where() with orderBy()
    const hasFiltersApplied = !!(classId || teacherId || isActive !== undefined);
    if (!hasFiltersApplied) {
      query = query.orderBy('createdAt', 'desc');
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({ 
        assignments: [],
        totalCount: 0
      });
    }
    
    // Collect teacher UIDs and class IDs for batch fetching
    const teacherUIDs = new Set();
    const classIds = new Set();
    const assignmentDocs = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      assignmentDocs.push({ id: doc.id, data });
      teacherUIDs.add(data.teacherId);
      classIds.add(data.classId);
    });
    
    // Batch fetch teacher and class information
    const [teacherInfoMap, classInfoMap] = await Promise.all([
      fetchTeacherInfoBatch(Array.from(teacherUIDs)),
      fetchClassInfoBatch(Array.from(classIds))
    ]);
    
    // Filter by academic year if provided (after fetching class info)
    let filteredAssignments = assignmentDocs;
    if (academicYear) {
      filteredAssignments = assignmentDocs.filter(({ data }) => {
        const classInfo = classInfoMap.get(data.classId);
        return classInfo && classInfo.academicYear === academicYear;
      });
    }
    
    // Build response with teacher and class info
    const assignments = filteredAssignments.map(({ id, data }) => {
      const teacherInfo = teacherInfoMap.get(data.teacherId);
      const classInfo = classInfoMap.get(data.classId);
      
      return {
        id,
        classId: data.classId,
        teacherId: data.teacherId,
        subjects: data.subjects || [],
        isActive: data.isActive !== false, // Default to true if not specified
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
        // Include referenced data
        teacherInfo: teacherInfo || {
          uid: data.teacherId,
          email: 'Unknown',
          displayName: 'Unknown Teacher',
          role: 'teacher'
        },
        classInfo: classInfo || {
          id: data.classId,
          name: 'Unknown Class',
          level: 'Unknown',
          academicYear: 'Unknown'
        }
      };
    });
    
    res.json({
      assignments,
      totalCount: assignments.length,
      filters: {
        classId: classId || null,
        teacherId: teacherId || null,
        academicYear: academicYear || null,
        isActive: isActive || null
      }
    });
  } catch (error) {
    console.error('Error listing assignments:', error);
    res.status(500).json({ 
      error: 'Failed to list assignments',
      details: error.message 
    });
  }
};

// Get single assignment
const getAssignment = async (req, res, authResult) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Assignment ID is required' });
    }
    
    const doc = await db.collection('class_teacher_assignments').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    const data = doc.data();
    
    // Fetch teacher and class information
    const [teacherInfo, classInfo] = await Promise.all([
      getTeacherInfo(data.teacherId),
      getClassInfo(data.classId)
    ]);
    
    const assignment = {
      id: doc.id,
      classId: data.classId,
      teacherId: data.teacherId,
      subjects: data.subjects || [],
      isActive: data.isActive !== false,
      createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      teacherInfo,
      classInfo
    };
    
    res.json({ assignment });
  } catch (error) {
    console.error('Error getting assignment:', error);
    res.status(500).json({ 
      error: 'Failed to get assignment',
      details: error.message 
    });
  }
};

// Create assignment
const createAssignment = async (req, res, authResult) => {
  try {
    const assignmentData = req.body;
    
    // Validate assignment data
    const validationErrors = validateAssignmentData(assignmentData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    // Verify teacher exists and has teacher role
    const teacherValidation = await verifyTeacherRole(assignmentData.teacherId);
    if (!teacherValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid teacher',
        details: teacherValidation.error 
      });
    }
    
    // Verify class exists
    const classValidation = await verifyClassExists(assignmentData.classId);
    if (!classValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid class',
        details: classValidation.error 
      });
    }
    
    // Check for existing active assignment for this teacher-class combination
    const existingQuery = await db.collection('class_teacher_assignments')
      .where('classId', '==', assignmentData.classId)
      .where('teacherId', '==', assignmentData.teacherId)
      .where('isActive', '==', true)
      .get();
    
    if (!existingQuery.empty) {
      return res.status(409).json({ 
        error: 'Conflict: An active assignment already exists for this teacher-class combination' 
      });
    }
    
    // Create the assignment
    const now = admin.firestore.Timestamp.now();
    const newAssignment = {
      classId: assignmentData.classId,
      teacherId: assignmentData.teacherId,
      subjects: assignmentData.subjects,
      isActive: assignmentData.isActive !== false, // Default to true
      createdAt: now,
      updatedAt: now,
      createdBy: authResult.decodedToken.uid
    };
    
    const docRef = await db.collection('class_teacher_assignments').add(newAssignment);
    
    res.status(201).json({
      message: 'Assignment created successfully',
      assignmentId: docRef.id,
      assignment: {
        id: docRef.id,
        ...newAssignment,
        createdAt: newAssignment.createdAt.toDate().toISOString(),
        updatedAt: newAssignment.updatedAt.toDate().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ 
      error: 'Failed to create assignment',
      details: error.message 
    });
  }
};

// Update assignment
const updateAssignment = async (req, res, authResult) => {
  try {
    const { id } = req.query;
    const updateData = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Assignment ID is required' });
    }
    
    // Get existing assignment
    const doc = await db.collection('class_teacher_assignments').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    const existingData = doc.data();
    
    // Validate only the fields being updated
    const fieldsToValidate = {};
    if (updateData.classId !== undefined) fieldsToValidate.classId = updateData.classId;
    if (updateData.teacherId !== undefined) fieldsToValidate.teacherId = updateData.teacherId;
    if (updateData.subjects !== undefined) fieldsToValidate.subjects = updateData.subjects;
    if (updateData.isActive !== undefined) fieldsToValidate.isActive = updateData.isActive;
    
    if (Object.keys(fieldsToValidate).length > 0) {
      // Use existing values for required fields not being updated
      const dataToValidate = {
        classId: fieldsToValidate.classId || existingData.classId,
        teacherId: fieldsToValidate.teacherId || existingData.teacherId,
        subjects: fieldsToValidate.subjects || existingData.subjects,
        isActive: fieldsToValidate.isActive !== undefined ? fieldsToValidate.isActive : existingData.isActive
      };
      
      const validationErrors = validateAssignmentData(dataToValidate);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: validationErrors 
        });
      }
    }
    
    // Verify teacher if being updated
    if (updateData.teacherId && updateData.teacherId !== existingData.teacherId) {
      const teacherValidation = await verifyTeacherRole(updateData.teacherId);
      if (!teacherValidation.isValid) {
        return res.status(400).json({ 
          error: 'Invalid teacher',
          details: teacherValidation.error 
        });
      }
    }
    
    // Verify class if being updated
    if (updateData.classId && updateData.classId !== existingData.classId) {
      const classValidation = await verifyClassExists(updateData.classId);
      if (!classValidation.isValid) {
        return res.status(400).json({ 
          error: 'Invalid class',
          details: classValidation.error 
        });
      }
    }
    
    // Check for conflicts if teacher or class is being changed
    if ((updateData.teacherId && updateData.teacherId !== existingData.teacherId) ||
        (updateData.classId && updateData.classId !== existingData.classId)) {
      const newTeacherId = updateData.teacherId || existingData.teacherId;
      const newClassId = updateData.classId || existingData.classId;
      
      const conflictQuery = await db.collection('class_teacher_assignments')
        .where('classId', '==', newClassId)
        .where('teacherId', '==', newTeacherId)
        .where('isActive', '==', true)
        .get();
      
      // Check if there's a conflict (excluding the current assignment)
      const hasConflict = conflictQuery.docs.some(doc => doc.id !== id);
      if (hasConflict) {
        return res.status(409).json({ 
          error: 'Conflict: An active assignment already exists for this teacher-class combination' 
        });
      }
    }
    
    // Update the assignment
    const now = admin.firestore.Timestamp.now();
    const updates = {
      ...updateData,
      updatedAt: now,
      updatedBy: authResult.decodedToken.uid
    };
    
    await db.collection('class_teacher_assignments').doc(id).update(updates);
    
    res.json({
      message: 'Assignment updated successfully',
      assignmentId: id
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ 
      error: 'Failed to update assignment',
      details: error.message 
    });
  }
};

// Delete assignment
const deleteAssignment = async (req, res, authResult) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Assignment ID is required' });
    }
    
    // Check if assignment exists
    const doc = await db.collection('class_teacher_assignments').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Delete the assignment
    await db.collection('class_teacher_assignments').doc(id).delete();
    
    res.json({
      message: 'Assignment deleted successfully',
      assignmentId: id
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ 
      error: 'Failed to delete assignment',
      details: error.message 
    });
  }
};

// Bulk create assignments
const bulkCreateAssignments = async (req, res, authResult) => {
  try {
    const { assignments } = req.body;
    
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: 'Assignments array is required and must not be empty' });
    }
    
    if (assignments.length > 100) {
      return res.status(400).json({ error: 'Cannot create more than 100 assignments at once' });
    }
    
    // Validate all assignments
    const validationResults = assignments.map((assignment, index) => {
      const errors = validateAssignmentData(assignment);
      return { index, errors };
    });
    
    const invalidAssignments = validationResults.filter(result => result.errors.length > 0);
    if (invalidAssignments.length > 0) {
      return res.status(400).json({
        error: 'Validation failed for some assignments',
        details: invalidAssignments
      });
    }
    
    // Use batch operations for performance
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();
    const createdAssignments = [];
    
    for (const assignment of assignments) {
      // Verify teacher and class (simplified for bulk operation)
      const [teacherValidation, classValidation] = await Promise.all([
        verifyTeacherRole(assignment.teacherId),
        verifyClassExists(assignment.classId)
      ]);
      
      if (!teacherValidation.isValid) {
        return res.status(400).json({
          error: `Invalid teacher: ${assignment.teacherId}`,
          details: teacherValidation.error
        });
      }
      
      if (!classValidation.isValid) {
        return res.status(400).json({
          error: `Invalid class: ${assignment.classId}`,
          details: classValidation.error
        });
      }
      
      const docRef = db.collection('class_teacher_assignments').doc();
      const newAssignment = {
        classId: assignment.classId,
        teacherId: assignment.teacherId,
        subjects: assignment.subjects,
        isActive: assignment.isActive !== false,
        createdAt: now,
        updatedAt: now,
        createdBy: authResult.decodedToken.uid
      };
      
      batch.set(docRef, newAssignment);
      createdAssignments.push({
        id: docRef.id,
        ...newAssignment
      });
    }
    
    await batch.commit();
    
    res.status(201).json({
      message: `${assignments.length} assignments created successfully`,
      assignments: createdAssignments.map(assignment => ({
        ...assignment,
        createdAt: assignment.createdAt.toDate().toISOString(),
        updatedAt: assignment.updatedAt.toDate().toISOString()
      }))
    });
  } catch (error) {
    console.error('Error in bulk create assignments:', error);
    res.status(500).json({
      error: 'Failed to create assignments',
      details: error.message
    });
  }
};

// Bulk delete assignments
const bulkDeleteAssignments = async (req, res, authResult) => {
  try {
    const { assignmentIds } = req.body;
    
    if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return res.status(400).json({ error: 'Assignment IDs array is required and must not be empty' });
    }
    
    if (assignmentIds.length > 100) {
      return res.status(400).json({ error: 'Cannot delete more than 100 assignments at once' });
    }
    
    // Use batch operations for performance
    const batch = db.batch();
    
    for (const id of assignmentIds) {
      batch.delete(db.collection('class_teacher_assignments').doc(id));
    }
    
    await batch.commit();
    
    res.json({
      message: `${assignmentIds.length} assignments deleted successfully`,
      deletedCount: assignmentIds.length
    });
  } catch (error) {
    console.error('Error in bulk delete assignments:', error);
    res.status(500).json({
      error: 'Failed to delete assignments',
      details: error.message
    });
  }
};

// Helper functions
const fetchTeacherInfoBatch = async (teacherUIDs) => {
  const teacherInfoMap = new Map();
  const promises = teacherUIDs.map(async (uid) => {
    try {
      const info = await getTeacherInfo(uid);
      teacherInfoMap.set(uid, info);
    } catch (error) {
      console.warn(`Failed to get teacher info for ${uid}:`, error.message);
    }
  });
  
  await Promise.all(promises);
  return teacherInfoMap;
};

const fetchClassInfoBatch = async (classIds) => {
  const classInfoMap = new Map();
  const promises = classIds.map(async (id) => {
    try {
      const doc = await db.collection('classes').doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        classInfoMap.set(id, {
          id: doc.id,
          name: data.name,
          level: data.level,
          academicYear: data.academicYear
        });
      }
    } catch (error) {
      console.warn(`Failed to get class info for ${id}:`, error.message);
    }
  });
  
  await Promise.all(promises);
  return classInfoMap;
};

const getClassInfo = async (classId) => {
  try {
    const doc = await db.collection('classes').doc(classId).get();
    if (!doc.exists) {
      return {
        id: classId,
        name: 'Unknown Class',
        level: 'Unknown',
        academicYear: 'Unknown'
      };
    }
    
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      level: data.level,
      academicYear: data.academicYear
    };
  } catch (error) {
    console.warn(`Failed to get class info for ${classId}:`, error.message);
    return {
      id: classId,
      name: 'Unknown Class',
      level: 'Unknown',
      academicYear: 'Unknown'
    };
  }
};

module.exports = {
  manageClassTeacherAssignments
};
