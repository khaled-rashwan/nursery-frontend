import React, { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

interface AdminLoginFormProps {
  locale: string;
}

export function AdminLoginForm({ locale }: AdminLoginFormProps) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await login(credentials.email, credentials.password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '500px',
        border: '3px solid #3498db'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3498db, #2c3e50)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1rem auto',
            color: 'white'
          }}>
            🛡️
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            margin: '0 0 0.5rem 0'
          }}>
            {locale === 'ar-SA' ? 'بوابة الإدارة' : 'Admin Portal'}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#7f8c8d',
            margin: 0
          }}>
            {locale === 'ar-SA' 
              ? 'تسجيل الدخول للوصول إلى لوحة التحكم' 
              : 'Sign in to access the admin dashboard'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'البريد الإلكتروني الإداري' : 'Admin Email Address'}
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({
                ...credentials,
                email: e.target.value
              })}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder="admin@futurestep.edu.sa"
              required
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
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
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder="••••••••"
              required
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#ffebee',
              border: '2px solid #f44336',
              borderRadius: '8px',
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
                ? '#95a5a6' 
                : 'linear-gradient(135deg, #3498db, #2c3e50)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(52, 152, 219, 0.3)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(52, 152, 219, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(52, 152, 219, 0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                {locale === 'ar-SA' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
              </span>
            ) : (
              <>🚀 {locale === 'ar-SA' ? 'تسجيل الدخول' : 'Sign In'}</>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #e9ecef'
        }}>
          <p style={{ 
            fontSize: '0.9rem',
            color: '#6c757d',
            margin: 0
          }}>
            {locale === 'ar-SA' 
              ? '⚠️ مخصص للمديرين والإداريين المعتمدين فقط' 
              : '⚠️ For authorized administrators only'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
