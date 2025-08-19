const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireRole } = require('../utils/auth');
const { validateAttendanceData } = require('../utils/validation');

const db = admin.firestore();

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
        return { isValid: false, error: "Teachers can only manage attendance for their assigned classes" };
      }
    }

    // Parents have read-only access if their child is in the class
    if (userRole === "parent") {
      // We'll check parent access when retrieving attendance records
      return { isValid: true, classData: { ...classData, id: classDoc.id }, readOnly: true };
    }

    return { isValid: false, error: "Insufficient permissions" };
  } catch (error) {
    console.error('Error verifying enrollment access:', error);
    return { isValid: false, error: 'Failed to verify enrollment access' };
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

// Create or update attendance record
exports.saveAttendance = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return handleCorsOptions(res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Validate required fields
    const { enrollmentId, date, attendanceRecords } = req.body;
    if (!enrollmentId) {
      return res.status(400).json({ error: "Enrollment ID is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ error: "Attendance records are required" });
    }

    // Validate date
    const dateValidation = validateAttendanceDate(date);
    if (!dateValidation.isValid) {
      return res.status(400).json({ error: dateValidation.error });
    }

    // Get enrollment document
    const enrollmentDoc = await db.collection("enrollments").doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    const enrollmentData = enrollmentDoc.data();
    const classId = enrollmentData.classId;
    const academicYear = enrollmentData.academicYear;

    // Verify class access
    const accessResult = await verifyClassAccess(academicYear, classId, decodedToken);
    if (!accessResult.isValid) {
      return res.status(403).json({ error: accessResult.error });
    }
    if (accessResult.readOnly) {
      return res.status(403).json({ error: "Read-only access: Cannot modify attendance records" });
    }

    // Validate attendance records
    const validStatuses = ["present", "absent", "late"];
    for (const record of attendanceRecords) {
      if (!record.studentId || !record.status) {
        return res.status(400).json({ error: "Each attendance record must have studentId and status" });
      }
      if (!validStatuses.includes(record.status)) {
        return res.status(400).json({ error: `Invalid status: ${record.status}. Must be one of: ${validStatuses.join(", ")}` });
      }
    }

    // Use batch write for atomicity
    const batch = db.batch();
    const attendanceRef = db.collection("enrollments").doc(enrollmentId).collection("attendance").doc(date);
    const attendanceData = {
      date: date,
      enrollmentId: enrollmentId,
      academicYear: academicYear,
      classId: classId,
      teacherUID: decodedToken.uid,
      records: attendanceRecords.map(record => ({
        studentId: record.studentId,
        studentName: record.studentName || "",
        status: record.status,
        notes: record.notes || "",
        recordedAt: admin.firestore.FieldValue.serverTimestamp()
      })),
      totalStudents: attendanceRecords.length,
      presentCount: attendanceRecords.filter(r => r.status === "present").length,
      absentCount: attendanceRecords.filter(r => r.status === "absent").length,
      lateCount: attendanceRecords.filter(r => r.status === "late").length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: decodedToken.uid
    };

    // Check if attendance already exists for this date
    const existingDoc = await attendanceRef.get();
    if (existingDoc.exists) {
      attendanceData.createdAt = existingDoc.data().createdAt;
      attendanceData.createdBy = existingDoc.data().createdBy;
    }

    batch.set(attendanceRef, attendanceData, { merge: true });
    await batch.commit();

    console.log(`Attendance saved successfully for enrollment ${enrollmentId} on ${date} by user ${decodedToken.uid}`);

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      data: {
        enrollmentId,
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

// Get attendance records for a specific enrollment
exports.getAttendance = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return handleCorsOptions(res);
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Get parameters
    const { enrollmentId, date, startDate, endDate, limit = 50 } = req.query;
    
    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' });
    }

    // Verify enrollment access
    const accessResult = await verifyEnrollmentAccess(enrollmentId, decodedToken);
    if (!accessResult.isValid) {
      return res.status(403).json({ error: accessResult.error });
    }

    let query = db.collection('enrollments').doc(enrollmentId).collection('attendance');

    // Apply filters
    if (date) {
      // Get specific date
      const doc = await query.doc(date).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Attendance record not found for the specified date' });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ...doc.data(),
          id: doc.id
        }
      });
    }

    // Date range query
    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    // Order by date (most recent first) and limit
    query = query.orderBy('date', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const attendanceRecords = [];

    snapshot.forEach(doc => {
      attendanceRecords.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Retrieved ${attendanceRecords.length} attendance records for enrollment ${enrollmentId}`);

    res.status(200).json({
      success: true,
      data: attendanceRecords,
      meta: {
        count: attendanceRecords.length,
        enrollmentId,
        hasFilters: !!(startDate || endDate)
      }
    });

  } catch (error) {
    console.error('Error getting attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get attendance statistics for an enrollment
exports.getAttendanceStats = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return handleCorsOptions(res);
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Get parameters
    const { enrollmentId, startDate, endDate } = req.query;
    
    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' });
    }

    // Verify enrollment access
    const accessResult = await verifyEnrollmentAccess(enrollmentId, decodedToken);
    if (!accessResult.isValid) {
      return res.status(403).json({ error: accessResult.error });
    }

    let query = db.collection('enrollments').doc(enrollmentId).collection('attendance');

    // Apply date filters
    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    const snapshot = await query.get();
    
    let totalDays = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let studentStats = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      totalDays++;
      totalPresent += data.presentCount || 0;
      totalAbsent += data.absentCount || 0;
      totalLate += data.lateCount || 0;

      // Calculate per-student statistics
      if (data.records && Array.isArray(data.records)) {
        data.records.forEach(record => {
          if (!studentStats[record.studentId]) {
            studentStats[record.studentId] = {
              studentId: record.studentId,
              studentName: record.studentName || '',
              present: 0,
              absent: 0,
              late: 0,
              total: 0
            };
          }
          
          studentStats[record.studentId][record.status]++;
          studentStats[record.studentId].total++;
        });
      }
    });

    // Calculate attendance percentages for each student
    const studentStatsArray = Object.values(studentStats).map(stats => ({
      ...stats,
      attendanceRate: stats.total > 0 ? ((stats.present + stats.late) / stats.total * 100).toFixed(1) : '0.0'
    }));

    const stats = {
      enrollmentId,
      totalDays,
      totalPresent,
      totalAbsent,
      totalLate,
      overallAttendanceRate: totalDays > 0 ? ((totalPresent + totalLate) / (totalPresent + totalAbsent + totalLate) * 100).toFixed(1) : '0.0',
      studentStats: studentStatsArray,
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      }
    };

    console.log(`Generated attendance statistics for enrollment ${enrollmentId}`);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting attendance statistics:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Delete attendance record
exports.deleteAttendance = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return handleCorsOptions(res);
  }

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authResult = await authenticate(req, res);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ error: authResult.error.message });
    }
    const { decodedToken } = authResult;

    // Only admin and superadmin can delete attendance records
    const roleCheck = requireRole(decodedToken, ['admin', 'superadmin']);
    if (roleCheck.error) {
      return res.status(roleCheck.error.status).json({ error: roleCheck.error.message });
    }

    // Get parameters
    const { enrollmentId, date } = req.method === 'DELETE' ? req.query : req.body;
    
    if (!enrollmentId || !date) {
      return res.status(400).json({ error: 'Enrollment ID and date are required' });
    }

    // Verify enrollment exists
    const accessResult = await verifyEnrollmentAccess(enrollmentId, decodedToken);
    if (!accessResult.isValid) {
      return res.status(403).json({ error: accessResult.error });
    }

    // Delete attendance record
    const attendanceRef = db.collection('enrollments').doc(enrollmentId).collection('attendance').doc(date);
    const doc = await attendanceRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await attendanceRef.delete();

    console.log(`Attendance record deleted for enrollment ${enrollmentId} on ${date} by user ${decodedToken.uid}`);

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: {
        enrollmentId,
        date,
        deletedBy: decodedToken.uid,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});
