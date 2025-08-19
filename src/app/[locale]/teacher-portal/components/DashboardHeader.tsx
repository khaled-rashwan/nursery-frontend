"use client";

// DashboardHeader: Top bar with user info, class selector and logout
// Pure presentational component – no data fetching here.

import React from 'react';
import { ClassInfo, TeacherUser } from '../types';
import { AcademicYearSelector } from '../../../../components/common/AcademicYearSelector';

export function DashboardHeader({
  locale,
  user,
  selectedClass,
  classes,
  loadingClasses,
  onClassChange,
  onLogout
}: {
  locale: string;
  user: TeacherUser;
  selectedClass: string;
  classes: ClassInfo[];
  loadingClasses: boolean;
  onClassChange: (classId: string) => void;
  onLogout: () => void;
}) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
      color: 'white',
      padding: '2rem',
      borderRadius: '0 0 25px 25px',
      marginBottom: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>👩‍🏫</div>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {locale === 'ar-SA' ? 'بوابة المعلمين' : 'Teacher Portal'}
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              {locale === 'ar-SA' ? `مرحباً ${user.name}` : `Welcome ${user.name}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '15px', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
              {locale === 'ar-SA' ? 'اختر الصف:' : 'Select Class:'}
            </label>
            {loadingClasses ? (
              <div style={{ padding: '0.5rem', fontSize: '1rem', color: 'white', textAlign: 'center' }}>
                {locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading classes...'}
              </div>
            ) : classes.length === 0 ? (
              <div style={{ padding: '0.5rem', fontSize: '1rem', color: 'white', textAlign: 'center' }}>
                {locale === 'ar-SA' ? 'لا توجد فصول مخصصة' : 'No classes assigned'}
              </div>
            ) : (
              <select
                value={selectedClass}
                onChange={(e) => onClassChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'white',
                  color: 'var(--primary-blue-dark)',
                  fontWeight: 'bold',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {locale === 'ar-SA' ? cls.nameAr : cls.name} ({cls.studentCount || 0} {locale === 'ar-SA' ? 'طالب' : 'students'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Academic Year Selector */}
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '15px' }}>
            <AcademicYearSelector variant="compact" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
