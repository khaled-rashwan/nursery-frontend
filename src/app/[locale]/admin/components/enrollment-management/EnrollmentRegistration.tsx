'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { studentAPI, userAPI, classAPI } from '../../services/api';

interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
  parentInfo: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    role: string;
  };
}

interface Teacher {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: string;
}

interface Class {
  id: string;
  name: string;
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
}

interface EnrollmentFormData {
  studentUID: string;
  academicYear: string;
  class: string;
  teacherUID: string;
  status: 'enrolled' | 'withdrawn' | 'graduated' | 'pending';
  notes: string;
  previousClass?: string;
}

interface EnrollmentRegistrationProps {
  locale: string;
  onSubmit: (data: EnrollmentFormData) => void;
  onCancel: () => void;
  loading: boolean;
  initialData?: Partial<EnrollmentFormData>;
  isEditing?: boolean;
}

export function EnrollmentRegistration({
  locale,
  onSubmit,
  onCancel,
  loading,
  initialData,
  isEditing = false
}: EnrollmentRegistrationProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    studentUID: initialData?.studentUID || '',
    academicYear: initialData?.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    class: initialData?.class || '',
    teacherUID: initialData?.teacherUID || '',
    status: initialData?.status || 'enrolled',
    notes: initialData?.notes || '',
    previousClass: initialData?.previousClass || ''
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { user } = useAuth();

  const validStatuses = ['enrolled', 'withdrawn', 'graduated', 'pending'];

  // Get class names for current academic year
  const getClassNamesForYear = (academicYear: string) => {
    return classes
      .filter(cls => cls.academicYear === academicYear)
      .map(cls => cls.name);
  };

  // Get all class names for previous class options
  const getAllClassNames = () => {
    const allClassNames = [...new Set(classes.map(cls => cls.name))];
    return [...allClassNames, 'External'];
  };

  // Generate academic year options (current year and next 2 years)
  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i <= 2; i++) {
      const startYear = currentYear + i;
      years.push(`${startYear}-${startYear + 1}`);
    }
    return years;
  };

  const academicYears = generateAcademicYears();

  // Fetch students, teachers, and classes
  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoadingData(true);

    try {
      // Fetch students
      const studentsData = await studentAPI.list(user, { limit: 100 });
      setStudents(studentsData.students || []);

      // Find selected student if editing
      if (initialData?.studentUID) {
        const student = studentsData.students.find((s: Student) => s.id === initialData.studentUID);
        setSelectedStudent(student || null);
      }

      // Fetch teachers (users with teacher role)
      const usersData = await userAPI.list(user, 'teacher');
      const teacherUsers = usersData.users?.filter((user: { role: string }) => user.role === 'teacher') || [];
      setTeachers(teacherUsers);

      // Fetch classes
      const classesData = await classAPI.list(user);
      setClasses(classesData.classes || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors gracefully - you might want to show a user-friendly message
    } finally {
      setLoadingData(false);
    }
  }, [user, initialData?.studentUID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update selected student when studentUID changes
  useEffect(() => {
    if (formData.studentUID && students.length > 0) {
      const student = students.find(s => s.id === formData.studentUID);
      setSelectedStudent(student || null);
    } else {
      setSelectedStudent(null);
    }
  }, [formData.studentUID, students]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentUID) {
      newErrors.studentUID = locale === 'ar-SA' ? 'يجب اختيار طالب' : 'Student is required';
    }

    if (!formData.academicYear || !formData.academicYear.match(/^\d{4}-\d{4}$/)) {
      newErrors.academicYear = locale === 'ar-SA' ? 'العام الدراسي مطلوب' : 'Academic year is required';
    }

    if (!formData.class) {
      newErrors.class = locale === 'ar-SA' ? 'يجب اختيار فصل' : 'Class is required';
    }

    if (!formData.teacherUID) {
      newErrors.teacherUID = locale === 'ar-SA' ? 'يجب اختيار معلم' : 'Teacher is required';
    }

    if (!formData.status) {
      newErrors.status = locale === 'ar-SA' ? 'يجب اختيار حالة' : 'Status is required';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = locale === 'ar-SA' ? 'الملاحظات لا يمكن أن تتجاوز 1000 حرف' : 'Notes cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof EnrollmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getStatusLabel = (status: string) => {
    if (locale === 'ar-SA') {
      switch (status) {
        case 'enrolled': return 'مسجل';
        case 'pending': return 'معلق';
        case 'withdrawn': return 'منسحب';
        case 'graduated': return 'متخرج';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{ 
        margin: '0 0 2rem 0', 
        color: '#2c3e50',
        fontSize: '1.5rem'
      }}>
        {isEditing 
          ? (locale === 'ar-SA' ? 'تعديل التسجيل' : 'Edit Enrollment')
          : (locale === 'ar-SA' ? 'تسجيل جديد' : 'New Enrollment')}
      </h3>

      {loadingData && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '1.1rem'
        }}>
          {locale === 'ar-SA' ? 'جاري تحميل البيانات...' : 'Loading data...'}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Student Selection */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'الطالب *' : 'Student *'}
            </label>
            <select
              value={formData.studentUID}
              onChange={(e) => handleInputChange('studentUID', e.target.value)}
              disabled={isEditing || loadingData}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.studentUID ? '#e74c3c' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                background: isEditing ? '#f8f9fa' : 'white'
              }}
            >
              <option value="">
                {locale === 'ar-SA' ? 'اختر طالب' : 'Select Student'}
              </option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} - {student.parentInfo?.displayName || 'Unknown Parent'}
                </option>
              ))}
            </select>
            {errors.studentUID && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.studentUID}
              </div>
            )}
            {selectedStudent && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                background: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  <strong>{locale === 'ar-SA' ? 'معلومات الطالب:' : 'Student Info:'}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  <div>{locale === 'ar-SA' ? 'الجنس:' : 'Gender:'} {selectedStudent.gender === 'Male' ? (locale === 'ar-SA' ? 'ذكر' : 'Male') : (locale === 'ar-SA' ? 'أنثى' : 'Female')}</div>
                  <div>{locale === 'ar-SA' ? 'تاريخ الميلاد:' : 'Date of Birth:'} {new Date(selectedStudent.dateOfBirth).toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US')}</div>
                  <div>{locale === 'ar-SA' ? 'ولي الأمر:' : 'Parent:'} {selectedStudent.parentInfo?.displayName} ({selectedStudent.parentInfo?.email})</div>
                </div>
              </div>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'العام الدراسي *' : 'Academic Year *'}
            </label>
            <select
              value={formData.academicYear}
              onChange={(e) => handleInputChange('academicYear', e.target.value)}
              disabled={isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.academicYear ? '#e74c3c' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                background: isEditing ? '#f8f9fa' : 'white'
              }}
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.academicYear && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.academicYear}
              </div>
            )}
          </div>

          {/* Class */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'الفصل *' : 'Class *'}
            </label>
            <select
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.class ? '#e74c3c' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">
                {locale === 'ar-SA' ? 'اختر فصل' : 'Select Class'}
              </option>
              {getClassNamesForYear(formData.academicYear).map((className: string) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
            {errors.class && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.class}
              </div>
            )}
          </div>

          {/* Teacher */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'المعلم *' : 'Teacher *'}
            </label>
            <select
              value={formData.teacherUID}
              onChange={(e) => handleInputChange('teacherUID', e.target.value)}
              disabled={loadingData}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.teacherUID ? '#e74c3c' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">
                {locale === 'ar-SA' ? 'اختر معلم' : 'Select Teacher'}
              </option>
              {teachers.map(teacher => (
                <option key={teacher.uid} value={teacher.uid}>
                  {teacher.displayName} ({teacher.email})
                </option>
              ))}
            </select>
            {errors.teacherUID && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.teacherUID}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'الحالة *' : 'Status *'}
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'enrolled' | 'withdrawn' | 'graduated' | 'pending')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.status ? '#e74c3c' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              {validStatuses.map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
            {errors.status && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.status}
              </div>
            )}
          </div>

          {/* Previous Class */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'الفصل السابق' : 'Previous Class'}
            </label>
            <select
              value={formData.previousClass || ''}
              onChange={(e) => handleInputChange('previousClass', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">
                {locale === 'ar-SA' ? 'لا يوجد / غير محدد' : 'None / Not specified'}
              </option>
              {getAllClassNames().map((className: string) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#2c3e50'
          }}>
            {locale === 'ar-SA' ? 'ملاحظات' : 'Notes'}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder={locale === 'ar-SA' ? 'أضف أي ملاحظات إضافية...' : 'Add any additional notes...'}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.notes ? '#e74c3c' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#666',
            marginTop: '0.25rem',
            textAlign: 'right'
          }}>
            {formData.notes.length}/1000
          </div>
          {errors.notes && (
            <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.notes}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          borderTop: '1px solid #eee',
          paddingTop: '1.5rem'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              border: '1px solid #ddd',
              background: 'white',
              color: '#666',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={loading || loadingData}
            style={{
              padding: '0.75rem 2rem',
              border: 'none',
              background: loading ? '#95a5a6' : '#27ae60',
              color: 'white',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {loading 
              ? (locale === 'ar-SA' ? 'جاري الحفظ...' : 'Saving...')
              : (isEditing 
                ? (locale === 'ar-SA' ? 'حفظ التغييرات' : 'Save Changes')
                : (locale === 'ar-SA' ? 'إنشاء التسجيل' : 'Create Enrollment'))}
          </button>
        </div>
      </form>
    </div>
  );
}
