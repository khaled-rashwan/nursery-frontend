'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchAboutUsPageContent } from '../../../app/fetchContent';
import { LocaleSpecificAboutUsContent } from '../../../app/types';

export default function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [content, setContent] = useState<LocaleSpecificAboutUsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { locale: resolvedLocale } = await params;
      setLocale(resolvedLocale);
      const fetchedContent = await fetchAboutUsPageContent(resolvedLocale);
      setContent(fetchedContent);
      setLoading(false);
    };
    loadContent();
  }, [params]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1>Content Not Available</h1>
        <p>We&apos;re sorry, the content for this page could not be loaded.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      padding: '2rem 1rem'
    }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, var(--light-pink), var(--light-blue))',
        borderRadius: 'var(--border-radius)',
        margin: '2rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {locale === 'ar-SA' ? 'من نحن' : 'About Us'}
        </h1>
      </section>

      {/* Vision and Mission */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '3rem auto',
        padding: '0 1rem'
      }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)' }}>
          <h3>{content.vision.title}</h3>
          <p>{content.vision.text}</p>
        </div>
        <div style={{ background: 'white', padding: '3rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)' }}>
          <h3>{content.mission.title}</h3>
          <p>{content.mission.text}</p>
        </div>
      </div>

      {/* Principal's Message */}
      <section style={{
        background: 'white',
        padding: '4rem 3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
      }}>
        <h3>{content.principal.title}</h3>
        <p>{content.principal.text}</p>
      </section>

      {/* History Section */}
      <section style={{
        background: 'white',
        padding: '4rem 3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
      }}>
        <h3>{content.history.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'center' }}>
          {content.history.imageUrl && (
            <Image
              src={content.history.imageUrl}
              alt="Our History"
              width={300}
              height={300}
              style={{ borderRadius: 'var(--border-radius)', objectFit: 'cover' }}
            />
          )}
          <p style={{ whiteSpace: 'pre-wrap', flex: 1 }}>{content.history.text}</p>
        </div>
      </section>
    </div>
  );
}
