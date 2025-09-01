'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchCareersPageContent } from '../../../app/fetchContent';
import { LocaleSpecificCareersContent } from '../../../app/types';

export default function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [content, setContent] = useState<LocaleSpecificCareersContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { locale: resolvedLocale } = await params;
      setLocale(resolvedLocale);
      const fetchedContent = await fetchCareersPageContent(resolvedLocale);
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
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1>Content Not Available</h1>
        <p>We&apos;re sorry, the content for this page could not be loaded.</p>
      </div>
    );
  }

  const formInputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '1rem',
    borderRadius: 'var(--border-radius)',
    border: '2px solid var(--light-blue)',
    background: '#fff',
    fontSize: '1rem',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  };

  const formLabelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: 'var(--primary-purple)',
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
        background: 'linear-gradient(135deg, var(--light-blue), var(--light-green))',
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
      </section>

      {/* Section 1: Be part of our family */}
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
          {content.section1_title}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'left' }}>
          {content.section1_p1}
        </p>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'left', marginTop: '1rem' }}>
          {content.section1_p2}
        </p>
      </section>

      {/* Section 2: Why Work With Us? */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '3rem auto',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--light-yellow), white)',
          padding: '3rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          border: '4px solid var(--primary-yellow)',
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: 'var(--primary-green)',
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            {content.section2_title}
          </h2>
          <ul style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', paddingLeft: '20px' }}>
            {content.section2_points.map((point, index) => (
              <li key={index} className="stagger-item" style={{ marginBottom: '0.5rem' }}>{point}</li>
            ))}
          </ul>
        </div>
        <div>
          <Image
            src={content.section2_image}
            alt="Happy boy"
            width={500}
            height={500}
            style={{
              objectFit: 'cover',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow)',
            }}
          />
        </div>
      </div>

      {/* Section 3: Open Positions */}
      <section style={{
        background: 'linear-gradient(135deg, var(--light-orange), white)',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-blue)',
          marginBottom: '1.5rem',
          fontWeight: 'bold'
        }}>
          {content.section3_title}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>
          {content.section3_p1}
        </p>
        <ul style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {content.section3_positions.map((position, index) => (
            <li key={index} style={{
              background: 'rgba(255,255,255,0.7)',
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              marginBottom: '0.5rem',
              border: '2px solid var(--light-blue)'
            }}>{position}</li>
          ))}
        </ul>
      </section>

      {/* Section 4: Submit Your CV */}
      <section style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '800px',
        boxShadow: 'var(--shadow)',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {content.section4_title}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'center' }}>
          {content.section4_p1}
        </p>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
          {content.section4_p2}
        </p>
        <form>
          <div>
            <label htmlFor="fullName" style={formLabelStyle}>{content.form_fullName}</label>
            <input type="text" id="fullName" name="fullName" style={formInputStyle} />
          </div>
          <div>
            <label htmlFor="phoneNumber" style={formLabelStyle}>{content.form_phoneNumber}</label>
            <input type="text" id="phoneNumber" name="phoneNumber" style={formInputStyle} />
          </div>
          <div>
            <label htmlFor="emailAddress" style={formLabelStyle}>{content.form_emailAddress}</label>
            <input type="email" id="emailAddress" name="emailAddress" style={formInputStyle} />
          </div>
          <div>
            <label htmlFor="jobTitle" style={formLabelStyle}>{content.form_jobTitle}</label>
            <select id="jobTitle" name="jobTitle" style={formInputStyle}>
              {content.section3_positions.map((position, index) => (
                <option key={index} value={position}>{position}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="resume" style={formLabelStyle}>{content.form_attachResume}</label>
            <input type="file" id="resume" name="resume" style={formInputStyle} />
          </div>
          <div>
            <label htmlFor="message" style={formLabelStyle}>{content.form_yourMessage}</label>
            <textarea id="message" name="message" style={{...formInputStyle, minHeight: '150px'}}></textarea>
          </div>
          <button type="submit" style={{
            display: 'block',
            width: '100%',
            padding: '1rem',
            background: 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s, transform 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-blue-dark)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary-green)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            {content.form_submitButton}
          </button>
        </form>
      </section>
    </div>
  );
}