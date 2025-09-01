'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchAcademicProgramPageContent } from '../../../app/fetchContent';
import { LocaleSpecificAcademicProgramContent, AcademicProgram } from '../../../app/types';

export default function AcademicProgramPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [content, setContent] = useState<LocaleSpecificAcademicProgramContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { locale: resolvedLocale } = await params;
      setLocale(resolvedLocale);
      const fetchedContent = await fetchAcademicProgramPageContent(resolvedLocale);
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
          {content.title}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
          {content.description}
        </p>
      </section>

      {/* Programs Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '3rem auto',
        padding: '0 1rem'
      }}>
        {content.programs.map((program: AcademicProgram, index: number) => (
          <div key={index} style={{ background: 'white', padding: '3rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <Image
              src={program.image}
              alt={program.title}
              width={200}
              height={200}
              style={{ borderRadius: 'var(--border-radius)', objectFit: 'cover', margin: '0 auto 1.5rem auto' }}
            />
            <h3>{program.title}</h3>
            <p style={{ color: '#888', marginBottom: '1rem' }}>{program.age}</p>
            <p>{program.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
