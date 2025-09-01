'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchAdmissionsPageContent } from '../../fetchContent';
import { LocaleSpecificAdmissionsContent } from '../../types';

export default function AdmissionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [content, setContent] = useState<LocaleSpecificAdmissionsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrollment');
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    bestTime: '',
    whatsapp: 'yes',
    preferredLang: 'arabic',
    relationship: '',
    message: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { locale: resolvedLocale } = await params;
      setLocale(resolvedLocale);
      const fetchedContent = await fetchAdmissionsPageContent(resolvedLocale);
      setContent(fetchedContent);
      setLoading(false);
    };
    loadContent();
  }, [params]);

  const isRTL = locale === 'ar-SA';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmissionStatus(null);

    try {
      const response = await fetch('https://us-central1-future-step-nursery.cloudfunctions.net/submitAdmission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus({ success: true, message: 'Thank you! Your submission has been received.' });
        setFormData({
          parentName: '',
          email: '',
          phone: '',
          bestTime: '',
          whatsapp: 'yes',
          preferredLang: 'arabic',
          relationship: '',
          message: ''
        });
      } else {
        setSubmissionStatus({ success: false, message: `Error: ${result.error}` });
      }
    } catch (error) {
      setSubmissionStatus({ success: false, message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

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

  const tabContent = {
    enrollment: (
      <div style={{ textAlign: isRTL ? 'right' : 'left', lineHeight: '1.8' }}>
        {content.enrollmentProcess.steps.map((step, index) => (
          <p key={index}>
            <strong>{step.title}</strong> {step.description}
          </p>
        ))}
      </div>
    ),
    documents: (
      <ul style={{ listStyle: 'disc', paddingInlineStart: isRTL ? '40px' : '20px', textAlign: isRTL ? 'right' : 'left' }}>
        {content.requiredDocuments.documents.map((doc, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>{doc}</li>
        ))}
      </ul>
    ),
    fees: (
      <p style={{ textAlign: isRTL ? 'right' : 'left' }}>{content.tuitionFees.description}</p>
    )
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      padding: '2rem 1rem',
      direction: isRTL ? 'rtl' : 'ltr'
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
      }}>
        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary-purple)', marginBottom: '1rem' }}>
          {content.title}
        </h1>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-pink)', marginBottom: '1.5rem' }}>
          {content.subtitle}
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-blue)', maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
          {content.welcome}
        </p>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-blue)', maxWidth: '800px', margin: '0 auto', fontWeight: 'bold' }}>
          {content.lookForward}
        </p>
      </section>

      {/* Key Dates Section */}
      <section style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '2.5rem', color: 'var(--primary-purple)', marginBottom: '3rem' }}>
          {content.keyDates.title}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          {content.keyDates.items.map((item, index) => (
            <div key={index} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Image 
                src={item.image.replace('gs://future-step-nursery.firebasestorage.app', '')} 
                alt={item.title} 
                width={120} 
                height={120} 
              />
              <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs Section */}
      <section style={{
        margin: '3rem auto',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          order: isRTL ? 1 : 0
        }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '1.5rem' }}>
            <button onClick={() => setActiveTab('enrollment')} style={{...tabButtonStyle, ...(activeTab === 'enrollment' ? activeTabStyle : {})}}>{content.enrollmentProcess.title}</button>
            <button onClick={() => setActiveTab('documents')} style={{...tabButtonStyle, ...(activeTab === 'documents' ? activeTabStyle : {})}}>{content.requiredDocuments.title}</button>
            <button onClick={() => setActiveTab('fees')} style={{...tabButtonStyle, ...(activeTab === 'fees' ? activeTabStyle : {})}}>{content.tuitionFees.title}</button>
          </div>
          <div>
            {tabContent[activeTab as keyof typeof tabContent]}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: '1rem' }}>
          <Image 
            src={content.images.girl.replace('gs://future-step-nursery.firebasestorage.app', '')} 
            alt="Happy student" 
            width={300} 
            height={225} 
            style={{ borderRadius: 'var(--border-radius)', objectFit: 'cover', width: '100%', height: 'auto' }} 
          />
          <Image 
            src={content.images.boy.replace('gs://future-step-nursery.firebasestorage.app', '')} 
            alt="Happy student" 
            width={300} 
            height={225} 
            style={{ borderRadius: 'var(--border-radius)', objectFit: 'cover', width: '100%', height: 'auto' }} 
          />
        </div>
      </section>

      {/* Admission Form Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--light-yellow), white)',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '800px',
        boxShadow: 'var(--shadow)',
        border: '4px solid var(--primary-yellow)',
      }}>
        <h3 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--primary-orange)', marginBottom: '0.5rem' }}>
          {content.admissionForm.title}
        </h3>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}>
          {content.admissionForm.subtitle1}
        </p>
        <h4 style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--primary-purple)', marginBottom: '2rem' }}>
          {content.admissionForm.subtitle2}
        </h4>
        <form style={{ display: 'grid', gap: '1.5rem' }} onSubmit={handleSubmit}>
          <label htmlFor="parentName">{content.admissionForm.fields.parentName}</label>
          <input type="text" id="parentName" name="parentName" value={formData.parentName} onChange={handleChange} style={inputStyle} required />
          <label htmlFor="email">{content.admissionForm.fields.email}</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
          <label htmlFor="phone">{content.admissionForm.fields.phone}</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} required />
          <label htmlFor="bestTime">{content.admissionForm.fields.bestTime}</label>
          <input type="text" id="bestTime" name="bestTime" value={formData.bestTime} onChange={handleChange} style={inputStyle} />
          <label htmlFor="whatsapp">{content.admissionForm.fields.whatsapp}</label>
          <select id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} style={inputStyle}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <label htmlFor="preferredLang">{content.admissionForm.fields.preferredLang}</label>
          <select id="preferredLang" name="preferredLang" value={formData.preferredLang} onChange={handleChange} style={inputStyle}>
            <option value="arabic">Arabic</option>
            <option value="english">English</option>
          </select>
          <label htmlFor="relationship">{content.admissionForm.fields.relationship}</label>
          <input type="text" id="relationship" name="relationship" value={formData.relationship} onChange={handleChange} style={inputStyle} required />
          <label htmlFor="message">{content.admissionForm.fields.message}</label>
          <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} style={inputStyle}></textarea>
          {/* Recaptcha placeholder */}
          <div style={{
            height: '78px',
            background: '#f9f9f9',
            border: '1px solid #d3d3d3',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#555'
          }}>
            reCAPTCHA placeholder
          </div>
          {submissionStatus && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              background: submissionStatus.success ? 'var(--light-green)' : 'var(--light-pink)',
              color: submissionStatus.success ? 'var(--primary-green)' : 'var(--primary-pink)',
              border: `2px solid ${submissionStatus.success ? 'var(--primary-green)' : 'var(--primary-pink)'}`,
              textAlign: 'center'
            }}>
              {submissionStatus.message}
            </div>
          )}
          <button type="submit" disabled={isLoading} style={{
            padding: '1rem',
            background: isLoading ? '#ccc' : 'var(--primary-pink)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '1.2rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.3s ease'
          }}
          onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'var(--primary-purple)'}}
          onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = 'var(--primary-pink)'}}
          >
            {isLoading ? 'Submitting...' : content.admissionForm.submit}
          </button>
        </form>
      </section>
    </div>
  );
}

const tabButtonStyle: React.CSSProperties = {
  padding: '1rem',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#888',
  transition: 'color 0.3s, border-bottom-color 0.3s',
  borderBottom: '2px solid transparent',
  flex: 1
};

const activeTabStyle: React.CSSProperties = {
  color: 'var(--primary-pink)',
  borderBottomColor: 'var(--primary-pink)'
};

const inputStyle: React.CSSProperties = {
  padding: '0.8rem',
  borderRadius: 'var(--border-radius)',
  border: '1px solid #ccc',
  fontSize: '1rem',
  width: '100%'
};
