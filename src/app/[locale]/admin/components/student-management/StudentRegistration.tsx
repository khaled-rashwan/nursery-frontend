'use client';

import React, { useState, useEffect } from 'react';

interface StudentRegistrationProps {
  locale: string;
  onSubmit: (studentData: StudentData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: StudentData;
  isEditing?: boolean;
}

interface StudentData {
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
}

export function StudentRegistration({ 
  locale, 
  onSubmit, 
  onCancel, 
  loading = false, 
  initialData,
  isEditing = false 
}: StudentRegistrationProps) {
  const [formData, setFormData] = useState<StudentData>({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    parentUID: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Initialize form data with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = locale === 'ar-SA' ? 'الاسم الكامل مطلوب' : 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = locale === 'ar-SA' ? 'الاسم يجب أن يكون على الأقل حرفين' : 'Name must be at least 2 characters';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = locale === 'ar-SA' ? 'تاريخ الميلاد مطلوب' : 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (age < 2 || age > 6) {
        newErrors.dateOfBirth = locale === 'ar-SA' ? 'عمر الطالب يجب أن يكون بين 2 إلى 6 سنوات' : 'Student age must be between 2 and 6 years';
      }
    }

    if (!formData.parentUID.trim()) {
      newErrors.parentUID = locale === 'ar-SA' ? 'معرف ولي الأمر مطلوب' : 'Parent UID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      
      // Reset form only for new registration, not editing
      if (!isEditing) {
        setFormData({
          fullName: '',
          dateOfBirth: '',
          gender: 'Male',
          parentUID: ''
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      border: '3px solid #3498db'
    }}>
      <h2 style={{
        fontSize: '1.8rem',
        color: '#2c3e50',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {isEditing ? '✏️' : '👨‍🎓'} {
          isEditing 
            ? (locale === 'ar-SA' ? 'تعديل بيانات الطالب' : 'Edit Student Information')
            : (locale === 'ar-SA' ? 'تسجيل طالب جديد' : 'Register New Student')
        }
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Full Name */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            {locale === 'ar-SA' ? 'الاسم الكامل' : 'Full Name'} *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder={locale === 'ar-SA' ? 'أدخل الاسم الكامل للطالب' : 'Enter student full name'}
            style={{
              width: '100%',
              padding: '0.8rem',
              border: errors.fullName ? '2px solid #e74c3c' : '2px solid #bdc3c7',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
            disabled={loading}
          />
          {errors.fullName && (
            <p style={{ color: '#e74c3c', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            {locale === 'ar-SA' ? 'تاريخ الميلاد' : 'Date of Birth'} *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem',
              border: errors.dateOfBirth ? '2px solid #e74c3c' : '2px solid #bdc3c7',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
            disabled={loading}
          />
          {errors.dateOfBirth && (
            <p style={{ color: '#e74c3c', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            {locale === 'ar-SA' ? 'الجنس' : 'Gender'} *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value as 'Male' | 'Female')}
            style={{
              width: '100%',
              padding: '0.8rem',
              border: '2px solid #bdc3c7',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
            disabled={loading}
          >
            <option value="Male">{locale === 'ar-SA' ? 'ذكر' : 'Male'}</option>
            <option value="Female">{locale === 'ar-SA' ? 'أنثى' : 'Female'}</option>
          </select>
        </div>

        {/* Parent UID */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            {locale === 'ar-SA' ? 'معرف ولي الأمر' : 'Parent UID'} *
          </label>
          <input
            type="text"
            value={formData.parentUID}
            onChange={(e) => handleInputChange('parentUID', e.target.value)}
            placeholder={locale === 'ar-SA' ? 'أدخل معرف ولي الأمر' : 'Enter parent UID'}
            style={{
              width: '100%',
              padding: '0.8rem',
              border: errors.parentUID ? '2px solid #e74c3c' : '2px solid #bdc3c7',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
            disabled={loading}
          />
          {errors.parentUID && (
            <p style={{ color: '#e74c3c', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              {errors.parentUID}
            </p>
          )}
          <p style={{ color: '#7f8c8d', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
            {locale === 'ar-SA' 
              ? 'يمكن العثور على معرف ولي الأمر في قسم إدارة المستخدمين. تأكد من أن المستخدم لديه دور "ولي أمر"' 
              : 'Parent UID can be found in the User Management section. Make sure the user has "parent" role'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.8rem 1.5rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            disabled={loading}
          >
            {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
          </button>
          
          <button
            type="submit"
            style={{
              padding: '0.8rem 1.5rem',
              background: loading ? '#bdc3c7' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                {locale === 'ar-SA' ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                💾 {
                  isEditing 
                    ? (locale === 'ar-SA' ? 'حفظ التغييرات' : 'Save Changes')
                    : (locale === 'ar-SA' ? 'حفظ الطالب' : 'Save Student')
                }
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
