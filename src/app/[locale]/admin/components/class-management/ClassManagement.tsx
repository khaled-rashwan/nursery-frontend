'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { classAPI, userAPI, handleAPIError } from '../../services/api';
import { TeacherAssignment } from '../../types/admin.types';

interface Class {
  id: string;
  name: string;
  level: 'Pre-KG' | 'KG1' | 'KG2';
  academicYear: string;
  teachers: TeacherAssignment[];
  teacherInfo: Teacher[];
  capacity: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

interface Teacher {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: string;
}

interface ClassManagementProps {
  locale: string;
}

export function ClassManagement({ locale }: ClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    academicYear: '',
    level: ''
  });

  const { user } = useAuth();

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all classes first, then filter client-side to avoid index requirements
      const data = await classAPI.list(user, {});
      let filteredClasses = data.classes || [];

      // Apply client-side filtering
      if (filters.academicYear) {
        filteredClasses = filteredClasses.filter((cls: Class) => cls.academicYear === filters.academicYear);
      }
      
      if (filters.level) {
        filteredClasses = filteredClasses.filter((cls: Class) => cls.level === filters.level);
      }

      setClasses(filteredClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(handleAPIError(error, locale));
    } finally {
      setLoading(false);
    }
  }, [user, filters, locale]);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    if (!user) return;

    try {
      const data = await userAPI.list(user, 'teacher');
      const teacherUsers = data.users?.filter((user: { role: string }) => user.role === 'teacher') || [];
      setTeachers(teacherUsers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]); // Set empty array on error
    }
  }, [user]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Handle class creation/update
  const handleSubmit = async (classData: Partial<Class>) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const isEditing = editingClass !== null;
      
      let data;
      if (isEditing && editingClass) {
        data = await classAPI.update(user, editingClass.id, classData);
      } else {
        // Convert to ClassFormData for creation
        const classFormData = {
          name: classData.name!,
          level: classData.level!,
          academicYear: classData.academicYear!,
          teachers: classData.teachers!,
          capacity: classData.capacity!,
          notes: classData.notes,
        };
        data = await classAPI.create(user, classFormData);
      }
      
      setSuccess(data.message);
      setShowForm(false);
      setEditingClass(null);
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      setError(handleAPIError(error, locale));
    } finally {
      setLoading(false);
    }
  };

  // Handle class deletion
  const handleDelete = async (classId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await classAPI.delete(user, classId);
      setSuccess(data.message);
      setDeleteConfirm(null);
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      setError(handleAPIError(error, locale));
    } finally {
      setLoading(false);
    }
  };

  // Generate academic year options
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
  const levels = ['Pre-KG', 'KG1', 'KG2'];

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem'
      }}>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>
          {locale === 'ar-SA' ? 'إدارة الفصول' : 'Class Management'}
        </h2>
        
        <button
          onClick={() => {
            setEditingClass(null);
            setShowForm(true);
          }}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {locale === 'ar-SA' ? 'إضافة فصل جديد' : 'Add New Class'}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#efe',
          color: '#363',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #cfc'
        }}>
          {success}
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '6px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            {locale === 'ar-SA' ? 'العام الدراسي' : 'Academic Year'}
          </label>
          <select
            value={filters.academicYear}
            onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="">{locale === 'ar-SA' ? 'جميع السنوات' : 'All Years'}</option>
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            {locale === 'ar-SA' ? 'المستوى' : 'Level'}
          </label>
          <select
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="">{locale === 'ar-SA' ? 'جميع المستويات' : 'All Levels'}</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes Table */}
      {loading && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#666' 
        }}>
          {locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      )}

      {!loading && classes.length === 0 && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#666' 
        }}>
          {locale === 'ar-SA' ? 'لا توجد فصول' : 'No classes found'}
        </div>
      )}

      {!loading && classes.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>
                  {locale === 'ar-SA' ? 'اسم الفصل' : 'Class Name'}
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>
                  {locale === 'ar-SA' ? 'المستوى' : 'Level'}
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>
                  {locale === 'ar-SA' ? 'العام الدراسي' : 'Academic Year'}
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>
                  {locale === 'ar-SA' ? 'المعلم' : 'Teacher'}
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>
                  {locale === 'ar-SA' ? 'السعة' : 'Capacity'}
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>
                  {locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{classItem.name}</div>
                    {classItem.notes && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        {classItem.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>{classItem.level}</td>
                  <td style={{ padding: '1rem' }}>{classItem.academicYear}</td>
                  <td style={{ padding: '1rem' }}>
                    {classItem.teacherInfo.map(teacher => (
                      <div key={teacher.uid}>
                        <div>{teacher.displayName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {teacher.email}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          Subjects: {classItem.teachers.find(t => t.teacherId === teacher.uid)?.subjects.join(', ')}
                        </div>
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '1rem' }}>{classItem.capacity}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingClass(classItem);
                          setShowForm(true);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {locale === 'ar-SA' ? 'تعديل' : 'Edit'}
                      </button>
                      
                      <button
                        onClick={() => setDeleteConfirm(classItem.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {locale === 'ar-SA' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Class Form Modal */}
      {showForm && (
        <ClassForm
          locale={locale}
          teachers={teachers}
          academicYears={academicYears}
          levels={levels}
          initialData={editingClass}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingClass(null);
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e74c3c' }}>
              {locale === 'ar-SA' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h3>
            <p style={{ margin: '0 0 2rem 0', color: '#666' }}>
              {locale === 'ar-SA' 
                ? 'هل أنت متأكد من حذف هذا الفصل؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this class? This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#666',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: loading ? '#95a5a6' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading 
                  ? (locale === 'ar-SA' ? 'جاري الحذف...' : 'Deleting...') 
                  : (locale === 'ar-SA' ? 'حذف' : 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Class Form Component
interface ClassFormProps {
  locale: string;
  teachers: Teacher[];
  academicYears: string[];
  levels: string[];
  initialData: Class | null;
  onSubmit: (data: Partial<Class>) => void;
  onCancel: () => void;
  loading: boolean;
}

function ClassForm({
  locale,
  teachers,
  academicYears,
  levels,
  initialData,
  onSubmit,
  onCancel,
  loading
}: ClassFormProps) {
  interface FormErrors {
    name?: string;
    level?: string;
    academicYear?: string;
    teachers?: string | { teacherId?: string; subjects?: string }[];
    capacity?: string;
    notes?: string;
  }

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    level: initialData?.level || 'KG1',
    academicYear: initialData?.academicYear || academicYears[1] || '', // Default to current year
    teachers: initialData
      ? initialData.teachers.map(t => ({ ...t, subjects: t.subjects.join(', ') }))
      : [{ teacherId: '', subjects: '' }],
    capacity: initialData?.capacity || 25,
    notes: initialData?.notes || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = locale === 'ar-SA' ? 'اسم الفصل مطلوب' : 'Class name is required';
    }

    if (!formData.level) {
      newErrors.level = locale === 'ar-SA' ? 'المستوى مطلوب' : 'Level is required';
    }

    if (!formData.academicYear) {
      newErrors.academicYear = locale === 'ar-SA' ? 'العام الدراسي مطلوب' : 'Academic year is required';
    }

    if (formData.teachers.length === 0) {
      newErrors.teachers = locale === 'ar-SA' ? 'المعلم مطلوب' : 'Teacher is required';
    } else {
      const teacherErrors: { teacherId?: string, subjects?: string }[] = [];
      let hasErrors = false;
      formData.teachers.forEach((teacher) => {
        const error: { teacherId?: string, subjects?: string } = {};
        if (!teacher.teacherId) {
          error.teacherId = locale === 'ar-SA' ? 'المعلم مطلوب' : 'Teacher is required';
          hasErrors = true;
        }
        if (!teacher.subjects) {
          error.subjects = locale === 'ar-SA' ? 'المادة مطلوبة' : 'Subjects are required';
          hasErrors = true;
        }
        teacherErrors.push(error);
      });
      if (hasErrors) {
        newErrors.teachers = teacherErrors;
      }
    }

    if (formData.capacity < 1 || formData.capacity > 50) {
      newErrors.capacity = locale === 'ar-SA' ? 'السعة يجب أن تكون بين 1 و 50' : 'Capacity must be between 1 and 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formattedTeachers = formData.teachers.map(t => ({
        ...t,
        subjects: t.subjects.split(',').map(s => s.trim()).filter(s => s)
    }));

    onSubmit({ ...formData, teachers: formattedTeachers });
  };

  const handleInputChange = (field: keyof FormErrors, value: string | number) => {
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

  const handleTeacherChange = (index: number, field: string, value: string) => {
    const newTeachers = [...formData.teachers];
    newTeachers[index] = { ...newTeachers[index], [field]: value };
    setFormData({ ...formData, teachers: newTeachers });
  };

  const addTeacher = () => {
    setFormData({ ...formData, teachers: [...formData.teachers, { teacherId: '', subjects: '' }] });
  };

  const removeTeacher = (index: number) => {
    const newTeachers = [...formData.teachers];
    newTeachers.splice(index, 1);
    setFormData({ ...formData, teachers: newTeachers });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 2rem 0', color: '#2c3e50' }}>
          {initialData 
            ? (locale === 'ar-SA' ? 'تعديل الفصل' : 'Edit Class')
            : (locale === 'ar-SA' ? 'إضافة فصل جديد' : 'Add New Class')}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Class Name */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'اسم الفصل *' : 'Class Name *'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="KG1-A"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.name ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              {errors.name && (
                <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.name}
                </div>
              )}
            </div>

            {/* Level */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'المستوى *' : 'Level *'}
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.level ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {errors.level && (
                <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.level}
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
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.academicYear ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem'
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

            {/* Capacity */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'السعة *' : 'Capacity *'}
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.capacity ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              {errors.capacity && (
                <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.capacity}
                </div>
              )}
            </div>
          </div>

          {/* Teachers */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'المعلمون *' : 'Teachers *'}
            </label>
            {typeof errors.teachers === 'string' && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {errors.teachers}
              </div>
            )}
            {formData.teachers.map((teacher, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '1rem',
                marginBottom: '1rem',
                alignItems: 'center'
              }}>
                <select
                  value={teacher.teacherId}
                  onChange={(e) => handleTeacherChange(index, 'teacherId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${Array.isArray(errors.teachers) && errors.teachers[index]?.teacherId ? '#e74c3c' : '#ddd'}`,
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">
                    {locale === 'ar-SA' ? 'اختر معلم' : 'Select Teacher'}
                  </option>
                  {teachers.map(t => (
                    <option key={t.uid} value={t.uid}>
                      {t.displayName} ({t.email})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={teacher.subjects}
                  onChange={(e) => handleTeacherChange(index, 'subjects', e.target.value)}
                  placeholder={locale === 'ar-SA' ? 'المواد (مفصولة بفواصل)' : 'Subjects (comma-separated)'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${Array.isArray(errors.teachers) && errors.teachers[index]?.subjects ? '#e74c3c' : '#ddd'}`,
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeTeacher(index)}
                  style={{
                    padding: '0.5rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTeacher}
              style={{
                padding: '0.5rem 1rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {locale === 'ar-SA' ? 'إضافة معلم' : 'Add Teacher'}
            </button>
          </div>


          {/* Notes */}
          <div style={{ marginBottom: '2rem', marginTop: '2rem' }}>
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
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
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
              disabled={loading}
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
                : (initialData 
                  ? (locale === 'ar-SA' ? 'حفظ التغييرات' : 'Save Changes')
                  : (locale === 'ar-SA' ? 'إنشاء الفصل' : 'Create Class'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
