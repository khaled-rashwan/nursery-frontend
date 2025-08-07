'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Educational Philosophy Section
function EducationalPhilosophySection({ locale }: { locale: string }) {
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
            🌟 {locale === 'ar-SA' ? 'فلسفتنا التعليمية' : 'Our Educational Philosophy'}
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
            📖 {locale === 'ar-SA' ? 'منهجنا التعليمي' : 'EYFS Framework'}
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
            {locale === 'ar-SA' 
              ? 'في روضة خطوة المستقبل، نتبع إطار عمل السنوات المبكرة (EYFS) - وهو نموذج محترم عالمياً يؤكد على أهمية الاستكشاف الذي يقوده الطفل، والتعلم من خلال اللعب، والتطوير العاطفي في السنوات المبكرة.'
              : 'At Future Step Nursery, we follow the Early Years Foundation Stage (EYFS) framework — a globally respected model that emphasizes the importance of child-led exploration, learning through play, and emotional development in the early years.'
            }
          </p>

          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#555',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            {locale === 'ar-SA' 
              ? 'نؤمن أن الأطفال يزدهرون في البيئات التي تشجع الفضول والإبداع والثقة. نركز على رعاية الطفل ككل: اجتماعياً وعاطفياً وجسدياً وفكرياً - مما يضمن رؤية كل متعلم صغير ودعمه والاحتفال به.'
              : 'We believe that children thrive in environments that encourage curiosity, creativity, and confidence. We focus on nurturing the whole child: socially, emotionally, physically, and intellectually — ensuring that each young learner is seen, supported, and celebrated.'
            }
          </p>

          {/* Core Values Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {[
              {
                icon: '🎯',
                title: locale === 'ar-SA' ? 'الاستكشاف الموجه' : 'Child-Led Exploration',
                color: 'var(--primary-blue)'
              },
              {
                icon: '🎮',
                title: locale === 'ar-SA' ? 'التعلم باللعب' : 'Learning Through Play',
                color: 'var(--primary-green)'
              },
              {
                icon: '💝',
                title: locale === 'ar-SA' ? 'التطوير العاطفي' : 'Emotional Development',
                color: 'var(--primary-orange)'
              },
              {
                icon: '🌱',
                title: locale === 'ar-SA' ? 'النمو الشامل' : 'Holistic Growth',
                color: 'var(--primary-yellow)'
              }
            ].map((value, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: `${value.color}15`,
                borderRadius: '20px',
                border: `2px solid ${value.color}`,
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
                  color: value.color,
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

// Program interface
interface Program {
  lightColor1: string;
  lightColor2: string;
  bgIcon1: string;
  bgIcon2: string;
  image: string;
  title: string;
  ageRange: string;
  primaryColor: string;
  icon: string;
  overview: string;
  experiences: string[];
}

// Program Detail Component
function ProgramDetailSection({ program, locale }: { program: Program; locale: string }) {
  return (
    <section style={{
      padding: '6rem 2rem',
      background: `linear-gradient(135deg, ${program.lightColor1} 0%, ${program.lightColor2} 100%)`,
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
      }}>{program.bgIcon1}</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '8%',
        fontSize: '4rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '3s'
      }}>{program.bgIcon2}</div>

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
              border: `3px solid ${program.primaryColor}`,
              position: 'relative'
            }}>
              {/* Program Title Badge */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: locale === 'ar-SA' ? 'auto' : '30px',
                right: locale === 'ar-SA' ? '30px' : 'auto',
                background: program.primaryColor,
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
                color: program.primaryColor,
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
                color: program.primaryColor,
                marginBottom: '2rem',
                fontWeight: 'bold'
              }}>
                {locale === 'ar-SA' ? 'ما سيختبره طفلك:' : 'What Your Child Will Experience:'}
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
                    background: `${program.primaryColor}10`,
                    borderRadius: '15px',
                    border: `2px solid ${program.primaryColor}30`,
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(10px)';
                    e.currentTarget.style.background = `${program.primaryColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = `${program.primaryColor}10`;
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      background: program.primaryColor,
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  const programs = locale === 'ar-SA' ? [
    {
      id: 'pre-kg',
      title: 'ما قبل الروضة',
      ageRange: '2.5-3.5 سنوات',
      icon: '🌱',
      image: '/prekg.avif',
      primaryColor: 'var(--primary-orange)',
      lightColor1: 'var(--light-orange)',
      lightColor2: '#ffe5dc',
      bgIcon1: '🎨',
      bgIcon2: '🧸',
      overview: 'يوفر برنامج ما قبل الروضة لدينا بداية دافئة ومرحبة للتعليم المبكر. وهو مصمم لتعريف الأطفال الصغار بلطف على البيئة التعليمية، وتعزيز الشعور بالأمان والانتماء والفضول.',
      experiences: [
        'محو الأمية والحساب المبكر باستخدام الصوتيات والعد الممتع',
        'تطوير الذكاء العاطفي من خلال القصص والنقاش',
        'الاستكشاف العلمي والطبيعي القائم على الاستقصاء',
        'الفن والموسيقى والحركة لتقوية التعبير',
        'أنشطة لتشجيع الاستقلالية والاستعداد للمدرسة'
      ]
    },
    {
      id: 'kg1',
      title: 'الروضة الأولى',
      ageRange: '3-4 سنوات',
      icon: '🎯',
      image: '/kg1.png',
      primaryColor: 'var(--primary-blue)',
      lightColor1: 'var(--light-blue)',
      lightColor2: 'var(--light-blue-alt)',
      bgIcon1: '📚',
      bgIcon2: '🎪',
      overview: 'يوفر برنامج الروضة الأولى مقدمة دافئة وآمنة لرحلة التعلم. في هذه المرحلة، نركز على مساعدة الأطفال على تطوير التواصل الأساسي والمهارات الحركية المبكرة والاستقلالية والثقة.',
      experiences: [
        'الروتين اليومي الذي يعزز الشعور بالبنية والراحة',
        'أنشطة لتطوير المهارات الحركية الكبرى والدقيقة',
        'الأغاني والقصص ووقت الحلقة لتعزيز اللغة',
        'لعب الأدوار واللعب التخيلي لإثارة الخيال',
        'التنشئة الاجتماعية اللطيفة والعمل الجماعي من خلال اللعب الموجه'
      ]
    },
    {
      id: 'kg2',
      title: 'الروضة الثانية',
      ageRange: '4-5 سنوات',
      icon: '🚀',
      image: '/kg2.png',
      primaryColor: 'var(--primary-green)',
      lightColor1: 'var(--light-green)',
      lightColor2: '#f0f8e8',
      bgIcon1: '🎓',
      bgIcon2: '⭐',
      overview: 'تبني الروضة الثانية على أساس الروضة الأولى، وتعرف الأطفال على المفاهيم الأكاديمية المبكرة من خلال الأنشطة العملية والتجارب ذات المعنى. يتم تشجيع الأطفال على التفكير النقدي والتعاون مع الأقران والتعبير عن أنفسهم بثقة.',
      experiences: [
        'محو الأمية والحساب المبكر باستخدام الصوتيات والعد الممتع',
        'تطوير الذكاء العاطفي من خلال القصص والنقاش',
        'الاستكشاف العلمي والطبيعي القائم على الاستقصاء',
        'الفن والموسيقى والحركة لتقوية التعبير',
        'أنشطة لتشجيع الاستقلالية والاستعداد للمدرسة'
      ]
    }
  ] : [
    {
      id: 'pre-kg',
      title: 'Pre-KG',
      ageRange: '2.5–3.5 Years',
      icon: '🌱',
      image: '/prekg.avif',
      primaryColor: 'var(--primary-orange)',
      lightColor1: 'var(--light-orange)',
      lightColor2: '#ffe5dc',
      bgIcon1: '🎨',
      bgIcon2: '🧸',
      overview: 'Our Pre-KG program offers a warm, welcoming start to early education. It is designed to gently introduce young children to the learning environment, fostering a sense of security, belonging, and curiosity.',
      experiences: [
        'Early literacy and numeracy using phonics and playful counting',
        'Emotional intelligence development through storytelling and discussion',
        'Inquiry–based science and nature exploration',
        'Art, music, and movement to strengthen expression',
        'Activities to encourage independence and school readiness'
      ]
    },
    {
      id: 'kg1',
      title: 'KG1',
      ageRange: '3–4 Years Old',
      icon: '🎯',
      image: '/kg1.png',
      primaryColor: 'var(--primary-blue)',
      lightColor1: 'var(--light-blue)',
      lightColor2: 'var(--light-blue-alt)',
      bgIcon1: '📚',
      bgIcon2: '🎪',
      overview: 'Our KG1 program offers a warm, secure introduction to the learning journey. At this stage, our focus is on helping children develop basic communication, early motor skills, independence, and confidence.',
      experiences: [
        'Daily routines that promote a sense of structure and comfort',
        'Activities to develop gross and fine motor skills',
        'Songs, stories, and circle time to enhance language',
        'Role–playing and pretend play to spark imagination',
        'Gentle socialization and teamwork through guided play'
      ]
    },
    {
      id: 'kg2',
      title: 'KG2',
      ageRange: '4–5 Years Old',
      icon: '🚀',
      image: '/kg2.png',
      primaryColor: 'var(--primary-green)',
      lightColor1: 'var(--light-green)',
      lightColor2: '#f0f8e8',
      bgIcon1: '🎓',
      bgIcon2: '⭐',
      overview: 'KG2 builds upon the KG1 foundation, introducing children to early academic concepts through hands-on activities and meaningful experiences. Children are encouraged to think critically, collaborate with peers, and express themselves confidently.',
      experiences: [
        'Early literacy and numeracy using phonics and playful counting',
        'Emotional intelligence development through storytelling and discussion',
        'Inquiry–based science and nature exploration',
        'Art, music, and movement to strengthen expression',
        'Activities to encourage independence and school readiness'
      ]
    }
  ];

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, var(--light-blue), var(--light-yellow))'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--primary-blue-dark)'
        }}>
          <div className="loading-spinner" style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 2rem'
          }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
    }}>
      <EducationalPhilosophySection locale={locale} />
      
      {programs.map((program) => (
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
            {locale === 'ar-SA' ? '🎓 هل أنت مستعد لبدء رحلة طفلك؟' : '🎓 Ready to Start Your Child\'s Journey?'}
          </h2>
          
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            marginBottom: '3rem',
            opacity: 0.9
          }}>
            {locale === 'ar-SA' 
              ? 'انضم إلى عائلة روضة خطوة المستقبل واكتشف كيف يمكن لطفلك أن يزدهر في بيئة تعليمية محبة ومحفزة.'
              : 'Join the Future Step Nursery family and discover how your child can thrive in a nurturing, stimulating educational environment.'
            }
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
              📝 {locale === 'ar-SA' ? 'ابدأ التسجيل' : 'Start Enrollment'}
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
              💬 {locale === 'ar-SA' ? 'تواصل معنا' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
