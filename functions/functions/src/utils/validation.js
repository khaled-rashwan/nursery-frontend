// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phoneNumber) => {
  // International format validation
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

const validateStudentData = (studentData) => {
  const errors = [];
  
  if (!studentData.fullName || studentData.fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }
  
  if (!studentData.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(studentData.dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    if (age < 2 || age > 6) {
      errors.push('Student age must be between 2 and 6 years');
    }
  }
  
  if (!studentData.gender || !['Male', 'Female'].includes(studentData.gender)) {
    errors.push('Gender must be either Male or Female');
  }
  
  if (!studentData.parentUID || studentData.parentUID.trim().length === 0) {
    errors.push('Parent UID is required');
  }
  
  return errors;
};

const validateEnrollmentData = (enrollmentData) => {
  const errors = [];
  
  if (!enrollmentData.studentUID || enrollmentData.studentUID.trim().length === 0) {
    errors.push('Student UID is required');
  }
  
  if (!enrollmentData.academicYear || !enrollmentData.academicYear.match(/^\d{4}-\d{4}$/)) {
    errors.push('Academic year must be in format YYYY-YYYY (e.g., 2025-2026)');
  } else {
    // Validate that the academic year makes sense (not too far in past/future)
    const startYear = parseInt(enrollmentData.academicYear.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (startYear < currentYear - 5 || startYear > currentYear + 5) {
      errors.push('Academic year seems invalid (too far in past or future)');
    }
  }
  
  if (!enrollmentData.class || enrollmentData.class.trim().length === 0) {
    errors.push('Class is required');
  }
  // Removed hardcoded class validation - classes will be validated against database in the main function
  
  if (!enrollmentData.teacherUID || enrollmentData.teacherUID.trim().length === 0) {
    errors.push('Teacher UID is required');
  }
  
  const validStatuses = ['enrolled', 'withdrawn', 'graduated', 'pending'];
  if (enrollmentData.status && !validStatuses.includes(enrollmentData.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Validate notes if provided (optional field)
  if (enrollmentData.notes && enrollmentData.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }
  
  // Validate previousClass if provided (optional field) - removed hardcoded validation
  // previousClass can be any string as it might be from external sources
  
  return errors;
};

const validateAttendanceData = (attendanceData) => {
  const errors = [];
  
  if (!attendanceData.enrollmentId || attendanceData.enrollmentId.trim().length === 0) {
    errors.push('Enrollment ID is required');
  }
  
  if (!attendanceData.date) {
    errors.push('Date is required');
  } else {
    const attendanceDate = new Date(attendanceData.date);
    if (isNaN(attendanceDate.getTime())) {
      errors.push('Invalid date format');
    } else {
      const today = new Date();
      if (attendanceDate > today) {
        errors.push('Cannot record attendance for future dates');
      }
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      if (attendanceDate < oneYearAgo) {
        errors.push('Cannot record attendance for dates older than one year');
      }
    }
  }
  
  if (!attendanceData.records || !Array.isArray(attendanceData.records)) {
    errors.push('Attendance records must be an array');
  } else if (attendanceData.records.length === 0) {
    errors.push('At least one attendance record is required');
  } else {
    const validStatuses = ['present', 'absent', 'late'];
    attendanceData.records.forEach((record, index) => {
      if (!record.studentId || record.studentId.trim().length === 0) {
        errors.push(`Record ${index + 1}: Student ID is required`);
      }
      
      if (!record.status || !validStatuses.includes(record.status)) {
        errors.push(`Record ${index + 1}: Status must be one of: ${validStatuses.join(', ')}`);
      }
      
      if (record.notes && record.notes.length > 500) {
        errors.push(`Record ${index + 1}: Notes cannot exceed 500 characters`);
      }
    });
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePhoneNumber,
  validateStudentData,
  validateEnrollmentData,
  validateAttendanceData
};
