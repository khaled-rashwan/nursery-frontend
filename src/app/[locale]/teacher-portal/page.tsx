'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Mock data for demonstration
const mockClasses = [
  { id: 'kg1-a', name: 'KG1-A', nameAr: 'الروضة الأولى - أ', studentCount: 18 },
  { id: 'kg1-b', name: 'KG1-B', nameAr: 'الروضة الأولى - ب', studentCount: 20 },
  { id: 'kg2-a', name: 'KG2-A', nameAr: 'الروضة الثانية - أ', studentCount: 16 },
  { id: 'prekg-a', name: 'Pre-KG-A', nameAr: 'ما قبل الروضة - أ', studentCount: 15 }
];

const mockStudentsData = {
  'kg1-a': [
    {
      id: 1,
      name: 'أحمد محمد',
      nameEn: 'Ahmed Mohamed',
      class: 'KG1-A',
      attendance: 95,
      lastReport: '2024-12-15',
      parentContact: 'parent1@email.com',
      unreadMessages: 2,
      profileImage: '/kg1.png'
    },
    {
      id: 2,
      name: 'فاطمة علي',
      nameEn: 'Fatima Ali',
      class: 'KG1-A',
      attendance: 88,
      lastReport: '2024-12-10',
      parentContact: 'parent2@email.com',
      unreadMessages: 0,
      profileImage: '/kg1.png'
    },
    {
      id: 3,
      name: 'سارة أحمد',
      nameEn: 'Sara Ahmed',
      class: 'KG1-A',
      attendance: 92,
      lastReport: '2024-12-12',
      parentContact: 'parent3@email.com',
      unreadMessages: 1,
      profileImage: '/kg1.png'
    }
  ],
  'kg1-b': [
    {
      id: 4,
      name: 'محمد أحمد',
      nameEn: 'Mohamed Ahmed',
      class: 'KG1-B',
      attendance: 90,
      lastReport: '2024-12-14',
      parentContact: 'parent4@email.com',
      unreadMessages: 1,
      profileImage: '/kg1.png'
    },
    {
      id: 5,
      name: 'نور خالد',
      nameEn: 'Nour Khaled',
      class: 'KG1-B',
      attendance: 85,
      lastReport: '2024-12-13',
      parentContact: 'parent5@email.com',
      unreadMessages: 0,
      profileImage: '/kg1.png'
    }
  ],
  'kg2-a': [
    {
      id: 6,
      name: 'عمر سالم',
      nameEn: 'Omar Salem',
      class: 'KG2-A',
      attendance: 93,
      lastReport: '2024-12-16',
      parentContact: 'parent6@email.com',
      unreadMessages: 3,
      profileImage: '/kg2.png'
    },
    {
      id: 7,
      name: 'مريم عبدالله',
      nameEn: 'Mariam Abdullah',
      class: 'KG2-A',
      attendance: 97,
      lastReport: '2024-12-15',
      parentContact: 'parent7@email.com',
      unreadMessages: 0,
      profileImage: '/kg2.png'
    }
  ],
  'prekg-a': [
    {
      id: 8,
      name: 'ليلى حسن',
      nameEn: 'Layla Hassan',
      class: 'Pre-KG-A',
      attendance: 89,
      lastReport: '2024-12-11',
      parentContact: 'parent8@email.com',
      unreadMessages: 2,
      profileImage: '/prekg.avif'
    },
    {
      id: 9,
      name: 'يوسف عمر',
      nameEn: 'Youssef Omar',
      class: 'Pre-KG-A',
      attendance: 91,
      lastReport: '2024-12-13',
      parentContact: 'parent9@email.com',
      unreadMessages: 1,
      profileImage: '/prekg.avif'
    }
  ]
};

const mockMessages = [
  {
    id: 1,
    from: 'والدة أحمد محمد',
    fromEn: 'Ahmed\'s Mother',
    subject: 'استفسار عن الواجبات المنزلية',
    subjectEn: 'Homework Inquiry',
    time: '2 hours ago',
    unread: true,
    studentId: 1
  },
  {
    id: 2,
    from: 'والد فاطمة علي',
    fromEn: 'Fatima\'s Father',
    subject: 'موعد اجتماع أولياء الأمور',
    subjectEn: 'Parent Meeting Schedule',
    time: '1 day ago',
    unread: false,
    studentId: 2
  }
];

// Authentication Component
function AuthenticationForm({ locale, onLogin }: { locale: string, onLogin: (user: any) => void }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    onLogin({
      name: locale === 'ar-SA' ? 'المعلمة سارة أحمد' : 'Teacher Sarah Ahmed',
      class: 'KG1-A',
      email: credentials.email || 'teacher@futurestep.edu'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--light-blue) 0%, var(--light-orange) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '4rem',
        borderRadius: '25px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem'
        }}>👩‍🏫</div>
        
        <h1 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-blue-dark)',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {locale === 'ar-SA' ? 'بوابة المعلمين' : 'Teacher Portal'}
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '3rem'
        }}>
          {locale === 'ar-SA' ? 'تسجيل الدخول للوصول إلى لوحة التحكم' : 'Login to access your dashboard'}
        </p>

        <form onSubmit={handleLogin} style={{
          textAlign: locale === 'ar-SA' ? 'right' : 'left'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: 'var(--primary-blue-dark)'
            }}>
              {locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                border: '2px solid var(--light-blue)',
                borderRadius: '15px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={locale === 'ar-SA' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--light-blue)'}
            />
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: 'var(--primary-blue-dark)'
            }}>
              {locale === 'ar-SA' ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                border: '2px solid var(--light-blue)',
                borderRadius: '15px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={locale === 'ar-SA' ? 'أدخل كلمة المرور' : 'Enter your password'}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--light-blue)'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }}
          >
            {locale === 'ar-SA' ? 'تسجيل الدخول' : 'Login'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--light-yellow)',
          borderRadius: '15px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>{locale === 'ar-SA' ? 'للتجربة:' : 'Demo:'}</strong><br />
          {locale === 'ar-SA' ? 'اضغط تسجيل الدخول مباشرة' : 'Click Login directly to demo'}
        </div>
      </div>
    </div>
  );
}

// Dashboard Header Component
function DashboardHeader({ 
  locale, 
  user, 
  selectedClass, 
  onClassChange, 
  onLogout 
}: { 
  locale: string, 
  user: any, 
  selectedClass: string, 
  onClassChange: (classId: string) => void, 
  onLogout: () => void 
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '3rem'
          }}>👩‍🏫</div>
          <div>
            <h1 style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              {locale === 'ar-SA' ? 'بوابة المعلمين' : 'Teacher Portal'}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: 0.9
            }}>
              {locale === 'ar-SA' ? `مرحباً ${user.name}` : `Welcome ${user.name}`}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Class Selector */}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '1rem',
            borderRadius: '15px',
            minWidth: '200px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              opacity: 0.9
            }}>
              {locale === 'ar-SA' ? 'اختر الصف:' : 'Select Class:'}
            </label>
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
              {mockClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {locale === 'ar-SA' ? cls.nameAr : cls.name} ({cls.studentCount} {locale === 'ar-SA' ? 'طالب' : 'students'})
                </option>
              ))}
            </select>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '1rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏫</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {locale === 'ar-SA' ? 'الصف الحالي' : 'Current Class'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {locale === 'ar-SA' 
                ? mockClasses.find(c => c.id === selectedClass)?.nameAr 
                : mockClasses.find(c => c.id === selectedClass)?.name
              }
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}

// Quick Stats Component
function QuickStats({ locale, selectedClass }: { locale: string, selectedClass: string }) {
  const currentStudents = (mockStudentsData as any)[selectedClass] || [];
  const selectedClassInfo = mockClasses.find(c => c.id === selectedClass);
  const totalMessages = currentStudents.reduce((sum: number, student: any) => sum + student.unreadMessages, 0);
  const avgAttendance = currentStudents.length > 0 
    ? Math.round(currentStudents.reduce((sum: number, student: any) => sum + student.attendance, 0) / currentStudents.length)
    : 0;
  
  const stats = [
    {
      icon: '👥',
      value: selectedClassInfo?.studentCount.toString() || '0',
      label: locale === 'ar-SA' ? 'طالب' : 'Students',
      color: 'var(--primary-blue)'
    },
    {
      icon: '✅',
      value: `${avgAttendance}%`,
      label: locale === 'ar-SA' ? 'معدل الحضور' : 'Attendance Rate',
      color: 'var(--primary-green)'
    },
    {
      icon: '💌',
      value: totalMessages.toString(),
      label: locale === 'ar-SA' ? 'رسائل جديدة' : 'New Messages',
      color: 'var(--primary-orange)'
    },
    {
      icon: '📝',
      value: currentStudents.filter((s: any) => 
        new Date(s.lastReport) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length.toString(),
      label: locale === 'ar-SA' ? 'تقارير معلقة' : 'Pending Reports',
      color: 'var(--primary-yellow)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    }}>
      {stats.map((stat, index) => (
        <div key={index} style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: `3px solid ${stat.color}`,
          textAlign: 'center',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            {stat.icon}
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: stat.color,
            marginBottom: '0.5rem'
          }}>
            {stat.value}
          </div>
          <div style={{
            fontSize: '1.1rem',
            color: '#666',
            fontWeight: '600'
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Student Roster Component
function StudentRoster({ locale, selectedClass }: { locale: string, selectedClass: string }) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const currentStudents = (mockStudentsData as any)[selectedClass] || [];
  const selectedClassInfo = mockClasses.find(c => c.id === selectedClass);

  return (
    <div style={{
      background: 'white',
      borderRadius: '25px',
      padding: '2rem',
      boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
      marginBottom: '3rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          color: 'var(--primary-blue-dark)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          👥 {locale === 'ar-SA' ? 'قائمة الطلاب' : 'Student Roster'} - {locale === 'ar-SA' ? selectedClassInfo?.nameAr : selectedClassInfo?.name}
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button style={{
            background: 'var(--primary-green)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            📊 {locale === 'ar-SA' ? 'تصدير التقرير' : 'Export Report'}
          </button>
          
          <button style={{
            background: 'var(--primary-orange)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            📢 {locale === 'ar-SA' ? 'إرسال إعلان جماعي' : 'Send Group Announcement'}
          </button>
        </div>
      </div>

      {currentStudents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {locale === 'ar-SA' ? 'لا توجد بيانات طلاب' : 'No student data available'}
          </h3>
          <p>
            {locale === 'ar-SA' 
              ? 'لا توجد بيانات للطلاب في هذا الصف حالياً'
              : 'No student data available for this class currently'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {currentStudents.map((student: any) => (
            <div key={student.id} style={{
              background: 'var(--light-blue)',
              padding: '1.5rem',
              borderRadius: '20px',
              border: '2px solid var(--primary-blue)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedStudent(student)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'white'
                }}>
                  👤
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue-dark)',
                    marginBottom: '0.3rem'
                  }}>
                    {locale === 'ar-SA' ? student.name : student.nameEn}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666'
                  }}>
                    {student.class}
                  </p>
                </div>
                {student.unreadMessages > 0 && (
                  <div style={{
                    background: 'var(--primary-red)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    marginLeft: 'auto'
                  }}>
                    {student.unreadMessages}
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                fontSize: '0.9rem'
              }}>
                <div>
                  <span style={{ color: '#666' }}>
                    {locale === 'ar-SA' ? 'الحضور:' : 'Attendance:'}
                  </span>
                  <br />
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: student.attendance >= 90 ? 'var(--primary-green)' : 'var(--primary-orange)'
                  }}>
                    {student.attendance}%
                  </span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>
                    {locale === 'ar-SA' ? 'آخر تقرير:' : 'Last Report:'}
                  </span>
                  <br />
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-blue-dark)' }}>
                    {new Date(student.lastReport).toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
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
        }}
        onClick={() => setSelectedStudent(null)}>
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '3rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '2rem',
                color: 'var(--primary-blue-dark)',
                fontWeight: 'bold'
              }}>
                {locale === 'ar-SA' ? selectedStudent.name : selectedStudent.nameEn}
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: 'var(--primary-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {[
                { icon: '✅', label: locale === 'ar-SA' ? 'تسجيل الحضور' : 'Mark Attendance', color: 'var(--primary-green)' },
                { icon: '📝', label: locale === 'ar-SA' ? 'إضافة ملاحظة' : 'Add Note', color: 'var(--primary-blue)' },
                { icon: '📊', label: locale === 'ar-SA' ? 'رفع تقرير' : 'Upload Report', color: 'var(--primary-orange)' },
                { icon: '💌', label: locale === 'ar-SA' ? 'إرسال رسالة' : 'Send Message', color: 'var(--primary-purple)' }
              ].map((action, index) => (
                <button key={index} style={{
                  background: action.color,
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

            {/* Student Details */}
            <div style={{
              background: 'var(--light-blue)',
              padding: '1.5rem',
              borderRadius: '15px'
            }}>
              <h4 style={{
                fontSize: '1.3rem',
                marginBottom: '1rem',
                color: 'var(--primary-blue-dark)'
              }}>
                {locale === 'ar-SA' ? 'تفاصيل الطالب' : 'Student Details'}
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                fontSize: '1rem'
              }}>
                <div>
                  <strong>{locale === 'ar-SA' ? 'الصف:' : 'Class:'}</strong> {selectedStudent.class}
                </div>
                <div>
                  <strong>{locale === 'ar-SA' ? 'معدل الحضور:' : 'Attendance:'}</strong> {selectedStudent.attendance}%
                </div>
                <div>
                  <strong>{locale === 'ar-SA' ? 'آخر تقرير:' : 'Last Report:'}</strong> {selectedStudent.lastReport}
                </div>
                <div>
                  <strong>{locale === 'ar-SA' ? 'تواصل الوالدين:' : 'Parent Contact:'}</strong> {selectedStudent.parentContact}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Communication Center Component
function CommunicationCenter({ locale, selectedClass }: { locale: string, selectedClass: string }) {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <div style={{
      background: 'white',
      borderRadius: '25px',
      padding: '2rem',
      boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
      marginBottom: '3rem'
    }}>
      <h2 style={{
        fontSize: '2rem',
        color: 'var(--primary-blue-dark)',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        💌 {locale === 'ar-SA' ? 'مركز التواصل' : 'Communication Center'}
      </h2>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--light-blue)'
      }}>
        {[
          { id: 'messages', label: locale === 'ar-SA' ? 'الرسائل' : 'Messages', icon: '💬' },
          { id: 'announcements', label: locale === 'ar-SA' ? 'الإعلانات' : 'Announcements', icon: '📢' },
          { id: 'compose', label: locale === 'ar-SA' ? 'إنشاء رسالة' : 'Compose', icon: '✏️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--primary-blue)',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '15px 15px 0 0',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div>
          {mockMessages.map((message) => (
            <div key={message.id} style={{
              background: message.unread ? 'var(--light-yellow)' : 'var(--light-blue)',
              padding: '1.5rem',
              borderRadius: '15px',
              marginBottom: '1rem',
              border: message.unread ? '2px solid var(--primary-yellow)' : '2px solid var(--light-blue)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(10px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue-dark)',
                    marginBottom: '0.5rem'
                  }}>
                    {locale === 'ar-SA' ? message.from : message.fromEn}
                  </h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666'
                  }}>
                    {locale === 'ar-SA' ? message.subject : message.subjectEn}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#888'
                  }}>
                    {message.time}
                  </span>
                  {message.unread && (
                    <div style={{
                      background: 'var(--primary-red)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '12px',
                      height: '12px'
                    }}></div>
                  )}
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button style={{
                  background: 'var(--primary-blue)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  {locale === 'ar-SA' ? 'رد' : 'Reply'}
                </button>
                <button style={{
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  {locale === 'ar-SA' ? 'قراءة' : 'Read'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📢</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {locale === 'ar-SA' ? 'إرسال إعلان جماعي' : 'Send Group Announcement'}
          </h3>
          <p style={{ marginBottom: '2rem' }}>
            {locale === 'ar-SA' ? 'أرسل إعلانات مهمة لجميع أولياء الأمور في صفك' : 'Send important announcements to all parents in your class'}
          </p>
          <button style={{
            background: 'var(--primary-orange)',
            color: 'white',
            border: 'none',
            padding: '1.5rem 3rem',
            borderRadius: '15px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}>
            {locale === 'ar-SA' ? 'إنشاء إعلان' : 'Create Announcement'}
          </button>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div>
          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: 'var(--primary-blue-dark)'
              }}>
                {locale === 'ar-SA' ? 'إلى:' : 'To:'}
              </label>
              <select style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                border: '2px solid var(--light-blue)',
                borderRadius: '15px',
                outline: 'none'
              }}>
                <option>{locale === 'ar-SA' ? 'اختر ولي الأمر' : 'Select Parent'}</option>
                {((mockStudentsData as any)[selectedClass] || []).map((student: any) => (
                  <option key={student.id}>
                    {locale === 'ar-SA' ? `والد/ة ${student.name}` : `${student.nameEn}'s Parent`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: 'var(--primary-blue-dark)'
              }}>
                {locale === 'ar-SA' ? 'الموضوع:' : 'Subject:'}
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid var(--light-blue)',
                  borderRadius: '15px',
                  outline: 'none'
                }}
                placeholder={locale === 'ar-SA' ? 'أدخل موضوع الرسالة' : 'Enter message subject'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: 'var(--primary-blue-dark)'
              }}>
                {locale === 'ar-SA' ? 'الرسالة:' : 'Message:'}
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid var(--light-blue)',
                  borderRadius: '15px',
                  outline: 'none',
                  minHeight: '150px',
                  resize: 'vertical'
                }}
                placeholder={locale === 'ar-SA' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
              />
            </div>

            <button style={{
              background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
              color: 'white',
              border: 'none',
              padding: '1.5rem 3rem',
              borderRadius: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              ✉️ {locale === 'ar-SA' ? 'إرسال الرسالة' : 'Send Message'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Attendance Management Component
function AttendanceManagement({ locale, selectedClass }: { locale: string, selectedClass: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{[key: number]: 'present' | 'absent' | 'late'}>({});
  const currentStudents = (mockStudentsData as any)[selectedClass] || [];

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '25px',
      padding: '2rem',
      boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
      marginBottom: '3rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          color: 'var(--primary-blue-dark)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ✅ {locale === 'ar-SA' ? 'إدارة الحضور' : 'Attendance Management'}
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <label style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'var(--primary-blue-dark)'
          }}>
            {locale === 'ar-SA' ? 'التاريخ:' : 'Date:'}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.8rem',
              fontSize: '1rem',
              border: '2px solid var(--primary-blue)',
              borderRadius: '15px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {currentStudents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {locale === 'ar-SA' ? 'لا توجد بيانات حضور' : 'No attendance data available'}
          </h3>
          <p>
            {locale === 'ar-SA' 
              ? 'لا توجد بيانات للطلاب في هذا الصف لتسجيل الحضور'
              : 'No student data available in this class for attendance tracking'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {currentStudents.map((student: any) => (
            <div key={student.id} style={{
              background: 'var(--light-blue)',
              padding: '1.5rem',
              borderRadius: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: 'white'
                }}>
                  👤
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue-dark)',
                    marginBottom: '0.3rem'
                  }}>
                    {locale === 'ar-SA' ? student.name : student.nameEn}
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    {student.class}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                {[
                  { status: 'present', label: locale === 'ar-SA' ? 'حاضر' : 'Present', color: 'var(--primary-green)', icon: '✅' },
                  { status: 'late', label: locale === 'ar-SA' ? 'متأخر' : 'Late', color: 'var(--primary-yellow)', icon: '⏰' },
                  { status: 'absent', label: locale === 'ar-SA' ? 'غائب' : 'Absent', color: 'var(--primary-red)', icon: '❌' }
                ].map((option) => (
                  <button
                    key={option.status}
                    onClick={() => handleAttendanceChange(student.id, option.status as any)}
                    style={{
                      background: attendance[student.id] === option.status ? option.color : 'white',
                      color: attendance[student.id] === option.status ? 'white' : option.color,
                      border: `2px solid ${option.color}`,
                      padding: '0.8rem 1.2rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                    onMouseEnter={(e) => {
                      if (attendance[student.id] !== option.status) {
                        e.currentTarget.style.background = option.color;
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (attendance[student.id] !== option.status) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = option.color;
                      }
                    }}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <button style={{
          background: 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
          color: 'white',
          border: 'none',
          padding: '1.5rem 3rem',
          borderRadius: '15px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          💾 {locale === 'ar-SA' ? 'حفظ الحضور' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}

// Main Teacher Portal Component
export default function TeacherPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  useEffect(() => {
    // Initialize with first available class when user is logged in
    if (user && mockClasses.length > 0 && !selectedClass) {
      setSelectedClass(mockClasses[0].id);
    }
  }, [user, selectedClass]);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedClass('');
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
  };

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, var(--light-blue), var(--light-orange))'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--primary-blue-dark)'
        }}>
          <div className="loading-spinner" style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 2rem'
          }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}
          </h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthenticationForm locale={locale} onLogin={handleLogin} />;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      paddingBottom: '2rem'
    }}>
      <DashboardHeader 
        locale={locale} 
        user={user} 
        selectedClass={selectedClass}
        onClassChange={handleClassChange}
        onLogout={handleLogout} 
      />
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <QuickStats locale={locale} selectedClass={selectedClass} />
        <StudentRoster locale={locale} selectedClass={selectedClass} />
        <AttendanceManagement locale={locale} selectedClass={selectedClass} />
        <CommunicationCenter locale={locale} selectedClass={selectedClass} />
      </div>
    </div>
  );
}
