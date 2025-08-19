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
          <button style={{ background: 'var(--primary-green)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '15px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            📊 {locale === 'ar-SA' ? 'تصدير التقرير' : 'Export Report'}
          </button>

          <button style={{ background: 'var(--primary-orange)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '15px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            📢 {locale === 'ar-SA' ? 'إرسال إعلان جماعي' : 'Send Group Announcement'}
          </button>
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
              onClick={() => setSelectedStudent(student)}
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

      {selectedStudent && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }} onClick={() => setSelectedStudent(null)}>
            <div style={{ background: 'white', borderRadius: '25px', padding: '3rem', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '2rem', color: 'var(--primary-blue-dark)', fontWeight: 'bold' }}>
                  {locale === 'ar-SA' ? selectedStudent.name : selectedStudent.nameEn}
                </h3>
                <button onClick={() => setSelectedStudent(null)} style={{ background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <button style={{ background: 'var(--primary-green)', color: 'white', border: 'none', padding: '1rem', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>✅</span>
                  {locale === 'ar-SA' ? 'تسجيل الحضور' : 'Mark Attendance'}
                </button>
                <button style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '1rem', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📝</span>
                  {locale === 'ar-SA' ? 'إضافة ملاحظة' : 'Add Note'}
                </button>
                <button style={{ background: 'var(--primary-orange)', color: 'white', border: 'none', padding: '1rem', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => setShowReportCardModal(true)}>
                  <span style={{ fontSize: '1.5rem' }}>📊</span>
                  {locale === 'ar-SA' ? 'إدارة بطاقات التقرير' : 'Manage Report Cards'}
                  <span style={{ fontSize: '0.85rem', color: '#fff', opacity: 0.8, marginTop: 2 }}>{locale === 'ar-SA' ? 'عرض أو إضافة أو تعديل' : 'View, add, or edit'}</span>
                </button>
                <button style={{ background: 'var(--primary-purple)', color: 'white', border: 'none', padding: '1rem', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💌</span>
                  {locale === 'ar-SA' ? 'إرسال رسالة' : 'Send Message'}
                </button>
              </div>

              <div style={{ background: 'var(--light-blue)', padding: '1.5rem', borderRadius: '15px' }}>
                <h4 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--primary-blue-dark)' }}>
                  {locale === 'ar-SA' ? 'تفاصيل الطالب' : 'Student Details'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '1rem' }}>
                  <div><strong>{locale === 'ar-SA' ? 'الصف:' : 'Class:'}</strong> {selectedStudent.class}</div>
                  <div><strong>{locale === 'ar-SA' ? 'معدل الحضور:' : 'Attendance:'}</strong> {selectedStudent.attendance}%</div>
                  <div><strong>{locale === 'ar-SA' ? 'آخر تقرير:' : 'Last Report:'}</strong> {selectedStudent.lastReport}</div>
                  <div><strong>{locale === 'ar-SA' ? 'تواصل الوالدين:' : 'Parent Contact:'}</strong> {selectedStudent.parentContact}</div>
                </div>
              </div>
            </div>
          </div>
          {showReportCardModal && (
            <ReportCardModal
              open={showReportCardModal}
              onClose={() => setShowReportCardModal(false)}
              studentId={selectedStudent.id}
              studentName={locale === 'ar-SA' ? selectedStudent.name : selectedStudent.nameEn}
              academicYear={selectedClassInfo?.academicYear || ''}
              locale={locale}
            />
          )}
        </>
      )}
    </div>
  );
}

export default StudentRoster;
