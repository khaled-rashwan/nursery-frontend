'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export default function AdmissionsPage() {
  const t = useTranslations('AdmissionsPage');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState('enrollment');

  const isRTL = locale === 'ar-SA';

  const docList = [
    t('docList.0'),
    t('docList.1'),
    t('docList.2'),
    t('docList.3'),
    t('docList.4'),
    t('docList.5'),
    t('docList.6'),
  ];

  const tabContent = {
    enrollment: (
      <div style={{ textAlign: isRTL ? 'right' : 'left', lineHeight: '1.8' }}>
        <p><strong>{t('expressInterest')}</strong> {t('expressInterestText')}</p>
        <p><strong>{t('visitNursery')}</strong> {t('visitNurseryText')}</p>
        <p><strong>{t('submitApplication')}</strong> {t('submitApplicationText')}</p>
        <p>{t('submitRequiredDocs')}</p>
        <p><strong>{t('childSession')}</strong> {t('childSessionText')}</p>
        <p>{t('parentInterview')}</p>
        <p>{t('admissionDecision')}</p>
      </div>
    ),
    documents: (
      <ul style={{ listStyle: 'disc', paddingInlineStart: isRTL ? '40px' : '20px', textAlign: isRTL ? 'right' : 'left' }}>
        {docList.map((doc, index) => <li key={index} style={{ marginBottom: '10px' }}>{doc}</li>)}
      </ul>
    ),
    fees: (
      <p style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('feesText')}</p>
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
          {t('title')}
        </h1>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-pink)', marginBottom: '1.5rem' }}>
          {t('subtitle')}
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-blue)', maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
          {t('welcome')}
        </p>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-blue)', maxWidth: '800px', margin: '0 auto', fontWeight: 'bold' }}>
          {t('lookForward')}
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
          {t('keyDates')}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Image src="/admissions/house.png" alt="Admissions Open" width={100} height={100} />
            <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>{t('openNow')}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image src="/admissions/calender.png" alt="Application Deadline" width={100} height={100} />
            <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>{t('deadline')}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image src="/admissions/chairs.png" alt="Limited Seats" width={100} height={100} />
            <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>{t('seatsLimited')}</p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section style={{
        margin: '3rem auto',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: isRTL ? '1fr 2fr' : '2fr 1fr',
        gap: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '1.5rem' }}>
            <button onClick={() => setActiveTab('enrollment')} style={{...tabButtonStyle, ...(activeTab === 'enrollment' ? activeTabStyle : {})}}>{t('enrollmentProcess')}</button>
            <button onClick={() => setActiveTab('documents')} style={{...tabButtonStyle, ...(activeTab === 'documents' ? activeTabStyle : {})}}>{t('requiredDocuments')}</button>
            <button onClick={() => setActiveTab('fees')} style={{...tabButtonStyle, ...(activeTab === 'fees' ? activeTabStyle : {})}}>{t('tuitionFees')}</button>
          </div>
          <div>
            {tabContent[activeTab as keyof typeof tabContent]}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1rem' }}>
          <Image src="/admissions/girl.jpg" alt="Happy student" width={400} height={300} style={{ borderRadius: 'var(--border-radius)', objectFit: 'cover', width: '100%', height: '100%' }} />
          <Image src="/admissions/boy.jpg" alt="Happy student" width={400} height={300} style={{ borderRadius: 'var(--border-radius)', objectFit: 'cover', width: '100%', height: '100%' }} />
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
          {t('formTitle')}
        </h3>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}>
          {t('formDeadline')}
        </p>
        <h4 style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--primary-purple)', marginBottom: '2rem' }}>
          {t('formSubtitle')}
        </h4>
        <form style={{ display: 'grid', gap: '1.5rem' }}>
          <label>{t('parentName')}</label>
          <input type="text" style={inputStyle} />
          <label>{t('email')}</label>
          <input type="email" style={inputStyle} />
          <label>{t('phone')}</label>
          <input type="tel" style={inputStyle} />
          <label>{t('bestTime')}</label>
          <input type="text" style={inputStyle} />
          <label>{t('whatsapp')}</label>
          <select style={inputStyle}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <label>{t('preferredLang')}</label>
          <select style={inputStyle}>
            <option value="arabic">Arabic</option>
            <option value="english">English</option>
          </select>
          <label>{t('relationship')}</label>
          <input type="text" style={inputStyle} />
          <label>{t('message')}</label>
          <textarea rows={5} style={inputStyle}></textarea>
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
          <button type="submit" style={{
            padding: '1rem',
            background: 'var(--primary-pink)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-purple)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary-pink)'}
          >
            {t('submit')}
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
