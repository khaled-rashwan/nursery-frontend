'use client';

import React, { useState } from 'react';
import { User, UserFormData } from '../../types/admin.types';

interface UserModalProps {
  user: User | null;
  locale: string;
  currentUserRole: string | null;
  canEditUser: (user: User) => boolean;
  onSave: (userData: UserFormData) => void;
  onCancel: () => void;
}

export function UserModal({ 
  user, 
  locale, 
  onSave, 
  onCancel,
  currentUserRole,
  canEditUser
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    password: '',
    role: user?.customClaims.role || 'parent'
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const errors: string[] = [];
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push(locale === 'ar-SA' 
        ? 'البريد الإلكتروني غير صحيح'
        : 'Invalid email format'
      );
    }
    
    // Validate password (only for new users)
    if (!user && formData.password.length < 6) {
      errors.push(locale === 'ar-SA' 
        ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        : 'Password must be at least 6 characters'
      );
    }
    
    // Validate display name
    if (!formData.displayName.trim() || formData.displayName.length > 100) {
      errors.push(locale === 'ar-SA' 
        ? 'اسم العرض يجب أن يكون بين 1-100 حرف'
        : 'Display name must be 1-100 characters'
      );
    }
    
    // Validate phone number format (if provided)
    if (formData.phoneNumber) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.push(locale === 'ar-SA' 
          ? 'رقم الهاتف يجب أن يكون بالتنسيق الدولي (مثال: +966501234567)'
          : 'Phone number must be in international format (e.g., +966501234567)'
        );
      }
    }
    
    // Show validation errors
    if (errors.length > 0) {
      alert(locale === 'ar-SA' 
        ? `يرجى إصلاح الأخطاء التالية:\n• ${errors.join('\n• ')}`
        : `Please fix the following errors:\n• ${errors.join('\n• ')}`
      );
      return;
    }
    
    onSave(formData);
  };

  const handleRoleChange = (newRole: UserFormData['role']) => {
    setFormData({
      ...formData,
      role: newRole
    });
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
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#2c3e50',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {user ? '✏️' : '➕'} 
          {user 
            ? (locale === 'ar-SA' ? 'تعديل المستخدم' : 'Edit User')
            : (locale === 'ar-SA' ? 'إضافة مستخدم جديد' : 'Add New User')
          }
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email Address'} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder={locale === 'ar-SA' ? 'مثال: ahmed@futurestep.edu.sa' : 'e.g., user@futurestep.edu.sa'}
              />
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#7f8c8d', 
                marginTop: '0.25rem',
                marginBottom: 0 
              }}>
                {locale === 'ar-SA' 
                  ? 'يجب أن يكون البريد الإلكتروني صحيح التنسيق'
                  : 'Must be a valid email address'
                }
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'الاسم الكامل' : 'Full Name'} *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder={locale === 'ar-SA' ? 'أحمد محمد' : 'John Doe'}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder={locale === 'ar-SA' ? '+966501234567' : '+966501234567'}
              />
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#7f8c8d', 
                marginTop: '0.25rem',
                marginBottom: 0 
              }}>
                {locale === 'ar-SA' 
                  ? 'يجب أن يبدأ برمز الدولة (مثال: +966 للسعودية)'
                  : 'Must start with country code (e.g., +966 for Saudi Arabia)'
                }
              </p>
            </div>

            {/* Password (only for new users) */}
            {!user && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'كلمة المرور' : 'Password'} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '2px solid #bdc3c7',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      paddingRight: '3rem'
                    }}
                    placeholder={locale === 'ar-SA' ? 'كلمة المرور (6 أحرف على الأقل)' : 'Password (min 6 characters)'}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#7f8c8d', 
                  marginTop: '0.25rem',
                  marginBottom: 0 
                }}>
                  {locale === 'ar-SA' 
                    ? 'يجب أن تكون كلمة المرور 6 أحرف أو أكثر'
                    : 'Password must be at least 6 characters long'
                  }
                </p>
              </div>
            )}

            {/* Role */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'الدور' : 'Role'} *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as UserFormData['role'])}
                required
                disabled={user ? !canEditUser(user) : false}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  background: (user && !canEditUser(user)) ? '#f5f5f5' : 'white',
                  cursor: (user && !canEditUser(user)) ? 'not-allowed' : 'default',
                  opacity: (user && !canEditUser(user)) ? 0.7 : 1
                }}
              >
                {currentUserRole === 'superadmin' && (
                  <option value="admin">{locale === 'ar-SA' ? 'مدير' : 'Admin'}</option>
                )}
                <option value="teacher">{locale === 'ar-SA' ? 'معلم' : 'Teacher'}</option>
                <option value="parent">{locale === 'ar-SA' ? 'ولي أمر' : 'Parent'}</option>
                <option value="content-manager">{locale === 'ar-SA' ? 'مدير المحتوى' : 'Content Manager'}</option>
              </select>
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#7f8c8d', 
                marginTop: '0.25rem',
                marginBottom: 0 
              }}>
                {locale === 'ar-SA' 
                  ? 'اختر الدور المناسب للمستخدم'
                  : 'Select the appropriate role for the user'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '1rem 1.5rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
            </button>
            
            <button
              type="submit"
              style={{
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {user 
                ? (locale === 'ar-SA' ? 'تحديث' : 'Update')
                : (locale === 'ar-SA' ? 'إنشاء' : 'Create')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
