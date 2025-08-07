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
  // Save attendance for a specific enrollment and date
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

      // Get user's custom claims to verify teacher role
      const token = await user.getIdTokenResult();
      const userRole = token.claims.role;
      
      if (!userRole || !['teacher', 'admin', 'superadmin'].includes(userRole)) {
        throw new Error('Access denied: Invalid user role');
      }

      // Create attendance document reference
      const attendanceRef = doc(db, 'enrollments', enrollmentId, 'attendance', date);
      
      // Prepare attendance data
      const attendanceData: AttendanceData = {
        date,
        enrollmentId,
        records,
        teacherUID: user.uid,
        teacherName: user.displayName || user.email || 'Unknown Teacher',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firestore
      await setDoc(attendanceRef, attendanceData);

      return {
        success: true,
        message: 'Attendance saved successfully',
        data: attendanceData
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
        totalDays: attendanceRecords.length,
        totalStudents: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        attendanceRate: 0,
        dateRange: {
          startDate: options.startDate || '',
          endDate: options.endDate || ''
        }
      };

      // Calculate stats from records
      attendanceRecords.forEach((record) => {
        record.records?.forEach((studentRecord) => {
          stats.totalStudents = Math.max(stats.totalStudents, record.records?.length || 0);
          
          switch (studentRecord.status) {
            case 'present':
              stats.presentCount++;
              break;
            case 'absent':
              stats.absentCount++;
              break;  
            case 'late':
              stats.lateCount++;
              break;
          }
        });
      });

      // Calculate attendance rate
      const totalRecords = stats.presentCount + stats.absentCount + stats.lateCount;
      if (totalRecords > 0) {
        stats.attendanceRate = Math.round(((stats.presentCount + stats.lateCount) / totalRecords) * 100);
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

// Teacher Portal Attendance API
export const teacherAttendanceAPI = {
  // Save attendance for teacher's class
  saveAttendance: async (
    user: User, 
    enrollmentId: string, 
    date: string, 
    attendanceRecords: AttendanceRecord[]
  ): Promise<{ success: boolean; message: string; data: any }> => {
    return makeTeacherAPICall('saveAttendance', user, {
      method: 'POST',
      body: { enrollmentId, date, attendanceRecords }
    });
  },

  // Get attendance records for teacher's class
  getAttendance: async (
    user: User, 
    enrollmentId: string, 
    options?: { 
      date?: string; 
      startDate?: string; 
      endDate?: string; 
      limit?: number; 
    }
  ): Promise<{ success: boolean; data: AttendanceData | AttendanceData[] }> => {
    const queryParams: Record<string, string> = { enrollmentId };
    if (options?.date) queryParams.date = options.date;
    if (options?.startDate) queryParams.startDate = options.startDate;
    if (options?.endDate) queryParams.endDate = options.endDate;
    if (options?.limit) queryParams.limit = options.limit.toString();
    
    return makeTeacherAPICall('getAttendance', user, { queryParams });
  },

  // Get attendance statistics for teacher's class
  getAttendanceStats: async (
    user: User, 
    enrollmentId: string, 
    options?: { 
      startDate?: string; 
      endDate?: string; 
    }
  ): Promise<{ success: boolean; data: AttendanceStats }> => {
    const queryParams: Record<string, string> = { enrollmentId };
    if (options?.startDate) queryParams.startDate = options.startDate;
    if (options?.endDate) queryParams.endDate = options.endDate;
    
    return makeTeacherAPICall('getAttendanceStats', user, { queryParams });
  }
};

// Helper function to handle API errors gracefully in teacher portal
export const handleTeacherAPIError = (error: unknown, locale: string = 'en-US') => {
  console.error('Teacher API Error:', error);
  
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      return locale === 'ar-SA' 
        ? 'فشل في الاتصال بالخادم. تحقق من الاتصال بالإنترنت.' 
        : 'Failed to connect to server. Please check your internet connection.';
    }
    
    // Handle specific teacher-related errors
    if (error.message.includes('Teachers can only manage attendance')) {
      return locale === 'ar-SA'
        ? 'يمكن للمعلمين إدارة الحضور لصفوفهم فقط'
        : 'Teachers can only manage attendance for their own classes';
    }
    
    if (error.message.includes('Cannot record attendance for future dates')) {
      return locale === 'ar-SA'
        ? 'لا يمكن تسجيل الحضور للتواريخ المستقبلية'
        : 'Cannot record attendance for future dates';
    }
    
    if (error.message.includes('Enrollment does not exist')) {
      return locale === 'ar-SA'
        ? 'التسجيل غير موجود'
        : 'Enrollment does not exist';
    }
    
    return error.message;
  }
  
  return locale === 'ar-SA' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred';
};

// Utility functions for attendance management
export const attendanceUtils = {
  // Calculate attendance statistics from records
  calculateStats: (records: AttendanceRecord[]) => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    
    return {
      total,
      present,
      absent,
      late,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0.0'
    };
  },

  // Validate attendance records before sending to API
  validateAttendanceRecords: (records: AttendanceRecord[], locale: string = 'en-US') => {
    const errors: string[] = [];
    
    if (!records || records.length === 0) {
      errors.push(
        locale === 'ar-SA' 
          ? 'يجب تسجيل حضور طالب واحد على الأقل'
          : 'At least one student attendance must be recorded'
      );
      return { isValid: false, errors };
    }

    const validStatuses = ['present', 'absent', 'late'];
    records.forEach((record, index) => {
      if (!record.studentId) {
        errors.push(
          locale === 'ar-SA'
            ? `الطالب ${index + 1}: معرف الطالب مطلوب`
            : `Student ${index + 1}: Student ID is required`
        );
      }
      
      if (!record.status || !validStatuses.includes(record.status)) {
        errors.push(
          locale === 'ar-SA'
            ? `الطالب ${index + 1}: حالة الحضور يجب أن تكون: حاضر، غائب، أو متأخر`
            : `Student ${index + 1}: Status must be: present, absent, or late`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format date for API calls
  formatDateForAPI: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  },

  // Check if date is valid for attendance recording
  isValidAttendanceDate: (date: Date | string, locale: string = 'en-US') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    if (isNaN(dateObj.getTime())) {
      return {
        isValid: false,
        error: locale === 'ar-SA' ? 'تاريخ غير صالح' : 'Invalid date'
      };
    }

    if (dateObj > today) {
      return {
        isValid: false,
        error: locale === 'ar-SA' 
          ? 'لا يمكن تسجيل الحضور للتواريخ المستقبلية'
          : 'Cannot record attendance for future dates'
      };
    }

    if (dateObj < oneYearAgo) {
      return {
        isValid: false,
        error: locale === 'ar-SA'
          ? 'لا يمكن تسجيل الحضور للتواريخ الأقدم من سنة'
          : 'Cannot record attendance for dates older than one year'
      };
    }

    return { isValid: true };
  }
};
