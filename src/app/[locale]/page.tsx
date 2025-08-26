'use client';

import React, { useEffect, useState } from 'react';
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

// Hero Section Component
function HeroSection({ content, locale }: { content: LocaleSpecificContent['hero']; locale: string }) {
  return (
    <section style={{
      display: 'flex', alignItems: 'center', minHeight: '80vh', padding: '4rem 2rem',
      background: 'linear-gradient(135deg, var(--light-pink) 0%, var(--light-blue) 50%, var(--light-yellow) 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background elements from original component */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '4rem', opacity: 0.1, animation: 'float 6s ease-in-out infinite' }}>🎨</div>
      <div style={{ position: 'absolute', top: '20%', right: '10%', fontSize: '3rem', opacity: 0.1, animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}>🌟</div>
      <div style={{ position: 'absolute', bottom: '20%', left: '8%', fontSize: '3.5rem', opacity: 0.1, animation: 'float 6s ease-in-out infinite', animationDelay: '4s' }}>🧩</div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', fontSize: '4rem', opacity: 0.1, animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}>🚀</div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center',
        maxWidth: '1400px', margin: '0 auto', width: '100%', zIndex: 2, position: 'relative'
      }}>
        <div style={{ textAlign: locale === 'ar-SA' ? 'right' : 'left', padding: '2rem' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.9)', padding: '1rem 2rem', borderRadius: '50px',
            marginBottom: '2rem', border: '3px solid var(--primary-pink)', animation: 'bounce 2s infinite'
          }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--primary-purple)', fontWeight: 'bold' }}>
              ✨ {content.welcome}
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--primary-purple)', marginBottom: '1.5rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.2)', fontWeight: 'bold', lineHeight: '1.2'
          }}>
            {content.title}
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--primary-pink)', marginBottom: '2rem',
            fontWeight: '600', lineHeight: '1.3'
          }}>
            {content.subtitle}
          </h2>
          <p style={{
            fontSize: '1.3rem', color: 'var(--primary-blue)', marginBottom: '3rem', lineHeight: '1.8',
            background: 'rgba(255,255,255,0.8)', padding: '1.5rem', borderRadius: 'var(--border-radius)',
            border: '2px solid var(--light-blue)', fontStyle: 'italic'
          }}>
            {content.description}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href={`/${locale}/admissions`} style={{
              display: 'inline-block', padding: '1.5rem 3rem', background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
              color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '1.3rem', fontWeight: 'bold',
              transition: 'all 0.3s ease', border: '3px solid white', boxShadow: '0 8px 25px rgba(0,0,0,0.2)', textAlign: 'center'
            }}>
              🎓 {content.enrollButton}
            </Link>
            <Link href={`/${locale}/about_us`} style={{
              display: 'inline-block', padding: '1.5rem 3rem', background: 'transparent', color: 'var(--primary-purple)',
              textDecoration: 'none', borderRadius: '50px', fontSize: '1.3rem', fontWeight: 'bold',
              transition: 'all 0.3s ease', border: '3px solid var(--primary-purple)', textAlign: 'center'
            }}>
              💫 {content.learnMoreButton}
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div style={{
            position: 'relative', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            transform: 'rotate(3deg)', transition: 'transform 0.3s ease'
          }}>
            <Image src="/her-image.png" alt={content.title} width={500} height={500} style={{
              width: '100%', height: 'auto', maxWidth: '500px', display: 'block', borderRadius: '30px'
            }}/>
          </div>
        </div>
      </div>
    </section>
  );
}

// Principal Message Section Component
function PrincipalMessageSection({ content, locale }: { content: LocaleSpecificContent['principalMessage']; locale: string }) {
  return (
    <section style={{
      padding: '6rem 2rem', background: 'linear-gradient(135deg, var(--light-blue) 0%, var(--light-pink) 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '3.5rem', color: 'var(--primary-purple)', marginBottom: '1.5rem', fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            💼 {content.title}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', order: locale === 'ar-SA' ? 2 : 1 }}>
            <div style={{
              position: 'relative', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
              border: '6px solid white', background: 'white', padding: '1rem', transform: 'rotate(-2deg)', transition: 'transform 0.3s ease'
            }}>
              <Image src="/principal-image.png" alt={content.title} width={400} height={400} style={{
                width: '100%', height: 'auto', maxWidth: '400px', display: 'block', borderRadius: '20px'
              }}/>
            </div>
          </div>
          <div style={{ order: locale === 'ar-SA' ? 1 : 2, textAlign: locale === 'ar-SA' ? 'right' : 'left' }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)', padding: '3rem', borderRadius: '25px', boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
              border: '3px solid var(--primary-pink)', position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '-15px', left: locale === 'ar-SA' ? 'auto' : '30px', right: locale === 'ar-SA' ? '30px' : 'auto',
                background: 'var(--primary-pink)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '20px',
                fontSize: '1.1rem', fontWeight: 'bold'
              }}>
                💝 {content.specialMessageTag}
              </div>
              <p style={{
                fontSize: '1.3rem', lineHeight: '2', color: '#333', marginBottom: '3rem', fontStyle: 'italic', textAlign: 'center'
              }}>
                {content.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Academic Program Section Component
function AcademicProgramSection({ content, locale }: { content: LocaleSpecificContent['academicProgram']; locale: string }) {
  const programImages = ['/Pre-KG.svg', '/KG-1.svg', '/KG-2.svg'];

  return (
    <section style={{
      padding: '6rem 2rem', background: 'linear-gradient(135deg, var(--light-yellow) 0%, var(--light-orange) 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '3.5rem', color: 'var(--primary-purple)', marginBottom: '1.5rem', fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            📖 {content.title}
          </h2>
          <p style={{ fontSize: '1.4rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            {content.subtitle}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {content.programs.map((program: Program, index: number) => (
            <div key={index} style={{
              background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              border: `3px solid ${getProgramColor(index)}`, transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', textAlign: 'center'
            }}>
              <div style={{
                width: '100px', height: '100px', background: `linear-gradient(135deg, ${getProgramColor(index)}, ${getProgramColor(index)}20)`,
                borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                margin: '0 auto 1.5rem auto'
              }}>
                <Image src={programImages[index]} alt={program.title} width={65} height={65} style={{ objectFit: 'contain' }}/>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: getProgramColor(index), marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {program.title}
              </h3>
              {program.age && (
                <div style={{
                  fontSize: '1rem', color: '#888', marginBottom: '1.5rem', fontWeight: '600',
                  background: `${getProgramColor(index)}15`, padding: '0.4rem 0.8rem', borderRadius: '15px', display: 'inline-block'
                }}>
                  {program.age}
                </div>
              )}
              <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.8', textAlign: locale === 'ar-SA' ? 'right' : 'left', marginTop: program.age ? '1rem' : '2rem' }}>
                {program.description}
              </p>
            </div>
          ))}
        </div>
        <div style={{
          textAlign: 'center', marginTop: '4rem', padding: '3rem', background: 'rgba(255,255,255,0.9)',
          borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--primary-purple)', marginBottom: '1rem', fontWeight: 'bold' }}>
            {content.ctaTitle}
          </h3>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
            {content.ctaSubtitle}
          </p>
          <Link href={`/${locale}/academic-program`} style={{
            display: 'inline-block', padding: '1.5rem 3rem', background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-pink))',
            color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '1.3rem', fontWeight: 'bold',
            transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
          }}>
            📚 {content.ctaButton}
          </Link>
        </div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection({ content }: { content: LocaleSpecificContent['features'] }) {
  return (
    <section style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', position: 'relative' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '3.5rem', color: 'var(--primary-purple)', marginBottom: '1.5rem', fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            ⭐ {content.title}
          </h2>
          <p style={{ fontSize: '1.4rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            {content.subtitle}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
          {content.featureList.map((feature: Feature, index: number) => (
            <div key={index} style={{
              background: 'white', padding: '3rem', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: `4px solid ${getFeatureColor(index)}`, transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.8rem', color: getFeatureColor(index), marginBottom: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.8', textAlign: 'center' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection({ content, locale }: { content: LocaleSpecificContent['cta']; locale: string }) {
  return (
    <section style={{
      padding: '6rem 2rem', background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
      color: 'white', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '2rem', fontWeight: 'bold',
            textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
          }}>
            {content.title}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div style={{ order: locale === 'ar-SA' ? 2 : 1, textAlign: locale === 'ar-SA' ? 'right' : 'left' }}>
            <p style={{
              fontSize: '1.5rem', marginBottom: '3rem', lineHeight: '1.8', background: 'rgba(255,255,255,0.1)',
              padding: '2rem', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {content.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column', alignItems: locale === 'ar-SA' ? 'flex-end' : 'flex-start' }}>
              <Link href={`/${locale}/contact`} style={{
                display: 'inline-block', padding: '1.8rem 3.5rem', background: 'var(--primary-yellow)', color: 'var(--primary-purple)',
                textDecoration: 'none', borderRadius: '50px', fontSize: '1.4rem', fontWeight: 'bold',
                transition: 'all 0.3s ease', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', textAlign: 'center', minWidth: '300px'
              }}>
                📞 {content.contactButton}
              </Link>
              <Link href={`/${locale}/parent-portal`} style={{
                display: 'inline-block', padding: '1.8rem 3.5rem', background: 'transparent', color: 'white',
                textDecoration: 'none', borderRadius: '50px', fontSize: '1.4rem', fontWeight: 'bold',
                transition: 'all 0.3s ease', border: '4px solid white', textAlign: 'center', minWidth: '300px'
              }}>
                🏠 {content.portalButton}
              </Link>
            </div>
          </div>
          <div style={{ order: locale === 'ar-SA' ? 1 : 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              position: 'relative', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
              border: '6px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', padding: '1.5rem',
              transform: 'rotate(-3deg)', transition: 'transform 0.3s ease', backdropFilter: 'blur(10px)'
            }}>
              <Image src="/portal-image.png" alt={content.title} width={450} height={450} style={{
                width: '100%', height: 'auto', maxWidth: '450px', display: 'block', borderRadius: '25px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}/>
              <div style={{
                position: 'absolute', top: '-10px', right: '-10px', background: 'linear-gradient(135deg, var(--primary-yellow), var(--primary-orange))',
                color: 'var(--primary-purple)', padding: '1rem 2rem', borderRadius: '25px', fontSize: '1.1rem',
                fontWeight: 'bold', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', border: '3px solid white',
                animation: 'bounce 2s infinite', transform: 'rotate(15deg)'
              }}>
                {content.startNowBadge}
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {content.additionalFeatures.map((feature: AdditionalFeature, index: number) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '20px', backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)', transition: 'transform 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
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
        background: 'linear-gradient(135deg, var(--light-pink), var(--light-blue))'
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
        background: 'linear-gradient(135deg, #ffdddd, #ffd1d1)', color: '#d8000c', padding: '2rem'
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
      <HeroSection content={content.hero} locale={locale} />
      <PrincipalMessageSection content={content.principalMessage} locale={locale} />
      <AcademicProgramSection content={content.academicProgram} locale={locale} />
      <FeaturesSection content={content.features} />
      <CTASection content={content.cta} locale={locale} />
    </div>
  );
}