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
const userTriggers = require('./src/triggers/userTriggers');
const manageMessages = require('./src/messages/manageMessages');
const { manageReportCards } = require('./src/reportCards/reportCardCrud');

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
exports.getChildrenWithEnrollments = require('./src/students/getChildrenWithEnrollments').getChildrenWithEnrollments;

// Export Enrollment Management Functions
exports.createEnrollment = enrollmentCrud.createEnrollment;
exports.listEnrollments = enrollmentCrud.listEnrollments;
exports.getEnrollment = enrollmentCrud.getEnrollment;
exports.updateEnrollment = enrollmentCrud.updateEnrollment;
exports.deleteEnrollment = enrollmentCrud.deleteEnrollment;
exports.getEnrollmentsByYear = enrollmentCrud.getEnrollmentsByYear;
exports.getEnrollmentsByClass = require('./src/enrollments/getEnrollmentsByClass').getEnrollmentsByClass;

// Export Class Management Functions
exports.manageClasses = classCrud.manageClasses;
exports.getEnrollmentStats = enrollmentCrud.getEnrollmentStats;

// Export Class Teacher Assignment Functions
const classTeacherAssignments = require('./src/classes/classTeacherAssignments');
exports.manageClassTeacherAssignments = classTeacherAssignments.manageClassTeacherAssignments;

// Export Teacher Management Functions
const teacherCrud = require('./src/teachers/teacherCrud');
const teacherCrudNew = require('./src/teachers/teacherCrudNew');
exports.manageTeachers = teacherCrud.manageTeachers; // Keep old for backward compatibility
exports.manageTeachersNew = teacherCrudNew.manageTeachers; // New implementation

// Export Homework Management Functions
const homeworkCrud = require('./src/homework/homeworkCrud');
exports.createHomework = homeworkCrud.createHomework;
exports.getHomework = homeworkCrud.getHomework;
exports.listHomeworkByClass = homeworkCrud.listHomeworkByClass;
exports.updateHomework = homeworkCrud.updateHomework;
exports.deleteHomework = homeworkCrud.deleteHomework;

// Export Homework Submission CRUDL (Parent/Teacher)
const homeworkSubmissionCrud = require('./src/homework/homeworkSubmissionCrud');
exports.submitHomework = homeworkSubmissionCrud.submitHomework;
exports.listHomeworkSubmissions = homeworkSubmissionCrud.listHomeworkSubmissions;
exports.getHomeworkSubmission = homeworkSubmissionCrud.getHomeworkSubmission;
exports.updateHomeworkSubmission = homeworkSubmissionCrud.updateHomeworkSubmission;
exports.deleteHomeworkSubmission = homeworkSubmissionCrud.deleteHomeworkSubmission;

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

// Export User Triggers (for teacher record management)
exports.onCustomClaimsChange = userTriggers.onCustomClaimsChange;

// Export Messaging Functions
exports.manageMessages = manageMessages.manageMessages;

// Export Announcement Functions
const { manageAnnouncements } = require('./src/announcements/manageAnnouncements');
exports.manageAnnouncements = manageAnnouncements;

// Export Report Card Functions
exports.manageReportCards = manageReportCards;

// Export Admissions Functions
const { submitAdmission, manageAdmissions } = require('./src/admissions/admissionCrud');
exports.submitAdmission = submitAdmission;
exports.manageAdmissions = manageAdmissions;

// Export Content Management Functions
const contentManagement = require('./src/content/contentManagement');
exports.getHomePageContent = contentManagement.getHomePageContent;
exports.saveHomePageContent = contentManagement.saveHomePageContent;
exports.getAboutUsPageContent = contentManagement.getAboutUsPageContent;
exports.saveAboutUsPageContent = contentManagement.saveAboutUsPageContent;
exports.getContactUsPageContent = contentManagement.getContactUsPageContent;
exports.saveContactUsPageContent = contentManagement.saveContactUsPageContent;
exports.getAcademicProgramPageContent = contentManagement.getAcademicProgramPageContent;
exports.saveAcademicProgramPageContent = contentManagement.saveAcademicProgramPageContent;
exports.getCareersPageContent = contentManagement.getCareersPageContent;
exports.saveCareersPageContent = contentManagement.saveCareersPageContent;

// Export Media Library API
const mediaApi = require('./src/media/index');
exports.mediaApi = mediaApi.mediaApi;
