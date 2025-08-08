const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireAdmin, requireRole } = require('../utils/auth');
const { canManageStudents } = require('../utils/permissions');
const { validateStudentData } = require('../utils/validation');

const db = admin.firestore();

// Helper function to verify parent role
const verifyParentRole = async (parentUID) => {
  try {
    // First check if user exists
    const userRecord = await admin.auth().getUser(parentUID);
    
    // Check if user has parent role in custom claims
    const customClaims = userRecord.customClaims || {};
    const userRole = customClaims.role;
    
    if (userRole !== 'parent') {
      return { 
        isValid: false, 
        error: `User ${parentUID} does not have parent role. Current role: ${userRole || 'none'}` 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return { isValid: false, error: 'Parent UID does not exist' };
    }
    return { isValid: false, error: `Error verifying parent: ${error.message}` };
  }
};

// HTTPS function to create student
const createStudent = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  if (!canManageStudents(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage students' });
  }

  try {
    const { studentData } = req.body;
    if (!studentData) {
      return res.status(400).json({ error: 'Student data is required' });
    }

    // Validate student data
    const validationErrors = validateStudentData(studentData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }

    // Verify parent exists and has correct role
    const parentVerification = await verifyParentRole(studentData.parentUID);
    if (!parentVerification.isValid) {
      return res.status(400).json({ 
        error: 'Invalid parent',
        details: parentVerification.error 
      });
    }

    // Check for duplicate student name under the same parent
    const existingStudentQuery = await db.collection('students')
      .where('parentUID', '==', studentData.parentUID)
      .where('fullName', '==', studentData.fullName.trim())
      .get();

    if (!existingStudentQuery.empty) {
      return res.status(400).json({ 
        error: 'A student with this name already exists for this parent' 
      });
    }

    // Create student document
    const studentRef = db.collection('students').doc();
    const studentDoc = {
      fullName: studentData.fullName.trim(),
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      parentUID: studentData.parentUID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authResult.decodedToken.uid
    };

    await studentRef.set(studentDoc);

    // Get created student data with parent information
    const createdStudent = await studentRef.get();
    const data = createdStudent.data();
    const parentInfo = await getParentInfo(data.parentUID);

    const responseStudent = {
      id: createdStudent.id,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      parentUID: data.parentUID,
      parentInfo: parentInfo,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      createdBy: data.createdBy
    };

    res.status(201).json({ 
      message: 'Student created successfully',
      student: responseStudent 
    });

  } catch (error) {
    console.error('Error creating student:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (error.code === 'unavailable') {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Helper function to get parent information
const getParentInfo = async (parentUID) => {
  try {
    const userRecord = await admin.auth().getUser(parentUID);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email.split('@')[0],
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

// HTTPS function to list students
const listStudents = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  if (!canManageStudents(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage students' });
  }

  try {
    // Parse query parameters with better defaults
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const parentUID = req.query.parentUID;
    const search = req.query.search?.trim();
    const sortBy = req.query.sortBy || 'createdAt'; // fullName, dateOfBirth, createdAt, updatedAt
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const genderFilter = req.query.gender; // 'Male' or 'Female'
    const startAfterTimestamp = req.query.startAfterTimestamp;
    const startAfterName = req.query.startAfterName;

    console.log('List students request:', {
      limit,
      parentUID,
      search,
      sortBy,
      sortOrder,
      genderFilter,
      startAfterTimestamp,
      startAfterName
    });

    let query = db.collection('students');

    // Apply only sorting to avoid complex Firestore index requirements
    // We'll do filtering client-side to avoid index issues
    console.log('Applying sort:', sortBy, sortOrder);
    
    // Use single orderBy to avoid complex index requirements
    if (sortBy === 'fullName') {
      query = query.orderBy('fullName', sortOrder);
    } else if (sortBy === 'dateOfBirth') {
      query = query.orderBy('dateOfBirth', sortOrder);
    } else if (sortBy === 'updatedAt') {
      query = query.orderBy('updatedAt', sortOrder);
    } else {
      // Default: createdAt
      query = query.orderBy('createdAt', sortOrder);
    }

    // Handle cursor-based pagination
    if (startAfterTimestamp && !isNaN(parseInt(startAfterTimestamp))) {
      console.log('Applying pagination with startAfterTimestamp:', startAfterTimestamp);
      try {
        const startAfterDate = admin.firestore.Timestamp.fromMillis(parseInt(startAfterTimestamp));
        
        if (sortBy === 'fullName' && startAfterName) {
          query = query.startAfter(startAfterName);
        } else {
          query = query.startAfter(startAfterDate);
        }
      } catch (timestampError) {
        console.warn('Error parsing timestamp for pagination:', timestampError);
        // Continue without pagination rather than failing
      }
    }

    // Apply a larger limit since we'll filter client-side
    // This ensures we get enough results after filtering
    const fetchLimit = Math.min(limit * 3, 300); // Fetch more to account for filtering
    query = query.limit(fetchLimit);

    console.log('Executing Firestore query...');
    const snapshot = await query.get();
    console.log('Query executed successfully, documents found:', snapshot.size);

    // Process students and collect data for filtering
    const studentDocs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Ensure all required fields exist with defaults
      const studentData = {
        ...data,
        fullName: data.fullName || 'Unknown',
        gender: data.gender || 'Unknown',
        parentUID: data.parentUID || '',
        createdAt: data.createdAt || admin.firestore.Timestamp.now(),
        updatedAt: data.updatedAt || data.createdAt || admin.firestore.Timestamp.now()
      };
      studentDocs.push({ id: doc.id, data: studentData });
    });

    console.log('Processed student documents:', studentDocs.length);

    // Filter out soft-deleted students unless explicitly requested
    const includeDeleted = req.query.includeDeleted === 'true';
    const filteredStudentDocs = includeDeleted 
      ? studentDocs 
      : studentDocs.filter(({ data }) => !data.deleted);

    console.log('Filtered student documents (after deleted filter):', filteredStudentDocs.length);

    // Collect parent UIDs from filtered students
    const parentUIDs = new Set();
    filteredStudentDocs.forEach(({ data }) => {
      if (data.parentUID?.trim()) {
        parentUIDs.add(data.parentUID);
      }
    });

    console.log('Unique parent UIDs found:', parentUIDs.size);

    // Batch fetch parent information
    const parentInfoMap = new Map();
    const parentUIDArray = Array.from(parentUIDs);
    
    // Fetch parent info in parallel with error handling
    const parentPromises = parentUIDArray.map(async (parentUID) => {
      try {
        const parentInfo = await getParentInfo(parentUID);
        parentInfoMap.set(parentUID, parentInfo);
      } catch (error) {
        console.warn(`Failed to get parent info for ${parentUID}:`, error.message);
        parentInfoMap.set(parentUID, {
          uid: parentUID,
          email: 'Unknown',
          displayName: 'Unknown Parent',
          phoneNumber: null,
          role: 'user'
        });
      }
    });

    await Promise.all(parentPromises);
    console.log('Parent info fetched for', parentInfoMap.size, 'parents');

    // Build final student list with parent information
    students = filteredStudentDocs.map(({ id, data }) => {
      const parentInfo = parentInfoMap.get(data.parentUID) || {
        uid: data.parentUID || '',
        email: 'Unknown',
        displayName: 'Unknown Parent',
        phoneNumber: null,
        role: 'user'
      };

      return {
        id,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        parentUID: data.parentUID,
        parentInfo: parentInfo,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    });

    console.log('Built student list with parent info:', students.length);

    // Apply client-side filters to avoid Firestore index issues
    
    // Filter by parent if specified
    if (parentUID?.trim()) {
      console.log('Applying parentUID filter:', parentUID);
      const beforeCount = students.length;
      students = students.filter(student => student.parentUID === parentUID.trim());
      console.log('ParentUID filter applied. Before:', beforeCount, 'After:', students.length);
    }

    // Filter by gender if specified
    if (genderFilter && ['Male', 'Female'].includes(genderFilter)) {
      console.log('Applying gender filter:', genderFilter);
      const beforeCount = students.length;
      students = students.filter(student => student.gender === genderFilter);
      console.log('Gender filter applied. Before:', beforeCount, 'After:', students.length);
    }

    // Apply search filter if specified (after enrichment for better search capability)
    if (search) {
      console.log('Applying search filter:', search);
      const searchLower = search.toLowerCase();
      const beforeSearchCount = students.length;
      students = students.filter(student => 
        (student.fullName || '').toLowerCase().includes(searchLower) ||
        (student.parentInfo?.email || '').toLowerCase().includes(searchLower) ||
        (student.parentInfo?.displayName || '').toLowerCase().includes(searchLower) ||
        (student.parentInfo?.phoneNumber || '').toLowerCase().includes(searchLower) ||
        (student.gender || '').toLowerCase().includes(searchLower)
      );
      console.log('Search filter applied. Before:', beforeSearchCount, 'After:', students.length);
    }

    // Apply the final limit after all filtering
    const totalFilteredCount = students.length;
    students = students.slice(0, limit);

    console.log('Applied final limit. Total filtered:', totalFilteredCount, 'Returned:', students.length);

    // Prepare pagination info
    let nextPageInfo = null;
    if (totalFilteredCount > limit) {
      const lastStudent = students[students.length - 1];
      
      nextPageInfo = {
        startAfterTimestamp: Date.now(), // Simplified pagination
        startAfterName: sortBy === 'fullName' ? lastStudent.fullName : undefined
      };
    }

    console.log('Returning response with', students.length, 'students');

    res.json({ 
      students,
      count: students.length,
      totalCount: totalFilteredCount,
      nextPageInfo,
      pagination: {
        limit,
        hasMore: nextPageInfo !== null
      },
      filters: {
        parentUID: parentUID || null,
        search: search || null,
        gender: genderFilter || null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error listing students:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied accessing student data' });
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
    
    res.status(500).json({ 
      error: 'Internal server error while listing students',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// HTTPS function to get student by ID
const getStudent = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  if (!canManageStudents(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage students' });
  }

  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const data = studentDoc.data();
    
    // Check if student is soft-deleted
    if (data.deleted && req.query.includeDeleted !== 'true') {
      return res.status(404).json({ error: 'Student not found or has been deleted' });
    }
    
    // Get parent information
    const parentInfo = await getParentInfo(data.parentUID);

    const student = {
      id: studentDoc.id,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      parentUID: data.parentUID,
      parentInfo: parentInfo,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    };

    res.json({ student });

  } catch (error) {
    console.error('Error getting student:', error);
    res.status(500).json({ error: error.message });
  }
});

// HTTPS function to update student
const updateStudent = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  if (!canManageStudents(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage students' });
  }

  try {
    const { studentId, studentData } = req.body;
    if (!studentId || !studentData) {
      return res.status(400).json({ error: 'Student ID and data are required' });
    }

    // Check if student exists
    const studentRef = db.collection('students').doc(studentId);
    const existingStudent = await studentRef.get();
    if (!existingStudent.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const existingData = existingStudent.data();

    // Validate updated student data
    const validationErrors = validateStudentData(studentData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }

    // Verify parent exists and has correct role if parentUID is being updated
    if (studentData.parentUID && studentData.parentUID !== existingData.parentUID) {
      const parentVerification = await verifyParentRole(studentData.parentUID);
      if (!parentVerification.isValid) {
        return res.status(400).json({ 
          error: 'Invalid parent',
          details: parentVerification.error 
        });
      }
    }

    // Check for duplicate student name under the same parent (excluding current student)
    if (studentData.fullName.trim() !== existingData.fullName || 
        studentData.parentUID !== existingData.parentUID) {
      const duplicateQuery = await db.collection('students')
        .where('parentUID', '==', studentData.parentUID)
        .where('fullName', '==', studentData.fullName.trim())
        .get();

      const hasDuplicate = duplicateQuery.docs.some(doc => doc.id !== studentId);
      if (hasDuplicate) {
        return res.status(400).json({ 
          error: 'A student with this name already exists for this parent' 
        });
      }
    }

    // Update student document
    const updateData = {
      fullName: studentData.fullName.trim(),
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      parentUID: studentData.parentUID,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: authResult.decodedToken.uid
    };

    await studentRef.update(updateData);

    // Get updated student data with parent information
    const updatedStudent = await studentRef.get();
    const data = updatedStudent.data();
    const parentInfo = await getParentInfo(data.parentUID);

    const responseStudent = {
      id: updatedStudent.id,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      parentUID: data.parentUID,
      parentInfo: parentInfo,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    };

    res.json({ 
      message: 'Student updated successfully',
      student: responseStudent 
    });

  } catch (error) {
    console.error('Error updating student:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (error.code === 'unavailable') {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// HTTPS function to delete student
const deleteStudent = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  if (!canManageStudents(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage students' });
  }

  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Check if student exists
    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const data = studentDoc.data();

    // Check if student has active enrollments
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('studentUID', '==', studentId)
      .where('status', '==', 'enrolled')
      .get();

    if (!enrollmentsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete student with active enrollments',
        details: 'Please withdraw the student from all programs first.',
        activeEnrollments: enrollmentsSnapshot.size
      });
    }

    // Check if student has any historical enrollments
    const allEnrollmentsSnapshot = await db.collection('enrollments')
      .where('studentUID', '==', studentId)
      .get();

    const hasHistoricalData = !allEnrollmentsSnapshot.empty;

    // Get parent information for response
    const parentInfo = await getParentInfo(data.parentUID);

    // Store comprehensive student info for response
    const deletedStudentInfo = {
      id: studentDoc.id,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      parentUID: data.parentUID,
      parentInfo: parentInfo,
      createdAt: data.createdAt?.toDate().toISOString(),
      hadHistoricalEnrollments: hasHistoricalData,
      totalHistoricalEnrollments: allEnrollmentsSnapshot.size
    };

    // If student has historical data, mark as deleted instead of hard delete
    if (hasHistoricalData) {
      await studentRef.update({
        deleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: authResult.decodedToken.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ 
        message: 'Student marked as deleted (preserved due to historical data)',
        deletedStudent: deletedStudentInfo,
        softDelete: true
      });
    } else {
      // Hard delete if no historical data
      await studentRef.delete();

      res.json({ 
        message: 'Student deleted successfully',
        deletedStudent: deletedStudentInfo,
        softDelete: false
      });
    }

  } catch (error) {
    console.error('Error deleting student:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (error.code === 'unavailable') {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent
};
