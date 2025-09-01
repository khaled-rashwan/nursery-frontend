'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchAcademicProgramPageContent } from '../../../app/fetchContent';
import { LocaleSpecificAcademicProgramContent, Program } from '../../../app/types';

const programDetails: { [key: string]: { primaryColor: string; lightColor1: string; lightColor2: string; bgIcon1: string; bgIcon2: string } } = {
  'pre-kg': {
    primaryColor: 'var(--primary-orange)',
    lightColor1: 'var(--light-orange)',
    lightColor2: '#ffe5dc',
    bgIcon1: '🎨',
    bgIcon2: '🧸',
  },
  'kg1': {
    primaryColor: 'var(--primary-blue)',
    lightColor1: 'var(--light-blue)',
    lightColor2: 'var(--light-blue-alt)',
    bgIcon1: '📚',
    bgIcon2: '🎪',
  },
  'kg2': {
    primaryColor: 'var(--primary-green)',
    lightColor1: 'var(--light-green)',
    lightColor2: '#f0f8e8',
    bgIcon1: '🎓',
    bgIcon2: '⭐',
  },
};

// Educational Philosophy Section
function EducationalPhilosophySection({ content, locale }: { content: LocaleSpecificAcademicProgramContent['educationalPhilosophy']; locale: string }) {
  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(135deg, var(--light-blue) 0%, var(--light-blue-alt) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '4rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite'
      }}>📚</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '8%',
        fontSize: '3.5rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '3s'
      }}>🎓</div>
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '15%',
        fontSize: '3rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '5s'
      }}>✨</div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: 'var(--primary-blue-dark)',
            marginBottom: '2rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🌟 {content.title}
          </h1>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '4rem',
          borderRadius: '25px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
          border: '3px solid var(--primary-blue)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--primary-blue)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '25px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
          }}>
            📖 {content.framework}
          </div>

          <div style={{
            fontSize: '4rem',
            textAlign: 'center',
            marginBottom: '2rem',
            marginTop: '2rem',
            opacity: 0.1
          }}>
            &quot;
          </div>

          <p style={{
            fontSize: '1.4rem',
            lineHeight: '2',
            color: '#333',
            marginBottom: '2rem',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {content.frameworkDescription}
          </p>

          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#555',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            {content.philosophy}
          </p>

          {/* Core Values Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {content.coreValues.map((value, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: `${['var(--primary-blue)', 'var(--primary-green)', 'var(--primary-orange)', 'var(--primary-yellow)'][index % 4]}15`,
                borderRadius: '20px',
                border: `2px solid ${['var(--primary-blue)', 'var(--primary-green)', 'var(--primary-orange)', 'var(--primary-yellow)'][index % 4]}`,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '1rem'
                }}>
                  {value.icon}
                </div>
                <h4 style={{
                  fontSize: '1.1rem',
                  color: ['var(--primary-blue)', 'var(--primary-green)', 'var(--primary-orange)', 'var(--primary-yellow)'][index % 4],
                  fontWeight: 'bold'
                }}>
                  {value.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


// Program Detail Component
function ProgramDetailSection({ program, locale }: { program: Program; locale: string }) {
  const details = programDetails[program.id];
  return (
    <section style={{
      padding: '6rem 2rem',
      background: `linear-gradient(135deg, ${details.lightColor1} 0%, ${details.lightColor2} 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '5%',
        fontSize: '3rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite'
      }}>{details.bgIcon1}</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '8%',
        fontSize: '4rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '3s'
      }}>{details.bgIcon2}</div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Program Image */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            order: locale === 'ar-SA' ? 2 : 1
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
              border: '6px solid white',
              background: 'white',
              padding: '1.5rem',
              transform: 'rotate(-3deg)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(-3deg) scale(1)';
            }}>
              <Image
                src={program.image}
                alt={program.title}
                width={450}
                height={450}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '450px',
                  display: 'block',
                  borderRadius: '25px'
                }}
              />
              {/* Age Badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, var(--primary-yellow), var(--primary-orange))',
                color: 'var(--primary-blue-dark)',
                padding: '1rem 1.5rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                border: '3px solid white',
                transform: 'rotate(10deg)'
              }}>
                {program.ageRange}
              </div>
            </div>
          </div>

          {/* Program Content */}
          <div style={{
            order: locale === 'ar-SA' ? 1 : 2,
            textAlign: locale === 'ar-SA' ? 'right' : 'left'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '3rem',
              borderRadius: '25px',
              boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
              border: `3px solid ${details.primaryColor}`,
              position: 'relative'
            }}>
              {/* Program Title Badge */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: locale === 'ar-SA' ? 'auto' : '30px',
                right: locale === 'ar-SA' ? '30px' : 'auto',
                background: details.primaryColor,
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '25px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}>
                {program.icon} {program.title}
              </div>

              {/* Overview */}
              <h2 style={{
                fontSize: '2.5rem',
                color: details.primaryColor,
                marginBottom: '1.5rem',
                marginTop: '2rem',
                fontWeight: 'bold'
              }}>
                {locale === 'ar-SA' ? 'نظرة عامة' : 'Overview'}
              </h2>

              <p style={{
                fontSize: '1.3rem',
                lineHeight: '1.8',
                color: '#333',
                marginBottom: '3rem'
              }}>
                {program.overview}
              </p>

              {/* What Your Child Will Experience */}
              <h3 style={{
                fontSize: '2rem',
                color: details.primaryColor,
                marginBottom: '2rem',
                fontWeight: 'bold'
              }}>
                {program.experiencesTitle}
              </h3>

              <div style={{
                display: 'grid',
                gap: '1.5rem'
              }}>
                {program.experiences.map((experience: string, expIndex: number) => (
                  <div key={expIndex} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: `${details.primaryColor}10`,
                    borderRadius: '15px',
                    border: `2px solid ${details.primaryColor}30`,
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(10px)';
                    e.currentTarget.style.background = `${details.primaryColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = `${details.primaryColor}10`;
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      background: details.primaryColor,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}>
                      {expIndex + 1}
                    </div>
                    <p style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.6',
                      color: '#444',
                      margin: 0
                    }}>
                      {experience}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main Academic Program Page Component
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
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
    }}>
      <EducationalPhilosophySection content={content.educationalPhilosophy} locale={locale} />
      
      {content.programs.map((program) => (
        <ProgramDetailSection 
          key={program.id} 
          program={program} 
          locale={locale} 
        />
      ))}

      {/* Call to Action Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, var(--primary-blue-dark), var(--primary-blue))',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '3rem',
            marginBottom: '2rem',
            fontWeight: 'bold'
          }}>
            {content.cta.title}
          </h2>
          
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            marginBottom: '3rem',
            opacity: 0.9
          }}>
            {content.cta.subtitle}
          </p>

          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link 
              href={`/${locale}/admissions`}
              style={{
                display: 'inline-block',
                padding: '1.5rem 3rem',
                background: 'var(--primary-yellow)',
                color: 'var(--primary-blue-dark)',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: '3px solid white',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }}
            >
              📝 {content.cta.enrollButton}
            </Link>

            <Link 
              href={`/${locale}/contact`}
              style={{
                display: 'inline-block',
                padding: '1.5rem 3rem',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: '3px solid white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = 'var(--primary-blue-dark)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💬 {content.cta.contactButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
