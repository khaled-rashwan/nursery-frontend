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
  const [activeTab, setActiveTab] = useState('overview');
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
        { id: 'overview', permission: 'view_reports' },
        { id: 'content', permission: 'manage_content' },
        { id: 'admissions', permission: 'manage_classes' },
        { id: 'contact', permission: 'manage_classes' },
        { id: 'careers', permission: 'manage_classes' },
        { id: 'users', permission: 'manage_users' },
        { id: 'students', permission: 'view_students' },
        { id: 'enrollments', permission: 'manage_classes' },
        { id: 'classes', permission: 'manage_classes' },
        { id: 'teachers', permission: 'manage_users' },
        { id: 'reports', permission: 'view_reports' },
        { id: 'settings', permission: 'system_settings' }
      ].filter(tab => hasPermission(userClaims.role as UserRole, tab.permission));

      if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
        setActiveTab(availableTabs[0].id);
      }
    }
  }, [userClaims, activeTab]);

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

      {/* Navigation Tabs */}
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
            { id: 'overview', label: locale === 'ar-SA' ? 'نظرة عامة' : 'Overview', icon: '📊', permission: 'view_reports' },
            { id: 'content', label: locale === 'ar-SA' ? 'إدارة المحتوى' : 'Content Management', icon: '📝', permission: 'manage_content' },
            { id: 'admissions', label: locale === 'ar-SA' ? 'إدارة القبول' : 'Admissions', icon: '📝', permission: 'manage_classes' },
            { id: 'contact', label: locale === 'ar-SA' ? 'رسائل الاتصال' : 'Contact Submissions', icon: '📨', permission: 'manage_classes' },
            { id: 'careers', label: locale === 'ar-SA' ? 'طلبات التوظيف' : 'Career Applications', icon: '💼', permission: 'manage_classes' },
            { id: 'users', label: locale === 'ar-SA' ? 'إدارة المستخدمين' : 'User Management', icon: '👥', permission: 'manage_users' },
            { id: 'students', label: locale === 'ar-SA' ? 'إدارة الطلاب' : 'Student Management', icon: '👨‍🎓', permission: 'view_students' },
            { id: 'enrollments', label: locale === 'ar-SA' ? 'إدارة التسجيلات' : 'Enrollment Management', icon: '📚', permission: 'manage_classes' },
            { id: 'classes', label: locale === 'ar-SA' ? 'إدارة الفصول' : 'Class Management', icon: '🏫', permission: 'manage_classes' },
            { id: 'teachers', label: locale === 'ar-SA' ? 'إدارة المعلمين' : 'Teacher Management', icon: '👩‍🏫', permission: 'manage_users' },
            { id: 'reports', label: locale === 'ar-SA' ? 'التقارير' : 'Reports', icon: '📈', permission: 'view_reports' },
            { id: 'settings', label: locale === 'ar-SA' ? 'الإعدادات' : 'Settings', icon: '⚙️', permission: 'system_settings' }
          ]
          .filter(tab => hasPermission(userClaims?.role as UserRole, tab.permission))
          .map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #3498db, #2c3e50)' 
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : '#2c3e50',
                border: activeTab === tab.id ? 'none' : '2px solid #bdc3c7',
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          {/* System Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <StatCard 
              icon="👨‍🎓" 
              title={locale === 'ar-SA' ? 'إجمالي الطلاب' : 'Total Students'} 
              value={loading ? '...' : systemStats.totalStudents} 
              color="#3498db" 
            />
            <StatCard 
              icon="👩‍🏫" 
              title={locale === 'ar-SA' ? 'إجمالي المعلمين' : 'Total Teachers'} 
              value={loading ? '...' : systemStats.totalTeachers} 
              color="#2ecc71" 
            />
            <StatCard 
              icon="👨‍👩‍👧‍👦" 
              title={locale === 'ar-SA' ? 'إجمالي أولياء الأمور' : 'Total Parents'} 
              value={loading ? '...' : systemStats.totalParents} 
              color="#9b59b6" 
            />
            <StatCard 
              icon="🏫" 
              title={locale === 'ar-SA' ? 'إجمالي الفصول' : 'Total Classes'} 
              value={loading ? '...' : systemStats.totalClasses} 
              color="#f39c12" 
            />
          </div>

          {/* Recent Activity section removed as per request */}
        </div>
      )}

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

      {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'students' && activeTab !== 'enrollments' && activeTab !== 'classes' && activeTab !== 'teachers' && activeTab !== 'admissions' && activeTab !== 'contact' && activeTab !== 'careers' && activeTab !== 'content' && (
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
