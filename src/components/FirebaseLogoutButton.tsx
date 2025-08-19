'use client';


import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface FirebaseLogoutButtonProps {
  locale: string;
}

export default function FirebaseLogoutButton({ locale }: FirebaseLogoutButtonProps) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Don't render anything if no user is logged in
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="firebase-logout-btn"
      style={{
        padding: '0.5rem 1rem',
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: loading ? 0.7 : 1,
        minWidth: '100px',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.3)';
        }
      }}
    >
      {loading ? (
        <>
          <div 
            className="loading-spinner" 
            style={{ 
              width: '16px', 
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          {locale === 'ar-SA' ? 'جاري الخروج...' : 'Logging out...'}
        </>
      ) : (
        <>
          🚪
          {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Logout'}
        </>
      )}
    </button>
  );
}
