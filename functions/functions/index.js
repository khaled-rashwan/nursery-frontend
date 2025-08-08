const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import modular functions
const userManagement = require('./src/auth/userManagement');
const studentCrud = require('./src/students/studentCrud');
const getChildrenByParentUID = require('./src/students/getChildrenByParentUID');
const enrollmentCrud = require('./src/enrollments/enrollmentCrud');
const classCrud = require('./src/classes/classCrud');
const attendanceCrud = require('./src/attendance/attendanceCrud');
const attendanceCrudNew = require('./src/attendance/attendanceCrudNew');

// Export User Management Functions
exports.listUsers = userManagement.listUsers;
exports.editUser = userManagement.editUser;
exports.createUser = userManagement.createUser;
exports.deleteUser = userManagement.deleteUser;

// Export Student Management Functions
exports.createStudent = studentCrud.createStudent;
exports.listStudents = studentCrud.listStudents;
exports.getStudent = studentCrud.getStudent;
exports.updateStudent = studentCrud.updateStudent;
exports.deleteStudent = studentCrud.deleteStudent;
exports.getChildrenByParentUID = getChildrenByParentUID.getChildrenByParentUID;

// Export Enrollment Management Functions
exports.createEnrollment = enrollmentCrud.createEnrollment;
exports.listEnrollments = enrollmentCrud.listEnrollments;
exports.getEnrollment = enrollmentCrud.getEnrollment;
exports.updateEnrollment = enrollmentCrud.updateEnrollment;
exports.deleteEnrollment = enrollmentCrud.deleteEnrollment;
exports.getEnrollmentsByYear = enrollmentCrud.getEnrollmentsByYear;

// Export Class Management Functions
exports.manageClasses = classCrud.manageClasses;
exports.getEnrollmentStats = enrollmentCrud.getEnrollmentStats;

// Export Teacher Management Functions
const teacherCrud = require('./src/teachers/teacherCrud');
exports.manageTeachers = teacherCrud.manageTeachers;

// Export Attendance Management Functions (Old system - for backward compatibility)
exports.saveAttendance = attendanceCrud.saveAttendance;
exports.getAttendance = attendanceCrud.getAttendance;
exports.getAttendanceStats = attendanceCrud.getAttendanceStats;
exports.deleteAttendance = attendanceCrud.deleteAttendance;

// Export New Centralized Attendance Management Functions
exports.saveAttendanceCentralized = attendanceCrudNew.saveAttendanceCentralized;
exports.getAttendanceCentralized = attendanceCrudNew.getAttendanceCentralized;
exports.getStudentAttendanceHistory = attendanceCrudNew.getStudentAttendanceHistory;
exports.deleteAttendanceCentralized = attendanceCrudNew.deleteAttendance;
