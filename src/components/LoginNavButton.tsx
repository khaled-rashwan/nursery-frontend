"use client";
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginNavButtonProps {
  locale: string;
}

export default function LoginNavButton({ locale }: LoginNavButtonProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (user) return null;

  return (
    <Link
      href={`/${locale}/login`}
      className="portal-nav-button"
      style={{
        padding: '0.5rem 1.2rem',
        fontWeight: '600',
        borderRadius: 20,
        background: '#f37f20',
        color: '#fff',
        fontSize: '0.95rem',
        marginInlineStart: '0.5rem',
        letterSpacing: '0.3px',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(243, 127, 32, 0.3)',
        direction: locale === 'ar-SA' ? 'rtl' : 'ltr',
      }}
    >
      {locale === 'ar-SA' ? 'تسجيل الدخول' : 'Login'}
    </Link>
  );
}
