'use client';

import React, { useEffect, useState } from 'react';

export default function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const content = locale === 'ar-SA' ? {
    title: 'المعرض',
    subtitle: 'روضة خطوة المستقبل',
    heading: 'استكشف عالمنا',
    p1: 'يقدم معرضنا نافذة على الحياة اليومية في روضة خطوة المستقبل. شاهد كيف يتعلم أطفالنا وينمون ويضحكون في بيئة نابضة بالحياة مصممة خصيصًا لهم.',
    p2: 'من المغامرات الفنية واللعب في الهواء الطلق إلى الاحتفالات ذات الطابع الخاص والاكتشافات في الفصول الدراسية - كل صورة تحكي قصة تعلم ممتعة.',
    placeholder: 'سيتم إضافة الصور قريبًا...'
  } : {
    title: 'Gallery',
    subtitle: 'Future Step Kindergarten',
    heading: 'Explore Our World',
    p1: 'Our gallery offers a window into daily life at Future Step Kindergarten. See how our children learn, grow, and laugh in a vibrant environment designed just for them.',
    p2: 'From artistic adventures and outdoor play to themed celebrations and classroom discoveries — every photo tells a story of joyful learning.',
    placeholder: 'Images will be added soon...'
  };

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
        background: 'linear-gradient(135deg, var(--light-pink), var(--light-green))',
        borderRadius: 'var(--border-radius)',
        margin: '2rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
          fontWeight: 'bold'
        }}>
          {content.title}
        </h1>
        <h2 style={{
          fontSize: '2rem',
          color: 'var(--primary-pink)',
          marginBottom: '1.5rem'
        }}>
          {content.subtitle}
        </h2>
      </section>

      <section style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-orange)',
          marginBottom: '1.5rem',
          fontWeight: 'bold'
        }}>
          {content.heading}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'left' }}>
          {content.p1}
        </p>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'left', marginTop: '1rem' }}>
          {content.p2}
        </p>
      </section>

      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, var(--light-blue), var(--light-yellow))',
        borderRadius: 'var(--border-radius)',
        margin: '2rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
      }}>
        <h3 style={{
            fontSize: '2rem',
            color: 'var(--primary-purple)',
            fontWeight: 'bold'
        }}>{content.placeholder}</h3>
      </section>
    </div>
  );
}
