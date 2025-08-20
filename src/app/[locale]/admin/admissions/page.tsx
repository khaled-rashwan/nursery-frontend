'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import AdmissionsManagement from '../components/admissions-management/AdmissionsManagement';

export default function AdminAdmissionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<string>('en-US');
  const { user, loading, userRole } = useAuth();
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

  if (userRole !== 'admin' && userRole !== 'superadmin') {
      return (
          <div style={{ textAlign: 'center', padding: '50px' }}>
              <h1>Access Denied</h1>
              <p>You do not have permission to view this page.</p>
          </div>
      );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      padding: '2rem'
    }}>
        <AdmissionsManagement locale={locale} />
    </div>
  );
}
