'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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
    subtitle: 'روضة خطوة المستقبل الأهلية',
    description: 'أكثر من مجرد مدرسة — نحن شريك للعائلات ومنصة انطلاق للمستقبل',
    mission: 'رسالتنا',
    missionText: 'في روضة خطوة المستقبل، مهمتنا هي توفير بيئة تعليمية مبكرة مبتكرة وملهمة تنمي فضول كل طفل الفطري، وتغذي مواهبه الفردية، وتبني المهارات الأساسية للتفكير الإبداعي وحل المشكلات والمشاركة المتعاطفة.',
    vision: 'رؤيتنا',
    visionText: 'إلهام الجيل القادم من المفكرين الإبداعيين وحلال المشكلات والأفراد المتعاطفين — رعاية قدراتهم الفطرية للتأثير الإيجابي على مجتمعاتهم والعالم.',
    philosophy: 'فلسفتنا',
    philosophyText: 'نؤمن أن كل طفل يولد بإمكانيات ويستحق مساحة تحترم فرديته. نهجنا المرتكز على الطفل والقائم على اللعب والموجه بالاستفسار يساعد المتعلمين الصغار على بناء الثقة والاستقلالية وحب التعلم.',
    principalMessage: 'رسالة المديرة',
    principalText: 'مرحباً بكم في عائلة روضة خطوة المستقبل! كمديرة، أؤمن بقوة التعليم المبكر في تشكيل مستقبل أطفالنا. نحن ملتزمون بخلق بيئة حيث يزدهر كل طفل ويكتشف إمكاناته الكاملة.',
    values: 'قيمنا',
    valuesItems: [
      {
        emoji: '🔍',
        title: 'الفضول والاستكشاف',
        description: 'نؤمن بإشعال شغف مدى الحياة للاستطلاع من خلال التجارب العملية والتعلم الموجه بالاستفسار.'
      },
      {
        emoji: '🎨',
        title: 'الإبداع والتعبير',
        description: 'من رواية القصص إلى الفن والموسيقى، نمكن الأطفال من التعبير عن أنفسهم بثقة وفرح.'
      },
      {
        emoji: '🧠',
        title: 'التفكير النقدي وحل المشكلات',
        description: 'أنشطتنا مصممة لمساعدة الأطفال على تطوير اتخاذ القرارات المدروسة والمرونة في مواجهة التحديات.'
      },
      {
        emoji: '💝',
        title: 'التعاطف والتعاون',
        description: 'نعزز مجتمع اللطف حيث يتعلم الأطفال الاحترام والعمل الجماعي والذكاء العاطفي.'
      },
      {
        emoji: '🌱',
        title: 'المرونة وعقلية النمو',
        description: 'يتم تشجيع الأطفال على احتضان التحديات والتعلم من الأخطاء والنمو من خلال المثابرة.'
      }
    ],
    closingMessage: 'انضموا إلينا ونحن نبني معياراً جديداً في تعليم السنوات المبكرة — خطوة مفرحة واحدة في كل مرة.'
  } : {
    title: 'About Us',
    subtitle: 'Future Step Nursery',
    description: 'We are more than a school — we are a partner to families and a launching pad for the future',
    mission: 'Our Mission',
    missionText: 'At Future Step Nursery, our mission is to provide an innovative and inspiring early learning environment that cultivates each child\'s innate curiosity, nurtures their individual talents, and builds the foundational skills for creative thinking, problem-solving, and empathetic engagement.',
    vision: 'Our Vision',
    visionText: 'To inspire the next generation of creative thinkers, problem-solvers, and empathetic individuals — nurturing their innate abilities to positively impact their communities and the world.',
    philosophy: 'Our Philosophy',
    philosophyText: 'We believe every child is born with potential and deserves a space that respects their individuality. Our child-centered, play-based, and inquiry-driven approach helps young learners build confidence, independence, and a love for learning.',
    principalMessage: 'Principal\'s Message',
    principalText: 'Welcome to the Future Step Nursery family! As the principal, I believe in the power of early education to shape our children\'s future. We are committed to creating an environment where every child thrives and discovers their full potential.',
    values: 'Our Values',
    valuesItems: [
      {
        emoji: '🔍',
        title: 'Curiosity & Discovery',
        description: 'We believe in sparking a lifelong passion for exploration through hands-on experiences and inquiry-led learning.'
      },
      {
        emoji: '🎨',
        title: 'Creativity & Expression',
        description: 'From storytelling to art and music, we empower children to express themselves with confidence and joy.'
      },
      {
        emoji: '🧠',
        title: 'Critical Thinking & Problem Solving',
        description: 'Our activities are designed to help children develop thoughtful decision-making and resilience in the face of challenges.'
      },
      {
        emoji: '💝',
        title: 'Empathy & Collaboration',
        description: 'We foster a community of kindness where children learn respect, teamwork, and emotional intelligence.'
      },
      {
        emoji: '🌱',
        title: 'Resilience & Growth Mindset',
        description: 'Children are encouraged to embrace challenges, learn from mistakes, and grow through perseverance.'
      }
    ],
    closingMessage: 'Join us as we build a new standard in early years education — one joyful step at a time.'
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
        background: 'linear-gradient(135deg, var(--light-pink), var(--light-blue))',
        borderRadius: 'var(--border-radius)',
        margin: '2rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          fontSize: '3rem',
          opacity: 0.3,
          animation: 'bounce 2s infinite'
        }}>🌟</div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          fontSize: '2.5rem',
          opacity: 0.3,
          animation: 'bounce 2s infinite 0.5s'
        }}>🎨</div>
        
        {/* Logo */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Image
            src="/logo.png" 
            alt="Future Step Nursery Logo"
            width={200}
            height={120}
            style={{
              objectFit: 'contain',
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        </div>
        
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
        <p style={{
          fontSize: '1.3rem',
          color: 'var(--primary-blue)',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6',
          fontStyle: 'italic',
          fontWeight: 'bold'
        }}>
          {content.description}
        </p>
      </section>

      {/* Mission and Vision */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '3rem auto',
        padding: '0 1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--light-yellow), white)',
          padding: '3rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          border: '4px solid var(--primary-yellow)',
          textAlign: 'center',
          position: 'relative',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '2rem',
            opacity: 0.4
          }}>🎯</div>
          <h3 style={{
            fontSize: '2.5rem',
            color: 'var(--primary-orange)',
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            🎯 {content.mission}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            color: '#555',
            lineHeight: '1.8',
            textAlign: 'left'
          }}>
            {content.missionText}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--light-orange), white)',
          padding: '3rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          border: '4px solid var(--primary-orange)',
          textAlign: 'center',
          position: 'relative',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '2rem',
            opacity: 0.4
          }}>🌟</div>
          <h3 style={{
            fontSize: '2.5rem',
            color: 'var(--primary-green)',
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            🌟 {content.vision}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            color: '#555',
            lineHeight: '1.8',
            textAlign: 'left'
          }}>
            {content.visionText}
          </p>
        </div>
      </div>

      {/* Principal's Message */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-green))',
        color: 'white',
        padding: '4rem 3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '2rem',
          opacity: 0.3
        }}>💝</div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '2rem',
          opacity: 0.3
        }}>�</div>
        
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '4rem',
          border: '3px solid rgba(255,255,255,0.3)'
        }}>
          👩‍🏫
        </div>
        <h3 style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          💬 {content.principalMessage}
        </h3>
        <p style={{
          fontSize: '1.4rem',
          lineHeight: '1.8',
          maxWidth: '800px',
          margin: '0 auto',
          fontStyle: 'italic'
        }}>
          {content.principalText}
        </p>
      </section>

      {/* Values Section */}
      <section style={{
        background: 'white',
        padding: '4rem 3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '2rem',
          opacity: 0.3
        }}>✨</div>
        
        <h3 style={{
          fontSize: '3rem',
          color: 'var(--primary-purple)',
          marginBottom: '3rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          💎 {content.values}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          {content.valuesItems.map((value, index) => {
            const colors = ['pink', 'blue', 'yellow', 'orange', 'green'];
            const colorIndex = index % colors.length;
            
            return (
              <div 
                key={index} 
                style={{
                  background: `linear-gradient(135deg, var(--light-${colors[colorIndex]}), rgba(255,255,255,0.9))`,
                  padding: '2.5rem',
                  borderRadius: 'var(--border-radius)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: `3px solid var(--primary-${colors[colorIndex]})`,
                  boxShadow: 'var(--shadow)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1.5rem',
                  display: 'inline-block',
                  animation: `bounce 2s infinite ${index * 0.2}s`
                }}>
                  {value.emoji}
                </div>
                <h4 style={{
                  fontSize: '1.6rem',
                  color: 'var(--primary-purple)',
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  {value.title}
                </h4>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  lineHeight: '1.6',
                  textAlign: 'left'
                }}>
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Philosophy Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--light-purple), white)',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
        border: '4px solid var(--primary-purple)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          fontSize: '2rem',
          opacity: 0.4
        }}>🎭</div>
        <div style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          fontSize: '2rem',
          opacity: 0.4
        }}>🌟</div>
        
        <h3 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '2rem',
          fontWeight: 'bold'
        }}>
          🎭 {content.philosophy}
        </h3>
        <p style={{
          fontSize: '1.3rem',
          color: '#555',
          lineHeight: '1.8',
          textAlign: 'left',
          fontStyle: 'italic',
          background: 'rgba(255,255,255,0.7)',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          border: '2px solid var(--light-purple)'
        }}>
          {content.philosophyText}
        </p>
      </section>

      {/* Closing Message */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
        color: 'white',
        padding: '4rem 3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          fontSize: '2rem',
          opacity: 0.3
        }}>🚀</div>
        <div style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          fontSize: '2rem',
          opacity: 0.3
        }}>⭐</div>
        
        <div style={{
          fontSize: '5rem',
          marginBottom: '2rem',
          animation: 'bounce 2s infinite'
        }}>
          🚀
        </div>
        <h3 style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {locale === 'ar-SA' ? '🌟 انضموا إلى رحلتنا' : '🌟 Join Our Journey'}
        </h3>
        <p style={{
          fontSize: '1.4rem',
          lineHeight: '1.8',
          fontStyle: 'italic',
          marginBottom: '2rem'
        }}>
          {content.closingMessage}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <a 
            href={`/${locale}/contact`}
            style={{
              display: 'inline-block',
              padding: '1.2rem 2rem',
              background: 'var(--primary-yellow)',
              color: 'var(--primary-purple)',
              textDecoration: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
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
            {locale === 'ar-SA' ? '📞 تواصل معنا' : '📞 Contact Us'}
          </a>
          <a 
            href={`/${locale}/admissions`}
            style={{
              display: 'inline-block',
              padding: '1.2rem 2rem',
              background: 'transparent',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              border: '3px solid white',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'var(--primary-purple)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            }}
          >
            {locale === 'ar-SA' ? '🎓 التسجيل' : '🎓 Admissions'}
          </a>
        </div>
      </section>
    </div>
  );
}
