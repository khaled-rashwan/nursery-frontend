const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');
const { validateAttendanceData } = require('../utils/validation');

const db = admin.firestore();

// Helper function to verify class access and get class information
const verifyClassAccess = async (academicYear, classId, decodedToken) => {
  try {
    // Get class information
    const classQuery = await db.collection('classes')
      .where('academicYear', '==', academicYear)
      .where('name', '==', classId)
      .limit(1)
      .get();
    
    if (classQuery.empty) {
      return { isValid: false, error: 'Class does not exist' };
    }
    
    const classDoc = classQuery.docs[0];
    const classData = classDoc.data();
    
    // Role-based access control
    const userRole = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);
    
    // Superadmin and admin can access all classes
    if (['superadmin', 'admin'].includes(userRole)) {
      return { isValid: true, classData: { ...classData, id: classDoc.id } };
    }
    
    // Teachers can only access their own classes
    if (userRole === 'teacher') {
      if (classData.teacherUID === decodedToken.uid) {
        return { isValid: true, classData: { ...classData, id: classDoc.id } };
      } else {
        return { isValid: false, error: 'Teachers can only manage attendance for their own classes' };
      }
    }
    
    // Parents have read-only access if their child is in the class
    if (userRole === 'parent') {
      // We'll check parent access when retrieving attendance records
      return { isValid: true, classData: { ...classData, id: classDoc.id }, readOnly: true };
    }
    
    return { isValid: false, error: 'Invalid user role' };
  } catch (error) {
    console.error('Error verifying class access:', error);
    return { isValid: false, error: 'Error verifying class access' };
  }
};

// Helper function to get enrolled students for a class
const getClassEnrollments = async (academicYear, classId) => {
  try {
    const enrollmentsQuery = await db.collection('enrollments')
      .where('academicYear', '==', academicYear)
      .where('class', '==', classId)
      .where('status', '==', 'enrolled')
      .get();
    
    const enrollments = [];
    enrollmentsQuery.forEach(doc => {
      const data = doc.data();
      if (!data.deleted) {
        enrollments.push({
          id: doc.id,
          studentUID: data.studentUID,
          studentInfo: data.studentInfo
        });
      }
    });
    
    return enrollments;
  } catch (error) {
    console.error('Error getting class enrollments:', error);
    return [];
  }
};

// Helper function to validate attendance date
const validateAttendanceDate = (date) => {
  const attendanceDate = new Date(date);
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  if (isNaN(attendanceDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (attendanceDate > today) {
    return { isValid: false, error: 'Cannot record attendance for future dates' };
  }

  if (attendanceDate < oneYearAgo) {
    return { isValid: false, error: 'Cannot record attendance for dates older than one year' };
  }

  return { isValid: true };
};

/**
 * Save Attendance Function - Centralized Approach
 * URL: /saveAttendanceCentralized
 * Method: POST
 * Body: { academicYear, classId, date, attendanceRecords }
 */
exports.saveAttendanceCentralized = functions.https.onRequest(async (req, res) => {
  try {
    setCorsHeaders(res);
    // FIX: correctly handle CORS preflight by passing req, res
    if (req.method === 'OPTIONS') {
      handleCorsOptions(req, res);
      return; // end early after responding to preflight
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate user
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Validate required fields
    const { academicYear, classId, date, attendanceRecords } = req.body;
    
    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year is required' });
    }
    
    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ error: 'Attendance records are required' });
    }

    // Validate date
    const dateValidation = validateAttendanceDate(date);
    if (!dateValidation.isValid) {
      return res.status(400).json({ error: dateValidation.error });
    }

    // Verify class access
    const accessResult = await verifyClassAccess(academicYear, classId, decodedToken);
    if (!accessResult.isValid) {
      return res.status(403).json({ error: accessResult.error });
    }

    if (accessResult.readOnly) {
      return res.status(403).json({ error: 'Read-only access: Cannot modify attendance records' });
    }

    // Validate attendance records
    const validStatuses = ['present', 'absent', 'late'];
    for (const record of attendanceRecords) {
      if (!record.studentId || !record.status) {
        return res.status(400).json({ error: 'Each attendance record must have studentId and status' });
      }
      
      if (!validStatuses.includes(record.status)) {
        return res.status(400).json({ error: `Invalid status: ${record.status}. Must be one of: ${validStatuses.join(', ')}` });
      }
    }

    // Create attendance document ID using new format: academicYear_classId_date
    const attendanceDocId = `${academicYear}_${classId}_${date}`;
    const attendanceRef = db.collection('attendance').doc(attendanceDocId);
    
    // Get current timestamp for use in array records
    const currentTimestamp = admin.firestore.Timestamp.now();
    
    const attendanceData = {
      academicYear: academicYear,
      classId: classId,
      className: accessResult.classData.name,
      date: date,
      teacherUID: decodedToken.uid,
      records: attendanceRecords.map(record => ({
        studentId: record.studentId,
        enrollmentId: record.enrollmentId || `${academicYear}_${record.studentId}`, // fallback for enrollment ID
        studentName: record.studentName || '',
        status: record.status,
        notes: record.notes || '',
        recordedAt: currentTimestamp // Use regular timestamp instead of FieldValue.serverTimestamp() in array
      })),
      totalStudents: attendanceRecords.length,
      presentCount: attendanceRecords.filter(r => r.status === 'present').length,
      absentCount: attendanceRecords.filter(r => r.status === 'absent').length,
      lateCount: attendanceRecords.filter(r => r.status === 'late').length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: decodedToken.uid
    };

    // Check if attendance already exists for this date
    const existingDoc = await attendanceRef.get();
    if (existingDoc.exists) {
      // Update existing record
      attendanceData.createdAt = existingDoc.data().createdAt; // Preserve original creation date
      attendanceData.createdBy = existingDoc.data().createdBy; // Preserve original creator
    }

    await attendanceRef.set(attendanceData, { merge: true });

    console.log(`Attendance saved successfully for class ${classId} on ${date} by user ${decodedToken.uid}`);

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
      data: {
        attendanceId: attendanceDocId,
        academicYear,
        classId,
        date,
        totalStudents: attendanceData.totalStudents,
        presentCount: attendanceData.presentCount,
        absentCount: attendanceData.absentCount,
        lateCount: attendanceData.lateCount
      }
    });

  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Get Attendance Function - Centralized Approach
 * URL: /getAttendanceCentralized
 * Method: GET
 * Query: academicYear, classId, date (optional), startDate (optional), endDate (optional)
 */
exports.getAttendanceCentralized = functions.https.onRequest(async (req, res) => {
  try {
    setCorsHeaders(res);
    // FIX: correctly handle CORS preflight
    if (req.method === 'OPTIONS') {
      handleCorsOptions(req, res);
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate user
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Get parameters
    const { academicYear, classId, date, startDate, endDate, limit = 50 } = req.query;
    
    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year is required' });
    }
    
    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    // Verify class access
    const accessResult = await verifyClassAccess(academicYear, classId, decodedToken);
    if (!accessResult.isValid) {
      return res.status(403).json({ error: accessResult.error });
    }

    if (date) {
      // Get specific date attendance
      const attendanceDocId = `${academicYear}_${classId}_${date}`;
      const doc = await db.collection('attendance').doc(attendanceDocId).get();
      
      if (!doc.exists) {
        return res.status(200).json({
          success: true,
          message: 'No attendance record found for the specified date',
          data: null
        });
      }
      
      const attendanceData = doc.data();
      
      // For parents, filter to only their child's records
      if (accessResult.readOnly && decodedToken.role === 'parent') {
        // Get parent's children from enrollments
        const parentChildrenQuery = await db.collection('enrollments')
          .where('academicYear', '==', academicYear)
          .where('class', '==', classId)
          .where('studentInfo.parentUID', '==', decodedToken.uid)
          .get();
        
        const childStudentIds = [];
        parentChildrenQuery.forEach(doc => {
          const data = doc.data();
          childStudentIds.push(data.studentUID);
        });
        
        // Filter records to only include parent's children
        attendanceData.records = attendanceData.records.filter(record => 
          childStudentIds.includes(record.studentId)
        );
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ...attendanceData,
          id: doc.id
        }
      });
    } else {
      // Get range of attendance records
      let query = db.collection('attendance')
        .where('academicYear', '==', academicYear)
        .where('classId', '==', classId)
        .orderBy('date', 'desc');

      if (startDate) {
        query = query.where('date', '>=', startDate);
      }
      
      if (endDate) {
        query = query.where('date', '<=', endDate);
      }

      query = query.limit(parseInt(limit));

      const snapshot = await query.get();
      const attendanceRecords = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // For parents, filter to only their child's records
        if (accessResult.readOnly && decodedToken.role === 'parent') {
          // This would need to be implemented with a more complex query
          // For now, we'll return the full record and filter on client side
        }
        
        attendanceRecords.push({
          id: doc.id,
          ...data
        });
      });

      return res.status(200).json({
        success: true,
        data: attendanceRecords,
        hasFilters: !!(startDate || endDate),
        count: attendanceRecords.length
      });
    }

  } catch (error) {
    console.error('Error getting attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Get Student Attendance History - For Parent Portal
 * URL: /getStudentAttendanceHistory
 * Method: GET
 * Query: studentId, academicYear (optional), startDate (optional), endDate (optional)
 */
exports.getStudentAttendanceHistory = functions.https.onRequest(async (req, res) => {
  try {
    setCorsHeaders(res);
    // FIX: correctly handle CORS preflight
    if (req.method === 'OPTIONS') {
      handleCorsOptions(req, res);
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate user
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Get parameters
    const { studentId, academicYear, startDate, endDate, limit = 100 } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Verify parent has access to this student
    if (decodedToken.role === 'parent') {
      const studentEnrollmentQuery = await db.collection('enrollments')
        .where('studentUID', '==', studentId)
        .where('studentInfo.parentUID', '==', decodedToken.uid)
        .limit(1)
        .get();
      
      if (studentEnrollmentQuery.empty) {
        return res.status(403).json({ error: 'Access denied: Not authorized to view this student\'s attendance' });
      }
    }

    // Build query for attendance records containing this student
    let query = db.collection('attendance');

    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    query = query.orderBy('date', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const studentAttendanceRecords = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Find this student's record in the attendance records
      const studentRecord = data.records?.find(record => record.studentId === studentId);
      
      if (studentRecord) {
        studentAttendanceRecords.push({
          date: data.date,
          academicYear: data.academicYear,
          classId: data.classId,
          className: data.className,
          status: studentRecord.status,
          notes: studentRecord.notes,
          teacherUID: data.teacherUID
        });
      }
    });

    // Calculate statistics
    const stats = {
      totalDays: studentAttendanceRecords.length,
      presentDays: studentAttendanceRecords.filter(r => r.status === 'present').length,
      absentDays: studentAttendanceRecords.filter(r => r.status === 'absent').length,
      lateDays: studentAttendanceRecords.filter(r => r.status === 'late').length
    };
    
    stats.attendanceRate = stats.totalDays > 0 
      ? ((stats.presentDays + stats.lateDays) / stats.totalDays * 100).toFixed(1)
      : '0.0';

    return res.status(200).json({
      success: true,
      data: {
        studentId,
        records: studentAttendanceRecords,
        stats
      }
    });

  } catch (error) {
    console.error('Error getting student attendance history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Delete Attendance Record - Admin only
 * URL: /deleteAttendance
 * Method: DELETE
 * Body: { academicYear, classId, date }
 */
exports.deleteAttendance = functions.https.onRequest(async (req, res) => {
  try {
    setCorsHeaders(res);
    // FIX: correctly handle CORS preflight
    if (req.method === 'OPTIONS') {
      handleCorsOptions(req, res);
      return;
    }

    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate user and require admin role
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Check if user has admin privileges
    const userRole = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);
    if (!['admin', 'superadmin'].includes(userRole)) {
      return res.status(403).json({ error: 'Admin privileges required to delete attendance records' });
    }

    // Get parameters
    const { academicYear, classId, date } = req.body;
    
    if (!academicYear || !classId || !date) {
      return res.status(400).json({ error: 'Academic year, class ID, and date are required' });
    }

    // Delete the attendance record
    const attendanceDocId = `${academicYear}_${classId}_${date}`;
    const attendanceRef = db.collection('attendance').doc(attendanceDocId);
    
    const doc = await attendanceRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await attendanceRef.delete();

    console.log(`Attendance record deleted: ${attendanceDocId} by user ${decodedToken.uid}`);

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});
