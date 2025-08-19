const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireAdmin, requireRole } = require('../utils/auth');
const { canManageEnrollments } = require('../utils/permissions');
const { validateEnrollmentData } = require('../utils/validation');

const db = admin.firestore();

// Helper function to get valid class names from the classes collection
const getValidClassNames = async (academicYear = null) => {
  try {
    let query = db.collection('classes');
    
    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }
    
    // Only get non-deleted classes
    query = query.where('deleted', '!=', true);
    
    const snapshot = await query.get();
    const classNames = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && !data.deleted) {
        classNames.push(data.name);
      }
    });
    
    return classNames;
  } catch (error) {
    console.warn('Failed to get valid class names:', error.message);
    // Fallback to hardcoded classes if database query fails
    return ['Pre-KG', 'KG1-A', 'KG1-B', 'KG2-A', 'KG2-B'];
  }
};

// Helper function to verify student exists and is not deleted
const verifyStudentExists = async (studentUID) => {
  try {
    const studentDoc = await db.collection('students').doc(studentUID).get();
    if (!studentDoc.exists) {
      return { isValid: false, error: 'Student does not exist' };
    }
    
    const studentData = studentDoc.data();
    if (studentData.deleted) {
      return { isValid: false, error: 'Cannot enroll a deleted student' };
    }
    
    return { isValid: true, studentData };
  } catch (error) {
    return { isValid: false, error: `Error verifying student: ${error.message}` };
  }
};

// Helper function to verify teacher exists and has correct role
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
    
    return { isValid: true, teacherData: userRecord };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return { isValid: false, error: 'Teacher UID does not exist' };
    }
    return { isValid: false, error: `Error verifying teacher: ${error.message}` };
  }
};

// Helper function to get comprehensive student information
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
      createdAt: studentData.createdAt?.toDate()?.toISOString(),
      updatedAt: studentData.updatedAt?.toDate()?.toISOString()
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

// HTTPS function to create enrollment
const createEnrollment = functions.https.onRequest(async (req, res) => {
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

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage enrollments' });
  }

  try {
    const { enrollmentData } = req.body;
    if (!enrollmentData) {
      return res.status(400).json({ error: 'Enrollment data is required' });
    }

    // Validate enrollment data
    const validationErrors = validateEnrollmentData(enrollmentData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }

    // NEW ARCHITECTURE: Validate classId instead of teacherUID
    // Get class information to validate classId and get className
    let classDoc = null;
    let className = null;
    
    if (enrollmentData.classId) {
      // NEW: Using classId (preferred method)
      try {
        classDoc = await db.collection('classes').doc(enrollmentData.classId).get();
        if (!classDoc.exists) {
          return res.status(400).json({ 
            error: 'Invalid class',
            details: 'Class with specified ID does not exist' 
          });
        }
        const classData = classDoc.data();
        if (classData.deleted) {
          return res.status(400).json({ 
            error: 'Invalid class',
            details: 'Cannot enroll in a deleted class' 
          });
        }
        className = classData.name;
        console.log(`✅ Class validation successful: ${className} (${enrollmentData.classId})`);
      } catch (error) {
        console.error('Error validating classId:', error);
        return res.status(400).json({ 
          error: 'Invalid class',
          details: `Error validating class ID: ${error.message}` 
        });
      }
    } else if (enrollmentData.class) {
      // FALLBACK: Using class name (legacy support)
      try {
        const classQuery = await db.collection('classes')
          .where('name', '==', enrollmentData.class)
          .where('academicYear', '==', enrollmentData.academicYear)
          .where('deleted', '!=', true)
          .limit(1)
          .get();
        
        if (classQuery.empty) {
          // Try without academicYear filter in case class spans multiple years
          const classQueryFallback = await db.collection('classes')
            .where('name', '==', enrollmentData.class)
            .where('deleted', '!=', true)
            .limit(1)
            .get();
          
          if (classQueryFallback.empty) {
            return res.status(400).json({ 
              error: 'Invalid class',
              details: `Class "${enrollmentData.class}" not found` 
            });
          }
          classDoc = classQueryFallback.docs[0];
        } else {
          classDoc = classQuery.docs[0];
        }
        
        className = enrollmentData.class;
        enrollmentData.classId = classDoc.id; // Add classId for new architecture
        console.log(`✅ Class validation successful (legacy): ${className} → ${classDoc.id}`);
      } catch (error) {
        console.error('Error validating class name:', error);
        return res.status(400).json({ 
          error: 'Invalid class',
          details: `Error validating class name: ${error.message}` 
        });
      }
    } else {
      return res.status(400).json({ 
        error: 'Invalid enrollment data',
        details: 'Either classId or class name is required' 
      });
    }

    // Verify student exists and is not deleted
    const studentVerification = await verifyStudentExists(enrollmentData.studentUID);
    if (!studentVerification.isValid) {
      return res.status(400).json({ 
        error: 'Invalid student',
        details: studentVerification.error 
      });
    }

    // REMOVED: Teacher verification - teachers are assigned via teachers.classes[] field
    // Teacher assignments are managed through the Teacher Management component
    // No need to verify teacherUID in enrollment creation

    // Create enrollment ID using the specified format: {academicYear}_{studentUID}
    const enrollmentId = `${enrollmentData.academicYear}_${enrollmentData.studentUID}`;
    
    // Check for duplicate enrollment (same student, same academic year)
    const existingEnrollment = await db.collection('enrollments').doc(enrollmentId).get();
    if (existingEnrollment.exists) {
      const existingData = existingEnrollment.data();
      
      // If existing enrollment is not deleted, it's a duplicate
      if (!existingData.deleted) {
        return res.status(400).json({ 
          error: `Student is already enrolled for academic year ${enrollmentData.academicYear}`,
          details: `Existing enrollment status: ${existingData.status}` 
        });
      }
    }

    // Create enrollment document with NEW ARCHITECTURE
    const enrollmentDoc = {
      studentUID: enrollmentData.studentUID,
      academicYear: enrollmentData.academicYear,
      classId: enrollmentData.classId,        // NEW: Reference to classes collection document ID
      class: className,                       // KEEP: Human-readable class name for compatibility
      status: enrollmentData.status || 'enrolled',
      enrollmentDate: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authResult.decodedToken.uid,
      // Additional metadata
      notes: enrollmentData.notes || '',
      previousClass: enrollmentData.previousClass || null
      // REMOVED: teacherUID - teacher assignments managed via teachers.classes[] field
    };

    await db.collection('enrollments').doc(enrollmentId).set(enrollmentDoc);

    // Get created enrollment data with complete information
    const createdEnrollment = await db.collection('enrollments').doc(enrollmentId).get();
    const data = createdEnrollment.data();
    
    // Get comprehensive student information
    const studentInfo = await getStudentInfo(data.studentUID);
    // REMOVED: Teacher info - teachers managed via teachers.classes[] architecture

    const responseEnrollment = {
      id: createdEnrollment.id,
      studentUID: data.studentUID,
      academicYear: data.academicYear,
      classId: data.classId,              // NEW: Include classId in response
      class: data.class,                  // KEEP: Human-readable class name
      status: data.status,
      notes: data.notes,
      previousClass: data.previousClass,
      studentInfo: studentInfo,
      // REMOVED: teacherInfo - not relevant in new architecture
      enrollmentDate: data.enrollmentDate?.toDate().toISOString(),
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      createdBy: data.createdBy
    };

    res.status(201).json({ 
      message: 'Enrollment created successfully',
      enrollment: responseEnrollment 
    });

  } catch (error) {
    console.error('Error creating enrollment:', error);
    
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

// HTTPS function to list enrollments with advanced filtering, search, and pagination
const listEnrollments = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  // Allow admins, teachers, and parents (scoped to their own children) to access enrollments
  const userRole = authResult.decodedToken.role || 'user';
  const isAdmin = ['admin', 'superadmin'].includes(userRole);
  const isTeacher = userRole === 'teacher';
  const isParent = userRole === 'parent';

  if (!isAdmin && !isTeacher && !isParent) {
    return res.status(403).json({ error: 'Forbidden: Only administrators, teachers, or parents (their own children) can access enrollments' });
  }

  // If teacher, restrict to only their assigned classes by adding teacherUID filter
  const isTeacherFilteringOwnClasses = isTeacher;

  try {
    // Parse query parameters with better defaults
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const academicYear = req.query.academicYear?.trim();
    const className = req.query.class?.trim();
  let teacherUID = req.query.teacherUID?.trim();
  const studentUID = req.query.studentUID?.trim();
  let parentUID = req.query.parentUID?.trim();
    const status = req.query.status?.trim();
    const search = req.query.search?.trim();
    const sortBy = req.query.sortBy || 'createdAt'; // class, academicYear, createdAt, updatedAt, enrollmentDate
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const startAfterTimestamp = req.query.startAfterTimestamp;
    const includeDeleted = req.query.includeDeleted === 'true';

    // If user is a teacher, force filter to only their classes
    if (isTeacherFilteringOwnClasses) {
      teacherUID = authResult.decodedToken.uid; // Override with teacher's UID
    }

    // If user is a parent, force filter to only their children
    if (isParent) {
      // Ensure parents cannot query other parents' enrollments
      // This forces the filter to the authenticated parent's UID regardless of query params
      if (req.query.parentUID && req.query.parentUID !== authResult.decodedToken.uid) {
        console.warn('Parent attempted to query another parent\'s enrollments. Overriding to own UID.');
      }
      // eslint-disable-next-line no-param-reassign
      parentUID = authResult.decodedToken.uid;
    }

    console.log('List enrollments request:', {
      limit,
      academicYear,
      className,
      teacherUID,
      studentUID,
      parentUID,
      status,
      search,
      sortBy,
      sortOrder,
      startAfterTimestamp,
  includeDeleted,
  isTeacherFilteringOwnClasses,
  isParent
    });

    let query = db.collection('enrollments');


    // Apply only sorting to avoid complex Firestore index requirements
    console.log('Applying sort:', sortBy, sortOrder);
    // Use single orderBy to avoid complex index requirements
    if (sortBy === 'class') {
      query = query.orderBy('class', sortOrder);
    } else if (sortBy === 'academicYear') {
      query = query.orderBy('academicYear', sortOrder);
    } else if (sortBy === 'enrollmentDate') {
      query = query.orderBy('enrollmentDate', sortOrder);
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
        query = query.startAfter(startAfterDate);
      } catch (timestampError) {
        console.warn('Error parsing timestamp for pagination:', timestampError);
        // Continue without pagination rather than failing
      }
    }
    // Apply a larger limit since we'll filter client-side
    const fetchLimit = Math.min(limit * 3, 300); // Fetch more to account for filtering
    query = query.limit(fetchLimit);

    console.log('Executing Firestore query...');
    const snapshot = await query.get();
    console.log('Query executed successfully, documents found:', snapshot.size);

    // Process enrollments and collect data for filtering
    const enrollmentDocs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Ensure all required fields exist with defaults
      const enrollmentData = {
        ...data,
        studentUID: data.studentUID || '',
        academicYear: data.academicYear || '',
        class: data.class || 'Unknown',
        teacherUID: data.teacherUID || '',
        status: data.status || 'enrolled',
        createdAt: data.createdAt || admin.firestore.Timestamp.now(),
        updatedAt: data.updatedAt || data.createdAt || admin.firestore.Timestamp.now(),
        enrollmentDate: data.enrollmentDate || data.createdAt || admin.firestore.Timestamp.now()
      };
      enrollmentDocs.push({ id: doc.id, data: enrollmentData });
    });

    console.log('Processed enrollment documents:', enrollmentDocs.length);

    // Filter out soft-deleted enrollments unless explicitly requested
    const filteredEnrollmentDocs = includeDeleted 
      ? enrollmentDocs 
      : enrollmentDocs.filter(({ data }) => !data.deleted);

    console.log('Filtered enrollment documents (after deleted filter):', filteredEnrollmentDocs.length);

    // Collect unique student and teacher UIDs for batch processing
    const studentUIDs = new Set();
    const teacherUIDs = new Set();
    
    filteredEnrollmentDocs.forEach(({ data }) => {
      if (data.studentUID?.trim()) {
        studentUIDs.add(data.studentUID);
      }
      if (data.teacherUID?.trim()) {
        teacherUIDs.add(data.teacherUID);
      }
    });

    console.log('Unique student UIDs found:', studentUIDs.size);
    console.log('Unique teacher UIDs found:', teacherUIDs.size);

    // Batch fetch student information
    const studentInfoMap = new Map();
    const studentUIDArray = Array.from(studentUIDs);
    
    const studentPromises = studentUIDArray.map(async (studentUID) => {
      try {
        const studentInfo = await getStudentInfo(studentUID);
        studentInfoMap.set(studentUID, studentInfo);
      } catch (error) {
        console.warn(`Failed to get student info for ${studentUID}:`, error.message);
        studentInfoMap.set(studentUID, {
          uid: studentUID,
          fullName: 'Unknown Student',
          dateOfBirth: null,
          gender: 'Unknown',
          parentUID: null,
          parentInfo: null
        });
      }
    });

    // Batch fetch teacher information
    const teacherInfoMap = new Map();
    const teacherUIDArray = Array.from(teacherUIDs);
    
    const teacherPromises = teacherUIDArray.map(async (teacherUID) => {
      try {
        const teacherInfo = await getTeacherInfo(teacherUID);
        teacherInfoMap.set(teacherUID, teacherInfo);
      } catch (error) {
        console.warn(`Failed to get teacher info for ${teacherUID}:`, error.message);
        teacherInfoMap.set(teacherUID, {
          uid: teacherUID,
          email: 'Unknown',
          displayName: 'Unknown Teacher',
          phoneNumber: null,
          role: 'user'
        });
      }
    });

    // Wait for all info to be fetched
    await Promise.all([...studentPromises, ...teacherPromises]);
    console.log('Student info fetched for', studentInfoMap.size, 'students');
    console.log('Teacher info fetched for', teacherInfoMap.size, 'teachers');

    // Build final enrollment list with comprehensive information
    let enrollments = filteredEnrollmentDocs.map(({ id, data }) => {
      const studentInfo = studentInfoMap.get(data.studentUID) || {
        uid: data.studentUID || '',
        fullName: 'Unknown Student',
        dateOfBirth: null,
        gender: 'Unknown',
        parentUID: null,
        parentInfo: null
      };

      const teacherInfo = teacherInfoMap.get(data.teacherUID) || {
        uid: data.teacherUID || '',
        email: 'Unknown',
        displayName: 'Unknown Teacher',
        phoneNumber: null,
        role: 'user'
      };

      return {
        id,
        studentUID: data.studentUID,
        academicYear: data.academicYear,
        classId: data.classId, // NEW: expose classId for reliable joins
        class: data.class,
        teacherUID: data.teacherUID,
        status: data.status,
        notes: data.notes || '',
        previousClass: data.previousClass,
        studentInfo: studentInfo,
        teacherInfo: teacherInfo,
        enrollmentDate: data.enrollmentDate?.toDate()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    });

    console.log('Built enrollment list with comprehensive info:', enrollments.length);

    // Apply client-side filters to avoid Firestore index issues
    
    // Filter by academic year if specified
    if (academicYear) {
      console.log('Applying academicYear filter:', academicYear);
      const beforeCount = enrollments.length;
      enrollments = enrollments.filter(enrollment => enrollment.academicYear === academicYear);
      console.log('AcademicYear filter applied. Before:', beforeCount, 'After:', enrollments.length);
    }

    // Filter by class if specified
    if (className) {
      console.log('Applying class filter:', className);
      const beforeCount = enrollments.length;
      enrollments = enrollments.filter(enrollment => enrollment.class === className);
      console.log('Class filter applied. Before:', beforeCount, 'After:', enrollments.length);
    }

    // Filter by teacher if specified - NEW ARCHITECTURE: Filter by classId assignments
    if (teacherUID) {
      console.log('Applying teacherUID filter (via classId assignments):', teacherUID);
      const beforeCount = enrollments.length;
      try {
        const teacherDoc = await db.collection('teachers').doc(teacherUID).get();
        let teacherAssignedClassIds = [];
        if (teacherDoc.exists()) {
          const teacherData = teacherDoc.data();
          const teacherClassAssignments = teacherData.classes || [];
          teacherAssignedClassIds = teacherClassAssignments.map(assignment => assignment.classId);
          console.log('Teacher assigned classIds:', teacherAssignedClassIds);
        }
        // Filter enrollments to only include classIds assigned to the teacher
        if (teacherAssignedClassIds.length > 0) {
          enrollments = enrollments.filter(enrollment => 
            teacherAssignedClassIds.includes(enrollment.classId)
          );
          console.log('Filtered enrollments by assigned classIds');
        } else {
          // FALLBACK: If no assignments found, try legacy teacherUID field
          console.log('No class assignments found, trying legacy teacherUID filter');
          enrollments = enrollments.filter(enrollment => enrollment.teacherUID === teacherUID);
        }
      } catch (error) {
        console.error('Error fetching teacher assignments:', error);
        // FALLBACK: Use legacy teacherUID filter
        enrollments = enrollments.filter(enrollment => enrollment.teacherUID === teacherUID);
      }
      console.log('TeacherUID filter applied (via classId assignments). Before:', beforeCount, 'After:', enrollments.length);
    }

    // Filter by student if specified
    if (studentUID) {
      console.log('Applying studentUID filter:', studentUID);
      const beforeCount = enrollments.length;
      enrollments = enrollments.filter(enrollment => enrollment.studentUID === studentUID);
      console.log('StudentUID filter applied. Before:', beforeCount, 'After:', enrollments.length);
    }

    // Filter by parent if specified
    if (parentUID) {
      console.log('Applying parentUID filter:', parentUID);
      const beforeCount = enrollments.length;
      enrollments = enrollments.filter(enrollment => 
        enrollment.studentInfo?.parentUID === parentUID
      );
      console.log('ParentUID filter applied. Before:', beforeCount, 'After:', enrollments.length);
    }

    // Filter by status if specified
    if (status && ['enrolled', 'withdrawn', 'graduated', 'pending'].includes(status)) {
      console.log('Applying status filter:', status);
      const beforeCount = enrollments.length;
      enrollments = enrollments.filter(enrollment => enrollment.status === status);
      console.log('Status filter applied. Before:', beforeCount, 'After:', enrollments.length);
    }

    // Apply search filter if specified (comprehensive search across all relevant fields)
    if (search) {
      console.log('Applying search filter:', search);
      const searchLower = search.toLowerCase();
      const beforeSearchCount = enrollments.length;
      enrollments = enrollments.filter(enrollment => 
        (enrollment.academicYear || '').toLowerCase().includes(searchLower) ||
        (enrollment.class || '').toLowerCase().includes(searchLower) ||
        (enrollment.status || '').toLowerCase().includes(searchLower) ||
        (enrollment.studentInfo?.fullName || '').toLowerCase().includes(searchLower) ||
        (enrollment.studentInfo?.parentInfo?.email || '').toLowerCase().includes(searchLower) ||
        (enrollment.studentInfo?.parentInfo?.displayName || '').toLowerCase().includes(searchLower) ||
        (enrollment.teacherInfo?.email || '').toLowerCase().includes(searchLower) ||
        (enrollment.teacherInfo?.displayName || '').toLowerCase().includes(searchLower) ||
        (enrollment.notes || '').toLowerCase().includes(searchLower)
      );
      console.log('Search filter applied. Before:', beforeSearchCount, 'After:', enrollments.length);
    }


  // Apply the final limit after all filtering
  let totalFilteredCount = enrollments.length;
  enrollments = enrollments.slice(0, limit);
  totalFilteredCount = enrollments.length;

  console.log('Applied final limit. Total filtered:', totalFilteredCount, 'Returned:', enrollments.length);

    // Prepare pagination info
    let nextPageInfo = null;
    if (totalFilteredCount > limit) {
      const lastEnrollment = enrollments[enrollments.length - 1];
      nextPageInfo = {
        startAfterTimestamp: Date.now() // Simplified pagination
      };
    }

    // Calculate summary statistics
    const summaryStats = {
      totalEnrollments: totalFilteredCount,
      byStatus: {},
      byClass: {},
      byAcademicYear: {}
    };

    // Build statistics from all filtered enrollments (not just the limited results)
    const allFilteredEnrollments = filteredEnrollmentDocs.map(({ id, data }) => ({
      id,
      status: data.status,
      class: data.class,
      academicYear: data.academicYear
    }));

    allFilteredEnrollments.forEach(enrollment => {
      // Count by status
      summaryStats.byStatus[enrollment.status] = (summaryStats.byStatus[enrollment.status] || 0) + 1;
      
      // Count by class
      summaryStats.byClass[enrollment.class] = (summaryStats.byClass[enrollment.class] || 0) + 1;
      
      // Count by academic year
      summaryStats.byAcademicYear[enrollment.academicYear] = (summaryStats.byAcademicYear[enrollment.academicYear] || 0) + 1;
    });

    console.log('Returning response with', enrollments.length, 'enrollments');

    res.json({ 
      enrollments,
      count: enrollments.length,
      totalCount: totalFilteredCount,
      nextPageInfo,
      summaryStats,
      pagination: {
        limit,
        hasMore: nextPageInfo !== null
      },
      filters: {
        academicYear: academicYear || null,
        class: className || null,
        teacherUID: teacherUID || null,
        studentUID: studentUID || null,
        parentUID: parentUID || null,
        status: status || null,
        search: search || null,
        sortBy,
        sortOrder,
        includeDeleted
      }
    });

  } catch (error) {
    console.error('Error listing enrollments:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied accessing enrollment data' });
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
      error: 'Internal server error while listing enrollments',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// HTTPS function to get enrollment by ID
const getEnrollment = functions.https.onRequest(async (req, res) => {
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

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage enrollments' });
  }

  try {
    const { enrollmentId } = req.query;
    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' });
    }

    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const data = enrollmentDoc.data();
    
    // Check if enrollment is soft-deleted
    if (data.deleted && req.query.includeDeleted !== 'true') {
      return res.status(404).json({ error: 'Enrollment not found or has been deleted' });
    }
    
    // Get comprehensive student and teacher information
    const studentInfo = await getStudentInfo(data.studentUID);
    const teacherInfo = await getTeacherInfo(data.teacherUID);

    const enrollment = {
      id: enrollmentDoc.id,
      studentUID: data.studentUID,
      academicYear: data.academicYear,
      classId: data.classId, // NEW: include classId in single fetch
      class: data.class,
      teacherUID: data.teacherUID,
      status: data.status,
      notes: data.notes || '',
      previousClass: data.previousClass,
      studentInfo: studentInfo,
      teacherInfo: teacherInfo,
      enrollmentDate: data.enrollmentDate?.toDate().toISOString(),
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    };

    res.json({ enrollment });

  } catch (error) {
    console.error('Error getting enrollment:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Enrollment not found' });
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

// HTTPS function to update enrollment
const updateEnrollment = functions.https.onRequest(async (req, res) => {
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

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage enrollments' });
  }

  try {
    const { enrollmentId, enrollmentData } = req.body;
    if (!enrollmentId || !enrollmentData) {
      return res.status(400).json({ error: 'Enrollment ID and data are required' });
    }

    // Check if enrollment exists
    const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
    const existingEnrollment = await enrollmentRef.get();
    if (!existingEnrollment.exists) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const existingData = existingEnrollment.data();

    // Check if enrollment is soft-deleted
    if (existingData.deleted) {
      return res.status(400).json({ error: 'Cannot update a deleted enrollment' });
    }

    // Validate updated enrollment data (partial validation for updates)
    const updateData = {};
    
    // Validate and update class if provided
    if (enrollmentData.class !== undefined) {
      const validClasses = ['Pre-KG', 'KG1-A', 'KG1-B', 'KG2-A', 'KG2-B'];
      if (!validClasses.includes(enrollmentData.class)) {
        return res.status(400).json({ 
          error: `Class must be one of: ${validClasses.join(', ')}` 
        });
      }
      updateData.class = enrollmentData.class;
    }

    // Validate and update teacher if provided
    if (enrollmentData.teacherUID !== undefined) {
      if (enrollmentData.teacherUID !== existingData.teacherUID) {
        const teacherVerification = await verifyTeacherRole(enrollmentData.teacherUID);
        if (!teacherVerification.isValid) {
          return res.status(400).json({ 
            error: 'Invalid teacher',
            details: teacherVerification.error 
          });
        }
      }
      updateData.teacherUID = enrollmentData.teacherUID;
    }

    // Validate and update status if provided
    if (enrollmentData.status !== undefined) {
      const validStatuses = ['enrolled', 'withdrawn', 'graduated', 'pending'];
      if (!validStatuses.includes(enrollmentData.status)) {
        return res.status(400).json({ 
          error: `Status must be one of: ${validStatuses.join(', ')}` 
        });
      }
      updateData.status = enrollmentData.status;
    }

    // Update notes if provided
    if (enrollmentData.notes !== undefined) {
      updateData.notes = enrollmentData.notes.trim();
    }

    // Update previous class if provided
    if (enrollmentData.previousClass !== undefined) {
      updateData.previousClass = enrollmentData.previousClass;
    }

    // Add timestamp and updater info
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updateData.updatedBy = authResult.decodedToken.uid;

    // Update enrollment document
    await enrollmentRef.update(updateData);

    // Get updated enrollment data with comprehensive information
    const updatedEnrollment = await enrollmentRef.get();
    const data = updatedEnrollment.data();
    
    // Get comprehensive student and teacher information
    const studentInfo = await getStudentInfo(data.studentUID);
    const teacherInfo = await getTeacherInfo(data.teacherUID);

    const responseEnrollment = {
      id: updatedEnrollment.id,
      studentUID: data.studentUID,
      academicYear: data.academicYear,
      class: data.class,
      teacherUID: data.teacherUID,
      status: data.status,
      notes: data.notes || '',
      previousClass: data.previousClass,
      studentInfo: studentInfo,
      teacherInfo: teacherInfo,
      enrollmentDate: data.enrollmentDate?.toDate().toISOString(),
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    };

    res.json({ 
      message: 'Enrollment updated successfully',
      enrollment: responseEnrollment 
    });

  } catch (error) {
    console.error('Error updating enrollment:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Enrollment not found' });
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

// HTTPS function to delete enrollment (supports soft delete for data integrity)
const deleteEnrollment = functions.https.onRequest(async (req, res) => {
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

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage enrollments' });
  }

  try {
    const { enrollmentId, forceDelete } = req.body;
    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' });
    }

    // Check if enrollment exists
    const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
    const enrollmentDoc = await enrollmentRef.get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const data = enrollmentDoc.data();

    // Get comprehensive student and teacher information for response
    const studentInfo = await getStudentInfo(data.studentUID);
    const teacherInfo = await getTeacherInfo(data.teacherUID);

    // Store comprehensive enrollment info for response
    const deletedEnrollmentInfo = {
      id: enrollmentDoc.id,
      studentUID: data.studentUID,
      academicYear: data.academicYear,
      class: data.class,
      teacherUID: data.teacherUID,
      status: data.status,
      studentInfo: studentInfo,
      teacherInfo: teacherInfo,
      enrollmentDate: data.enrollmentDate?.toDate().toISOString(),
      createdAt: data.createdAt?.toDate().toISOString()
    };

    // Check if there are related records that would require soft delete
    // For example, check if there are attendance records, grades, or other related data
    const hasRelatedData = false; // This could be expanded to check for related collections
    
    // Check if this is an active enrollment that shouldn't be hard deleted
    const isActiveEnrollment = data.status === 'enrolled';

    // Determine deletion strategy
    if (forceDelete === true && !isActiveEnrollment) {
      // Hard delete if explicitly requested and not an active enrollment
      await enrollmentRef.delete();

      res.json({ 
        message: 'Enrollment permanently deleted',
        deletedEnrollment: deletedEnrollmentInfo,
        softDelete: false,
        warning: 'This enrollment has been permanently removed from the system'
      });
    } else {
      // Soft delete (mark as deleted) for data integrity
      await enrollmentRef.update({
        deleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: authResult.decodedToken.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Preserve original status for potential restoration
        originalStatus: data.status,
        status: 'deleted'
      });

      const reasonForSoftDelete = isActiveEnrollment 
        ? 'Active enrollments are archived rather than deleted to maintain academic records'
        : 'Enrollment archived to preserve historical data';

      res.json({ 
        message: 'Enrollment archived successfully',
        deletedEnrollment: deletedEnrollmentInfo,
        softDelete: true,
        reason: reasonForSoftDelete,
        note: 'Use forceDelete=true to permanently remove non-active enrollments'
      });
    }

  } catch (error) {
    console.error('Error deleting enrollment:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Enrollment not found' });
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

// HTTPS function to get enrollments by academic year with enhanced features
const getEnrollmentsByYear = functions.https.onRequest(async (req, res) => {
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

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage enrollments' });
  }

  try {
    const { academicYear } = req.query;
    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year is required' });
    }

    const includeDeleted = req.query.includeDeleted === 'true';
    const includeStats = req.query.includeStats !== 'false'; // Default to true

    console.log('Getting enrollments for academic year:', academicYear);

    // Query enrollments for the specified academic year
    const snapshot = await db.collection('enrollments')
      .where('academicYear', '==', academicYear)
      .orderBy('class')
      .orderBy('createdAt', 'desc')
      .get();

    console.log('Found enrollments:', snapshot.size);

    const enrollmentDocs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Filter deleted enrollments unless explicitly requested
      if (!includeDeleted && data.deleted) {
        return;
      }
      
      enrollmentDocs.push({ id: doc.id, data });
    });

    console.log('Filtered enrollments:', enrollmentDocs.length);

    // Collect unique student and teacher UIDs for batch processing
    const studentUIDs = new Set();
    const teacherUIDs = new Set();
    
    enrollmentDocs.forEach(({ data }) => {
      if (data.studentUID?.trim()) {
        studentUIDs.add(data.studentUID);
      }
      if (data.teacherUID?.trim()) {
        teacherUIDs.add(data.teacherUID);
      }
    });

    // Batch fetch student and teacher information
    const studentInfoMap = new Map();
    const teacherInfoMap = new Map();
    
    const studentPromises = Array.from(studentUIDs).map(async (studentUID) => {
      try {
        const studentInfo = await getStudentInfo(studentUID);
        studentInfoMap.set(studentUID, studentInfo);
      } catch (error) {
        console.warn(`Failed to get student info for ${studentUID}:`, error.message);
      }
    });

    const teacherPromises = Array.from(teacherUIDs).map(async (teacherUID) => {
      try {
        const teacherInfo = await getTeacherInfo(teacherUID);
        teacherInfoMap.set(teacherUID, teacherInfo);
      } catch (error) {
        console.warn(`Failed to get teacher info for ${teacherUID}:`, error.message);
      }
    });

    await Promise.all([...studentPromises, ...teacherPromises]);

    // Build enriched enrollment data
    const enrollments = enrollmentDocs.map(({ id, data }) => {
      const studentInfo = studentInfoMap.get(data.studentUID) || {
        uid: data.studentUID,
        fullName: 'Unknown Student',
        dateOfBirth: null,
        gender: 'Unknown',
        parentUID: null,
        parentInfo: null
      };

      const teacherInfo = teacherInfoMap.get(data.teacherUID) || {
        uid: data.teacherUID,
        email: 'Unknown',
        displayName: 'Unknown Teacher',
        phoneNumber: null,
        role: 'user'
      };

      return {
        id,
        studentUID: data.studentUID,
        academicYear: data.academicYear,
        class: data.class,
        teacherUID: data.teacherUID,
        status: data.status,
        notes: data.notes || '',
        previousClass: data.previousClass,
        studentInfo: studentInfo,
        teacherInfo: teacherInfo,
        enrollmentDate: data.enrollmentDate?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    });

    // Group by class for better organization
    const enrollmentsByClass = enrollments.reduce((acc, enrollment) => {
      const className = enrollment.class;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(enrollment);
      return acc;
    }, {});

    // Calculate statistics if requested
    let stats = null;
    if (includeStats) {
      stats = {
        totalEnrollments: enrollments.length,
        byStatus: {},
        byClass: {},
        byGender: {},
        classCapacityStatus: {}
      };

      // Define class capacities (can be made configurable)
      const classCapacities = {
        'Pre-KG': 15,
        'KG1-A': 20,
        'KG1-B': 20,
        'KG2-A': 25,
        'KG2-B': 25
      };

      enrollments.forEach(enrollment => {
        // Count by status
        stats.byStatus[enrollment.status] = (stats.byStatus[enrollment.status] || 0) + 1;
        
        // Count by class
        stats.byClass[enrollment.class] = (stats.byClass[enrollment.class] || 0) + 1;
        
        // Count by gender
        const gender = enrollment.studentInfo?.gender || 'Unknown';
        stats.byGender[gender] = (stats.byGender[gender] || 0) + 1;
        
        // Calculate class capacity status
        const className = enrollment.class;
        const currentCount = stats.byClass[className];
        const capacity = classCapacities[className] || 20;
        
        stats.classCapacityStatus[className] = {
          enrolled: currentCount,
          capacity: capacity,
          available: capacity - currentCount,
          utilizationRate: Math.round((currentCount / capacity) * 100)
        };
      });
    }

    const response = {
      academicYear,
      enrollments,
      enrollmentsByClass,
      totalCount: enrollments.length,
      filters: {
        includeDeleted,
        includeStats
      }
    };

    if (stats) {
      response.statistics = stats;
    }

    res.json(response);

  } catch (error) {
    console.error('Error getting enrollments by year:', error);
    
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

// HTTPS function to get enrollment statistics and analytics
const getEnrollmentStats = functions.https.onRequest(async (req, res) => {
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

  if (!canManageEnrollments(roleResult.role)) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can manage enrollments' });
  }

  try {
    const academicYear = req.query.academicYear;
    const includeDeleted = req.query.includeDeleted === 'true';

    console.log('Getting enrollment statistics for:', academicYear || 'all years');

    let query = db.collection('enrollments');
    
    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }

    const snapshot = await query.get();
    
    const stats = {
      totalEnrollments: 0,
      activeEnrollments: 0,
      byAcademicYear: {},
      byStatus: {},
      byClass: {},
      byGender: {},
      recentEnrollments: [],
      trends: {
        enrollmentGrowth: {},
        statusTransitions: {}
      }
    };

    // Collect enrollment data for analysis
    const enrollmentData = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip deleted enrollments unless requested
      if (!includeDeleted && data.deleted) {
        return;
      }
      
      enrollmentData.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        enrollmentDate: data.enrollmentDate?.toDate()
      });
    });

    stats.totalEnrollments = enrollmentData.length;

    // Analyze enrollment data
    enrollmentData.forEach(enrollment => {
      // Count active enrollments
      if (enrollment.status === 'enrolled') {
        stats.activeEnrollments++;
      }
      
      // Count by academic year
      const year = enrollment.academicYear;
      stats.byAcademicYear[year] = (stats.byAcademicYear[year] || 0) + 1;
      
      // Count by status
      stats.byStatus[enrollment.status] = (stats.byStatus[enrollment.status] || 0) + 1;
      
      // Count by class
      stats.byClass[enrollment.class] = (stats.byClass[enrollment.class] || 0) + 1;
      
      // For recent enrollments analysis
      if (enrollment.createdAt && enrollment.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        stats.recentEnrollments.push({
          id: enrollment.id,
          studentUID: enrollment.studentUID,
          academicYear: enrollment.academicYear,
          class: enrollment.class,
          status: enrollment.status,
          createdAt: enrollment.createdAt.toISOString()
        });
      }
    });

    // Sort recent enrollments by creation date
    stats.recentEnrollments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    stats.recentEnrollments = stats.recentEnrollments.slice(0, 10); // Top 10 recent

    // Calculate enrollment growth trends by month
    const currentDate = new Date();
    const monthlyEnrollments = {};
    
    enrollmentData.forEach(enrollment => {
      if (enrollment.createdAt) {
        const monthKey = `${enrollment.createdAt.getFullYear()}-${String(enrollment.createdAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyEnrollments[monthKey] = (monthlyEnrollments[monthKey] || 0) + 1;
      }
    });

    stats.trends.enrollmentGrowth = monthlyEnrollments;

    res.json({
      statistics: stats,
      generatedAt: new Date().toISOString(),
      filters: {
        academicYear: academicYear || 'all',
        includeDeleted
      }
    });

  } catch (error) {
    console.error('Error getting enrollment statistics:', error);
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = {
  createEnrollment,
  listEnrollments,
  getEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentsByYear,
  getEnrollmentStats
};
