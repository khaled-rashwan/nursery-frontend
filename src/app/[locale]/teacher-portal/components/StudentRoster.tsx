"use client";

// StudentRoster: Grid of students for the selected class with a details modal
// Pure presentational – no data fetching, uses props and internal UI state only.


import React, { useState } from 'react';
import { ClassInfo, Student } from '../types';
import ReportCardModal from './ReportCardModal';

export function StudentRoster({ locale, selectedClass, classes }: { locale: string; selectedClass: string; classes: ClassInfo[] }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const selectedClassInfo = classes.find((c) => c.id === selectedClass);
  const currentStudents = selectedClassInfo?.students || [];

  return (
    <div style={{ background: 'white', borderRadius: '25px', padding: '2rem', boxShadow: '0 15px 50px rgba(0,0,0,0.1)', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-blue-dark)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👥 {locale === 'ar-SA' ? 'قائمة الطلاب' : 'Student Roster'} - {locale === 'ar-SA' ? selectedClassInfo?.nameAr : selectedClassInfo?.name}
        </h2>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* <button style={{ background: 'var(--primary-green)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '15px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            📊 {locale === 'ar-SA' ? 'تصدير التقرير' : 'Export Report'}
          </button>

          <button style={{ background: 'var(--primary-orange)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '15px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            📢 {locale === 'ar-SA' ? 'إرسال إعلان جماعي' : 'Send Group Announcement'}
          </button> */}
        </div>
      </div>

      {currentStudents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {locale === 'ar-SA' ? 'لا توجد بيانات طلاب' : 'No student data available'}
          </h3>
          <p>{locale === 'ar-SA' ? 'لا توجد بيانات للطلاب في هذا الصف حالياً' : 'No student data available for this class currently'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {currentStudents.map((student: Student) => (
            <div key={student.id} style={{ background: 'var(--light-blue)', padding: '1.5rem', borderRadius: '20px', border: '2px solid var(--primary-blue)', transition: 'all 0.3s ease', cursor: 'pointer' }}
              onClick={() => {
                setSelectedStudent(student);
                setShowReportCardModal(true);
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>👤</div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-blue-dark)', marginBottom: '0.3rem' }}>
                    {locale === 'ar-SA' ? student.name : student.nameEn}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#666' }}>{student.class}</p>
                </div>
                {student.unreadMessages > 0 && (
                  <div style={{ background: 'var(--primary-red)', color: 'white', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', marginLeft: 'auto' }}>
                    {student.unreadMessages}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: '#666' }}>{locale === 'ar-SA' ? 'الحضور:' : 'Attendance:'}</span><br />
                  <span style={{ fontWeight: 'bold', color: student.attendance >= 90 ? 'var(--primary-green)' : 'var(--primary-orange)' }}>
                    {student.attendance}%
                  </span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>{locale === 'ar-SA' ? 'آخر تقرير:' : 'Last Report:'}</span><br />
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-blue-dark)' }}>
                    {new Date(student.lastReport).toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStudent && showReportCardModal && (
        <ReportCardModal
          open={showReportCardModal}
          onClose={() => {
            setShowReportCardModal(false);
            setSelectedStudent(null);
          }}
          studentId={selectedStudent.id}
          studentName={locale === 'ar-SA' ? selectedStudent.name : selectedStudent.nameEn}
          academicYear={selectedClassInfo?.academicYear || ''}
          locale={locale}
        />
      )}
    </div>
  );
}

export default StudentRoster;
