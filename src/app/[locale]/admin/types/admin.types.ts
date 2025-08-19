import { UserRole } from '../../../../utils/rolePermissions';

export interface SystemStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_created' | 'user_updated' | 'user_deleted' | 
        'student_created' | 'student_updated' | 'student_deleted' |
        'class_created' | 'class_updated' | 'class_deleted' |
        'enrollment_created' | 'enrollment_updated' | 'enrollment_deleted' |
        'teacher_assigned' | 'teacher_unassigned' |
        'attendance_recorded' | 'system_backup' | 'login' | 'logout';
  description: string;
  timestamp: string;
  user: string;
  userDisplayName?: string;
  targetId?: string; // ID of the affected resource (student, class, etc.)
  targetName?: string; // Name of the affected resource
  metadata?: Record<string, unknown>; // Additional context data
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSignIn?: string;
  customClaims: {
    role: UserRole;
    [key: string]: unknown;
  };
}

export interface UserFormData {
  email: string;
  displayName: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
}

export interface UserClaims {
  role?: UserRole;
  [key: string]: unknown;
}

export interface ParentInfo {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: string;
}

export interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
  parentInfo: ParentInfo;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface StudentFormData {
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
}

export interface TeacherAssignment {
  teacherId: string;
  subjects: string[];
}

// New class teacher assignment interface for the junction table
export interface ClassTeacherAssignment {
  id: string;
  classId: string;
  teacherId: string;
  subjects: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  // Additional info populated by API
  teacherInfo?: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    role: string;
  };
  classInfo?: {
    id: string;
    name: string;
    level: string;
    academicYear: string;
  };
}

// Form data for creating/updating assignments
export interface ClassTeacherAssignmentFormData {
  classId: string;
  teacherId: string;
  subjects: string[];
  isActive?: boolean;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  teachers: TeacherAssignment[];
  capacity: number;
  currentEnrollment: number;
  schedule?: {
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  notes?: string;
}

export interface ClassFormData {
  name: string;
  level: string;
  academicYear: string;
  teachers: TeacherAssignment[];
  capacity: number;
  notes?: string;
  schedule?: {
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
  };
}

export interface Enrollment {
  id: string;
  studentUID: string;
  studentName?: string;
  academicYear: string;
  class: string;
  teacherUID: string;
  teacherName?: string;
  status: 'enrolled' | 'withdrawn' | 'graduated' | 'pending';
  enrollmentDate: string;
  notes?: string;
  previousClass?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface EnrollmentFormData {
  studentUID: string;
  academicYear: string;
  classId: string;              // NEW: Reference to classes collection document ID
  class?: string;               // OPTIONAL: Human-readable class name (auto-filled)
  status?: 'enrolled' | 'withdrawn' | 'graduated' | 'pending';
  notes?: string;
  previousClass?: string;
  // REMOVED: teacherUID - teacher assignments managed via teachers.classes[]
}

// Attendance Management Types
export interface AttendanceRecord {
  studentId: string;
  studentName?: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  recordedAt?: string;
}

export interface AttendanceData {
  id?: string;
  date: string;
  enrollmentId: string;
  academicYear: string;
  className: string;
  teacherUID: string;
  records: AttendanceRecord[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AttendanceStats {
  enrollmentId: string;
  totalDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  overallAttendanceRate: string;
  studentStats: StudentAttendanceStats[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: string;
}

// API Response types
export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceData | AttendanceData[] | AttendanceStats | null;
}
