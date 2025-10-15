'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ReCAPTCHA from 'react-google-recaptcha';
import { fetchCareersPageContent } from '../../../app/fetchContent';
import { LocaleSpecificCareersContent } from '../../../app/types';
import { CareerFormData } from '../../../services/careerService';
import { uploadResume } from '../../../services/storageService';
import { useRecaptchaForm } from '../../../hooks/useRecaptchaForm';

export default function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const [content, setContent] = useState<LocaleSpecificCareersContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CareerFormData>({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    jobTitle: '',
    message: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { recaptchaRef, isSubmitting, formError, formSuccess, submitForm, resetForm } = useRecaptchaForm({
    onSuccess: (message) => {
      // Reset form on success
      setFormData({
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        jobTitle: '',
        message: '',
      });
      setResumeFile(null);
      setUploadProgress(0);
      
      // Reset file input
      const fileInput = document.getElementById('resume') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  });

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { locale: resolvedLocale } = await params;
      const fetchedContent = await fetchCareersPageContent(resolvedLocale);
      setContent(fetchedContent);
      setLoading(false);
    };
    loadContent();
  }, [params]);

  // Debug logging for reCAPTCHA configuration
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    console.log('[reCAPTCHA Debug - Careers] Site key configured:', siteKey ? `${siteKey.substring(0, 20)}...` : 'NOT SET');
    console.log('[reCAPTCHA Debug - Careers] Implementation type: reCAPTCHA v2 (Checkbox)');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    resetForm();
    setUploadProgress(0);

    try {
      let resumeUrl: string | undefined;
      
      // Upload resume if provided
      if (resumeFile) {
        try {
          resumeUrl = await uploadResume(resumeFile, (progress) => {
            setUploadProgress(progress);
          });
        } catch (uploadError) {
          console.error('Resume upload error:', uploadError);
          // Let the hook handle the error display
          throw new Error(`Resume upload failed: ${uploadError}`);
        }
      }

      // Submit form with reCAPTCHA
      const submissionData: CareerFormData = {
        ...formData,
        resumeUrl,
      };

      await submitForm(submissionData, 'career');

    } catch (error) {
      console.error('Form submission error:', error);
      // Error is already handled by the hook
    }
  };

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
        
        {formError && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem',
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            textAlign: 'center'
          }}>
            {formError}
          </div>
        )}
        
        {formSuccess && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem',
            background: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            {formSuccess}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" style={formLabelStyle}>{content.form_fullName}</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              value={formData.fullName}
              onChange={handleInputChange}
              required
              style={formInputStyle} 
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" style={formLabelStyle}>{content.form_phoneNumber}</label>
            <input 
              type="text" 
              id="phoneNumber" 
              name="phoneNumber" 
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              style={formInputStyle} 
            />
          </div>
          <div>
            <label htmlFor="emailAddress" style={formLabelStyle}>{content.form_emailAddress}</label>
            <input 
              type="email" 
              id="emailAddress" 
              name="emailAddress" 
              value={formData.emailAddress}
              onChange={handleInputChange}
              required
              style={formInputStyle} 
            />
          </div>
          <div>
            <label htmlFor="jobTitle" style={formLabelStyle}>{content.form_jobTitle}</label>
            <select 
              id="jobTitle" 
              name="jobTitle" 
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
              style={formInputStyle}
            >
              <option value="">Select a position</option>
              {content.section3_positions.map((position, index) => (
                <option key={index} value={position}>{position}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="resume" style={formLabelStyle}>{content.form_attachResume}</label>
            <input 
              type="file" 
              id="resume" 
              name="resume" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              style={formInputStyle} 
            />
            <small style={{ color: '#666', fontSize: '0.9rem' }}>
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </small>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary-green)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <small style={{ color: '#666' }}>Uploading: {Math.round(uploadProgress)}%</small>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="message" style={formLabelStyle}>{content.form_yourMessage}</label>
            <textarea 
              id="message" 
              name="message" 
              value={formData.message}
              onChange={handleInputChange}
              required
              style={{...formInputStyle, minHeight: '150px'}}
            ></textarea>
          </div>
          
          {/* reCAPTCHA Widget */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            />
          </div>

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
            {isSubmitting ? 'Submitting...' : content.form_submitButton}
          </button>
        </form>
      </section>
    </div>
  );
}