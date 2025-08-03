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

export interface Class {
  id: string;
  className: string;
  level: string;
  academicYear: string;
  teacherUID: string;
  teacherName?: string;
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
}

export interface ClassFormData {
  className: string;
  level: string;
  academicYear: string;
  teacherUID: string;
  capacity: number;
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
