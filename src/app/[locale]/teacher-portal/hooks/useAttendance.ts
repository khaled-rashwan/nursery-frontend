import { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  teacherAttendanceAPI, 
  handleTeacherAPIError, 
  attendanceUtils 
} from '../services/api';
import { 
  AttendanceRecord, 
  AttendanceData, 
  AttendanceStats 
} from '../../admin/types/admin.types';

interface UseAttendanceState {
  attendanceRecords: Record<string, AttendanceRecord[]>;
  currentAttendance: Record<string, string>; // studentId -> status
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSavedDate: string | null;
}

interface UseAttendanceActions {
  loadAttendance: (classId: string, academicYear: string, date: string) => Promise<void>;
  saveAttendance: (classId: string, academicYear: string, date: string, records: AttendanceRecord[]) => Promise<boolean>;
  updateStudentAttendance: (studentId: string, status: string) => void;
  clearCurrentAttendance: () => void;
  setCurrentAttendanceFromRecords: (records: AttendanceRecord[]) => void;
  getAttendanceStats: () => Promise<AttendanceStats | null>;
}

export interface UseAttendanceReturn extends UseAttendanceState, UseAttendanceActions {}

/**
 * Custom hook for managing attendance in teacher portal - Centralized approach
 * Provides state management and API integration for attendance operations
 */
export const useAttendance = (user: User | null, locale: string = 'en-US'): UseAttendanceReturn => {
  const [state, setState] = useState<UseAttendanceState>({
    attendanceRecords: {},
    currentAttendance: {},
    loading: false,
    saving: false,
    error: null,
    lastSavedDate: null
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<UseAttendanceState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Load attendance records for a specific date using centralized approach
  const loadAttendance = useCallback(async (classId: string, academicYear: string, date: string) => {
    if (!user) {
      updateState({ error: 'User not authenticated' });
      return;
    }

    updateState({ loading: true, error: null });

    try {
      const response = await teacherAttendanceAPI.getAttendanceCentralized(user, {
        classId,
        academicYear, 
        date
      });
      
      if (response.success && response.data) {
        const attendanceData = response.data as AttendanceData;
        
        // Update attendance records cache
        const recordsKey = `${academicYear}_${classId}_${date}`;
        setState(prevState => ({
          ...prevState,
          attendanceRecords: {
            ...prevState.attendanceRecords,
            [recordsKey]: attendanceData.records || []
          },
          loading: false
        }));

        // Set current attendance state
        const currentAttendance: Record<string, string> = {};
        attendanceData.records?.forEach(record => {
          currentAttendance[record.studentId] = record.status;
        });
        
        updateState({ currentAttendance });
      } else {
        // No attendance data for this date - this is normal
        setState(prevState => ({
          ...prevState,
          attendanceRecords: {
            ...prevState.attendanceRecords,
            [`${academicYear}_${classId}_${date}`]: []
          },
          currentAttendance: {},
          loading: false
        }));
      }
    } catch (error) {
      const errorMessage = handleTeacherAPIError(error, locale);
      updateState({ 
        error: errorMessage, 
        loading: false 
      });
      console.error('Error loading attendance:', error);
    }
  }, [user, locale, updateState]); // Removed state.attendanceRecords from dependencies

  // Save attendance records using centralized approach
  const saveAttendance = useCallback(async (
    classId: string,
    academicYear: string,
    date: string,
    records: AttendanceRecord[]
  ): Promise<boolean> => {
    if (!user) {
      updateState({ error: 'User not authenticated' });
      return false;
    }

    // Validate records before sending
    const validation = attendanceUtils.validateAttendanceRecords(records, locale);
    if (!validation.isValid) {
      updateState({ error: validation.errors.join(', ') });
      return false;
    }

    // Validate date
    const dateValidation = attendanceUtils.isValidAttendanceDate(date, locale);
    if (!dateValidation.isValid) {
      updateState({ error: dateValidation.error });
      return false;
    }

    updateState({ saving: true, error: null });

    try {
      const response = await teacherAttendanceAPI.saveAttendanceCentralized(
        user,
        academicYear,
        classId,
        date,
        records
      );
      
      if (response.success) {
        // Update local cache
        const recordsKey = `${academicYear}_${classId}_${date}`;
        setState(prevState => ({
          ...prevState,
          attendanceRecords: {
            ...prevState.attendanceRecords,
            [recordsKey]: records
          },
          saving: false,
          lastSavedDate: date,
          error: null
        }));

        console.log('Attendance saved successfully:', response.data);
        return true;
      } else {
        updateState({ 
          error: response.message || 'Failed to save attendance',
          saving: false 
        });
        return false;
      }
    } catch (error) {
      const errorMessage = handleTeacherAPIError(error, locale);
      updateState({ 
        error: errorMessage, 
        saving: false 
      });
      console.error('Error saving attendance:', error);
      return false;
    }
  }, [user, locale, updateState]);

  // Update individual student attendance
  const updateStudentAttendance = useCallback((studentId: string, status: string) => {
    setState(prevState => ({
      ...prevState,
      currentAttendance: {
        ...prevState.currentAttendance,
        [studentId]: status
      }
    }));
  }, []); // No dependencies needed since we use functional state update

  // Clear current attendance state
  const clearCurrentAttendance = useCallback(() => {
    updateState({ currentAttendance: {} });
  }, [updateState]);

  // Set current attendance from existing records
  const setCurrentAttendanceFromRecords = useCallback((records: AttendanceRecord[]) => {
    const currentAttendance: Record<string, string> = {};
    records.forEach(record => {
      currentAttendance[record.studentId] = record.status;
    });
    updateState({ currentAttendance });
  }, [updateState]);

  // Get attendance statistics (to be implemented with centralized approach)
  const getAttendanceStats = useCallback(async (): Promise<AttendanceStats | null> => {
    if (!user) {
      updateState({ error: 'User not authenticated' });
      return null;
    }

    updateState({ loading: true, error: null });

    try {
      // TODO: Implement centralized attendance stats API
      // For now, return null until the API is implemented
      console.warn('Attendance stats not yet implemented for centralized approach');
      
      updateState({ loading: false });
      return null;
    } catch (error) {
      const errorMessage = handleTeacherAPIError(error, locale);
      updateState({ 
        error: errorMessage, 
        loading: false 
      });
      console.error('Error loading attendance stats:', error);
      return null;
    }
  }, [user, locale, updateState]);

  return {
    // State
    attendanceRecords: state.attendanceRecords,
    currentAttendance: state.currentAttendance,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    lastSavedDate: state.lastSavedDate,
    
    // Actions
    loadAttendance,
    saveAttendance,
    updateStudentAttendance,
    clearCurrentAttendance,
    setCurrentAttendanceFromRecords,
    getAttendanceStats
  };
};
