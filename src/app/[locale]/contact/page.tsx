'use client';

import React, { useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { fetchContactUsPageContent } from '../../fetchContent';
import { LocaleSpecificContactUsContent } from '../../types';
import { useRecaptchaForm } from '../../../hooks/useRecaptchaForm';

export default function ContactUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [content, setContent] = useState<LocaleSpecificContactUsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    message: ''
  });

  const { recaptchaRef, isSubmitting, formError, formSuccess, submitForm, resetForm } = useRecaptchaForm({
    onSuccess: (message) => {
      // Reset form on success
      setFormData({ fullName: '', phoneNumber: '', message: '' });
    }
  });

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { locale: resolvedLocale } = await params;
      setLocale(resolvedLocale);
      const fetchedContent = await fetchContactUsPageContent(resolvedLocale);
      setContent(fetchedContent);
      setLoading(false);
    };
    loadContent();
    
    // Load reCAPTCHA v3 script
    loadRecaptchaScript().catch(error => {
      console.error('Failed to load reCAPTCHA:', error);
    });
  }, [params]);

  // Debug logging for reCAPTCHA configuration
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    console.log('[reCAPTCHA Debug - Contact] Site key configured:', siteKey ? `${siteKey.substring(0, 20)}...` : 'NOT SET');
    console.log('[reCAPTCHA Debug - Contact] Implementation type: reCAPTCHA v2 (Checkbox)');
  }, []);

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    await submitForm(formData, 'contact');
  };

  // Hardcoded form text content
  const getFormContent = (locale: string) => {
    if (locale === 'ar-SA') {
      return {
        section2_title: "اتصل بنا",
        section2_subtitle: "هل لديك سؤال؟",
        section2_text: "لا تتردد في الاتصال بنا.",
        form_fullName: "الاسم الكامل",
        form_phoneNumber: "رقم الهاتف",
        form_yourMessage: "رسالتك",
        form_submitButton: "إرسال"
      };
    }
    return {
      section2_title: "Contact Us",
      section2_subtitle: "Have a question?",
      section2_text: "Feel free to contact us.",
      form_fullName: "Full Name",
      form_phoneNumber: "Phone Number",
      form_yourMessage: "Your Message",
      form_submitButton: "Submit"
    };
  };

  const formContent = getFormContent(locale);

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
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      padding: '2rem 1rem'
    }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, var(--light-orange), var(--light-yellow))',
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

      {/* Section 1: Contact Information */}
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
          color: 'var(--primary-blue)',
          marginBottom: '1.5rem',
          fontWeight: 'bold'
        }}>
          {content.section1_title}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>📞 {content.phone}</p>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>📍 {content.address}</p>
        <div style={{height: '400px', borderRadius: 'var(--border-radius)', overflow: 'hidden', margin: '2rem 0', boxShadow: 'var(--shadow)'}}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3574.69738933688!2d50.16185261503345!3d26.31433198336304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e7f507256e65%3A0xe8144a55f64b2ab5!2sFuture%20Step%20Kindergarten!5e0!3m2!1sen!2ssa!4v1620826723455!5m2!1sen!2ssa"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>🕒 {content.workingHours}</p>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>✉️ {content.email}</p>
      </section>

      {/* Section 2: Contact Us Form */}
      <section style={{
        background: 'linear-gradient(135deg, var(--light-blue), white)',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '800px',
        boxShadow: 'var(--shadow)',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {formContent.section2_title}
        </h2>
        <h3 style={{
          fontSize: '1.5rem',
          color: 'var(--primary-orange)',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>{formContent.section2_subtitle}</h3>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
          {formContent.section2_text}
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" style={formLabelStyle}>{formContent.form_fullName}</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              value={formData.fullName}
              onChange={handleFormChange}
              style={formInputStyle} 
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" style={formLabelStyle}>{formContent.form_phoneNumber}</label>
            <input 
              type="text" 
              id="phoneNumber" 
              name="phoneNumber" 
              value={formData.phoneNumber}
              onChange={handleFormChange}
              style={formInputStyle} 
              required
            />
          </div>
          <div>
            <label htmlFor="message" style={formLabelStyle}>{formContent.form_yourMessage}</label>
            <textarea 
              id="message" 
              name="message" 
              value={formData.message}
              onChange={handleFormChange}
              style={{...formInputStyle, minHeight: '150px'}}
              required
            ></textarea>
          </div>
          
          {/* reCAPTCHA Widget */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            />
          </div>

          {formError && (
            <div style={{
              margin: '1rem 0', 
              padding: '1rem', 
              borderRadius: 'var(--border-radius)', 
              textAlign: 'center',
              background: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb'
            }}>
              {formError}
            </div>
          )}

          {formSuccess && (
            <div style={{
              margin: '1rem 0', 
              padding: '1rem', 
              borderRadius: 'var(--border-radius)', 
              textAlign: 'center',
              background: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb'
            }}>
              {formSuccess}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              background: isSubmitting ? '#ccc' : 'var(--primary-green)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s, transform 0.3s',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'var(--primary-blue-dark)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'var(--primary-green)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isSubmitting 
              ? (locale === 'ar-SA' ? 'جاري الإرسال...' : 'Submitting...') 
              : formContent.form_submitButton
            }
          </button>
        </form>
      </section>

      {/* Section 3: FAQ */}
      <section style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-green)',
          marginBottom: '2rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {content.section3_title}
        </h2>
        <div>
          {content.faqs.map((faq, index) => (
            <div key={index} style={{ marginBottom: '1rem', borderBottom: '2px solid var(--light-blue)', paddingBottom: '1rem' }}>
              <button onClick={() => toggleFaq(index)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', color: 'var(--primary-purple)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{faq.q}</span>
                <span>{openFaq === index ? '-' : '+'}</span>
              </button>
              {openFaq === index && <p style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--light-yellow)', borderRadius: 'var(--border-radius)' }}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
