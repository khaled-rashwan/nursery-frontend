'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Hero Section Component with Image
function HeroSection({ locale }: { locale: string }) {
  return (
    <section style={{
      display: 'flex',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, var(--light-pink) 0%, var(--light-blue) 50%, var(--light-yellow) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '4rem',
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '0s'
      }}>🎨</div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        fontSize: '3rem',
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '2s'
      }}>🌟</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '8%',
        fontSize: '3.5rem',
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '4s'
      }}>🧩</div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        fontSize: '4rem',
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '1s'
      }}>🚀</div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '4rem',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        zIndex: 2,
        position: 'relative'
      }}>
        {/* Hero Content */}
        <div style={{
          textAlign: locale === 'ar-SA' ? 'right' : 'left',
          padding: '2rem'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.9)',
            padding: '1rem 2rem',
            borderRadius: '50px',
            marginBottom: '2rem',
            border: '3px solid var(--primary-pink)',
            animation: 'bounce 2s infinite'
          }}>
            <span style={{
              fontSize: '1.2rem',
              color: 'var(--primary-purple)',
              fontWeight: 'bold'
            }}>
              ✨ {locale === 'ar-SA' ? 'أهلاً وسهلاً' : 'Welcome'}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: 'var(--primary-purple)',
            marginBottom: '1.5rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}>
            {locale === 'ar-SA' ? 'روضة خطوة المستقبل الأهلية' : 'Future Step Nursery'}
          </h1>

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: 'var(--primary-pink)',
            marginBottom: '2rem',
            fontWeight: '600',
            lineHeight: '1.3'
          }}>
            {locale === 'ar-SA' ? 'حيث تنمو العقول الصغيرة لتحقق أحلاماً كبيرة!' : 'Where little minds grow big dreams!'}
          </h2>

          <p style={{
            fontSize: '1.3rem',
            color: 'var(--primary-blue)',
            marginBottom: '3rem',
            lineHeight: '1.8',
            background: 'rgba(255,255,255,0.8)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            border: '2px solid var(--light-blue)',
            fontStyle: 'italic'
          }}>
            {locale === 'ar-SA' 
              ? 'مكان سحري حيث يكتشف الأطفال ويتعلمون وينمون من خلال التعليم القائم على اللعب والإبداع والمرح'
              : 'A magical place where children discover, learn, and flourish through play-based education, creativity, and joy'
            }
          </p>

          <div style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <Link 
              href={`/${locale}/admissions`}
              style={{
                display: 'inline-block',
                padding: '1.5rem 3rem',
                background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: '3px solid white',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }}
            >
              🎓 {locale === 'ar-SA' ? 'سجل الآن' : 'Enroll Now'}
            </Link>

            <Link 
              href={`/${locale}/about_us`}
              style={{
                display: 'inline-block',
                padding: '1.5rem 3rem',
                background: 'transparent',
                color: 'var(--primary-purple)',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: '3px solid var(--primary-purple)',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-purple)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--primary-purple)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💫 {locale === 'ar-SA' ? 'تعرف علينا' : 'Learn More'}
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '30px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            transform: 'rotate(3deg)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(3deg) scale(1)';
          }}>
            <Image
              src="/her-image.png" 
              alt={locale === 'ar-SA' ? 'صورة روضة خطوة المستقبل' : 'Future Step Nursery Hero Image'}
              width={500}
              height={500}
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '500px',
                display: 'block',
                borderRadius: '30px'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              pointerEvents: 'none'
            }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Academic Program Preview Section
function AcademicProgramSection({ locale }: { locale: string }) {
  const programs = locale === 'ar-SA' ? [
    {
      title: 'ما قبل الروضة',
      age: '',
      image: '/Pre-KG.svg',
      description: 'روضة خطوة المستقبل الأهلية هي روضة دولية بريطانية تتبع إطار عمل السنوات المبكرة البريطاني (EYFS).',
      color: 'var(--primary-pink)'
    },
    {
      title: 'الروضة الأولى',
      age: '(3-4 سنوات)',
      image: '/KG-1.svg',
      description: 'التركيز على الأمان العاطفي والمهارات الحركية والتواصل واللعب الاجتماعي المبكر. نعرّف الأطفال على الروتين المنظم مع الحفاظ على التعلم ممتعاً وسلساً.',
      color: 'var(--primary-blue)'
    },
    {
      title: 'الروضة الثانية',
      age: '(4-5 سنوات)',
      image: '/KG-2.svg',
      description: 'يبدأ الأطفال أنشطة ما قبل القراءة والحساب وحل المشكلات الأساسية. يشاركون في اللعب التعاوني ويتحضرون للمدرسة الابتدائية مع نمو الاستقلالية.',
      color: 'var(--primary-green)'
    }
  ] : [
    {
      title: 'Pre-KG',
      age: '',
      image: '/Pre-KG.svg',
      description: 'Steps of the Future Private Kindergarten is a British international preschool that follows the British Early Years Foundation Stage (EYFS) framework.',
      color: 'var(--primary-pink)'
    },
    {
      title: 'KG1',
      age: '(3–4 years)',
      image: '/KG-1.svg',
      description: 'Focusing on emotional security, motor skills, communication, and early social play. We introduce children to structured routines while keeping learning fun and fluid.',
      color: 'var(--primary-blue)'
    },
    {
      title: 'KG2',
      age: '(4–5 years)',
      image: '/KG-2.svg',
      description: 'Children begin foundational pre-literacy, numeracy, and problem-solving activities. They engage in collaborative play and prepare for primary school with growing independence.',
      color: 'var(--primary-green)'
    }
  ];

  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(135deg, var(--light-yellow) 0%, var(--light-orange) 100%)',
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
        top: '70%',
        right: '8%',
        fontSize: '3.5rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '3s'
      }}>🎓</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '10%',
        fontSize: '3rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '5s'
      }}>✏️</div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '3.5rem',
            color: 'var(--primary-purple)',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            📖 {locale === 'ar-SA' ? 'لمحة عن البرنامج الأكاديمي' : 'Academic Program Preview'}
          </h2>
          <p style={{
            fontSize: '1.4rem',
            color: '#666',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.8'
          }}>
            {locale === 'ar-SA' 
              ? 'برنامج تعليمي متدرج يراعي احتياجات كل مرحلة عمرية ويعد الأطفال للمستقبل'
              : 'A progressive educational program that meets the needs of each age group and prepares children for the future'
            }
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {programs.map((program, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              border: `3px solid ${program.color}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
            }}>
              {/* Decorative corner element */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '60px',
                height: '60px',
                background: program.color,
                borderRadius: '50%',
                opacity: 0.1
              }}></div>

              {/* Program Image */}
              <div style={{
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: `linear-gradient(135deg, ${program.color}, ${program.color}20)`,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  animation: `bounce 2s infinite ${index * 0.5}s`
                }}>
                  <Image
                    src={program.image} 
                    alt={`${program.title} ${program.age}`}
                    width={65}
                    height={65}
                    style={{
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>

              {/* Program Title and Age */}
              <h3 style={{
                fontSize: '1.6rem',
                color: program.color,
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                {program.title}
              </h3>
              
              {program.age && (
                <div style={{
                  fontSize: '1rem',
                  color: '#888',
                  marginBottom: '1.5rem',
                  fontWeight: '600',
                  background: `${program.color}15`,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '15px',
                  display: 'inline-block'
                }}>
                  {program.age}
                </div>
              )}

              {/* Program Description */}
              <p style={{
                fontSize: '1rem',
                color: '#666',
                lineHeight: '1.8',
                textAlign: locale === 'ar-SA' ? 'right' : 'left',
                marginTop: program.age ? '1rem' : '2rem'
              }}>
                {program.description}
              </p>

              {/* Learn More Button */}
              <div style={{
                marginTop: '2rem'
              }}>
                <Link 
                  href={`/${locale}/academic-program`}
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: program.color,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  {locale === 'ar-SA' ? 'اعرف المزيد' : 'Learn More'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center',
          marginTop: '4rem',
          padding: '3rem',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '25px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '2rem',
            color: 'var(--primary-purple)',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            {locale === 'ar-SA' ? '🌟 اكتشف البرنامج الأكاديمي الكامل' : '🌟 Discover Our Complete Academic Program'}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            {locale === 'ar-SA' 
              ? 'تعرف على منهجنا التفصيلي والأنشطة والمهارات التي سيكتسبها طفلك في كل مرحلة'
              : 'Learn about our detailed curriculum, activities, and skills your child will develop at each stage'
            }
          </p>
          <Link 
            href={`/${locale}/academic-program`}
            style={{
              display: 'inline-block',
              padding: '1.5rem 3rem',
              background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-pink))',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }}
          >
            📚 {locale === 'ar-SA' ? 'استكشف البرنامج الأكاديمي' : 'Explore Academic Program'}
          </Link>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection({ locale }: { locale: string }) {
  const features = locale === 'ar-SA' ? [
    {
      icon: '🎨',
      title: 'التعلم الإبداعي',
      description: 'نشجع الإبداع والخيال من خلال الفنون والحرف اليدوية والأنشطة التفاعلية الممتعة التي تنمي المواهب الفردية لكل طفل.',
      color: 'var(--primary-pink)'
    },
    {
      icon: '🧩',
      title: 'التعلم باللعب',
      description: 'منهج تعليمي متطور قائم على اللعب يجعل التعلم ممتعاً ومثيراً للأطفال في جميع المراحل التعليمية.',
      color: 'var(--primary-blue)'
    },
    {
      icon: '👥',
      title: 'التطوير الاجتماعي',
      description: 'نساعد الأطفال على بناء مهارات التواصل والصداقة في بيئة آمنة ومحببة تعزز الثقة بالنفس.',
      color: 'var(--primary-green)'
    },
    {
      icon: '🌱',
      title: 'النمو الشامل',
      description: 'نركز على التطوير الجسدي والعقلي والعاطفي لكل طفل بطريقة متوازنة ومدروسة علمياً.',
      color: 'var(--primary-orange)'
    },
    {
      icon: '🔬',
      title: 'الاستكشاف العلمي',
      description: 'تجارب علمية بسيطة وآمنة تثير فضول الأطفال وتنمي حب الاستطلاع والاكتشاف.',
      color: 'var(--primary-purple)'
    },
    {
      icon: '💡',
      title: 'التفكير النقدي',
      description: 'أنشطة مصممة خصيصاً لتطوير مهارات التفكير النقدي وحل المشكلات بطرق إبداعية.',
      color: 'var(--primary-pink)'
    }
  ] : [
    {
      icon: '🎨',
      title: 'Creative Learning',
      description: 'We foster creativity and imagination through arts, crafts, and engaging interactive activities that develop each child\'s individual talents.',
      color: 'var(--primary-pink)'
    },
    {
      icon: '🧩',
      title: 'Play-Based Education',
      description: 'Our advanced curriculum uses play as the primary vehicle for learning, making education fun and exciting for children at all stages.',
      color: 'var(--primary-blue)'
    },
    {
      icon: '👥',
      title: 'Social Development',
      description: 'We help children build communication skills and friendships in a safe, nurturing environment that builds self-confidence.',
      color: 'var(--primary-green)'
    },
    {
      icon: '🌱',
      title: 'Holistic Growth',
      description: 'We focus on the physical, intellectual, and emotional development of every child in a balanced and scientifically designed way.',
      color: 'var(--primary-orange)'
    },
    {
      icon: '🔬',
      title: 'Scientific Discovery',
      description: 'Simple and safe science experiments that spark children\'s curiosity and develop their love for exploration and discovery.',
      color: 'var(--primary-purple)'
    },
    {
      icon: '💡',
      title: 'Critical Thinking',
      description: 'Activities specifically designed to develop critical thinking skills and creative problem-solving abilities.',
      color: 'var(--primary-pink)'
    }
  ];

  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '3.5rem',
            color: 'var(--primary-purple)',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            ⭐ {locale === 'ar-SA' ? 'لماذا نحن مميزون؟' : 'Why We\'re Special?'}
          </h2>
          <p style={{
            fontSize: '1.4rem',
            color: '#666',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.8'
          }}>
            {locale === 'ar-SA' 
              ? 'نقدم تجربة تعليمية استثنائية تجمع بين المرح والتعلم والنمو الشامل للطفل'
              : 'We provide an exceptional educational experience that combines fun, learning, and holistic child development'
            }
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2.5rem'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '25px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: `4px solid ${feature.color}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                background: feature.color,
                borderRadius: '50%',
                opacity: 0.1
              }}></div>

              <div style={{
                fontSize: '5rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                animation: `bounce 2s infinite ${index * 0.3}s`
              }}>
                {feature.icon}
              </div>

              <h3 style={{
                fontSize: '1.8rem',
                color: feature.color,
                marginBottom: '1.5rem',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {feature.title}
              </h3>

              <p style={{
                fontSize: '1.1rem',
                color: '#666',
                lineHeight: '1.8',
                textAlign: 'center'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Principal's Message Section
function PrincipalMessageSection({ locale }: { locale: string }) {
  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(135deg, var(--light-blue) 0%, var(--light-pink) 100%)',
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
      }}>📚</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '8%',
        fontSize: '4rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '3s'
      }}>✨</div>
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '10%',
        fontSize: '2.5rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '5s'
      }}>🌟</div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '3.5rem',
            color: 'var(--primary-purple)',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            💼 {locale === 'ar-SA' ? 'كلمة من المديرة العامة' : 'Principal\'s Message – From the General Manager'}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Principal Image */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            order: locale === 'ar-SA' ? 2 : 1
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '25px',
              overflow: 'hidden',
              boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
              border: '6px solid white',
              background: 'white',
              padding: '1rem',
              transform: 'rotate(-2deg)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(-2deg) scale(1)';
            }}>
              <Image
                src="/principal-image.png" 
                alt={locale === 'ar-SA' ? 'صورة المديرة العامة' : 'Principal Image'}
                width={400}
                height={400}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '400px',
                  display: 'block',
                  borderRadius: '20px'
                }}
              />
              {/* <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
                color: 'white',
                padding: '1rem',
                borderRadius: '15px',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}>
                {locale === 'ar-SA' ? 'المديرة العامة' : 'General Manager'}
              </div> */}
            </div>
          </div>

          {/* Principal Message Content */}
          <div style={{
            order: locale === 'ar-SA' ? 1 : 2,
            textAlign: locale === 'ar-SA' ? 'right' : 'left'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '3rem',
              borderRadius: '25px',
              boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
              border: '3px solid var(--primary-pink)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: locale === 'ar-SA' ? 'auto' : '30px',
                right: locale === 'ar-SA' ? '30px' : 'auto',
                background: 'var(--primary-pink)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                💝 {locale === 'ar-SA' ? 'رسالة خاصة' : 'Special Message'}
              </div>

              <div style={{
                fontSize: '4rem',
                textAlign: 'center',
                marginBottom: '2rem',
                opacity: 0.1
              }}>
                &quot;
              </div>

              <p style={{
                fontSize: '1.3rem',
                lineHeight: '2',
                color: '#333',
                marginBottom: '3rem',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {locale === 'ar-SA' 
                  ? 'في روضة خطوة المستقبل الأهلية، لا نعد أطفالنا للمدرسة فقط، بل نعدّهم للحياة. نلتزم بتقديم تجربة تعليمية متكاملة ترتكز على القيم، وتعزز من المهارات الشخصية، وتدعم التواصل الفعّال بيننا وبين أولياء الأمور.'
                  : 'At Future Step Nursery, we don\'t just prepare children for school — we prepare them for life. I believe every child holds within them a world of possibility. Here, we nurture that spark through meaningful play, rich bilingual experiences, and strong parent partnerships.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ locale }: { locale: string }) {
  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        fontSize: '6rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite'
      }}>🎈</div>
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        fontSize: '5rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '2s'
      }}>⭐</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        fontSize: '4rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '4s'
      }}>🌈</div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <div style={{
            fontSize: '6rem',
            marginBottom: '2rem',
            animation: 'bounce 2s infinite'
          }}>
            🚀
          </div>

          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            marginBottom: '2rem',
            fontWeight: 'bold',
            textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
          }}>
            {locale === 'ar-SA' ? '🌟 ابدأ رحلة طفلك معنا اليوم!' : '🌟 Start Your Child\'s Journey Today!'}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* CTA Content */}
          <div style={{
            order: locale === 'ar-SA' ? 2 : 1,
            textAlign: locale === 'ar-SA' ? 'right' : 'left'
          }}>
            <p style={{
              fontSize: '1.5rem',
              marginBottom: '3rem',
              lineHeight: '1.8',
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {locale === 'ar-SA' 
                ? 'انضم إلى عائلة روضة خطوة المستقبل الأهلية واكتشف عالماً من التعلم والمرح والإبداع. دع طفلك يخطو خطواته الأولى نحو مستقبل مشرق!'
                : 'Join the Future Step Nursery family and discover a world of learning, fun, and creativity. Let your child take their first steps towards a bright future!'
              }
            </p>

            <div style={{
              display: 'flex',
              gap: '2rem',
              flexDirection: 'column',
              alignItems: locale === 'ar-SA' ? 'flex-end' : 'flex-start'
            }}>
              <Link 
                href={`/${locale}/contact`}
                style={{
                  display: 'inline-block',
                  padding: '1.8rem 3.5rem',
                  background: 'var(--primary-yellow)',
                  color: 'var(--primary-purple)',
                  textDecoration: 'none',
                  borderRadius: '50px',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  border: '4px solid white',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  textAlign: 'center',
                  minWidth: '300px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 45px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                }}
              >
                📞 {locale === 'ar-SA' ? 'تواصل معنا الآن' : 'Contact Us Now'}
              </Link>

              <Link 
                href={`/${locale}/parent-portal`}
                style={{
                  display: 'inline-block',
                  padding: '1.8rem 3.5rem',
                  background: 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '50px',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  border: '4px solid white',
                  textAlign: 'center',
                  minWidth: '300px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = 'var(--primary-purple)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🏠 {locale === 'ar-SA' ? 'بوابة أولياء الأمور' : 'Parent Portal'}
              </Link>
            </div>
          </div>

          {/* Portal Image */}
          <div style={{
            order: locale === 'ar-SA' ? 1 : 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
              border: '6px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              padding: '1.5rem',
              transform: 'rotate(-3deg)',
              transition: 'transform 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(-3deg) scale(1)';
            }}>
              <Image
                src="/portal-image.png" 
                alt={locale === 'ar-SA' ? 'صورة بوابة أولياء الأمور' : 'Parent Portal Image'}
                width={450}
                height={450}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '450px',
                  display: 'block',
                  borderRadius: '25px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                borderRadius: '30px',
                pointerEvents: 'none'
              }}></div>
              
              {/* Floating Badge */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: 'linear-gradient(135deg, var(--primary-yellow), var(--primary-orange))',
                color: 'var(--primary-purple)',
                padding: '1rem 2rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                border: '3px solid white',
                animation: 'bounce 2s infinite',
                transform: 'rotate(15deg)'
              }}>
                {locale === 'ar-SA' ? '🎯 ابدأ الآن' : '🎯 Start Now'}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Row */}
        <div style={{
          marginTop: '5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          {[
            {
              icon: '🎓',
              title: locale === 'ar-SA' ? 'التسجيل السهل' : 'Easy Enrollment',
              desc: locale === 'ar-SA' ? 'عملية تسجيل بسيطة وسريعة' : 'Simple and quick registration process'
            },
            {
              icon: '👨‍👩‍👧‍👦',
              title: locale === 'ar-SA' ? 'مجتمع داعم' : 'Supportive Community',
              desc: locale === 'ar-SA' ? 'عائلة تعليمية متماسكة' : 'Close-knit educational family'
            },
            {
              icon: '🌟',
              title: locale === 'ar-SA' ? 'تجربة مميزة' : 'Exceptional Experience',
              desc: locale === 'ar-SA' ? 'رحلة تعليمية لا تُنسى' : 'Unforgettable learning journey'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                animation: `bounce 2s infinite ${index * 0.3}s`
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '1rem',
                opacity: 0.9
              }}>
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
        height: '100vh',
        background: 'linear-gradient(135deg, var(--light-pink), var(--light-blue))'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--primary-purple)'
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
      <HeroSection locale={locale} />
      <PrincipalMessageSection locale={locale} />
      <AcademicProgramSection locale={locale} />
      <FeaturesSection locale={locale} />
      <CTASection locale={locale} />
    </div>
  );
}