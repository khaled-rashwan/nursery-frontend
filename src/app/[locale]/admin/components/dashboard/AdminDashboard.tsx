'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { getRoleColor, getRoleIcon, getRoleName } from '../../../../../utils/rolePermissions';
import { UserClaims } from '../../types/admin.types';
import { mockSystemStats, mockRecentActivity } from '../../data/mockData';
import { UserManagement } from '../user-management/UserManagement';
import { StudentManagement } from '../student-management/StudentManagement';
import { EnrollmentManagement } from '../enrollment-management/EnrollmentManagement';

interface AdminDashboardProps {
  onLogout: () => void;
  locale: string;
}

export function AdminDashboard({ onLogout, locale }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, getUserCustomClaims } = useAuth();
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);

  useEffect(() => {
    const fetchUserClaims = async () => {
      if (user && getUserCustomClaims) {
        const claims = await getUserCustomClaims();
        setUserClaims(claims);
      }
    };
    fetchUserClaims();
    
  }, [user, getUserCustomClaims]);

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '3px solid #3498db'
      }}>
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
        
        <button
          onClick={onLogout}
          style={{
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🚪 {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Sign Out'}
        </button>
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
            { id: 'overview', label: locale === 'ar-SA' ? 'نظرة عامة' : 'Overview', icon: '📊' },
            { id: 'users', label: locale === 'ar-SA' ? 'إدارة المستخدمين' : 'User Management', icon: '👥' },
            { id: 'students', label: locale === 'ar-SA' ? 'إدارة الطلاب' : 'Student Management', icon: '👨‍🎓' },
            { id: 'enrollments', label: locale === 'ar-SA' ? 'إدارة التسجيلات' : 'Enrollment Management', icon: '📚' },
            { id: 'classes', label: locale === 'ar-SA' ? 'إدارة الفصول' : 'Class Management', icon: '🏫' },
            { id: 'reports', label: locale === 'ar-SA' ? 'التقارير' : 'Reports', icon: '📈' },
            { id: 'settings', label: locale === 'ar-SA' ? 'الإعدادات' : 'Settings', icon: '⚙️' }
          ].map(tab => (
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
              value={mockSystemStats.totalStudents} 
              color="#3498db" 
            />
            <StatCard 
              icon="👩‍🏫" 
              title={locale === 'ar-SA' ? 'إجمالي المعلمين' : 'Total Teachers'} 
              value={mockSystemStats.totalTeachers} 
              color="#2ecc71" 
            />
            <StatCard 
              icon="👨‍👩‍👧‍👦" 
              title={locale === 'ar-SA' ? 'إجمالي أولياء الأمور' : 'Total Parents'} 
              value={mockSystemStats.totalParents} 
              color="#9b59b6" 
            />
            <StatCard 
              icon="🏫" 
              title={locale === 'ar-SA' ? 'إجمالي الفصول' : 'Total Classes'} 
              value={mockSystemStats.totalClasses} 
              color="#f39c12" 
            />
            <StatCard 
              icon="💳" 
              title={locale === 'ar-SA' ? 'الرسوم المعلقة' : 'Pending Fees'} 
              value={`${mockSystemStats.pendingFees.toLocaleString()} ${locale === 'ar-SA' ? 'ريال' : 'SAR'}`} 
              color="#e74c3c" 
            />
            <StatCard 
              icon="💰" 
              title={locale === 'ar-SA' ? 'الإيرادات الشهرية' : 'Monthly Revenue'} 
              value={`${mockSystemStats.monthlyRevenue.toLocaleString()} ${locale === 'ar-SA' ? 'ريال' : 'SAR'}`} 
              color="#27ae60" 
            />
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            border: '3px solid #95a5a6'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#2c3e50',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 {locale === 'ar-SA' ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {mockRecentActivity.map(activity => (
                <div key={activity.id} style={{
                  padding: '1rem',
                  borderBottom: '1px solid #ecf0f1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: activity.type === 'user_created' ? '#3498db' : 
                               activity.type === 'fee_payment' ? '#27ae60' :
                               activity.type === 'class_updated' ? '#f39c12' :
                               activity.type === 'report_generated' ? '#9b59b6' : '#95a5a6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem'
                  }}>
                    {activity.type === 'user_created' ? '👤' :
                     activity.type === 'fee_payment' ? '💰' :
                     activity.type === 'class_updated' ? '📚' :
                     activity.type === 'report_generated' ? '📊' : '🔧'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#2c3e50',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {activity.description}
                    </p>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#7f8c8d',
                      margin: 0
                    }}>
                      👤 {activity.user} • 🕒 {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

      {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'students' && activeTab !== 'enrollments' && (
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
  );
}
