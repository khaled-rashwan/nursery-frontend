'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { User } from 'firebase/auth';

import DashboardHeader from './components/DashboardHeader';
import StudentRoster from './components/StudentRoster';
import CommunicationCenter from './components/CommunicationCenter';
import AttendanceManagement from './components/AttendanceManagement';
import HomeworkManagement from './components/HomeworkManagement';
import { ClassInfo, FirestoreClass, TeacherAssignedClass, TeacherUser } from './types';
import { convertFirestoreClassToClassInfo } from './utils';

// Academic Year Context
import { AcademicYearProvider, useAcademicYear } from '../../../contexts/AcademicYearContext';

const API_BASE_URL = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net`;

const makeAPICall = async (
  endpoint: string,
  user: User,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    queryParams?: Record<string, string>;
  } = {}
) => {
  const { method = 'GET', body, queryParams } = options;
  
  const token = await user.getIdToken();
  if (!token) throw new Error('No authentication token');

  let url = `${API_BASE_URL}/${endpoint}`;
  
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || `HTTP ${response.status}: Request failed`);
    } catch {
      throw new Error(`HTTP ${response.status}: ${errorText || 'Request failed'}`);
    }
  }

  return await response.json();
};

const classAPI = {
  list: async (user: User, filters?: { academicYear?: string; level?: string }) => {
    const queryParams: Record<string, string> = { operation: 'list' };
    if (filters?.academicYear) queryParams.academicYear = filters.academicYear;
    if (filters?.level) queryParams.level = filters.level;
    
    return makeAPICall('manageClasses', user, { queryParams });
  }
};

const enrollmentAPI = {
  getByClass: async (user: User, classId: string) => {
    const queryParams: Record<string, string> = { classId };
    return makeAPICall('getEnrollmentsByClass', user, { queryParams });
  }
};

// Teacher-specific API for fetching teacher assignments
const teacherAPI = {
  getAssignments: async (user: User): Promise<TeacherAssignedClass[]> => {
    try {
      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}/manageTeachersNew?operation=get&teacherId=${user.uid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch teacher assignments'}`);
      }
      
      const teacherData = await response.json();
      const assignments = teacherData.teacher?.classes || [];
      
      return assignments;
    } catch (error) {
      console.error('Failed to fetch teacher assignments:', error);
      return [];
    }
  }
};

// Authentication Component
function AuthenticationForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // useAuth hook updates auth state
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '1.5rem',
              background: loading 
                ? '#cccccc' 
                : 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }
            }}
          >
            {loading 
              ? (locale === 'ar-SA' ? 'جاري تسجيل الدخول...' : 'Logging in...') 
              : (locale === 'ar-SA' ? 'تسجيل الدخول' : 'Login')
            }
          </button>

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#ffe6e6',
              border: '1px solid #ff9999',
              borderRadius: '10px',
              color: '#d63031',
              textAlign: 'center',
              fontSize: '1rem'
            }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Main Teacher Portal Component
export default function TeacherPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  // State and auth
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);
  const { user, loading, getUserCustomClaims, logout } = useAuth();
  const router = require('next/navigation').useRouter();

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace(`/${locale}/login`);
    }
  }, [mounted, loading, user, locale, router]);

  if (!mounted || loading || !user) {
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

  return (
    <AcademicYearProvider>
      <TeacherDashboardWrapper locale={locale} user={user} getUserCustomClaims={getUserCustomClaims} logout={logout} />
    </AcademicYearProvider>
  );
}

function TeacherDashboardWrapper({ 
  locale, 
  user, 
  getUserCustomClaims, 
  logout 
}: { 
  locale: string; 
  user: User; 
  getUserCustomClaims: () => Promise<Record<string, unknown> | null>; 
  logout: () => Promise<{ success: boolean; error?: string }>; 
}) {
  const { selectedAcademicYear } = useAcademicYear();
  return (
    <TeacherDashboard 
      key={selectedAcademicYear}
      locale={locale} 
      user={user} 
      getUserCustomClaims={getUserCustomClaims} 
      logout={logout}
      selectedAcademicYear={selectedAcademicYear}
    />
  );
}

// Component that uses the academic year context
function TeacherDashboard({ 
  locale, 
  user, 
  getUserCustomClaims, 
  logout,
  selectedAcademicYear
}: { 
  locale: string; 
  user: User; 
  getUserCustomClaims: () => Promise<Record<string, unknown> | null>; 
  logout: () => Promise<{ success: boolean; error?: string }>; 
  selectedAcademicYear: string;
}) {
  const [selectedClass, setSelectedClass] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  
  // Memoized function to fetch classes - can be called from multiple useEffects
  const fetchClassesForAcademicYear = useCallback(async () => {
    if (!user || userRole !== 'teacher') {
      return;
    }

    if (!selectedAcademicYear) {
      return;
    }
    
    setLoadingClasses(true);
    setSelectedClass(''); // Clear current selection
    
    try {
      // Fetch teacher's assigned classes
      const assignedClasses = await teacherAPI.getAssignments(user);
      
      // Filter by academic year
      const assignedClassesForYear = assignedClasses.filter(
        (assignedClass: TeacherAssignedClass) => {
          return assignedClass.academicYear === selectedAcademicYear;
        }
      );

      if (assignedClassesForYear.length === 0) {
        setClasses([]);
        setLoadingClasses(false);
        return;
      }

      // Fetch all classes filtered by academic year
      const classesResponse = await classAPI.list(user, { academicYear: selectedAcademicYear });
      const firestoreClasses = classesResponse.classes || [];
      
  // Filter classes to only those assigned to teacher in the selected academic year
      const teacherClasses = firestoreClasses.filter(
        (cls: FirestoreClass) => {
          const classAcademicYearMatches = cls.academicYear === selectedAcademicYear;
          const isAssignedToClass = assignedClassesForYear.some((assignedClass: TeacherAssignedClass) => assignedClass.classId === cls.id);
          return classAcademicYearMatches && isAssignedToClass;
        }
      );

      if (teacherClasses.length === 0) {
        setClasses([]);
        setLoadingClasses(false);
        return;
      }

      // Convert classes with empty enrollment data initially
      const convertedClasses = teacherClasses.map((firestoreClass: FirestoreClass) => {
        return convertFirestoreClassToClassInfo(firestoreClass, []);
      });
      
      setClasses(convertedClasses);
      
      // Auto-select first class
      if (convertedClasses.length > 0) {
        setSelectedClass(convertedClasses[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, [user, userRole, selectedAcademicYear]);
  
  // Refetch classes whenever user, role, or academic year changes
  useEffect(() => {
    if (user && userRole === 'teacher' && selectedAcademicYear) {
      fetchClassesForAcademicYear();
    }
  }, [user, userRole, selectedAcademicYear, fetchClassesForAcademicYear]);

  useEffect(() => {
    // Get user role when user is authenticated
    const checkUserRole = async () => {
      if (user) {
        const customClaims = await getUserCustomClaims();
        const role = customClaims && typeof customClaims === 'object' && 'role' in customClaims 
          ? (customClaims.role as string) 
          : null;
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    };
    
    checkUserRole();
  }, [user, getUserCustomClaims]);

  // Fetch enrollments when a class is selected
  useEffect(() => {
    const fetchEnrollmentsForClass = async () => {
      if (!user || !selectedClass) return;

      try {
        const response = await enrollmentAPI.getByClass(user, selectedClass);
        
        // Update the selected class with the enrollment data
  setClasses(prevClasses => 
          prevClasses.map(cls => {
            if (cls.id === selectedClass) {
              const enrollments = response.enrollments || [];
              // Find the original firestore class data
              const originalClass = prevClasses.find(c => c.id === selectedClass);
              if (originalClass) {
                return convertFirestoreClassToClassInfo(
                  {
                    id: originalClass.id,
                    name: originalClass.name,
                    level: originalClass.level,
                    teacherUID: originalClass.teacherUID || '',
        academicYear: selectedAcademicYear,
                    teacherInfo: {
                      uid: originalClass.teacherUID || '',
                      email: '',
                      displayName: '',
                      role: 'teacher'
                    },
                    capacity: 0,
                    notes: ''
                  } as unknown as FirestoreClass,
                  enrollments
                );
              }
            }
            return cls;
          })
        );
      } catch (error) {
        console.error('Error fetching enrollments for class:', error);
      }
    };

    fetchEnrollmentsForClass();
  }, [selectedClass, user, selectedAcademicYear]);

  // Remove this useEffect as it conflicts with the main class fetching logic
  // Auto-selection is now handled in the main fetchClassesAndEnrollments function

  const handleLogout = async () => {
    await logout();
    setSelectedClass('');
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
  };

  // Wait for role to be loaded before allowing access
  if (user && userRole === null) {
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
            {locale === 'ar-SA' ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...'}
          </h2>
        </div>
      </div>
    );
  }

  // Check if user has teacher role - ONLY teachers can access teacher portal
  if (userRole !== 'teacher') {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--light-blue), var(--light-orange))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🚫</div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: 'var(--primary-blue-dark)',
            marginBottom: '1rem'
          }}>
            {locale === 'ar-SA' ? 'وصول مرفوض' : 'Access Denied'}
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666',
            marginBottom: '2rem'
          }}>
            {locale === 'ar-SA' 
              ? 'هذا القسم مخصص للمعلمين فقط. المدراء لديهم بوابة منفصلة في قسم الإدارة.'
              : 'This portal is exclusively for teachers. Administrators have a separate admin portal.'
            }
            <br />
            <small style={{ color: '#999' }}>
              {locale === 'ar-SA' 
                ? `دورك الحالي: ${userRole || 'غير محدد'}`
                : `Your current role: ${userRole || 'undefined'}`
              }
            </small>
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Logout'}
            </button>
            
            {(userRole === 'admin' || userRole === 'superadmin') && (
              <button
                onClick={() => window.location.href = `/${locale}/admin`}
                style={{
                  background: 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {locale === 'ar-SA' ? 'الذهاب للوحة الإدارة' : 'Go to Admin Portal'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create teacher user object from Firebase user
  const teacherUser: TeacherUser = {
    name: user.displayName || user.email?.split('@')[0] || 'Teacher',
    email: user.email || '',
    avatar: '👩‍🏫',
    subject: locale === 'ar-SA' ? 'المواد الدراسية' : 'Academic Subjects',
    experience: locale === 'ar-SA' ? 'معلم متمرس' : 'Experienced Teacher'
  };

  return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        paddingBottom: '2rem'
      }}>
        <DashboardHeader 
          locale={locale} 
          user={teacherUser} 
          selectedClass={selectedClass}
          classes={classes}
          loadingClasses={loadingClasses}
          onClassChange={handleClassChange}
          onLogout={handleLogout} 
        />
        
  {/* Show message when no classes found for selected academic year */}
        {!loadingClasses && classes.length === 0 && (
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto 2rem auto',
            padding: '0 2rem'
          }}>
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              border: '3px solid #f39c12'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📚</div>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '1rem'
              }}>
                {locale === 'ar-SA' ? 'لا توجد فصول مخصصة' : 'No Classes Assigned'}
              </h2>
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#666',
                marginBottom: '0'
              }}>
                {locale === 'ar-SA' 
                  ? `لم يتم العثور على فصول مخصصة لك في العام الدراسي المحدد. تواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.`
                  : `No classes have been assigned to you for the selected academic year. Contact administration if you believe this is an error.`
                }
              </p>
            </div>
          </div>
        )}
        
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <StudentRoster locale={locale} selectedClass={selectedClass} classes={classes} />
          <AttendanceManagement locale={locale} selectedClass={selectedClass} classes={classes} user={user} />
          <HomeworkManagement locale={locale} selectedClass={selectedClass} classes={classes} user={user} />
          <CommunicationCenter locale={locale} selectedClass={selectedClass} />
        </div>
  </div>
  );
}
