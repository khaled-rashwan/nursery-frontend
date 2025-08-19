import { User } from 'firebase/auth';
import { activityAPI } from '../services/api';
import { RecentActivity } from '../types/admin.types';

export type ActivityType = RecentActivity['type'];

interface LogActivityParams {
  user: User;
  type: ActivityType;
  description: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Utility function to log activities across the application
 */
export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    await activityAPI.log(params.user, {
      type: params.type,
      description: params.description,
      targetId: params.targetId,
      targetName: params.targetName,
      metadata: params.metadata
    });
  } catch (error) {
    // Silently fail activity logging to not disrupt main operations
    console.error('Failed to log activity:', error);
  }
};

/**
 * Helper functions to generate standard activity descriptions
 */
export const ActivityDescriptions = {
  // User management activities
  userCreated: (userName: string) => `New user account created for ${userName}`,
  userUpdated: (userName: string) => `User account updated for ${userName}`,
  userDeleted: (userName: string) => `User account deleted for ${userName}`,

  // Student management activities
  studentCreated: (studentName: string) => `New student ${studentName} added to the system`,
  studentUpdated: (studentName: string) => `Student information updated for ${studentName}`,
  studentDeleted: (studentName: string) => `Student ${studentName} removed from the system`,

  // Class management activities
  classCreated: (className: string) => `New class ${className} created`,
  classUpdated: (className: string) => `Class ${className} information updated`,
  classDeleted: (className: string) => `Class ${className} deleted`,

  // Enrollment management activities
  enrollmentCreated: (studentName: string, className: string) => `Student ${studentName} enrolled in ${className}`,
  enrollmentUpdated: (studentName: string, className: string) => `Enrollment updated for ${studentName} in ${className}`,
  enrollmentDeleted: (studentName: string, className: string) => `Enrollment removed for ${studentName} from ${className}`,

  // Teacher management activities
  teacherAssigned: (teacherName: string, className: string, subjects?: string[]) => 
    `Teacher ${teacherName} assigned to ${className}${subjects ? ` for ${subjects.join(', ')}` : ''}`,
  teacherUnassigned: (teacherName: string, className: string) => 
    `Teacher ${teacherName} unassigned from ${className}`,

  // Attendance activities
  attendanceRecorded: (className: string, date: string) => 
    `Attendance recorded for ${className} on ${date}`,

  // System activities
  login: (userName: string) => `${userName} logged into the system`,
  logout: (userName: string) => `${userName} logged out of the system`,
  systemBackup: () => 'System backup completed successfully'
};

/**
 * Convenience functions for common activities
 */
export const ActivityLogger = {
  // User activities
  logUserCreated: (user: User, targetUserName: string, targetUserId?: string) =>
    logActivity({
      user,
      type: 'user_created',
      description: ActivityDescriptions.userCreated(targetUserName),
      targetId: targetUserId,
      targetName: targetUserName
    }),

  logUserUpdated: (user: User, targetUserName: string, targetUserId?: string) =>
    logActivity({
      user,
      type: 'user_updated',
      description: ActivityDescriptions.userUpdated(targetUserName),
      targetId: targetUserId,
      targetName: targetUserName
    }),

  logUserDeleted: (user: User, targetUserName: string, targetUserId?: string) =>
    logActivity({
      user,
      type: 'user_deleted',
      description: ActivityDescriptions.userDeleted(targetUserName),
      targetId: targetUserId,
      targetName: targetUserName
    }),

  // Student activities
  logStudentCreated: (user: User, studentName: string, studentId?: string) =>
    logActivity({
      user,
      type: 'student_created',
      description: ActivityDescriptions.studentCreated(studentName),
      targetId: studentId,
      targetName: studentName
    }),

  logStudentUpdated: (user: User, studentName: string, studentId?: string) =>
    logActivity({
      user,
      type: 'student_updated',
      description: ActivityDescriptions.studentUpdated(studentName),
      targetId: studentId,
      targetName: studentName
    }),

  logStudentDeleted: (user: User, studentName: string, studentId?: string) =>
    logActivity({
      user,
      type: 'student_deleted',
      description: ActivityDescriptions.studentDeleted(studentName),
      targetId: studentId,
      targetName: studentName
    }),

  // Class activities
  logClassCreated: (user: User, className: string, classId?: string) =>
    logActivity({
      user,
      type: 'class_created',
      description: ActivityDescriptions.classCreated(className),
      targetId: classId,
      targetName: className
    }),

  logClassUpdated: (user: User, className: string, classId?: string) =>
    logActivity({
      user,
      type: 'class_updated',
      description: ActivityDescriptions.classUpdated(className),
      targetId: classId,
      targetName: className
    }),

  logClassDeleted: (user: User, className: string, classId?: string) =>
    logActivity({
      user,
      type: 'class_deleted',
      description: ActivityDescriptions.classDeleted(className),
      targetId: classId,
      targetName: className
    }),

  // Enrollment activities
  logEnrollmentCreated: (user: User, studentName: string, className: string, enrollmentId?: string) =>
    logActivity({
      user,
      type: 'enrollment_created',
      description: ActivityDescriptions.enrollmentCreated(studentName, className),
      targetId: enrollmentId,
      targetName: `${studentName} - ${className}`
    }),

  logEnrollmentUpdated: (user: User, studentName: string, className: string, enrollmentId?: string) =>
    logActivity({
      user,
      type: 'enrollment_updated',
      description: ActivityDescriptions.enrollmentUpdated(studentName, className),
      targetId: enrollmentId,
      targetName: `${studentName} - ${className}`
    }),

  logEnrollmentDeleted: (user: User, studentName: string, className: string, enrollmentId?: string) =>
    logActivity({
      user,
      type: 'enrollment_deleted',
      description: ActivityDescriptions.enrollmentDeleted(studentName, className),
      targetId: enrollmentId,
      targetName: `${studentName} - ${className}`
    }),

  // Teacher assignment activities
  logTeacherAssigned: (user: User, teacherName: string, className: string, subjects?: string[], assignmentId?: string) =>
    logActivity({
      user,
      type: 'teacher_assigned',
      description: ActivityDescriptions.teacherAssigned(teacherName, className, subjects),
      targetId: assignmentId,
      targetName: `${teacherName} - ${className}`,
      metadata: { subjects }
    }),

  logTeacherUnassigned: (user: User, teacherName: string, className: string, assignmentId?: string) =>
    logActivity({
      user,
      type: 'teacher_unassigned',
      description: ActivityDescriptions.teacherUnassigned(teacherName, className),
      targetId: assignmentId,
      targetName: `${teacherName} - ${className}`
    }),

  // Attendance activities
  logAttendanceRecorded: (user: User, className: string, date: string, attendanceId?: string) =>
    logActivity({
      user,
      type: 'attendance_recorded',
      description: ActivityDescriptions.attendanceRecorded(className, date),
      targetId: attendanceId,
      targetName: className,
      metadata: { date }
    }),

  // System activities
  logLogin: (user: User) =>
    logActivity({
      user,
      type: 'login',
      description: ActivityDescriptions.login(user.displayName || user.email || 'Unknown User')
    }),

  logLogout: (user: User) =>
    logActivity({
      user,
      type: 'logout',
      description: ActivityDescriptions.logout(user.displayName || user.email || 'Unknown User')
    })
};
