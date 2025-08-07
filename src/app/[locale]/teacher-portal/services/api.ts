import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../../../../firebase';
import { 
  AttendanceRecord, 
  AttendanceData, 
  AttendanceStats,
  AttendanceResponse 
} from '../../admin/types/admin.types';

// Direct Firestore operations for teacher attendance management
export const teacherAttendanceAPI = {
  // Save attendance using centralized approach
  saveAttendanceCentralized: async (
    user: User, 
    academicYear: string,
    classId: string, 
    date: string, 
    records: AttendanceRecord[]
  ): Promise<AttendanceResponse> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Make API call to Firebase Function
      const response = await fetch('/api/saveAttendanceCentralized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          academicYear,
          classId,
          date,
          attendanceRecords: records
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save attendance');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error saving attendance:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save attendance',
        data: null
      };
    }
  },

  // Get attendance using centralized approach
  getAttendanceCentralized: async (
    user: User, 
    options: { 
      academicYear: string;
      classId: string;
      date?: string; 
      startDate?: string; 
      endDate?: string 
    }
  ): Promise<AttendanceResponse> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { academicYear, classId, date, startDate, endDate } = options;
      const queryParams = new URLSearchParams({
        academicYear,
        classId,
        ...(date && { date }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/getAttendanceCentralized?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get attendance');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Attendance retrieved successfully',
        data: data.data
      };
    } catch (error) {
      console.error('Error getting attendance:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get attendance',
        data: null
      };
    }
  },

  // Legacy methods for backward compatibility
  // Save attendance for a specific enrollment and date (OLD METHOD)
  saveAttendance: async (
    user: User, 
    enrollmentId: string, 
    date: string, 
    records: AttendanceRecord[]
  ): Promise<AttendanceResponse> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔐 Saving attendance for user:', user.email, 'UID:', user.uid);

      // Get user's custom claims to verify teacher role
      const token = await user.getIdTokenResult();
      const userRole = token.claims.role as string;
      
      console.log('👤 User role from token:', userRole);
      console.log('🎟️ All custom claims:', token.claims);
      
      if (!userRole || !['teacher', 'admin', 'superadmin'].includes(userRole)) {
        console.error('❌ Access denied. User role:', userRole);
        throw new Error(`Access denied: Invalid user role (${userRole}). User needs teacher, admin, or superadmin role.`);
      }

      console.log('✅ Role verification passed');

      // Create attendance document reference
      const attendanceRef = doc(db, 'enrollments', enrollmentId, 'attendance', date);
      
      console.log('📋 Saving to path:', `enrollments/${enrollmentId}/attendance/${date}`);

      // Prepare attendance data with all required fields
      const attendanceDataToSave = {
        date,
        enrollmentId,
        academicYear: '2024-2025', // This should come from enrollment data
        className: 'TBD', // This should come from enrollment data
        teacherUID: user.uid,
        records,
        totalStudents: records.length,
        presentCount: records.filter(r => r.status === 'present').length,
        absentCount: records.filter(r => r.status === 'absent').length,
        lateCount: records.filter(r => r.status === 'late').length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid
      };

      console.log('💾 Attendance data to save:', attendanceDataToSave);

      // Save to Firestore
      await setDoc(attendanceRef, attendanceDataToSave);

      console.log('✅ Attendance saved successfully to Firestore');

      return {
        success: true,
        message: 'Attendance saved successfully',
        data: attendanceDataToSave as AttendanceData
      };
    } catch (error) {
      console.error('❌ Error saving attendance:', error);
      
      // Provide specific error messages for common issues
      const firebaseError = error as any;
      if (firebaseError?.code === 'permission-denied') {
        return {
          success: false,
          message: 'Permission denied: Please ensure you have the correct role and Firestore rules are properly configured.',
          data: null
        };
      }
      
      if (firebaseError?.code === 'unauthenticated') {
        return {
          success: false,
          message: 'Authentication required: Please log in again.',
          data: null
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save attendance',
        data: null
      };
    }
  },

  // Get attendance for a specific enrollment and date
  getAttendance: async (
    user: User, 
    enrollmentId: string, 
    options: { date?: string; startDate?: string; endDate?: string } = {}
  ): Promise<AttendanceResponse> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { date } = options;

      if (date) {
        // Get attendance for specific date
        const attendanceRef = doc(db, 'enrollments', enrollmentId, 'attendance', date);
        const attendanceSnap = await getDoc(attendanceRef);

        if (attendanceSnap.exists()) {
          const data = attendanceSnap.data() as AttendanceData;
          return {
            success: true,
            message: 'Attendance data retrieved successfully',
            data
          };
        } else {
          return {
            success: true,
            message: 'No attendance data found for this date',
            data: null
          };
        }
      } else {
        // Get all attendance records for the enrollment
        const attendanceCollection = collection(db, 'enrollments', enrollmentId, 'attendance');
        const attendanceQuery = query(attendanceCollection, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(attendanceQuery);

        const attendanceRecords: AttendanceData[] = [];
        querySnapshot.forEach((doc) => {
          attendanceRecords.push({ id: doc.id, ...doc.data() } as AttendanceData);
        });

        return {
          success: true,
          message: 'Attendance records retrieved successfully',
          data: attendanceRecords
        };
      }
    } catch (error) {
      console.error('Error getting attendance:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get attendance',
        data: null
      };
    }
  },

  // Get attendance statistics for an enrollment
  getAttendanceStats: async (
    user: User, 
    enrollmentId: string, 
    options: { startDate?: string; endDate?: string } = {}
  ): Promise<AttendanceResponse> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const attendanceCollection = collection(db, 'enrollments', enrollmentId, 'attendance');
      let attendanceQuery = query(attendanceCollection, orderBy('date', 'asc'));

      // Add date filters if provided
      if (options.startDate && options.endDate) {
        attendanceQuery = query(
          attendanceCollection,
          where('date', '>=', options.startDate),
          where('date', '<=', options.endDate),
          orderBy('date', 'asc')
        );
      }

      const querySnapshot = await getDocs(attendanceQuery);
      const attendanceRecords: AttendanceData[] = [];
      
      querySnapshot.forEach((doc) => {
        attendanceRecords.push({ id: doc.id, ...doc.data() } as AttendanceData);
      });

      // Calculate statistics
      const stats: AttendanceStats = {
        enrollmentId,
        totalDays: attendanceRecords.length,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        overallAttendanceRate: '0%',
        studentStats: [],
        dateRange: {
          startDate: options.startDate || '',
          endDate: options.endDate || ''
        }
      };

      // Calculate stats from records
      attendanceRecords.forEach((record) => {
        record.records?.forEach((studentRecord) => {
          switch (studentRecord.status) {
            case 'present':
              stats.totalPresent++;
              break;
            case 'absent':
              stats.totalAbsent++;
              break;  
            case 'late':
              stats.totalLate++;
              break;
          }
        });
      });

      // Calculate attendance rate
      const totalRecords = stats.totalPresent + stats.totalAbsent + stats.totalLate;
      if (totalRecords > 0) {
        const rate = Math.round(((stats.totalPresent + stats.totalLate) / totalRecords) * 100);
        stats.overallAttendanceRate = `${rate}%`;
      }

      return {
        success: true,
        message: 'Attendance statistics calculated successfully',
        data: stats
      };
    } catch (error) {
      console.error('Error getting attendance stats:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get attendance statistics',
        data: null
      };
    }
  }
};

// Utility functions for attendance validation and error handling
export const handleTeacherAPIError = (error: unknown, locale: string = 'en-US'): string => {
  if (error instanceof Error) {
    // Handle specific Firebase errors
    if (error.message.includes('permission-denied')) {
      return locale === 'ar-SA' 
        ? 'ليس لديك الصلاحية للوصول لهذه البيانات'
        : 'You do not have permission to access this data';
    }
    
    if (error.message.includes('not-found')) {
      return locale === 'ar-SA'
        ? 'لم يتم العثور على البيانات المطلوبة'
        : 'The requested data was not found';
    }
    
    if (error.message.includes('unavailable')) {
      return locale === 'ar-SA'
        ? 'الخدمة غير متاحة مؤقتاً'
        : 'Service temporarily unavailable';
    }

    if (error.message.includes('User not authenticated')) {
      return locale === 'ar-SA'
        ? 'يجب تسجيل الدخول أولاً'
        : 'Please log in to continue';
    }

    if (error.message.includes('Access denied')) {
      return locale === 'ar-SA'
        ? 'ليس لديك الصلاحية المطلوبة'
        : 'Access denied: Insufficient permissions';
    }

    // Return the original error message if it's user-friendly
    return error.message;
  }
  
  // Generic error message
  return locale === 'ar-SA'
    ? 'حدث خطأ غير متوقع'
    : 'An unexpected error occurred';
};

// Attendance validation utilities
export const attendanceUtils = {
  // Validate attendance records before saving
  validateAttendanceRecords: (records: AttendanceRecord[], locale: string = 'en-US') => {
    const errors: string[] = [];
    
    if (!records || records.length === 0) {
      errors.push(
        locale === 'ar-SA' 
          ? 'يجب إدخال سجلات الحضور' 
          : 'Attendance records are required'
      );
    }

    records.forEach((record, index) => {
      if (!record.studentId || record.studentId.trim() === '') {
        errors.push(
          locale === 'ar-SA'
            ? `معرف الطالب مطلوب للسجل ${index + 1}`
            : `Student ID is required for record ${index + 1}`
        );
      }

      if (!record.studentName || record.studentName.trim() === '') {
        errors.push(
          locale === 'ar-SA'
            ? `اسم الطالب مطلوب للسجل ${index + 1}`
            : `Student name is required for record ${index + 1}`
        );
      }

      if (!['present', 'absent', 'late'].includes(record.status)) {
        errors.push(
          locale === 'ar-SA'
            ? `حالة الحضور غير صحيحة للطالب ${record.studentName}`
            : `Invalid attendance status for student ${record.studentName}`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate attendance date
  isValidAttendanceDate: (date: string, locale: string = 'en-US') => {
    const attendanceDate = new Date(date);
    const today = new Date();
    const maxPastDays = 30; // Allow attendance for up to 30 days ago
    
    // Check if date is valid
    if (isNaN(attendanceDate.getTime())) {
      return {
        isValid: false,
        error: locale === 'ar-SA' ? 'تاريخ غير صحيح' : 'Invalid date'
      };
    }

    // Check if date is not in future
    if (attendanceDate > today) {
      return {
        isValid: false,
        error: locale === 'ar-SA' 
          ? 'لا يمكن تسجيل الحضور لتاريخ في المستقبل'
          : 'Cannot record attendance for future dates'
      };
    }

    // Check if date is not too far in the past
    const daysDiff = Math.floor((today.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxPastDays) {
      return {
        isValid: false,
        error: locale === 'ar-SA'
          ? `لا يمكن تسجيل الحضور لتاريخ أقدم من ${maxPastDays} يوم`
          : `Cannot record attendance for dates older than ${maxPastDays} days`
      };
    }

    return { isValid: true };
  },

  // Format date for display
  formatDateForDisplay: (date: string, locale: string = 'en-US') => {
    const dateObj = new Date(date);
    if (locale === 'ar-SA') {
      return dateObj.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    } else {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric', 
        weekday: 'long'
      });
    }
  }
};
