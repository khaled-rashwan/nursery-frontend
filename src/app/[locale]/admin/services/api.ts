import { User } from 'firebase/auth';
import { 
  UserFormData, 
  StudentFormData, 
  ClassFormData, 
  EnrollmentFormData,
  AttendanceRecord
} from '../types/admin.types';

// Base configuration for API calls
const API_BASE_URL = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net`;

// Generic API call function
export const makeAPICall = async (
  endpoint: string,
  user: User,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown> | UserFormData | StudentFormData | ClassFormData | EnrollmentFormData;
    queryParams?: Record<string, string>;
  } = {}
) => {
  const { method = 'GET', body, queryParams } = options;
  
  const token = await user.getIdToken();
  if (!token) throw new Error('No authentication token');

  let url = `${API_BASE_URL}/${endpoint}`;
  
  // Add query parameters if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || `HTTP ${response.status}: Request failed`);
    } catch {
      throw new Error(`HTTP ${response.status}: ${errorText || 'Request failed'}`);
    }
  }

  return await response.json();
};

// Class management API functions
export const classAPI = {
  // Get all classes with optional filters
  list: async (user: User, filters?: { academicYear?: string; level?: string }) => {
    const queryParams: Record<string, string> = { operation: 'list' };
    if (filters?.academicYear) queryParams.academicYear = filters.academicYear;
    if (filters?.level) queryParams.level = filters.level;
    
    return makeAPICall('manageClasses', user, { queryParams });
  },

  // Get a single class by ID
  get: async (user: User, classId: string) => {
    return makeAPICall('manageClasses', user, {
      queryParams: { operation: 'get', classId }
    });
  },

  // Create a new class
  create: async (user: User, classData: ClassFormData) => {
    return makeAPICall('manageClasses', user, {
      method: 'POST',
      queryParams: { operation: 'create' },
      body: { classData }
    });
  },

  // Update an existing class
  update: async (user: User, classId: string, classData: Partial<ClassFormData>) => {
    return makeAPICall('manageClasses', user, {
      method: 'POST',
      queryParams: { operation: 'update' },
      body: { classId, classData }
    });
  },

  // Delete a class
  delete: async (user: User, classId: string) => {
    return makeAPICall('manageClasses', user, {
      method: 'POST',
      queryParams: { operation: 'delete' },
      body: { classId }
    });
  }
};

// User management API functions
export const userAPI = {
  // Get all users with optional role filter
  list: async (user: User, role?: string) => {
    const queryParams: Record<string, string> = {};
    if (role) queryParams.role = role;
    
    return makeAPICall('listUsers', user, { queryParams });
  },

  // Create a new user
  create: async (user: User, userData: UserFormData) => {
    return makeAPICall('createUser', user, {
      method: 'POST',
      body: userData
    });
  },

  // Update a user
  update: async (user: User, uid: string, userData: Partial<UserFormData>) => {
    return makeAPICall('editUser', user, {
      method: 'POST',
      body: { uid, userData }
    });
  },

  // Delete a user
  delete: async (user: User, uid: string) => {
    return makeAPICall('deleteUser', user, {
      method: 'POST',
      body: { uid }
    });
  }
};

// Enrollment management API functions
export const enrollmentAPI = {
  // Get all enrollments with optional filters
  list: async (user: User, options?: { limit?: number; includeDeleted?: boolean; academicYear?: string }) => {
    const queryParams: Record<string, string> = {};
    if (options?.limit) queryParams.limit = options.limit.toString();
    if (options?.includeDeleted !== undefined) queryParams.includeDeleted = options.includeDeleted.toString();
    if (options?.academicYear) queryParams.academicYear = options.academicYear;
    
    return makeAPICall('listEnrollments', user, { queryParams });
  },

  // Get a single enrollment by ID
  get: async (user: User, enrollmentId: string) => {
    return makeAPICall('getEnrollment', user, {
      queryParams: { enrollmentId }
    });
  },

  // Create a new enrollment
  create: async (user: User, enrollmentData: EnrollmentFormData) => {
    return makeAPICall('createEnrollment', user, {
      method: 'POST',
      body: { enrollmentData }
    });
  },

  // Update an existing enrollment
  update: async (user: User, enrollmentId: string, enrollmentData: Partial<EnrollmentFormData>) => {
    return makeAPICall('updateEnrollment', user, {
      method: 'POST',
      body: { enrollmentId, enrollmentData }
    });
  },

  // Delete an enrollment
  delete: async (user: User, enrollmentId: string) => {
    return makeAPICall('deleteEnrollment', user, {
      method: 'POST',
      body: { enrollmentId }
    });
  },

  // Get enrollment statistics
  getStats: async (user: User, options?: { academicYear?: string; includeDeleted?: boolean }) => {
    const queryParams: Record<string, string> = {};
    if (options?.academicYear) queryParams.academicYear = options.academicYear;
    if (options?.includeDeleted !== undefined) queryParams.includeDeleted = options.includeDeleted.toString();
    
    return makeAPICall('getEnrollmentStats', user, { queryParams });
  },

  // Get enrollments by academic year
  getByYear: async (user: User, academicYear: string) => {
    return makeAPICall('getEnrollmentsByYear', user, {
      queryParams: { academicYear }
    });
  }
};

// Attendance management API functions
export const attendanceAPI = {
  // Save attendance for a specific enrollment and date
  save: async (user: User, enrollmentId: string, date: string, attendanceRecords: AttendanceRecord[]) => {
    return makeAPICall('saveAttendance', user, {
      method: 'POST',
      body: { enrollmentId, date, attendanceRecords }
    });
  },

  // Get attendance records for an enrollment
  get: async (user: User, enrollmentId: string, options?: { 
    date?: string; 
    startDate?: string; 
    endDate?: string; 
    limit?: number; 
  }) => {
    const queryParams: Record<string, string> = { enrollmentId };
    if (options?.date) queryParams.date = options.date;
    if (options?.startDate) queryParams.startDate = options.startDate;
    if (options?.endDate) queryParams.endDate = options.endDate;
    if (options?.limit) queryParams.limit = options.limit.toString();
    
    return makeAPICall('getAttendance', user, { queryParams });
  },

  // Get attendance statistics for an enrollment
  getStats: async (user: User, enrollmentId: string, options?: { 
    startDate?: string; 
    endDate?: string; 
  }) => {
    const queryParams: Record<string, string> = { enrollmentId };
    if (options?.startDate) queryParams.startDate = options.startDate;
    if (options?.endDate) queryParams.endDate = options.endDate;
    
    return makeAPICall('getAttendanceStats', user, { queryParams });
  },

  // Delete attendance record (Admin only)
  delete: async (user: User, enrollmentId: string, date: string) => {
    return makeAPICall('deleteAttendance', user, {
      method: 'POST',
      body: { enrollmentId, date }
    });
  }
};

// Student management API functions
export const studentAPI = {
  // Get all students with optional filters
  list: async (user: User, options?: { limit?: number; includeDeleted?: boolean }) => {
    const queryParams: Record<string, string> = {};
    if (options?.limit) queryParams.limit = options.limit.toString();
    if (options?.includeDeleted !== undefined) queryParams.includeDeleted = options.includeDeleted.toString();
    
    return makeAPICall('listStudents', user, { queryParams });
  },

  // Get a single student by ID
  get: async (user: User, studentId: string) => {
    return makeAPICall('getStudent', user, {
      queryParams: { studentId }
    });
  },

  // Create a new student
  create: async (user: User, studentData: StudentFormData) => {
    return makeAPICall('createStudent', user, {
      method: 'POST',
      body: { studentData }
    });
  },

  // Update an existing student
  update: async (user: User, studentId: string, studentData: Partial<StudentFormData>) => {
    return makeAPICall('updateStudent', user, {
      method: 'POST',
      body: { studentId, studentData }
    });
  },

  // Delete a student
  delete: async (user: User, studentId: string) => {
    return makeAPICall('deleteStudent', user, {
      method: 'POST',
      body: { studentId }
    });
  }
};

// Helper function to handle API errors gracefully
export const handleAPIError = (error: unknown, locale: string = 'en-US') => {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      return locale === 'ar-SA' 
        ? 'فشل في الاتصال بالخادم. تحقق من الاتصال بالإنترنت.' 
        : 'Failed to connect to server. Please check your internet connection.';
    }
    return error.message;
  }
  
  return locale === 'ar-SA' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred';
};
