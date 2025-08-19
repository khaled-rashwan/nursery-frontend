'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { UserRole, canAccessAdmin } from '../../../utils/rolePermissions';
import { AdminLoginForm } from './components/AdminLoginForm';
import { AccessDenied } from './components/AccessDenied';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { injectSpinnerAnimation } from './styles/animations';

// Inject the CSS animation
injectSpinnerAnimation();

// Main Admin Portal Component
export default function AdminPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  // All hooks must be called unconditionally, at the top
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);
  const { user, loading: authLoading, logout, getUserCustomClaims } = useAuth();
  const router = require('next/navigation').useRouter();
  const [redirecting, setRedirecting] = useState(false);

  // All hooks and effects must be called before any return
  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  useEffect(() => {
    // Always check admin role if user is present
    const checkAdminRole = async () => {
      if (user && getUserCustomClaims) {
        setIsCheckingRole(true);
        try {
          const claims = await getUserCustomClaims();
          const userRole = claims?.role as UserRole;
          const hasAccess = canAccessAdmin(userRole);
          setHasAdminAccess(hasAccess);
        } catch (error) {
          console.error('Error checking admin role:', error);
          setHasAdminAccess(false);
        } finally {
          setIsCheckingRole(false);
        }
      } else if (user === null) {
        setHasAdminAccess(null);
        setIsCheckingRole(false);
      }
    };
    if (mounted && !authLoading) {
      checkAdminRole();
    }
  }, [user, mounted, authLoading, getUserCustomClaims]);

  useEffect(() => {
    if (mounted && !authLoading && !user && !redirecting) {
      setRedirecting(true);
      router.replace(`/${locale}/login`);
    }
  }, [mounted, authLoading, user, locale, router, redirecting]);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  useEffect(() => {
    // Always check admin role if user is present
    const checkAdminRole = async () => {
      if (user && getUserCustomClaims) {
        setIsCheckingRole(true);
        try {
          const claims = await getUserCustomClaims();
          const userRole = claims?.role as UserRole;
          const hasAccess = canAccessAdmin(userRole);
          setHasAdminAccess(hasAccess);
        } catch (error) {
          console.error('Error checking admin role:', error);
          setHasAdminAccess(false);
        } finally {
          setIsCheckingRole(false);
        }
      } else if (user === null) {
        setHasAdminAccess(null);
        setIsCheckingRole(false);
      }
    };
    if (mounted && !authLoading) {
      checkAdminRole();
    }
  }, [user, mounted, authLoading, getUserCustomClaims]);

  // All hooks and effects have been called above. Now render conditionally.
  const handleLogout = async () => {
    await logout();
    setHasAdminAccess(null);
  };

  // Show spinner if loading, mounting, checking role, or redirecting
  if (!mounted || authLoading || isCheckingRole || (!user && !redirecting)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
      }}>
        <div className="loading-spinner" style={{ width: '50px', height: '50px', marginBottom: '1rem' }}></div>
        <p style={{
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          {isCheckingRole
            ? (locale === 'ar-SA' ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...')
            : (locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...')
          }
        </p>
      </div>
    );
  }

  // Authenticated but no admin access - show access denied
  if (hasAdminAccess === false) {
    return <AccessDenied locale={locale} onSignOut={handleLogout} />;
  }

  // Authenticated with admin access - show dashboard
  if (hasAdminAccess === true) {
    return <AdminDashboard onLogout={handleLogout} locale={locale} />;
  }

  // This should not happen, but fallback to login
  return <AdminLoginForm locale={locale} />;
}
