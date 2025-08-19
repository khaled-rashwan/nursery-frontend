// Teacher Portal Types
// This file centralizes shared interfaces and types used across the teacher portal.
// Keeping types here prevents duplication and helps ensure consistency between components.

export interface FirestoreClass {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  teacherUID: string;
  teacherInfo: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    role: string;
  };
  capacity: number;
  notes: string;
}

export interface TeacherAssignedClass {
  classId: string;
  className: string;
  academicYear?: string;
  subjects: string[];
}

export interface Student {
  id: string; // Student UID
  name: string;
  nameEn: string;
  class: string;
  attendance: number;
  lastReport: string;
  parentContact: string;
  unreadMessages: number;
  profileImage: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  nameAr: string;
  level: 'Pre-KG' | 'KG1' | 'KG2';
  academicYear: string;
  teacherUID: string;
  teacherInfo: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    role: string;
  };
  capacity: number;
  notes: string;
  studentCount: number;
  students: Student[];
}

export interface EnrollmentStudent {
  id: string;
  studentUID: string;
  academicYear: string;
  classId?: string; // NEW: prefer classId for reliable joins
  class: string;
  teacherUID: string;
  status: 'enrolled' | 'withdrawn' | 'graduated' | 'pending';
  notes: string;
  studentInfo: {
    uid: string;
    fullName: string;
    dateOfBirth: string | null;
    gender: string;
    parentUID: string | null;
    parentInfo: {
      uid: string;
      email: string;
      displayName: string;
      phoneNumber?: string;
    } | null;
  };
  teacherInfo: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    role: string;
  };
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherUser {
  name: string;
  email: string;
  avatar: string;
  subject: string;
  experience: string;
}
