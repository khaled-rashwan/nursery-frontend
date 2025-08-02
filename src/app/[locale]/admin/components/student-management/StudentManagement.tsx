'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { StudentRegistration } from './StudentRegistration';

interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
  createdAt: string;
  updatedAt: string;
}

interface Parent {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
}

interface StudentData {
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
}

interface StudentManagementProps {
  locale: string;
}

export function StudentManagement({ locale }: StudentManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch students
  const fetchStudents = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      if (!token) throw new Error('No authentication token');

      // Call Firebase function directly
      const response = await fetch(`https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/listStudents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available parents
  const fetchParents = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      if (!token) throw new Error('No authentication token');

      // Call Firebase function to get users with parent role
      const response = await fetch(`https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/listUsers?role=parent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setParents(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      // Don't set error state as this is supplementary data
    }
  };

  // Create student
  const handleCreateStudent = async (studentData: StudentData) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      if (!token) throw new Error('No authentication token');

      // Call Firebase function directly
      const response = await fetch(`https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/createStudent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create student';
        
        // Check if it's a role validation error and provide better user feedback
        if (errorMessage.includes('does not have parent role')) {
          throw new Error(
            locale === 'ar-SA' 
              ? 'المستخدم المحدد ليس ولي أمر. يرجى التأكد من أن المستخدم لديه دور "ولي أمر" في النظام.'
              : 'The specified user is not a parent. Please ensure the user has "parent" role in the system.'
          );
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setStudents(prev => [data.student, ...prev]);
      setActiveSubTab('list');
      
      // Show success message
      alert(locale === 'ar-SA' ? 'تم إنشاء الطالب بنجاح' : 'Student created successfully');
    } catch (error) {
      console.error('Error creating student:', error);
      setError(error instanceof Error ? error.message : 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'list') {
      fetchStudents();
    } else if (activeSubTab === 'register' || activeSubTab === 'parents') {
      fetchParents(); // Fetch parents when going to register or parents tab
    }
  }, [activeSubTab, user]);

  return (
    <div>
      {/* Sub Navigation */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        border: '3px solid #34495e'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'list', label: locale === 'ar-SA' ? 'قائمة الطلاب' : 'Students List', icon: '📋' },
            { id: 'register', label: locale === 'ar-SA' ? 'تسجيل طالب جديد' : 'Register New Student', icon: '➕' },
            { id: 'parents', label: locale === 'ar-SA' ? 'بحث أولياء الأمور' : 'Parent Lookup', icon: '👨‍👩‍👧‍👦' },
            { id: 'reports', label: locale === 'ar-SA' ? 'تقارير الطلاب' : 'Student Reports', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: activeSubTab === tab.id 
                  ? 'linear-gradient(135deg, #e67e22, #d35400)' 
                  : 'transparent',
                color: activeSubTab === tab.id ? 'white' : '#2c3e50',
                border: activeSubTab === tab.id ? 'none' : '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '1rem',
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
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '2px solid #ef5350'
        }}>
          <strong>{locale === 'ar-SA' ? 'خطأ: ' : 'Error: '}</strong>{error}
        </div>
      )}

      {/* Students List */}
      {activeSubTab === 'list' && (
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
            📋 {locale === 'ar-SA' ? 'قائمة الطلاب' : 'Students List'}
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>{locale === 'ar-SA' ? 'جاري تحميل الطلاب...' : 'Loading students...'}</p>
            </div>
          ) : students.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#7f8c8d'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍🎓</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
                {locale === 'ar-SA' ? 'لا توجد طلاب مسجلين' : 'No Students Registered'}
              </h3>
              <p style={{ color: '#95a5a6' }}>
                {locale === 'ar-SA' ? 'قم بتسجيل الطلاب الجدد باستخدام زر "تسجيل طالب جديد"' : 'Register new students using the "Register New Student" tab'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {students.map(student => (
                <div key={student.id} style={{
                  background: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
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
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: student.gender === 'Male' ? '#3498db' : '#e91e63',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {student.gender === 'Male' ? '👦' : '👧'}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        color: '#2c3e50',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {student.fullName}
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#7f8c8d',
                        margin: 0
                      }}>
                        {locale === 'ar-SA' ? 'الجنس: ' : 'Gender: '}
                        {student.gender === 'Male' ? 
                          (locale === 'ar-SA' ? 'ذكر' : 'Male') : 
                          (locale === 'ar-SA' ? 'أنثى' : 'Female')
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>{locale === 'ar-SA' ? 'تاريخ الميلاد: ' : 'Birth Date: '}</strong>
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>{locale === 'ar-SA' ? 'معرف ولي الأمر: ' : 'Parent UID: '}</strong>
                      {student.parentUID}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>{locale === 'ar-SA' ? 'تاريخ التسجيل: ' : 'Registration Date: '}</strong>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student Registration */}
      {activeSubTab === 'register' && (
        <StudentRegistration
          locale={locale}
          onSubmit={handleCreateStudent}
          onCancel={() => setActiveSubTab('list')}
          loading={loading}
        />
      )}

      {/* Parent Lookup */}
      {activeSubTab === 'parents' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          border: '3px solid #9b59b6'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2c3e50',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            👨‍👩‍👧‍👦 {locale === 'ar-SA' ? 'بحث أولياء الأمور' : 'Parent Lookup'}
          </h2>

          <p style={{
            color: '#7f8c8d',
            marginBottom: '2rem',
            fontSize: '1.1rem'
          }}>
            {locale === 'ar-SA' 
              ? 'قائمة أولياء الأمور المتاحين لتسجيل الطلاب. انسخ معرف ولي الأمر (UID) للاستخدام في تسجيل الطالب.'
              : 'Available parents for student registration. Copy the Parent UID to use when registering a student.'
            }
          </p>

          {parents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#7f8c8d'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
                {locale === 'ar-SA' ? 'لا توجد حسابات أولياء أمور' : 'No Parent Accounts'}
              </h3>
              <p style={{ color: '#95a5a6' }}>
                {locale === 'ar-SA' ? 'يجب إنشاء حسابات أولياء أمور أولاً في قسم إدارة المستخدمين' : 'Parent accounts must be created first in User Management section'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {parents.map(parent => (
                <div key={parent.uid} style={{
                  background: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
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
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#9b59b6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      👨‍👩‍👧‍👦
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.2rem',
                        color: '#2c3e50',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {parent.displayName || 'No Display Name'}
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#7f8c8d',
                        margin: 0
                      }}>
                        {parent.email}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#ecf0f1',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    wordBreak: 'break-all',
                    position: 'relative'
                  }}>
                    <strong style={{ color: '#2c3e50' }}>
                      {locale === 'ar-SA' ? 'معرف ولي الأمر: ' : 'Parent UID: '}
                    </strong>
                    <span style={{ color: '#34495e', fontFamily: 'monospace' }}>
                      {parent.uid}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(parent.uid);
                        // Simple feedback (you could enhance this with a toast notification)
                        alert(locale === 'ar-SA' ? 'تم نسخ المعرف!' : 'UID copied!');
                      }}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      📋 {locale === 'ar-SA' ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports (Under Development) */}
      {activeSubTab === 'reports' && (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '3px solid #bdc3c7'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2c3e50',
            marginBottom: '1rem'
          }}>
            {locale === 'ar-SA' ? 'قيد التطوير' : 'Under Development'}
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#7f8c8d'
          }}>
            {locale === 'ar-SA' 
              ? 'تقارير الطلاب قيد التطوير وستكون متاحة قريباً'
              : 'Student reports are under development and will be available soon'
            }
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
