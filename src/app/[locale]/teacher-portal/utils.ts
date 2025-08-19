// utils.ts
// Shared utilities for Teacher Portal components. Keep UI-free logic here.

import { ClassInfo, EnrollmentStudent, FirestoreClass, Student } from './types';

export const getProfileImageByLevel = (level: string): string => {
  switch (level) {
    case 'Pre-KG':
      return '/prekg.avif';
    case 'KG1':
      return '/kg1.png';
    case 'KG2':
      return '/kg2.png';
    default:
      return '/kg1.png';
  }
};

// Convert Firestore class + enrollments to UI-friendly ClassInfo
export const convertFirestoreClassToClassInfo = (
  firestoreClass: FirestoreClass,
  enrollments: EnrollmentStudent[] = []
): ClassInfo => {
  const getArabicName = (name: string, level: string) => {
    const levelMap: Record<string, string> = {
      'Pre-KG': 'ما قبل الروضة',
      KG1: 'الروضة الأولى',
      KG2: 'الروضة الثانية'
    };
    const levelAr = levelMap[level] || level;
    const classLetter = name.split('-').pop() || '';
    return `${levelAr} - ${classLetter}`;
  };

  // Prefer enrollments matched by classId, fallback to class name
  const filteredEnrollments = enrollments.filter((e) => {
    if (e.classId) return e.classId === firestoreClass.id;
    return e.class === firestoreClass.name;
  });

  const students: Student[] = filteredEnrollments
    .filter((e) => e.status === 'enrolled' && !!e.studentInfo?.uid)
    .map((e) => {
      // Safely handle date conversion
      let lastReportDate = new Date().toISOString().split('T')[0]; // default to today
      if (e.updatedAt) {
        const date = new Date(e.updatedAt);
        if (!isNaN(date.getTime())) {
          lastReportDate = date.toISOString().split('T')[0];
        }
      }
      
      return {
        id: e.studentInfo!.uid,
        name: e.studentInfo!.fullName || 'Unknown Student',
        nameEn: e.studentInfo!.fullName || 'Unknown Student',
        class: firestoreClass.name,
        attendance: 95,
        lastReport: lastReportDate,
        parentContact: e.studentInfo!.parentInfo?.email || 'No contact',
        unreadMessages: 0,
        profileImage: getProfileImageByLevel(firestoreClass.level)
      };
    });

  return {
    id: firestoreClass.id,
    name: firestoreClass.name,
    nameAr: getArabicName(firestoreClass.name, firestoreClass.level),
    level: firestoreClass.level as 'Pre-KG' | 'KG1' | 'KG2',
    academicYear: firestoreClass.academicYear,
    teacherUID: firestoreClass.teacherUID,
    teacherInfo: firestoreClass.teacherInfo,
    capacity: firestoreClass.capacity,
    notes: firestoreClass.notes,
    studentCount: students.length,
    students
  };
};
