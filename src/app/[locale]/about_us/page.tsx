'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
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
    title: 'من نحن',
    subtitle: 'نحن روضة المستقبل',
    description: 'نحن روضة خطوة المستقبل، ملتزمون بتعليم الطفولة المبكرة وتنمية قدرات الأطفال في بيئة آمنة ومحببة.',
    mission: 'رسالتنا',
    missionText: 'نهدف إلى تقديم تعليم عالي الجودة يركز على التطوير الشامل للطفل من خلال اللعب والاستكشاف والإبداع.',
    vision: 'رؤيتنا',
    visionText: 'أن نكون الخيار الأول لأولياء الأمور في تعليم أطفالهم وإعدادهم لمستقبل مشرق.',
    values: 'قيمنا',
    valuesItems: [
      '🌟 التميز في التعليم',
      '❤️ الحب والرعاية',
      '🤝 التعاون والشراكة',
      '🎨 الإبداع والابتكار',
      '🌱 النمو المستمر',
      '🛡️ الأمان والثقة'
    ]
  } : {
    title: 'About Us',
    subtitle: 'We are Future Nursery',
    description: 'We are Future Step Nursery, committed to early childhood education and developing children\'s abilities in a safe and loving environment.',
    mission: 'Our Mission',
    missionText: 'We aim to provide high-quality education that focuses on the holistic development of children through play, exploration, and creativity.',
    vision: 'Our Vision',
    visionText: 'To be the first choice for parents in educating their children and preparing them for a bright future.',
    values: 'Our Values',
    valuesItems: [
      '🌟 Excellence in Education',
      '❤️ Love and Care',
      '🤝 Cooperation and Partnership',
      '🎨 Creativity and Innovation',
      '🌱 Continuous Growth',
      '🛡️ Safety and Trust'
    ]
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, var(--light-pink), var(--light-blue))',
        borderRadius: 'var(--border-radius)',
        margin: '2rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
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
        <p style={{
          fontSize: '1.3rem',
          color: 'var(--primary-blue)',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {content.description}
        </p>
      </section>

      {/* Mission and Vision */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '3rem auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--light-yellow), white)',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          border: '3px solid var(--primary-yellow)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '2rem',
            color: 'var(--primary-orange)',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            🎯 {content.mission}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            color: '#555',
            lineHeight: '1.6'
          }}>
            {content.missionText}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--light-orange), white)',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          border: '3px solid var(--primary-orange)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '2rem',
            color: 'var(--primary-green)',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            🌟 {content.vision}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            color: '#555',
            lineHeight: '1.6'
          }}>
            {content.visionText}
          </p>
        </div>
      </div>

      {/* Values Section */}
      <section style={{
        background: 'white',
        padding: '3rem 2rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '2rem',
          fontWeight: 'bold'
        }}>
          💎 {content.values}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {content.valuesItems.map((value, index) => (
            <div key={index} style={{
              background: `linear-gradient(135deg, var(--light-${['pink', 'blue', 'yellow', 'orange', 'pink', 'blue'][index % 4]}), rgba(255,255,255,0.9))`,
              padding: '1.5rem',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--primary-purple)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              border: '2px solid var(--primary-pink)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}>
              {value}
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-green))',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          👥 {locale === 'ar-SA' ? 'فريقنا المتخصص' : 'Our Dedicated Team'}
        </h3>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          {locale === 'ar-SA' 
            ? 'يتكون فريقنا من معلمين مؤهلين ومتخصصين في تعليم الطفولة المبكرة، مكرسين لضمان أفضل تجربة تعليمية لأطفالكم.'
            : 'Our team consists of qualified teachers specialized in early childhood education, dedicated to ensuring the best educational experience for your children.'
          }
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          {['👩‍🏫', '👨‍🏫', '👩‍🎨', '👨‍🔬'].map((emoji, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '2rem',
              borderRadius: '50%',
              fontSize: '3rem',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2) rotate(10deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            }}>
              {emoji}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
