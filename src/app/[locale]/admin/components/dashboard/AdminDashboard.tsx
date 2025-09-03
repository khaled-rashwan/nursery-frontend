'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { getRoleColor, getRoleIcon, getRoleName } from '../../../../../utils/rolePermissions';
import { UserClaims, SystemStats, RecentActivity } from '../../types/admin.types';
import { activityLogger, ActivityHelpers } from '../../services/activityLogger';
import { systemAPI, handleAPIError } from '../../services/api';
import { UserManagement } from '../user-management/UserManagement';
import { StudentManagement } from '../student-management/StudentManagement';
import { EnrollmentManagement } from '../enrollment-management/EnrollmentManagement';
import { ClassManagement } from '../class-management/ClassManagement';
import { TeacherManagement } from '../teacher-management/TeacherManagement';
import { PaymentManagement } from '../payment-management/PaymentManagement';
import AdmissionsManagement from '../admissions-management/AdmissionsManagement';
import ContactSubmissionsManagement from '../contact-management/ContactSubmissionsManagement';
import CareerSubmissionsManagement from '../career-management/CareerSubmissionsManagement';
import ContentManagement from '../content-management/ContentManagement';
import { AcademicYearProvider, AcademicYearSelector } from '../../../../../components/academic-year';
import { hasPermission, UserRole } from '../../../../../utils/rolePermissions';

interface AdminDashboardProps {
  onLogout: () => void;
  locale: string;
}

export function AdminDashboard({ onLogout, locale }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('content');
  const { user, getUserCustomClaims } = useAuth();
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserClaims = async () => {
      if (user && getUserCustomClaims) {
        const claims = await getUserCustomClaims();
        setUserClaims(claims);
        if (user.email && user.displayName) {
          ActivityHelpers.login(user.email, user.displayName);
        }
      }
    };
    fetchUserClaims();
    
  }, [user, getUserCustomClaims]);

  useEffect(() => {
    if (userClaims) {
      const availableTabs = [
        { id: 'content', permission: 'manage_content' },
        { id: 'admissions', permission: 'manage_classes' },
        { id: 'contact', permission: 'manage_classes' },
        { id: 'careers', permission: 'manage_classes' },
        { id: 'payments', permission: 'manage_classes' },
        { id: 'users', permission: 'manage_users' },
        { id: 'students', permission: 'view_students' },
        { id: 'enrollments', permission: 'manage_classes' },
        { id: 'classes', permission: 'manage_classes' },
        { id: 'teachers', permission: 'manage_users' },
      ].filter(tab => hasPermission(userClaims.role as UserRole, tab.permission));

      if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
        setActiveTab(availableTabs[0].id);
      }
    }
  }, [userClaims, activeTab]);

  // Listen for navigation events from student management
  useEffect(() => {
    const handleNavigateToPayments = () => {
      setActiveTab('payments');
    };

    window.addEventListener('navigateToPayments', handleNavigateToPayments);
    return () => {
      window.removeEventListener('navigateToPayments', handleNavigateToPayments);
    };
  }, []);

  // Fetch system statistics
  const fetchSystemStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const stats = await systemAPI.getStats(user);
      setSystemStats(stats);
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      setError(handleAPIError(error, locale));
      // Keep the default values (all zeros) on error
    } finally {
      setLoading(false);
    }
  }, [user, locale]);

  // ...existing code...

  const StatCard = ({ icon, title, value, color }: { icon: string; title: string; value: string | number; color: string }) => (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      textAlign: 'center',
      transition: 'transform 0.3s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '1.2rem',
        color: '#2c3e50',
        margin: '0 0 0.5rem 0'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: color,
        margin: 0
      }}>
        {value}
      </p>
    </div>
  );

  return (
    <AcademicYearProvider>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
        padding: '2rem'
      }}>
      {/* Header */}
      <div
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '3px solid #3498db',
          flexWrap: 'wrap',
          rowGap: '1.5rem',
          columnGap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid #3498db',
            background: user?.photoURL ? `url(${user.photoURL})` : 'linear-gradient(135deg, #3498db, #2c3e50)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {!user?.photoURL && (user?.displayName?.charAt(0)?.toUpperCase() || '👤')}
          </div>
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              color: '#2c3e50',
              margin: '0 0 0.5rem 0'
            }}>
              {locale === 'ar-SA' ? 'مرحباً، ' : 'Welcome, '}
              {user?.displayName || 'Name is missing'}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#7f8c8d',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: userClaims?.role ? getRoleColor(userClaims.role) : '#95a5a6',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {userClaims?.role ? getRoleIcon(userClaims.role) : '❓'}
                {' '}
                {userClaims?.role ? 
                  getRoleName(userClaims.role, locale) : 
                  (locale === 'ar-SA' ? 'الدور مفقود' : 'Role is missing')
                }
              </span>
              • {user?.email || 'Email is missing'}
            </p>
          </div>
        </div>
        
        {/* Academic Year Selector */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 1rem' }}>
          <AcademicYearSelector variant="compact" />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={fetchSystemStats}
            disabled={loading}
            style={{
              padding: '0.6rem 1.2rem',
              background: loading ? '#95a5a6' : 'linear-gradient(135deg, #27ae60, #229954)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🔄 {loading
              ? (locale === 'ar-SA' ? 'تحديث...' : 'Refreshing...') 
              : (locale === 'ar-SA' ? 'تحديث البيانات' : 'Refresh Data')}
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Card Design */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {[
            { 
              id: 'content', 
              label: locale === 'ar-SA' ? 'إدارة المحتوى' : 'Content Management', 
              description: locale === 'ar-SA' ? 'إدارة صفحات ومحتوى الموقع.' : 'Manage website pages and content.',
              icon: '📄', 
              permission: 'manage_content',
              color: '#6366f1'
            },
            { 
              id: 'admissions', 
              label: locale === 'ar-SA' ? 'إدارة القبول' : 'Admissions', 
              description: locale === 'ar-SA' ? 'عرض وإدارة طلبات قبول الطلاب.' : 'View and manage student admissions.',
              icon: '🎓', 
              permission: 'manage_classes',
              color: '#14b8a6'
            },
            { 
              id: 'contact', 
              label: locale === 'ar-SA' ? 'رسائل الاتصال' : 'Contact Submissions', 
              description: locale === 'ar-SA' ? 'قراءة والرد على الرسائل.' : 'Read and reply to messages.',
              icon: '💬', 
              permission: 'manage_classes',
              color: '#3b82f6'
            },
            { 
              id: 'careers', 
              label: locale === 'ar-SA' ? 'طلبات التوظيف' : 'Career Applications', 
              description: locale === 'ar-SA' ? 'مراجعة طلبات التوظيف.' : 'Review job applications.',
              icon: '💼', 
              permission: 'manage_classes',
              color: '#f59e0b'
            },
            { 
              id: 'payments', 
              label: locale === 'ar-SA' ? 'تتبع المدفوعات' : 'Payment Tracker', 
              description: locale === 'ar-SA' ? 'تتبع الرسوم والمدفوعات.' : 'Track fees and payments.',
              icon: '💳', 
              permission: 'manage_classes',
              color: '#2563eb'
            },
            { 
              id: 'users', 
              label: locale === 'ar-SA' ? 'إدارة المستخدمين' : 'User Management', 
              description: locale === 'ar-SA' ? 'إدارة حسابات الموظفين والأولياء.' : 'Manage staff and parent accounts.',
              icon: '👥', 
              permission: 'manage_users',
              color: '#8b5cf6'
            },
            { 
              id: 'students', 
              label: locale === 'ar-SA' ? 'إدارة الطلاب' : 'Student Management', 
              description: locale === 'ar-SA' ? 'إدارة ملفات الطلاب.' : 'Manage student profiles.',
              icon: '👨‍🎓', 
              permission: 'view_students',
              color: '#10b981'
            },
            { 
              id: 'enrollments', 
              label: locale === 'ar-SA' ? 'إدارة التسجيلات' : 'Enrollment Management', 
              description: locale === 'ar-SA' ? 'التعامل مع تسجيلات الطلاب.' : 'Handle student enrollments.',
              icon: '📚', 
              permission: 'manage_classes',
              color: '#ef4444'
            },
            { 
              id: 'classes', 
              label: locale === 'ar-SA' ? 'إدارة الفصول' : 'Class Management', 
              description: locale === 'ar-SA' ? 'تنظيم الفصول والأقسام.' : 'Organize classes and sections.',
              icon: '🏫', 
              permission: 'manage_classes',
              color: '#f97316'
            },
            { 
              id: 'teachers', 
              label: locale === 'ar-SA' ? 'إدارة المعلمين' : 'Teacher Management', 
              description: locale === 'ar-SA' ? 'إدارة ملفات المعلمين.' : 'Manage teacher profiles.',
              icon: '👩‍🏫', 
              permission: 'manage_users',
              color: '#22c55e'
            },
          ]
          .filter(tab => hasPermission(userClaims?.role as UserRole, tab.permission))
          .map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id 
                  ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)` 
                  : 'white',
                color: activeTab === tab.id ? 'white' : '#374151',
                border: activeTab === tab.id ? 'none' : `2px solid ${tab.color}20`,
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.id 
                  ? `0 8px 25px ${tab.color}40` 
                  : '0 2px 8px rgba(0,0,0,0.1)',
                transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)',
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 5px 15px ${tab.color}30`;
                  e.currentTarget.style.borderColor = `${tab.color}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = `${tab.color}20`;
                }
              }}
            >
              <div>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{tab.icon}</span>
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1.3'
                }}>
                  {tab.label}
                </h3>
              </div>
              <p style={{
                fontSize: '0.9rem',
                margin: 0,
                opacity: activeTab === tab.id ? 0.9 : 0.7,
                lineHeight: '1.4'
              }}>
                {tab.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Other tabs content */}
      {activeTab === 'users' && (
        <UserManagement locale={locale} />
      )}

      {activeTab === 'students' && (
        <StudentManagement locale={locale} />
      )}

      {activeTab === 'enrollments' && (
        <EnrollmentManagement locale={locale} />
      )}

      {activeTab === 'classes' && (
        <ClassManagement locale={locale} />
      )}

      {activeTab === 'teachers' && (
        <TeacherManagement locale={locale} />
      )}

      {activeTab === 'payments' && (
        <PaymentManagement locale={locale} />
      )}

      {activeTab === 'admissions' && (
        <AdmissionsManagement locale={locale} />
      )}

      {activeTab === 'contact' && (
        <ContactSubmissionsManagement locale={locale} />
      )}

      {activeTab === 'careers' && (
        <CareerSubmissionsManagement locale={locale} />
      )}

      {activeTab === 'content' && (
        <ContentManagement />
      )}

      {activeTab !== 'users' && activeTab !== 'students' && activeTab !== 'enrollments' && activeTab !== 'classes' && activeTab !== 'teachers' && activeTab !== 'payments' && activeTab !== 'admissions' && activeTab !== 'contact' && activeTab !== 'careers' && activeTab !== 'content' && (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '3px solid #bdc3c7'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            🚧
          </div>
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
              ? 'هذا القسم قيد التطوير وسيكون متاحاً قريباً'
              : 'This section is under development and will be available soon'
            }
          </p>
        </div>
      )}
    </div>
    </AcademicYearProvider>
  );
}
