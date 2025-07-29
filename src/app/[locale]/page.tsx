'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Hero Section Component
function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="hero-section scroll-reveal">
      <div className="hero-content">
        <h1 className="hero-title">
          {locale === 'ar-SA' ? 'مرحباً بكم في روضة المستقبل' : 'Welcome to Future Nursery'}
        </h1>
        <h2 className="hero-subtitle">
          {locale === 'ar-SA' ? 'حيث تنمو العقول الصغيرة لتحقق أحلاماً كبيرة!' : 'Where little minds grow big dreams!'}
        </h2>
        <p className="hero-text">
          {locale === 'ar-SA' 
            ? 'مكان سحري حيث يكتشف الأطفال ويتعلمون وينمون من خلال التعليم القائم على اللعب'
            : 'A magical place where children discover, learn, and flourish through play-based education'
          }
        </p>
      </div>
    </section>
  );
}

// Puzzle Components
function PuzzlePiece({ 
  icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: string; 
  title: string; 
  description: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`puzzle-piece scroll-reveal ${isVisible ? 'active' : ''}`}>
      <span className="puzzle-icon">{icon}</span>
      <h3 className="puzzle-title">{title}</h3>
      <p className="puzzle-description">{description}</p>
    </div>
  );
}

function PuzzleContainer({ locale }: { locale: string }) {
  const puzzleData = locale === 'ar-SA' ? [
    {
      icon: '🎨',
      title: 'التعلم الإبداعي',
      description: 'نشجع الإبداع والخيال من خلال الفنون والحرف اليدوية والأنشطة التفاعلية الممتعة.'
    },
    {
      icon: '🧩',
      title: 'التعلم باللعب',
      description: 'منهج تعليمي قائم على اللعب يجعل التعلم ممتعاً ومثيراً للأطفال في جميع المراحل.'
    },
    {
      icon: '👥',
      title: 'التطوير الاجتماعي',
      description: 'نساعد الأطفال على بناء مهارات التواصل والصداقة في بيئة آمنة ومحببة.'
    },
    {
      icon: '🌱',
      title: 'النمو الشامل',
      description: 'نركز على التطوير الجسدي والعقلي والعاطفي لكل طفل بطريقة متوازنة.'
    }
  ] : [
    {
      icon: '🎨',
      title: 'Creative Learning',
      description: 'We foster creativity and imagination through arts, crafts, and engaging interactive activities.'
    },
    {
      icon: '🧩',
      title: 'Play-Based Education',
      description: 'Our curriculum uses play as the primary vehicle for learning, making education fun and exciting.'
    },
    {
      icon: '👥',
      title: 'Social Development',
      description: 'We help children build communication skills and friendships in a safe, nurturing environment.'
    },
    {
      icon: '🌱',
      title: 'Holistic Growth',
      description: 'We focus on the physical, intellectual, and emotional development of every child.'
    }
  ];

  return (
    <div className="puzzle-container">
      {puzzleData.map((puzzle, index) => (
        <PuzzlePiece
          key={index}
          icon={puzzle.icon}
          title={puzzle.title}
          description={puzzle.description}
          delay={index * 200}
        />
      ))}
    </div>
  );
}

// Interactive Features Section
function InteractiveSection({ locale }: { locale: string }) {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = locale === 'ar-SA' ? [
    {
      emoji: '🎪',
      title: 'ملعب المرح',
      description: 'منطقة لعب آمنة ومليئة بالألعاب التعليمية المثيرة'
    },
    {
      emoji: '📚',
      title: 'مكتبة القصص',
      description: 'مجموعة رائعة من الكتب والقصص التفاعلية للأطفال'
    },
    {
      emoji: '🎵',
      title: 'قاعة الموسيقى',
      description: 'تعلم الموسيقى والغناء في بيئة ممتعة ومحفزة'
    },
    {
      emoji: '🔬',
      title: 'مختبر الاستكشاف',
      description: 'تجارب علمية بسيطة وآمنة تثير فضول الأطفال'
    }
  ] : [
    {
      emoji: '🎪',
      title: 'Fun Playground',
      description: 'Safe and exciting play area filled with educational toys and games'
    },
    {
      emoji: '📚',
      title: 'Story Library',
      description: 'Amazing collection of interactive books and stories for children'
    },
    {
      emoji: '🎵',
      title: 'Music Room',
      description: 'Learn music and singing in a fun and encouraging environment'
    },
    {
      emoji: '🔬',
      title: 'Discovery Lab',
      description: 'Simple and safe science experiments that spark children\'s curiosity'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="interactive-section" style={{ 
      padding: '4rem 2rem', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, var(--light-yellow), var(--light-orange))',
      borderRadius: 'var(--border-radius)',
      margin: '2rem auto',
      maxWidth: '1200px',
      boxShadow: 'var(--shadow)'
    }}>
      <h2 style={{ 
        fontSize: '2.5rem', 
        color: 'var(--primary-purple)', 
        marginBottom: '2rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
      }}>
        {locale === 'ar-SA' ? '🌟 مرافقنا المميزة' : '🌟 Our Amazing Facilities'}
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              background: activeFeature === index ? 'white' : 'rgba(255,255,255,0.7)',
              padding: '2rem',
              borderRadius: 'var(--border-radius)',
              transform: activeFeature === index ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease',
              border: `3px solid ${activeFeature === index ? 'var(--primary-pink)' : 'transparent'}`,
              cursor: 'pointer',
              boxShadow: activeFeature === index ? '0 10px 30px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)'
            }}
            onClick={() => setActiveFeature(index)}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.emoji}</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              color: 'var(--primary-purple)', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {feature.title}
            </h3>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#666',
              lineHeight: '1.6'
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Main HomePage Component
export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  useEffect(() => {
    if (!mounted) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
    };
  }, [mounted]);

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

  return (
    <div style={{ minHeight: '100vh' }}>
      <HeroSection locale={locale} />
      
      <section className="scroll-reveal" style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem',
        background: 'rgba(255,255,255,0.9)',
        margin: '2rem auto',
        borderRadius: 'var(--border-radius)',
        maxWidth: '800px',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          color: 'var(--primary-blue)', 
          marginBottom: '1.5rem',
          fontWeight: 'bold'
        }}>
          {locale === 'ar-SA' ? '🎯 رؤيتنا' : '🎯 Our Vision'}
        </h2>
        <p style={{ 
          fontSize: '1.3rem', 
          color: '#555',
          lineHeight: '1.8',
          fontStyle: 'italic'
        }}>
          {locale === 'ar-SA' 
            ? 'نسعى لتكوين جيل واعٍ ومبدع قادر على مواجهة تحديات المستقبل بثقة وتميز'
            : 'We strive to develop a conscious and creative generation capable of facing future challenges with confidence and excellence'
          }
        </p>
      </section>

      <PuzzleContainer locale={locale} />
      
      <InteractiveSection locale={locale} />
      
      <section className="scroll-reveal" style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem',
        background: 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
        color: 'white',
        borderRadius: 'var(--border-radius)',
        margin: '2rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {locale === 'ar-SA' ? '🚀 ابدأ رحلة طفلك معنا!' : '🚀 Start Your Child\'s Journey With Us!'}
        </h2>
        <p style={{ 
          fontSize: '1.3rem', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {locale === 'ar-SA' 
            ? 'انضم إلى عائلة روضة المستقبل واكتشف عالماً من التعلم والمرح'
            : 'Join the Future Nursery family and discover a world of learning and fun'
          }
        </p>
        <Link 
          href={`/${locale}/contact`}
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: 'var(--primary-yellow)',
            color: 'var(--primary-purple)',
            textDecoration: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            transition: 'all 0.3s var(--bounce)',
            border: '3px solid white',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
          }}
        >
          {locale === 'ar-SA' ? '📞 تواصل معنا الآن' : '📞 Contact Us Now'}
        </Link>
      </section>
    </div>
  );
}