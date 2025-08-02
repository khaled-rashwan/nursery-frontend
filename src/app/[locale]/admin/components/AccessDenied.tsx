import React from 'react';

interface AccessDeniedProps {
  locale: string;
  onSignOut: () => void;
}

export function AccessDenied({ locale, onSignOut }: AccessDeniedProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        border: '3px solid #e74c3c'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          margin: '0 auto 2rem auto',
          color: 'white'
        }}>
          🚫
        </div>
        
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#e74c3c',
          margin: '0 0 1rem 0'
        }}>
          {locale === 'ar-SA' ? 'الوصول مرفوض' : 'Access Denied'}
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#7f8c8d',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {locale === 'ar-SA' 
            ? 'عذراً، ليس لديك الصلاحية للوصول إلى بوابة الإدارة. يرجى تسجيل الخروج وإعادة تسجيل الدخول بحساب إداري معتمد.'
            : 'Sorry, you do not have permission to access the admin portal. Please sign out and sign in with an authorized admin account.'
          }
        </p>
        
        <button
          onClick={onSignOut}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 15px rgba(231, 76, 60, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.3)';
          }}
        >
          🚪 {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
