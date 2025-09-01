'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchGalleryPageContent } from '../../../app/fetchContent';
import { LocaleSpecificGalleryContent, GalleryImage } from '../../../app/types';

export default function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [content, setContent] = useState<LocaleSpecificGalleryContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { locale: resolvedLocale } = await params;
      setLocale(resolvedLocale);
      const fetchedContent = await fetchGalleryPageContent(resolvedLocale);
      setContent(fetchedContent);
      setLoading(false);
    };
    loadContent();
  }, [params]);

  if (loading) {
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

  if (!content) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }}>Content Not Available</h1>
        <p style={{ color: '#666' }}>We&apos;re sorry, the gallery content could not be loaded.</p>
      </div>
    );
  }

  const hasImages = content.images && content.images.length > 0;

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

      {/* Description Section */}
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
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#555', 
          lineHeight: '1.8', 
          textAlign: locale === 'ar-SA' ? 'right' : 'left',
          marginBottom: '1rem'
        }}>
          {content.description1}
        </p>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#555', 
          lineHeight: '1.8', 
          textAlign: locale === 'ar-SA' ? 'right' : 'left'
        }}>
          {content.description2}
        </p>
      </section>

      {/* Gallery Section */}
      <section style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '2rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {content.imagesTitle}
        </h2>
        
        {hasImages ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            justifyItems: 'center'
          }}>
            {content.images.map((image, index) => (
              <div
                key={image.id || index}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '250px',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onClick={() => setSelectedImage(image)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
              >
                <Image
                  src={image.url}
                  alt={image.description || image.filename}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {image.description && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white',
                    padding: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    {image.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, var(--light-blue), var(--light-yellow))',
            borderRadius: 'var(--border-radius)',
            margin: '2rem 0',
          }}>
            <h3 style={{
              fontSize: '2rem',
              color: 'var(--primary-purple)',
              fontWeight: 'bold'
            }}>
              {locale === 'ar-SA' ? 'سيتم إضافة الصور قريبًا...' : 'Images will be added soon...'}
            </h3>
          </div>
        )}
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            backgroundColor: 'white',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <Image
              src={selectedImage.url}
              alt={selectedImage.description || selectedImage.filename}
              width={800}
              height={600}
              style={{ 
                width: '100%', 
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
            {selectedImage.description && (
              <div style={{
                padding: '1.5rem',
                background: 'white',
                borderTop: '1px solid #eee'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: '#333',
                  textAlign: locale === 'ar-SA' ? 'right' : 'left'
                }}>
                  {selectedImage.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
