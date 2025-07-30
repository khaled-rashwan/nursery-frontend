'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Mock data for demonstration - Updated to support multiple children
interface Child {
  id: string;
  name: string;
  nameEn: string;
  class: string;
  classEn: string;
  photo: string;
  attendance: number;
  fees: {
    total: number;
    paid: number;
    remaining: number;
  };
  birthDate: string;
  age: string;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  emoji: string;
}

interface HomeworkItem {
  subject: string;
  task: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  date: string;
  read: boolean;
}

const mockChildren: Child[] = [
  {
    id: 'ST2025001',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    class: 'الروضة الأولى',
    classEn: 'KG1-A',
    photo: '👦',
    attendance: 95,
    fees: {
      total: 12000,
      paid: 8000,
      remaining: 4000
    },
    birthDate: '2020-05-15',
    age: '4 years old'
  },
  {
    id: 'ST2025002',
    name: 'فاطمة محمد',
    nameEn: 'Fatima Mohammed',
    class: 'ما قبل الروضة',
    classEn: 'Pre-KG',
    photo: '👧',
    attendance: 88,
    fees: {
      total: 10000,
      paid: 10000,
      remaining: 0
    },
    birthDate: '2021-08-22',
    age: '3 years old'
  },
  {
    id: 'ST2025003',
    name: 'يوسف محمد',
    nameEn: 'Youssef Mohammed',
    class: 'الروضة الثانية',
    classEn: 'KG2-B',
    photo: '�',
    attendance: 92,
    fees: {
      total: 15000,
      paid: 12000,
      remaining: 3000
    },
    birthDate: '2019-12-10',
    age: '5 years old'
  }
];

// Mock attendance data per child
const mockAttendanceData: { [key: string]: AttendanceRecord[] } = {
  'ST2025001': [
    { date: '2025-01-15', status: 'present', emoji: '✅' },
    { date: '2025-01-14', status: 'present', emoji: '✅' },
    { date: '2025-01-13', status: 'absent', emoji: '❌' },
    { date: '2025-01-12', status: 'present', emoji: '✅' },
    { date: '2025-01-11', status: 'present', emoji: '✅' },
  ],
  'ST2025002': [
    { date: '2025-01-15', status: 'present', emoji: '✅' },
    { date: '2025-01-14', status: 'late', emoji: '⏰' },
    { date: '2025-01-13', status: 'present', emoji: '✅' },
    { date: '2025-01-12', status: 'absent', emoji: '❌' },
    { date: '2025-01-11', status: 'present', emoji: '✅' },
  ],
  'ST2025003': [
    { date: '2025-01-15', status: 'present', emoji: '✅' },
    { date: '2025-01-14', status: 'present', emoji: '✅' },
    { date: '2025-01-13', status: 'present', emoji: '✅' },
    { date: '2025-01-12', status: 'present', emoji: '✅' },
    { date: '2025-01-11', status: 'late', emoji: '⏰' },
  ]
};

// Mock homework data per child
const mockHomeworkData: { [key: string]: HomeworkItem[] } = {
  'ST2025001': [
    { subject: 'الرياضيات / Math', task: 'Complete worksheet pages 12-15', dueDate: '2025-01-20', status: 'pending' },
    { subject: 'العربية / Arabic', task: 'Read story and answer questions', dueDate: '2025-01-18', status: 'completed' },
    { subject: 'الإنجليزية / English', task: 'Practice spelling words', dueDate: '2025-01-22', status: 'pending' },
  ],
  'ST2025002': [
    { subject: 'الأنشطة / Activities', task: 'Color the shapes worksheet', dueDate: '2025-01-19', status: 'completed' },
    { subject: 'اللعب التعليمي / Educational Play', task: 'Practice counting 1-10', dueDate: '2025-01-21', status: 'pending' },
  ],
  'ST2025003': [
    { subject: 'الرياضيات / Math', task: 'Addition problems 1-20', dueDate: '2025-01-20', status: 'pending' },
    { subject: 'العلوم / Science', task: 'Plant observation journal', dueDate: '2025-01-23', status: 'pending' },
    { subject: 'القراءة / Reading', task: 'Read 3 short stories', dueDate: '2025-01-18', status: 'completed' },
  ]
};

// Mock notifications per child
const mockNotificationsData: { [key: string]: NotificationItem[] } = {
  'ST2025001': [
    { id: 1, type: 'homework', message: 'New homework assigned in Math', date: '2025-01-15', read: false },
    { id: 2, type: 'announcement', message: 'School holiday on January 25th', date: '2025-01-14', read: true },
    { id: 3, type: 'fee', message: 'Fee payment reminder', date: '2025-01-13', read: false },
  ],
  'ST2025002': [
    { id: 4, type: 'activity', message: 'Art class tomorrow - bring apron', date: '2025-01-15', read: false },
    { id: 5, type: 'health', message: 'Health checkup scheduled next week', date: '2025-01-14', read: true },
  ],
  'ST2025003': [
    { id: 6, type: 'academic', message: 'Excellent progress in reading!', date: '2025-01-15', read: false },
    { id: 7, type: 'event', message: 'Science fair next month', date: '2025-01-13', read: false },
    { id: 8, type: 'fee', message: 'Monthly fee due soon', date: '2025-01-12', read: true },
  ]
};

// Login Component
function LoginForm({ onLogin, locale }: { onLogin: () => void; locale: string }) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'iqama'>('email');
  const [credentials, setCredentials] = useState({ email: '', iqama: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process with a brief delay for better UX
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--light-pink), var(--light-blue))',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow)',
        width: '100%',
        maxWidth: '500px',
        border: '4px solid var(--primary-pink)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: 'var(--primary-purple)',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🔐 {locale === 'ar-SA' ? 'بوابة أولياء الأمور' : 'Parent Portal'}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--primary-blue)',
            marginBottom: '2rem'
          }}>
            {locale === 'ar-SA' 
              ? 'تسجيل الدخول للوصول إلى معلومات طفلك'
              : 'Login to access your child\'s information'
            }
          </p>
        </div>

        <div style={{
          display: 'flex',
          marginBottom: '2rem',
          background: 'var(--light-yellow)',
          borderRadius: 'var(--border-radius)',
          padding: '0.5rem'
        }}>
          <button
            onClick={() => setLoginMethod('email')}
            style={{
              flex: 1,
              padding: '1rem',
              background: loginMethod === 'email' ? 'var(--primary-yellow)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--primary-purple)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📧 {locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}
          </button>
          <button
            onClick={() => setLoginMethod('iqama')}
            style={{
              flex: 1,
              padding: '1rem',
              background: loginMethod === 'iqama' ? 'var(--primary-yellow)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--primary-purple)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🆔 {locale === 'ar-SA' ? 'رقم الهوية' : 'Iqama Number'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--primary-purple)'
            }}>
              {loginMethod === 'email' 
                ? (locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email Address')
                : (locale === 'ar-SA' ? 'رقم الهوية' : 'Iqama Number')
              }
            </label>
            <input
              type={loginMethod === 'email' ? 'email' : 'text'}
              value={loginMethod === 'email' ? credentials.email : credentials.iqama}
              onChange={(e) => setCredentials({
                ...credentials,
                [loginMethod]: e.target.value
              })}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                border: '3px solid var(--primary-blue)',
                borderRadius: 'var(--border-radius)',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={loginMethod === 'email' 
                ? 'parent@example.com'
                : '1234567890'
              }
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--primary-purple)'
            }}>
              {locale === 'ar-SA' ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                border: '3px solid var(--primary-blue)',
                borderRadius: 'var(--border-radius)',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1.2rem',
              background: isLoading 
                ? '#ccc' 
                : 'linear-gradient(135deg, var(--primary-pink), var(--primary-blue))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s var(--bounce)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                {locale === 'ar-SA' ? 'جاري تسجيل الدخول...' : 'Logging in...'}
              </span>
            ) : (
              <>🚀 {locale === 'ar-SA' ? 'تسجيل الدخول' : 'Login'}</>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: 'var(--light-green)',
          borderRadius: 'var(--border-radius)',
          border: '3px solid var(--primary-green)'
        }}>
          <h4 style={{ 
            fontSize: '1.2rem', 
            color: 'var(--primary-green)', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            🎯 {locale === 'ar-SA' ? 'بيانات تجريبية للاختبار' : 'Demo Credentials for Testing'}
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              border: '2px solid var(--primary-blue)'
            }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                📧 {locale === 'ar-SA' ? 'تسجيل دخول بالبريد' : 'Email Login'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#333' }}>
                {locale === 'ar-SA' ? 'البريد:' : 'Email:'} parent@demo.com<br/>
                {locale === 'ar-SA' ? 'كلمة المرور:' : 'Password:'} demo123
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              border: '2px solid var(--primary-purple)'
            }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-purple)', marginBottom: '0.5rem' }}>
                🆔 {locale === 'ar-SA' ? 'تسجيل دخول بالهوية' : 'Iqama Login'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#333' }}>
                {locale === 'ar-SA' ? 'رقم الهوية:' : 'Iqama:'} 1234567890<br/>
                {locale === 'ar-SA' ? 'كلمة المرور:' : 'Password:'} demo123
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            marginTop: '1rem'
          }}>
            <p style={{ 
              fontSize: '1rem', 
              color: 'var(--primary-green)', 
              margin: 0,
              fontWeight: 'bold'
            }}>
              ✨ {locale === 'ar-SA' 
                ? 'يمكنك استخدام أي بيانات للاختبار - جميع المدخلات مقبولة!'
                : 'You can use ANY credentials for testing - all inputs are accepted!'
              }
            </p>
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--light-orange)',
          borderRadius: 'var(--border-radius)'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
            {locale === 'ar-SA' 
              ? 'نسيت كلمة المرور؟ اتصل بالإدارة على 123-4567'
              : 'Forgot password? Contact administration at 123-4567'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
// Child Selector Component
function ChildSelector({ selectedChildId, onChildChange, locale }: { 
  selectedChildId: string; 
  onChildChange: (childId: string) => void; 
  locale: string;
}) {
  const selectedChild = mockChildren.find(child => child.id === selectedChildId);

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow)',
      marginBottom: '2rem',
      border: '4px solid var(--primary-green)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '2.5rem',
            background: 'var(--light-green)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            👨‍👩‍👧‍👦
          </div>
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              color: 'var(--primary-green)',
              margin: 0,
              fontWeight: 'bold'
            }}>
              {locale === 'ar-SA' ? 'اختر الطفل' : 'Select Child'}
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              margin: 0
            }}>
              {locale === 'ar-SA' 
                ? `المحدد حالياً: ${selectedChild?.name}` 
                : `Currently viewing: ${selectedChild?.nameEn}`
              }
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {mockChildren.map((child) => (
            <button
              key={child.id}
              onClick={() => onChildChange(child.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.2rem',
                background: selectedChildId === child.id 
                  ? 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))' 
                  : 'var(--light-green)',
                color: selectedChildId === child.id ? 'white' : 'var(--primary-green)',
                border: `2px solid ${selectedChildId === child.id ? 'var(--primary-green)' : 'var(--primary-green)'}`,
                borderRadius: '20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (selectedChildId !== child.id) {
                  e.currentTarget.style.background = 'var(--primary-green)';
                  e.currentTarget.style.color = 'white';
                }
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                if (selectedChildId !== child.id) {
                  e.currentTarget.style.background = 'var(--light-green)';
                  e.currentTarget.style.color = 'var(--primary-green)';
                }
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{child.photo}</span>
              <span>{locale === 'ar-SA' ? child.name : child.nameEn}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onLogout, locale }: { onLogout: () => void; locale: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const [selectedChildId, setSelectedChildId] = useState(mockChildren[0]?.id || '');

  // Get current child data
  const currentChild = mockChildren.find(child => child.id === selectedChildId) || mockChildren[0];
  const currentAttendance = mockAttendanceData[selectedChildId] || [];
  const currentHomework = mockHomeworkData[selectedChildId] || [];
  const currentNotifications = mockNotificationsData[selectedChildId] || [];

  const tabs = [
    { id: 'overview', icon: '📊', label: locale === 'ar-SA' ? 'نظرة عامة' : 'Overview' },
    { id: 'attendance', icon: '📅', label: locale === 'ar-SA' ? 'الحضور' : 'Attendance' },
    { id: 'reports', icon: '📋', label: locale === 'ar-SA' ? 'التقارير' : 'Reports' },
    { id: 'homework', icon: '📚', label: locale === 'ar-SA' ? 'الواجبات' : 'Homework' },
    { id: 'fees', icon: '💳', label: locale === 'ar-SA' ? 'الرسوم' : 'Fees' },
    { id: 'messages', icon: '💬', label: locale === 'ar-SA' ? 'الرسائل' : 'Messages' },
    { id: 'notifications', icon: '🔔', label: locale === 'ar-SA' ? 'الإشعارات' : 'Notifications' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-blue))',
        padding: '1rem 2rem',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href={`/${locale}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            {/* <img 
              src="/logo.png" 
              alt="Future Step Nursery Logo"
              style={{
                height: '40px',
                width: 'auto',
                maxWidth: '60px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)'
              }}
            /> */}
            {/* <span style={{ fontSize: '1.5rem' }}>
              {locale === 'ar-SA' ? 'روضة خطوة المستقبل الأهلية' : 'Future Step Nursery'}
            </span> */}
          </Link>
          {/* <span style={{ fontSize: '2rem' }}>|</span> */}
          <h1 style={{
            fontSize: '1.8rem',
            color: 'white',
            margin: 0,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {locale === 'ar-SA' ? 'بوابة أولياء الأمور' : 'Parent Portal'}
          </h1>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary-yellow)',
            color: 'var(--primary-purple)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🚪 {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Logout'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          minWidth: 'max-content'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: activeTab === tab.id ? 'var(--primary-pink)' : 'var(--light-pink)',
                color: activeTab === tab.id ? 'white' : 'var(--primary-purple)',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {/* Child Selector */}
        <ChildSelector 
          selectedChildId={selectedChildId}
          onChildChange={setSelectedChildId}
          locale={locale}
        />

        {activeTab === 'overview' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--primary-purple)',
              textAlign: 'center',
              marginBottom: '2rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              📊 {locale === 'ar-SA' ? 'نظرة عامة' : 'Dashboard Overview'}
            </h2>

            {/* Student Info Card */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow)',
              marginBottom: '2rem',
              border: '4px solid var(--primary-blue)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  fontSize: '5rem',
                  background: 'var(--light-blue)',
                  borderRadius: '50%',
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {currentChild.photo}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: 'var(--primary-purple)',
                    marginBottom: '0.5rem'
                  }}>
                    {locale === 'ar-SA' ? currentChild.name : currentChild.nameEn}
                  </h3>
                  <p style={{
                    fontSize: '1.3rem',
                    color: 'var(--primary-blue)',
                    marginBottom: '0.5rem'
                  }}>
                    📚 {locale === 'ar-SA' ? currentChild.class : currentChild.classEn}
                  </p>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    🆔 {locale === 'ar-SA' ? 'رقم الطالب:' : 'Student ID:'} {currentChild.id}
                  </p>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#666'
                  }}>
                    🎂 {locale === 'ar-SA' ? 'العمر:' : 'Age:'} {currentChild.age}
                  </p>
                </div>
                <div style={{
                  textAlign: 'center',
                  background: 'var(--light-green)',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius)'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    color: 'var(--primary-green)',
                    fontWeight: 'bold'
                  }}>
                    {currentChild.attendance}%
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    color: 'var(--primary-green)',
                    fontWeight: 'bold'
                  }}>
                    {locale === 'ar-SA' ? 'نسبة الحضور' : 'Attendance Rate'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--light-pink), white)',
                padding: '2rem',
                borderRadius: 'var(--border-radius)',
                textAlign: 'center',
                border: '3px solid var(--primary-pink)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <h4 style={{
                  fontSize: '1.3rem',
                  color: 'var(--primary-purple)',
                  marginBottom: '0.5rem'
                }}>
                  {locale === 'ar-SA' ? 'الواجبات المعلقة' : 'Pending Homework'}
                </h4>
                <div style={{
                  fontSize: '2rem',
                  color: 'var(--primary-pink)',
                  fontWeight: 'bold'
                }}>
                  {currentHomework.filter((h: HomeworkItem) => h.status === 'pending').length}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, var(--light-yellow), white)',
                padding: '2rem',
                borderRadius: 'var(--border-radius)',
                textAlign: 'center',
                border: '3px solid var(--primary-yellow)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                <h4 style={{
                  fontSize: '1.3rem',
                  color: 'var(--primary-purple)',
                  marginBottom: '0.5rem'
                }}>
                  {locale === 'ar-SA' ? 'الرسوم المتبقية' : 'Outstanding Fees'}
                </h4>
                <div style={{
                  fontSize: '1.5rem',
                  color: 'var(--primary-orange)',
                  fontWeight: 'bold'
                }}>
                  {locale === 'ar-SA' ? `${currentChild.fees.remaining} ريال` : `$${currentChild.fees.remaining}`}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135ds, var(--light-blue), white)',
                padding: '2rem',
                borderRadius: 'var(--border-radius)',
                textAlign: 'center',
                border: '3px solid var(--primary-blue)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                <h4 style={{
                  fontSize: '1.3rem',
                  color: 'var(--primary-purple)',
                  marginBottom: '0.5rem'
                }}>
                  {locale === 'ar-SA' ? 'إشعارات جديدة' : 'New Notifications'}
                </h4>
                <div style={{
                  fontSize: '2rem',
                  color: 'var(--primary-blue)',
                  fontWeight: 'bold'
                }}>
                  {currentNotifications.filter((n: NotificationItem) => !n.read).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--primary-purple)',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              📅 {locale === 'ar-SA' ? 'سجل الحضور' : 'Attendance Log'}
            </h2>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow)',
              border: '4px solid var(--primary-green)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: 'var(--primary-purple)',
                  margin: 0
                }}>
                  {locale === 'ar-SA' ? 'فلتر الشهر:' : 'Filter by Month:'}
                </h3>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '3px solid var(--primary-blue)',
                    borderRadius: 'var(--border-radius)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentAttendance.map((record: AttendanceRecord, index: number) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: record.status === 'present' ? 'var(--light-green)' : 'var(--light-pink)',
                    borderRadius: 'var(--border-radius)',
                    border: `3px solid ${record.status === 'present' ? 'var(--primary-green)' : 'var(--primary-pink)'}`
                  }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      📅 {record.date}
                    </span>
                    <span style={{ fontSize: '1.5rem' }}>
                      {record.emoji} {locale === 'ar-SA' 
                        ? (record.status === 'present' ? 'حاضر' : 'غائب')
                        : (record.status === 'present' ? 'Present' : 'Absent')
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--primary-purple)',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              📚 {locale === 'ar-SA' ? 'الواجبات والملاحظات' : 'Homework & Notes'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {currentHomework.map((hw: HomeworkItem, index: number) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow)',
                  border: `4px solid ${hw.status === 'completed' ? 'var(--primary-green)' : 'var(--primary-orange)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.5rem',
                        color: 'var(--primary-purple)',
                        marginBottom: '1rem'
                      }}>
                        📖 {hw.subject}
                      </h3>
                      <p style={{
                        fontSize: '1.2rem',
                        color: '#666',
                        marginBottom: '1rem',
                        lineHeight: '1.6'
                      }}>
                        {hw.task}
                      </p>
                      <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--primary-blue)',
                        fontWeight: 'bold'
                      }}>
                        📅 {locale === 'ar-SA' ? 'تاريخ التسليم:' : 'Due Date:'} {hw.dueDate}
                      </p>
                    </div>
                    <div style={{
                      padding: '1rem',
                      background: hw.status === 'completed' ? 'var(--light-green)' : 'var(--light-orange)',
                      borderRadius: 'var(--border-radius)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {hw.status === 'completed' ? '✅' : '⏰'}
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: hw.status === 'completed' ? 'var(--primary-green)' : 'var(--primary-orange)'
                      }}>
                        {locale === 'ar-SA' 
                          ? (hw.status === 'completed' ? 'مكتمل' : 'معلق')
                          : (hw.status === 'completed' ? 'Completed' : 'Pending')
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--primary-purple)',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              💳 {locale === 'ar-SA' ? 'تتبع الرسوم والدفع' : 'Fee Tracking & Payment'}
            </h2>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow)',
              border: '4px solid var(--primary-blue)',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                color: 'var(--primary-purple)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                💰 {locale === 'ar-SA' ? 'ملخص الرسوم' : 'Fee Summary'}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'var(--light-blue)',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center',
                  border: '3px solid var(--primary-blue)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <div style={{ fontSize: '1.1rem', color: '#666' }}>
                    {locale === 'ar-SA' ? 'إجمالي الرسوم' : 'Total Fees'}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue)'
                  }}>
                    {locale === 'ar-SA' ? `${currentChild.fees.total} ريال` : `$${currentChild.fees.total}`}
                  </div>
                </div>

                <div style={{
                  background: 'var(--light-green)',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center',
                  border: '3px solid var(--primary-green)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontSize: '1.1rem', color: '#666' }}>
                    {locale === 'ar-SA' ? 'المبلغ المدفوع' : 'Amount Paid'}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-green)'
                  }}>
                    {locale === 'ar-SA' ? `${currentChild.fees.paid} ريال` : `$${currentChild.fees.paid}`}
                  </div>
                </div>

                <div style={{
                  background: 'var(--light-orange)',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center',
                  border: '3px solid var(--primary-orange)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
                  <div style={{ fontSize: '1.1rem', color: '#666' }}>
                    {locale === 'ar-SA' ? 'المبلغ المتبقي' : 'Remaining Balance'}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-orange)'
                  }}>
                    {locale === 'ar-SA' ? `${currentChild.fees.remaining} ريال` : `$${currentChild.fees.remaining}`}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button style={{
                  padding: '1.2rem 2rem',
                  background: 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s var(--bounce)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}>
                  💳 {locale === 'ar-SA' ? 'دفع الآن' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--primary-purple)',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              🔔 {locale === 'ar-SA' ? 'لوحة الإشعارات' : 'Notifications Panel'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentNotifications.map((notification: NotificationItem) => (
                <div key={notification.id} style={{
                  background: notification.read ? 'rgba(255,255,255,0.7)' : 'white',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow)',
                  border: `3px solid ${notification.read ? '#ddd' : 'var(--primary-pink)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ fontSize: '2rem' }}>
                      {notification.type === 'homework' ? '📚' :
                       notification.type === 'announcement' ? '📢' :
                       notification.type === 'fee' ? '💳' : '🔔'}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--primary-purple)',
                        margin: '0 0 0.5rem 0',
                        fontWeight: notification.read ? 'normal' : 'bold'
                      }}>
                        {notification.message}
                      </p>
                      <p style={{
                        fontSize: '1rem',
                        color: '#666',
                        margin: 0
                      }}>
                        📅 {notification.date}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: notification.read ? '#ddd' : 'var(--primary-pink)'
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Parent Portal Component
export default function ParentPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {!isLoggedIn ? (
        <LoginForm onLogin={() => setIsLoggedIn(true)} locale={locale} />
      ) : (
        <Dashboard onLogout={() => setIsLoggedIn(false)} locale={locale} />
      )}
    </>
  );
}
