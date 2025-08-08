import { UserRole } from '../../../../utils/rolePermissions';

export interface SystemStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  pendingFees: number;
  monthlyRevenue: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
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
  class: string;
  teacherUID: string;
  status?: 'enrolled' | 'withdrawn' | 'graduated' | 'pending';
  notes?: string;
  previousClass?: string;
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
