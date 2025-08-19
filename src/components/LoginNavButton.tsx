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
      className="nav-link bounce-on-hover"
      style={{
        padding: '0.5rem 1.2rem',
        fontWeight: 'bold',
        borderRadius: 20,
        background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
        color: '#fff',
        fontSize: 16,
        marginLeft: locale === 'ar-SA' ? 0 : 8,
        marginRight: locale === 'ar-SA' ? 8 : 0,
        letterSpacing: 0.5,
        boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
        direction: locale === 'ar-SA' ? 'rtl' : 'ltr',
      }}
    >
      {locale === 'ar-SA' ? 'تسجيل الدخول' : 'Login'}
    </Link>
  );
}
