'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';

export default function AdminRolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<string>('en-US');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/admin/login`);
    }
  }, [user, loading, router, locale]);

  if (!mounted || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, var(--light-blue), var(--light-yellow))'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--primary-blue-dark)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}
          </h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '25px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
          border: '2px solid var(--primary-blue)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: 'var(--primary-blue-dark)',
            marginBottom: '2rem',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {locale === 'ar-SA' ? '🔐 إدارة الأدوار والصلاحيات' : '🔐 Roles & Permissions Management'}
          </h1>

          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#666'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '2rem',
              opacity: 0.3
            }}>
              🚧
            </div>
            
            <h2 style={{
              fontSize: '1.8rem',
              marginBottom: '1rem',
              color: 'var(--primary-blue-dark)'
            }}>
              {locale === 'ar-SA' ? 'قيد التطوير' : 'Under Development'}
            </h2>
            
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.6',
              marginBottom: '3rem'
            }}>
              {locale === 'ar-SA' 
                ? 'صفحة إدارة الأدوار والصلاحيات قيد التطوير حالياً. ستكون متاحة قريباً!'
                : 'The roles and permissions management page is currently under development. It will be available soon!'
              }
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => router.push(`/${locale}/admin`)}
                style={{
                  padding: '1rem 2rem',
                  background: 'var(--primary-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-blue-dark)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--primary-blue)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {locale === 'ar-SA' ? '← العودة للوحة الإدارة' : '← Back to Admin Panel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
