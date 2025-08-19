"use client";

// AttendanceManagement: Centralized attendance UI using the shared useAttendance hook
// Responsible only for date selection, per-student status selection and save action.

import React, { useEffect, useState } from 'react';
import { ClassInfo, Student } from '../types';
import { useAttendance } from '../hooks/useAttendance';
import { AttendanceRecord } from '../../admin/types/admin.types';
import type { User } from 'firebase/auth';
import { useAcademicYear } from '../../../../contexts/AcademicYearContext';

export function AttendanceManagement({ locale, selectedClass, classes, user }: { locale: string; selectedClass: string; classes: ClassInfo[]; user: User | null }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const selectedClassInfo = classes.find((c) => c.id === selectedClass);
  const currentStudents = selectedClassInfo?.students || [];

  // Use global academic year context
  const { selectedAcademicYear } = useAcademicYear();

  const { currentAttendance, loading, saving, error, lastSavedDate, updateStudentAttendance, saveAttendance, loadAttendance, clearCurrentAttendance } = useAttendance(user, locale);

  useEffect(() => {
    if (selectedClass && selectedDate && user && classes.length > 0 && selectedAcademicYear) {
      console.log(`🔍 Loading attendance for Academic Year: ${selectedAcademicYear}, Class: ${selectedClass}, Date: ${selectedDate}`);
      loadAttendance(selectedClass, selectedAcademicYear, selectedDate);
    }
  }, [selectedClass, selectedDate, user, classes, selectedAcademicYear, loadAttendance]);

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    updateStudentAttendance(studentId, status);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !user || currentStudents.length === 0 || !selectedAcademicYear) return;
    
    console.log(`💾 Saving attendance for Academic Year: ${selectedAcademicYear}, Class: ${selectedClass}, Date: ${selectedDate}`);

    const attendanceRecords: AttendanceRecord[] = currentStudents.map((student) => ({
      studentId: student.id,
      enrollmentId: `${selectedAcademicYear}_${student.id}`,
      studentName: locale === 'ar-SA' ? student.name : student.nameEn,
      status: (currentAttendance[student.id] as 'present' | 'absent' | 'late') || 'absent',
      notes: ''
    }));

    const success = await saveAttendance(selectedClass, selectedAcademicYear, selectedDate, attendanceRecords);
    if (success) {
      alert(locale === 'ar-SA' ? 'تم حفظ الحضور بنجاح!' : 'Attendance saved successfully!');
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '25px', padding: '2rem', boxShadow: '0 15px 50px rgba(0,0,0,0.1)', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-blue-dark)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✅ {locale === 'ar-SA' ? 'إدارة الحضور' : 'Attendance Management'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-blue-dark)' }}>{locale === 'ar-SA' ? 'التاريخ:' : 'Date:'}</label>
          <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); clearCurrentAttendance(); }} max={new Date().toISOString().split('T')[0]}
            style={{ padding: '0.8rem', fontSize: '1rem', border: '2px solid var(--primary-blue)', borderRadius: '15px', outline: 'none', color: 'var(--primary-blue-dark)' }} />
        </div>
      </div>

      {error && (<div style={{ background: 'var(--primary-red)', color: 'white', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center' }}>❌ {error}</div>)}

      {lastSavedDate === selectedDate && !error && (
        <div style={{ background: 'var(--primary-green)', color: 'white', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center' }}>
          ✅ {locale === 'ar-SA' ? `تم حفظ الحضور بنجاح للتاريخ ${selectedDate}` : `Attendance saved successfully for ${selectedDate}`}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-blue)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>{locale === 'ar-SA' ? 'جاري تحميل بيانات الحضور...' : 'Loading attendance data...'}</p>
        </div>
      )}

      {currentStudents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{locale === 'ar-SA' ? 'لا توجد بيانات حضور' : 'No attendance data available'}</h3>
          <p>{locale === 'ar-SA' ? 'لا توجد بيانات للطلاب في هذا الصف لتسجيل الحضور' : 'No student data available in this class for attendance tracking'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {currentStudents.map((student: Student) => (
            <div key={student.id} style={{ background: 'var(--light-blue)', padding: '1.5rem', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' }}>👤</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-blue-dark)', marginBottom: '0.3rem' }}>{locale === 'ar-SA' ? student.name : student.nameEn}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>{student.class}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { status: 'present', label: locale === 'ar-SA' ? 'حاضر' : 'Present', color: 'var(--primary-green)', icon: '✅' },
                  { status: 'late', label: locale === 'ar-SA' ? 'متأخر' : 'Late', color: 'var(--primary-yellow)', icon: '⏰' },
                  { status: 'absent', label: locale === 'ar-SA' ? 'غائب' : 'Absent', color: 'var(--primary-red)', icon: '❌' }
                ].map((option) => (
                  <button key={option.status} onClick={() => handleAttendanceChange(student.id, option.status as 'present' | 'absent' | 'late')}
                    style={{ background: currentAttendance[student.id] === option.status ? option.color : 'white', color: currentAttendance[student.id] === option.status ? 'white' : option.color, border: `2px solid ${option.color}`, padding: '0.8rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    onMouseEnter={(e) => { if (currentAttendance[student.id] !== option.status) { e.currentTarget.style.background = option.color; e.currentTarget.style.color = 'white'; } }}
                    onMouseLeave={(e) => { if (currentAttendance[student.id] !== option.status) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = option.color; } }}>
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button onClick={handleSaveAttendance} disabled={saving || currentStudents.length === 0}
          style={{ background: saving ? '#ccc' : 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))', color: 'white', border: 'none', padding: '1.5rem 3rem', borderRadius: '15px', fontSize: '1.2rem', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', opacity: saving ? 0.7 : 1 }}
          onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'; } }}
          onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}>
          {saving ? <>⏳ {locale === 'ar-SA' ? 'جاري الحفظ...' : 'Saving...'}</> : <>💾 {locale === 'ar-SA' ? 'حفظ الحضور' : 'Save Attendance'}</>}
        </button>
      </div>
    </div>
  );
}

export default AttendanceManagement;
