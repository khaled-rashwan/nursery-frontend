'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchHomePageContent } from '../../app/fetchContent';
import { LocaleSpecificContent, Program, Feature, AdditionalFeature } from '../../app/types';

// Helper function to get color for program cards
const getProgramColor = (index: number): string => {
  const colors = ['var(--primary-pink)', 'var(--primary-blue)', 'var(--primary-green)'];
  return colors[index % colors.length];
};

// Helper function to get color for feature cards
const getFeatureColor = (index: number): string => {
  const colors = [
    'var(--primary-pink)', 'var(--primary-blue)', 'var(--primary-green)',
    'var(--primary-orange)', 'var(--primary-purple)', 'var(--primary-pink)'
  ];
  return colors[index % colors.length];
};

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollY;
};

// Intersection Observer hook for reveal animations
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible] as const;
};


// Hero Section Component with modern parallax effect
function HeroSection({ content, locale }: { content: LocaleSpecificContent['hero']; locale: string }) {
  const scrollY = useScrollAnimation();
  const [heroRef, heroVisible] = useIntersectionObserver();

  return (
    <section
      ref={heroRef}
      style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #fff8e1 50%, #fff3e0 100%)',
      }}
    >
      {/* Animated background shapes */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff885e80, #ffcb6980)',
          transform: `translateY(${scrollY * 0.3}px)`,
          transition: 'transform 0.1s ease-out',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #37a5ef80, #82c34180)',
          transform: `translateY(${scrollY * 0.2}px)`,
          transition: 'transform 0.1s ease-out',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #82c34180, #ffcb6980)',
          transform: `translateY(${scrollY * 0.4}px)`,
          transition: 'transform 0.1s ease-out',
          filter: 'blur(40px)',
        }} />
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '4rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '4rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        opacity: heroVisible ? 1 : 0,
        transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-out',
      }}>
        {/* Text Content */}
        <div style={{
          textAlign: locale === 'ar-SA' ? 'right' : 'left',
          animation: heroVisible ? 'slideInLeft 0.8s ease-out' : 'none',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'white',
            padding: '0.8rem 2rem',
            borderRadius: '50px',
            marginBottom: '2rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            border: '2px solid #ff885e',
          }}>
            <span style={{
              fontSize: '1.1rem',
              color: '#2d72ba',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>✨</span>
              {content.welcome}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #2d72ba, #37a5ef, #ff885e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {content.title}
          </h1>

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            color: '#ff885e',
            fontWeight: '600',
            marginBottom: '2rem',
            lineHeight: '1.4',
          }}>
            {content.subtitle}
          </h2>

          <p style={{
            fontSize: '1.2rem',
            color: '#555',
            lineHeight: '1.8',
            marginBottom: '3rem',
            background: 'rgba(255,255,255,0.8)',
            padding: '1.5rem',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            {content.description}
          </p>

          <div style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <Link href={`/${locale}/admissions`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '1.2rem 2.5rem',
              background: 'linear-gradient(135deg, #ff885e, #f23f00)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: '700',
              boxShadow: '0 8px 25px rgba(255,136,94,0.4)',
              transition: 'all 0.3s ease',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(255,136,94,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,136,94,0.4)';
            }}>
              <span style={{ fontSize: '1.4rem' }}>🎓</span>
              {content.enrollButton}
            </Link>

            <Link href={`/${locale}/about_us`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '1.2rem 2.5rem',
              background: 'white',
              color: '#2d72ba',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: '700',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              border: '2px solid #2d72ba',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#2d72ba';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#2d72ba';
            }}>
              <span style={{ fontSize: '1.4rem' }}>💫</span>
              {content.learnMoreButton}
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: heroVisible ? 'slideInRight 0.8s ease-out' : 'none',
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '550px',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff885e40, #37a5ef40)',
              filter: 'blur(60px)',
              animation: 'pulse 3s ease-in-out infinite',
            }} />
            <div style={{
              position: 'relative',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
              transform: `translateY(${scrollY * 0.1}px)`,
              transition: 'transform 0.1s ease-out',
            }}>
              <Image
                src={content.heroImageUrl}
                alt={content.title}
                width={550}
                height={550}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </section>
  );
}



// Principal Message Section Component with reveal animation
function PrincipalMessageSection({ content, locale }: { content: LocaleSpecificContent['principalMessage']; locale: string }) {
  const [sectionRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '8rem 2rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #e3f2fd 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        fontSize: '8rem',
        opacity: 0.05,
      }}>💼</div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'all 0.8s ease-out',
      }}>
        {/* Section Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '5rem',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #ff885e, #ffcb69)',
            borderRadius: '50px',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(255,136,94,0.3)',
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              {locale === 'ar-SA' ? 'رسالة خاصة' : 'Special Message'}
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '800',
            color: '#2d72ba',
            lineHeight: '1.2',
          }}>
            {content.title}
          </h2>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '4rem',
          alignItems: 'center',
        }}>
          {/* Image Side */}
          <div style={{
            order: locale === 'ar-SA' ? 2 : 1,
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '450px',
            }}>
              {/* Decorative background */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '-20px',
                right: '-20px',
                bottom: '-20px',
                background: 'linear-gradient(135deg, #ff885e, #37a5ef)',
                borderRadius: '30px',
                opacity: 0.1,
                transform: isVisible ? 'rotate(-3deg)' : 'rotate(0deg)',
                transition: 'transform 0.8s ease-out 0.2s',
              }} />
              
              <div style={{
                position: 'relative',
                borderRadius: '25px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                border: '4px solid white',
                transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                transition: 'transform 0.8s ease-out 0.3s',
              }}>
                <Image
                  src="/principal-image.png"
                  alt={content.title}
                  width={450}
                  height={450}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>

              {/* Floating badge */}
              <div style={{
                position: 'absolute',
                bottom: '-15px',
                right: locale === 'ar-SA' ? 'auto' : '-15px',
                left: locale === 'ar-SA' ? '-15px' : 'auto',
                background: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '3px solid #ff885e',
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'transform 0.8s ease-out 0.5s',
              }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#2d72ba',
                }}>
                  💝 {content.specialMessageTag}
                </span>
              </div>
            </div>
          </div>

          {/* Message Side */}
          <div style={{
            order: locale === 'ar-SA' ? 1 : 2,
            textAlign: locale === 'ar-SA' ? 'right' : 'left',
          }}>
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '25px',
              boxShadow: '0 15px 50px rgba(0,0,0,0.08)',
              position: 'relative',
              border: '1px solid rgba(55,165,239,0.1)',
              transform: isVisible ? 'translateX(0)' : locale === 'ar-SA' ? 'translateX(30px)' : 'translateX(-30px)',
              transition: 'transform 0.8s ease-out 0.4s',
            }}>
              {/* Quote icon */}
              <div style={{
                fontSize: '4rem',
                color: '#37a5ef',
                opacity: 0.15,
                position: 'absolute',
                top: '20px',
                left: locale === 'ar-SA' ? 'auto' : '20px',
                right: locale === 'ar-SA' ? '20px' : 'auto',
                lineHeight: '1',
              }}>
                "
              </div>

              <p style={{
                fontSize: '1.3rem',
                lineHeight: '2',
                color: '#444',
                fontStyle: 'italic',
                position: 'relative',
                zIndex: 1,
                marginBottom: '2rem',
              }}>
                {content.message}
              </p>

              {/* Decorative line */}
              <div style={{
                width: '60px',
                height: '4px',
                background: 'linear-gradient(90deg, #ff885e, #37a5ef)',
                borderRadius: '2px',
                margin: locale === 'ar-SA' ? '0 0 0 auto' : '0',
              }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



// Academic Program Section Component with staggered animations
function AcademicProgramSection({ content, locale }: { content: LocaleSpecificContent['academicProgram']; locale: string }) {
  const programImages = ['/Pre-KG.svg', '/KG-1.svg', '/KG-2.svg'];
  const [sectionRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '8rem 2rem',
        background: 'linear-gradient(180deg, #e3f2fd 0%, #f1f8e9 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '3%',
        fontSize: '10rem',
        opacity: 0.03,
      }}>📚</div>
      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '3%',
        fontSize: '10rem',
        opacity: 0.03,
      }}>🎓</div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '5rem',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.6s ease-out',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #82c341, #37a5ef)',
            borderRadius: '50px',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(130,195,65,0.3)',
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              {locale === 'ar-SA' ? 'برامجنا' : 'Our Programs'}
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '800',
            color: '#2d72ba',
            marginBottom: '1rem',
            lineHeight: '1.2',
          }}>
            {content.title}
          </h2>
          <p style={{
            fontSize: '1.3rem',
            color: '#666',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.7',
          }}>
            {content.subtitle}
          </p>
        </div>

        {/* Programs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          marginBottom: '5rem',
        }}>
          {content.programs.map((program: Program, index: number) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '30px',
                padding: '2.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.6s ease-out ${index * 0.2}s`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isVisible ? 'translateY(0)' : 'translateY(40px)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
              }}
            >
              {/* Colored accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: `linear-gradient(90deg, ${getProgramColor(index)}, ${getProgramColor((index + 1) % 3)})`,
              }} />

              {/* Icon Circle */}
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${getProgramColor(index)}15, ${getProgramColor(index)}30)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                border: `3px solid ${getProgramColor(index)}40`,
                position: 'relative',
                boxShadow: `0 8px 25px ${getProgramColor(index)}20`,
              }}>
                <Image
                  src={programImages[index]}
                  alt={program.title}
                  width={70}
                  height={70}
                  style={{ objectFit: 'contain' }}
                />
                {/* Small badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '-5px',
                  right: '-5px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: getProgramColor(index),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  color: 'white',
                  fontWeight: '700',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}>
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: getProgramColor(index),
                  marginBottom: '0.8rem',
                }}>
                  {program.title}
                </h3>

                {program.age && (
                  <div style={{
                    display: 'inline-block',
                    padding: '0.4rem 1rem',
                    background: `${getProgramColor(index)}10`,
                    color: getProgramColor(index),
                    borderRadius: '20px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem',
                    border: `1px solid ${getProgramColor(index)}30`,
                  }}>
                    {program.age}
                  </div>
                )}

                <p style={{
                  fontSize: '1.05rem',
                  color: '#666',
                  lineHeight: '1.8',
                  textAlign: locale === 'ar-SA' ? 'right' : 'left',
                  marginTop: '1rem',
                }}>
                  {program.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div style={{
          background: 'white',
          borderRadius: '30px',
          padding: '3.5rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s ease-out 0.6s',
        }}>
          {/* Gradient background effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #82c34110, #37a5ef10)',
            opacity: 0.5,
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              color: '#2d72ba',
              marginBottom: '1rem',
            }}>
              {content.ctaTitle}
            </h3>
            <p style={{
              fontSize: '1.2rem',
              color: '#666',
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              lineHeight: '1.7',
            }}>
              {content.ctaSubtitle}
            </p>
            <Link href={`/${locale}/academic-program`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '1.3rem 3rem',
              background: 'linear-gradient(135deg, #82c341, #6ca832)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: '700',
              boxShadow: '0 8px 25px rgba(130,195,65,0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(130,195,65,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(130,195,65,0.4)';
            }}>
              <span style={{ fontSize: '1.4rem' }}>📚</span>
              {content.ctaButton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}



// Features Section Component with masonry-style grid
function FeaturesSection({ content }: { content: LocaleSpecificContent['features'] }) {
  const [sectionRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '8rem 2rem',
        background: 'linear-gradient(180deg, #f1f8e9 0%, #fff8e1 100%)',
        position: 'relative',
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '5rem',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.6s ease-out',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #ffcb69, #ff885e)',
            borderRadius: '50px',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(255,203,105,0.3)',
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              ⭐ Why Choose Us
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '800',
            color: '#2d72ba',
            marginBottom: '1rem',
            lineHeight: '1.2',
          }}>
            {content.title}
          </h2>
          <p style={{
            fontSize: '1.3rem',
            color: '#666',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.7',
          }}>
            {content.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
        }}>
          {content.featureList.map((feature: Feature, index: number) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '25px',
                padding: '2.5rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                transition: `all 0.5s ease-out ${index * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
              }}
            >
              {/* Gradient accent line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${getFeatureColor(index)}, ${getFeatureColor((index + 1) % 6)})`,
              }} />

              {/* Icon */}
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              }}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: getFeatureColor(index),
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                {feature.title}
              </h3>

              <p style={{
                fontSize: '1.05rem',
                color: '#666',
                lineHeight: '1.8',
                textAlign: 'center',
              }}>
                {feature.description}
              </p>

              {/* Decorative corner element */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `${getFeatureColor(index)}10`,
                filter: 'blur(20px)',
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



// CTA Section Component with bold modern design
function CTASection({ content, locale }: { content: LocaleSpecificContent['cta']; locale: string }) {
  const [sectionRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '8rem 2rem',
        background: 'linear-gradient(135deg, #37a5ef 0%, #2d72ba 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background patterns */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'white',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'white',
          filter: 'blur(60px)',
        }} />
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '5rem',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.6s ease-out',
        }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            color: 'white',
            lineHeight: '1.2',
            marginBottom: '1rem',
            textShadow: '2px 2px 20px rgba(0,0,0,0.2)',
          }}>
            {content.title}
          </h2>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '4rem',
          alignItems: 'center',
        }}>
          {/* Text & Buttons Side */}
          <div style={{
            order: locale === 'ar-SA' ? 2 : 1,
            textAlign: locale === 'ar-SA' ? 'right' : 'left',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : locale === 'ar-SA' ? 'translateX(30px)' : 'translateX(-30px)',
            transition: 'all 0.8s ease-out 0.2s',
          }}>
            <p style={{
              fontSize: '1.4rem',
              color: 'white',
              lineHeight: '1.9',
              marginBottom: '3rem',
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            }}>
              {content.subtitle}
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              alignItems: locale === 'ar-SA' ? 'flex-end' : 'flex-start',
            }}>
              <Link href={`/${locale}/contact`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '1.5rem 3rem',
                background: 'linear-gradient(135deg, #ffcb69, #ff885e)',
                color: '#2d72ba',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.3rem',
                fontWeight: '700',
                boxShadow: '0 10px 35px rgba(255,203,105,0.4)',
                transition: 'all 0.3s ease',
                border: '3px solid white',
                minWidth: '300px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 45px rgba(255,203,105,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 35px rgba(255,203,105,0.4)';
              }}>
                <span style={{ fontSize: '1.5rem' }}>📞</span>
                {content.contactButton}
              </Link>

              <Link href={`/${locale}/parent-portal`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '1.5rem 3rem',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.3rem',
                fontWeight: '700',
                boxShadow: '0 10px 35px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                border: '3px solid white',
                backdropFilter: 'blur(10px)',
                minWidth: '300px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#2d72ba';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
              }}>
                <span style={{ fontSize: '1.5rem' }}>🏠</span>
                {content.portalButton}
              </Link>
            </div>
          </div>

          {/* Image Side */}
          <div style={{
            order: locale === 'ar-SA' ? 1 : 2,
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : locale === 'ar-SA' ? 'translateX(-30px)' : 'translateX(30px)',
            transition: 'all 0.8s ease-out 0.4s',
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
            }}>
              {/* Floating badge */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: locale === 'ar-SA' ? 'auto' : '-20px',
                left: locale === 'ar-SA' ? '-20px' : 'auto',
                background: 'linear-gradient(135deg, #ffcb69, #ff885e)',
                color: '#2d72ba',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '700',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '3px solid white',
                zIndex: 10,
                animation: 'bounce 2s ease-in-out infinite',
              }}>
                {content.startNowBadge}
              </div>

              {/* Image container */}
              <div style={{
                position: 'relative',
                borderRadius: '30px',
                overflow: 'hidden',
                boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
                border: '4px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}>
                <Image
                  src="/portal-image.png"
                  alt={content.title}
                  width={500}
                  height={500}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Cards */}
        <div style={{
          marginTop: '6rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 0.6s',
        }}>
          {content.additionalFeatures.map((feature: AdditionalFeature, index: number) => (
            <div
              key={index}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                padding: '2.5rem',
                borderRadius: '25px',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '3.5rem',
                marginBottom: '1rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.6',
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}


// Main HomePage Component
export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [content, setContent] = useState<LocaleSpecificContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const { locale: resolvedLocale } = await params;
        setLocale(resolvedLocale);

        const fetchedContent = await fetchHomePageContent(resolvedLocale);
        if (fetchedContent) {
          setContent(fetchedContent);
        } else {
          setError('Failed to load homepage content. Please try again later.');
        }
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [params]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: 'var(--light-blue)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--primary-purple)' }}>
          <div className="loading-spinner" style={{ width: '60px', height: '60px', margin: '0 auto 2rem' }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {locale === 'ar-SA' ? 'جاري تحميل المحتوى...' : 'Loading Content...'}
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: 'var(--light-red)', color: '#d8000c', padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>😟 {locale === 'ar-SA' ? 'خطأ في تحميل الصفحة' : 'Error Loading Page'}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    // This case should ideally not be reached if error handling is correct, but it's a good fallback.
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>{locale === 'ar-SA' ? 'المحتوى غير متوفر' : 'Content not available'}</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <HeroSection content={content.hero} locale={locale} />
      <PrincipalMessageSection content={content.principalMessage} locale={locale} />
      <AcademicProgramSection content={content.academicProgram} locale={locale} />
      <FeaturesSection content={content.features} />
      <CTASection content={content.cta} locale={locale} />
    </div>
  );
}