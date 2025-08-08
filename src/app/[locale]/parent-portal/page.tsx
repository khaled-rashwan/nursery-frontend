'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { useAuth } from '../../../hooks/useAuth';
import { UserRole, getRoleName } from '../../../utils/rolePermissions';
import { 
  logSecurityEvent 
} from '../../../utils/parentPortalSecurity';
import { fetchChildren as fetchChildrenService, fetchStudentAttendanceHistory, ChildEnriched, StudentAttendanceHistoryResponse } from './services/api';

// Child interface - updated to match Firestore data
interface Child {
  id: string;
  name: string;
  nameEn: string;
  class?: string;
  classEn?: string;
  photo?: string;
  attendanceRate?: string; // derived from attendance stats
  fees?: {
    total: number;
    paid: number;
    remaining: number;
  };
  birthDate?: string;
  age?: string;
  parentUID?: string;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  emoji?: string; // made optional for backward compatibility; new data won't include it
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

// Access Denied Component
function AccessDenied({ locale, onLogout, currentRole }: { 
  locale: string; 
  onLogout: () => void; 
  currentRole?: UserRole | null;
}) {
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
        maxWidth: '600px',
        border: '4px solid var(--primary-pink)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🚫</div>
        
        <h1 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          {locale === 'ar-SA' ? 'الوصول مرفوض' : 'Access Denied'}
        </h1>
        
        <p style={{
          fontSize: '1.4rem',
          color: 'var(--primary-blue)',
          marginBottom: '1rem',
          lineHeight: '1.6'
        }}>
          {locale === 'ar-SA' 
            ? 'عذراً، هذه الصفحة مخصصة لأولياء الأمور فقط. يبدو أن حسابك لا يملك صلاحيات ولي أمر.'
            : 'Sorry, this page is exclusively for parents. It appears your account does not have parent privileges.'
          }
        </p>

        {/* Show current role for debugging purposes */}
        {currentRole && (
          <div style={{
            background: 'var(--light-red)',
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem',
            border: '2px solid var(--primary-red)'
          }}>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--primary-red)',
              margin: 0,
              fontWeight: 'bold'
            }}>
              {locale === 'ar-SA' 
                ? `دورك الحالي: ${getRoleName(currentRole, locale)}`
                : `Your current role: ${getRoleName(currentRole, locale)}`
              }
            </p>
          </div>
        )}

        <div style={{
          background: 'var(--light-yellow)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '2rem',
          border: '3px solid var(--primary-yellow)'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            color: 'var(--primary-orange)',
            marginBottom: '1rem'
          }}>
            {locale === 'ar-SA' ? 'ماذا يمكنك فعله؟' : 'What can you do?'}
          </h3>
          <ul style={{
            fontSize: '1.1rem',
            color: '#666',
            textAlign: locale === 'ar-SA' ? 'right' : 'left',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              {locale === 'ar-SA' 
                ? '• تسجيل الخروج والدخول بحساب ولي أمر'
                : '• Logout and login with a parent account'
              }
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              {locale === 'ar-SA' 
                ? '• التواصل مع الإدارة لتحديث صلاحياتك'
                : '• Contact administration to update your permissions'
              }
            </li>
            <li>
              {locale === 'ar-SA' 
                ? '• الانتقال إلى الصفحة الرئيسية'
                : '• Go back to the main page'
              }
            </li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={onLogout}
            style={{
              padding: '1.2rem 2rem',
              background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-blue))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s var(--bounce)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            }}
          >
            🚪 {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Logout'}
          </button>

          <Link 
            href={`/${locale}`}
            style={{
              display: 'inline-block',
              padding: '1.2rem 2rem',
              background: 'var(--primary-green)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.3s var(--bounce)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            }}
          >
            🏠 {locale === 'ar-SA' ? 'الصفحة الرئيسية' : 'Home Page'}
          </Link>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--light-blue)',
          borderRadius: 'var(--border-radius)'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
            {locale === 'ar-SA' 
              ? 'للمساعدة، اتصل بالإدارة على: 123-4567'
              : 'For assistance, contact administration at: 123-4567'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// Login Component
function LoginForm({ locale }: { locale: string }) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'iqama'>('email');
  const [credentials, setCredentials] = useState({ email: '', iqama: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (loginMethod === 'email') {
      // Use Firebase authentication for email login
      const result = await login(credentials.email, credentials.password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
      // No need to call onLogin since Firebase auth state will handle the redirect
    } else {
      // Keep the mock login for Iqama method since Firebase backend is not ready
      setError('Iqama login is not available yet. Please use email login.');
    }
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

          {error && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#ffebee',
              border: '2px solid #f44336',
              borderRadius: 'var(--border-radius)',
              color: '#d32f2f',
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.2rem',
              background: loading 
                ? '#ccc' 
                : 'linear-gradient(135deg, var(--primary-pink), var(--primary-blue))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s var(--bounce)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
              }
            }}
          >
            {loading ? (
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

// Session Monitor Component
function SessionMonitor({ 
  user, 
  onLogout, 
  locale 
}: { 
  user: User | null; 
  onLogout: () => void; 
  locale: string; 
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        const token = await user.getIdTokenResult();
        const expirationTime = token.expirationTime;
        const currentTime = Date.now();
        const timeUntilExpiry = new Date(expirationTime).getTime() - currentTime;
        
        // Show warning 5 minutes before expiry
        if (timeUntilExpiry > 0 && timeUntilExpiry <= 5 * 60 * 1000) {
          setShowWarning(true);
          setTimeLeft(Math.floor(timeUntilExpiry / 1000));
        } else if (timeUntilExpiry <= 0) {
          // Session expired, logout immediately
          onLogout();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    
    // Initial check
    checkSession();

    return () => clearInterval(interval);
  }, [user, onLogout]);

  // Update countdown every second when warning is shown
  useEffect(() => {
    if (!showWarning) return;

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onLogout(); // Auto logout when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showWarning, onLogout]);

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'var(--primary-orange)',
      color: 'white',
      padding: '1rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow)',
      zIndex: 9999,
      maxWidth: '300px',
      border: '3px solid var(--primary-red)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <strong>
          {locale === 'ar-SA' ? 'تحذير انتهاء الجلسة' : 'Session Expiry Warning'}
        </strong>
      </div>
      
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
        {locale === 'ar-SA' 
          ? `ستنتهي جلستك خلال ${minutes}:${seconds.toString().padStart(2, '0')}`
          : `Your session will expire in ${minutes}:${seconds.toString().padStart(2, '0')}`
        }
      </p>
      
      <button
        onClick={() => setShowWarning(false)}
        style={{
          padding: '0.5rem 1rem',
          background: 'white',
          color: 'var(--primary-orange)',
          border: 'none',
          borderRadius: 'calc(var(--border-radius) / 2)',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {locale === 'ar-SA' ? 'إغلاق التحذير' : 'Dismiss Warning'}
      </button>
    </div>
  );
}

// Dashboard Component
// Child Selector Component
function ChildSelector({ selectedChildId, onChildChange, locale, children }: { 
  selectedChildId: string; 
  onChildChange: (childId: string) => void; 
  locale: string;
  children: Child[];
}) {
  const selectedChild = children.find(child => child.id === selectedChildId);

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
          {children.map((child) => (
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
              <span style={{ fontSize: '1.5rem' }}>{child.photo || '👧'}</span>
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
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StudentAttendanceHistoryResponse>>({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const { user } = useAuth();
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Fetch children from backend (Step 1 integration)
  useEffect(() => {
    let cancelled = false;
    async function loadChildren() {
      if (!user) return;
      setLoadingChildren(true);
      setChildrenError(null);
      try {
        const token = await user.getIdToken();
        const fetched: ChildEnriched[] = await fetchChildrenService(token, user.uid);
        if (cancelled) return;
        // Map to Child shape (class info to be added later when enrollment endpoints used)
        const mapped: Child[] = fetched.map(c => ({
          id: c.id,
          name: c.name,
          nameEn: c.nameEn,
          birthDate: c.birthDate,
          age: c.age ? `${c.age} ${locale === 'ar-SA' ? 'سنة' : 'yrs'}` : undefined,
          parentUID: c.parentUID,
          photo: c.photo
        }));
        setChildren(mapped);
        if (mapped.length > 0) {
          setSelectedChildId(prev => prev || mapped[0].id);
        }
      } catch (e:any) {
        if (!cancelled) {
          console.error('Failed to load children', e);
          setChildrenError(e.message || 'Failed to load children');
          setChildren([]);
        }
      } finally {
        if (!cancelled) setLoadingChildren(false);
      }
    }
    loadChildren();
    return () => { cancelled = true; };
  }, [user, locale]);

  // Fetch attendance for selected child
  useEffect(() => {
    let cancelled = false;
    async function loadAttendance() {
      if (!user || !selectedChildId || attendanceMap[selectedChildId]) return; // already loaded
      setLoadingAttendance(true);
      setAttendanceError(null);
      try {
        const token = await user.getIdToken();
        const data = await fetchStudentAttendanceHistory(token, selectedChildId);
        if (cancelled) return;
        if (data) {
          setAttendanceMap(prev => ({ ...prev, [selectedChildId]: data }));
          // Update child attendanceRate
          setChildren(prev => prev.map(ch => ch.id === selectedChildId ? { ...ch, attendanceRate: data.stats.attendanceRate } : ch));
        }
      } catch (e:any) {
        if (!cancelled) {
          console.error('Failed to load attendance', e);
            setAttendanceError(e.message || 'Failed to load attendance');
        }
      } finally {
        if (!cancelled) setLoadingAttendance(false);
      }
    }
    loadAttendance();
    return () => { cancelled = true; };
  }, [user, selectedChildId, attendanceMap]);

  // Get current child data
  const currentChild = children.find(child => child.id === selectedChildId) || children[0];
  const attendanceHistory = currentChild ? attendanceMap[currentChild.id] : undefined;
  // Filter attendance records by selected month (YYYY-MM)
  const currentAttendance = attendanceHistory ? attendanceHistory.records.filter(r => r.date.startsWith(selectedMonth)) : [];
  const attendanceRateDisplay = currentChild?.attendanceRate || (attendanceHistory?.stats.attendanceRate ? attendanceHistory.stats.attendanceRate : '--');

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
        {/* Show loading state while fetching children */}
        {loadingChildren ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
            <p style={{ fontSize: '1.2rem', color: 'var(--primary-purple)' }}>
              {locale === 'ar-SA' ? 'جاري تحميل بيانات الأطفال...' : 'Loading children data...'}
            </p>
          </div>
        ) : children.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👶</div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-purple)', marginBottom: '1rem' }}>
              {locale === 'ar-SA' ? 'لا توجد أطفال مسجلين' : 'No Children Found'}
            </h3>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>
              {locale === 'ar-SA' 
                ? 'لا توجد أطفال مرتبطين بحسابك. يرجى التواصل مع الإدارة.'
                : 'No children are associated with your account. Please contact administration.'
              }
            </p>
          </div>
        ) : (
          <>
            <ChildSelector 
              selectedChildId={selectedChildId}
              onChildChange={(id) => {
                setSelectedChildId(id);
              }}
              locale={locale}
              children={children}
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
                        🎂 {locale === 'ar-SA' ? 'العمر:' : 'Age:'} {currentChild?.age || '--'}
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
                        {attendanceRateDisplay}{attendanceRateDisplay !== '--' ? '%' : ''}
                      </div>
                      <div style={{
                        fontSize: '1.1rem',
                        color: 'var(--primary-green)',
                        fontWeight: 'bold'
                      }}>
                        {locale === 'ar-SA' ? 'نسبة الحضور' : 'Attendance Rate'}
                      </div>
                      {loadingAttendance && <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.5rem' }}>{locale==='ar-SA'?'جاري التحميل...':'Loading...'}</div>}
                      {attendanceError && <div style={{ fontSize: '0.8rem', color: 'var(--primary-red)', marginTop: '0.5rem' }}>{attendanceError}</div>}
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
                      {currentChild.id}
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
                      {locale === 'ar-SA' ? `${currentChild.fees?.remaining || 0} ريال` : `$${currentChild.fees?.remaining || 0}`}
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
                      {currentChild.id}
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
                    {currentAttendance.map((record, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: record.status === 'present' ? 'var(--light-green)' : record.status === 'late' ? 'var(--light-yellow)' : 'var(--light-pink)',
                        borderRadius: 'var(--border-radius)',
                        border: `3px solid ${record.status === 'present' ? 'var(--primary-green)' : record.status === 'late' ? 'var(--primary-yellow)' : 'var(--primary-pink)'}`
                      }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                          📅 {record.date}
                        </span>
                        <span style={{ fontSize: '1.2rem' }}>
                          {record.status === 'present' ? (locale==='ar-SA'?'حاضر':'Present') : record.status === 'late' ? (locale==='ar-SA'?'متأخر':'Late') : (locale==='ar-SA'?'غائب':'Absent')}
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
                  {/* {currentHomework.map((hw: HomeworkItem, index: number) => (
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
                  ))} */}
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
                        {locale === 'ar-SA' ? `${currentChild.fees?.total || 0} ريال` : `$${currentChild.fees?.total || 0}`}
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
                        {locale === 'ar-SA' ? `${currentChild.fees?.paid || 0} ريال` : `$${currentChild.fees?.paid || 0}`}
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
                        {locale === 'ar-SA' ? `${currentChild.fees?.remaining || 0} ريال` : `$${currentChild.fees?.remaining || 0}`}
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
                  {currentChild.id}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Main Parent Portal Component
export default function ParentPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);
  const { user, loading: authLoading, logout, getUserCustomClaims } = useAuth();

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  // Check user role when user is authenticated
  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        setRoleLoading(true);
        setRoleError(null);
        
        try {
          const claims = await getUserCustomClaims();
          const role = claims?.role as UserRole;
          
          console.log('[DEBUG] Role check result:', { 
            userId: user.uid, 
            email: user.email,
            role, 
            claims 
          });
          
          // Simple role check - just verify the user has 'parent' role
          if (!role) {
            setRoleError('No role assigned to this account');
            setUserRole(null);
          } else if (role !== 'parent') {
            // Log security event for role mismatch
            logSecurityEvent('role_mismatch', {
              userId: user.uid,
              userRole: role,
              expectedRole: 'parent',
              timestamp: new Date(),
              userAgent: navigator.userAgent
            });
            
            setRoleError(`Access denied. Your role is: ${role}`);
            setUserRole(role); // Set the actual role so it shows in access denied screen
          } else {
            // User has parent role - allow access
            setUserRole(role);
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          
          // Log security event for failed role check
          logSecurityEvent('unauthorized_access', {
            userId: user.uid,
            userRole: null,
            expectedRole: 'parent',
            timestamp: new Date(),
            userAgent: navigator.userAgent
          });
          
          setRoleError('Failed to verify account permissions');
          setUserRole(null);
        } finally {
          setRoleLoading(false);
        }
      } else {
        setUserRole(null);
        setRoleLoading(false);
        setRoleError(null);
      }
    };

    checkUserRole();
  }, [user, getUserCustomClaims]);

  // Show loading spinner while checking authentication and role
  if (!mounted || authLoading || (user && roleLoading)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, var(--light-pink), var(--light-blue))'
      }}>
        <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--primary-purple)',
          fontWeight: 'bold'
        }}>
          {locale === 'ar-SA' ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...'}
        </p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setUserRole(null); // Reset role state on logout
    setRoleError(null);
  };

  const handleRetryRoleCheck = async () => {
    if (user) {
      setRoleLoading(true);
      setRoleError(null);
      
      try {
        const claims = await getUserCustomClaims();
        const role = claims?.role as UserRole;
        
        console.log('[DEBUG] Retry role check result:', { 
          userId: user.uid, 
          email: user.email,
          role, 
          claims 
        });
        
        // Simple role check - just verify the user has 'parent' role
        if (!role) {
          setRoleError('No role assigned to this account');
          setUserRole(null);
        } else if (role !== 'parent') {
          // Log security event for role mismatch
          logSecurityEvent('role_mismatch', {
            userId: user.uid,
            userRole: role,
            expectedRole: 'parent',
            timestamp: new Date(),
            userAgent: navigator.userAgent
          });
          
          setRoleError(`Access denied. Your role is: ${role}`);
          setUserRole(role); // Set the actual role so it shows in access denied screen
        } else {
          // User has parent role - allow access
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        
        // Log security event for failed role check
        logSecurityEvent('unauthorized_access', {
          userId: user.uid,
          userRole: null,
          expectedRole: 'parent',
          timestamp: new Date(),
          userAgent: navigator.userAgent
        });
        
        setRoleError('Failed to verify account permissions');
        setUserRole(null);
      } finally {
        setRoleLoading(false);
      }
    }
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm locale={locale} />;
  }

  // If there was an error checking role, show error with retry option
  if (roleError && !roleLoading) {
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
          border: '4px solid var(--primary-red)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚠️</div>
          
          <h2 style={{
            fontSize: '2rem',
            color: 'var(--primary-red)',
            marginBottom: '1rem'
          }}>
            {locale === 'ar-SA' ? 'خطأ في التحقق من الصلاحيات' : 'Permission Check Error'}
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '2rem'
          }}>
            {locale === 'ar-SA' 
              ? 'حدث خطأ أثناء التحقق من صلاحيات حسابك. يرجى المحاولة مرة أخرى.'
              : 'An error occurred while checking your account permissions. Please try again.'
            }
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleRetryRoleCheck}
              style={{
                padding: '1rem 2rem',
                background: 'var(--primary-green)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔄 {locale === 'ar-SA' ? 'إعادة المحاولة' : 'Retry'}
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '1rem 2rem',
                background: 'var(--primary-orange)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚪 {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated but doesn't have parent role, show access denied
  if (userRole !== 'parent') {
    return <AccessDenied locale={locale} onLogout={handleLogout} currentRole={userRole} />;
  }

  // If user is authenticated and has parent role, show dashboard
  return (
    <>
      <SessionMonitor user={user} onLogout={handleLogout} locale={locale} />
      <Dashboard onLogout={handleLogout} locale={locale} />
    </>
  );
}
