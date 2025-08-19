'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

// Map roles to portal paths
const roleToPortal: Record<string, string> = {
  superadmin: 'admin',
  admin: 'admin',
  teacher: 'teacher-portal',
  parent: 'parent-portal',
  // Add more roles as needed
};

export default function UnifiedLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<string>('en-US');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        // Get custom claims or role from user
        const idTokenResult = await result.user.getIdTokenResult();
        const role = idTokenResult.claims.role as string | undefined;
        if (role && roleToPortal[String(role)]) {
          router.push(`/${locale}/${roleToPortal[String(role)]}`);
        } else {
          setError('No portal assigned for your role.');
        }
      } else {
        setError('Login failed.');
      }
    } catch (err) {
      setError('Login error.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Arabic translations
  const t = locale === 'ar-SA'
    ? {
        login: 'تسجيل الدخول',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        loggingIn: 'جاري تسجيل الدخول...',
        noPortal: 'لا توجد بوابة مخصصة لهذا الدور.',
        loginFailed: 'فشل تسجيل الدخول.',
        loginError: 'حدث خطأ أثناء تسجيل الدخول.',
      }
    : {
        login: 'Login',
        email: 'Email',
        password: 'Password',
        loggingIn: 'Logging in...',
        noPortal: 'No portal assigned for your role.',
        loginFailed: 'Login failed.',
        loginError: 'Login error.',
      };

  // Use RTL for Arabic
  const isRTL = locale === 'ar-SA';

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '4rem auto',
        padding: 32,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
      }}
    >
      <h2 style={{ marginBottom: 24, color: 'var(--primary-blue-dark)' }}>{t.login}</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 500 }}>{t.email}</label>
        <input
          type="email"
          placeholder={t.email}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 16, padding: '10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
        />
        <label style={{ fontWeight: 500 }}>{t.password}</label>
        <input
          type="password"
          placeholder={t.password}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 24, padding: '10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
            transition: 'background 0.2s',
          }}
        >
          {loading ? t.loggingIn : t.login}
        </button>
        {error && (
          <div style={{ color: '#e11d48', marginTop: 16, fontWeight: 500, fontSize: 15 }}>
            {error === 'No portal assigned for your role.' ? t.noPortal :
             error === 'Login failed.' ? t.loginFailed :
             error === 'Login error.' ? t.loginError : error}
          </div>
        )}
      </form>
    </div>
  );
}
