'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchAllHomePageContent, fetchAllAboutUsPageContent } from '../../../../fetchContent';
import {
  FirestoreHomePageContent,
  LocaleSpecificContent,
  FirestoreAboutUsPageContent,
  LocaleSpecificAboutUsContent,
  AboutUsSection
} from '../../../../types';
import { useAuth } from '../../../../../hooks/useAuth';
import { uploadImage } from '../../../../../services/storageService';

const formStyles = {
  container: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },
  fieldset: {
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  legend: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary-purple)',
    padding: '0 0.5rem',
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  textarea: {
    width: '100%',
    padding: '0.8rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minHeight: '100px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
};


function HomePageForm({ content, setContent }: { content: LocaleSpecificContent, setContent: (content: LocaleSpecificContent) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (section: keyof LocaleSpecificContent, field: string, value: string) => {
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: value,
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const downloadURL = await uploadImage(selectedFile, 'images/hero', setUploadProgress);
      handleChange('hero', 'heroImageUrl', downloadURL);
      setUploading(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      setUploading(false);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Hero Section</legend>
        <div style={formStyles.grid}>
          {/* Text fields */}
          <div>
            <label style={formStyles.label}>Welcome Text</label>
            <input style={formStyles.input} type="text" value={content.hero.welcome} onChange={(e) => handleChange('hero', 'welcome', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Title</label>
            <input style={formStyles.input} type="text" value={content.hero.title} onChange={(e) => handleChange('hero', 'title', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle</label>
            <input style={formStyles.input} type="text" value={content.hero.subtitle} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Description</label>
            <textarea style={formStyles.textarea} value={content.hero.description} onChange={(e) => handleChange('hero', 'description', e.target.value)} />
          </div>

          {/* Image Upload */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Hero Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Image src={content.hero.heroImageUrl} alt="Hero" width={150} height={150} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
              <div>
                <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'block', marginBottom: '0.5rem' }} />
                <button onClick={handleImageUpload} disabled={!selectedFile || uploading}>
                  {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload New Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Principal's Message Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Principal&apos;s Message</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Title</label>
            <input
              style={formStyles.input}
              type="text"
              value={content.principalMessage.title}
              onChange={(e) => handleChange('principalMessage', 'title', e.target.value)}
            />
          </div>
          <div>
            <label style={formStyles.label}>Message</label>
            <textarea
              style={formStyles.textarea}
              value={content.principalMessage.message}
              onChange={(e) => handleChange('principalMessage', 'message', e.target.value)}
            />
          </div>
        </div>
      </fieldset>
      {/* Academic Program Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Academic Program</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Title</label>
            <input
              style={formStyles.input}
              type="text"
              value={content.academicProgram.title}
              onChange={(e) => handleChange('academicProgram', 'title', e.target.value)}
            />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle</label>
            <textarea
              style={formStyles.textarea}
              value={content.academicProgram.subtitle}
              onChange={(e) => handleChange('academicProgram', 'subtitle', e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {/* Features Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Features</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Title</label>
            <input
              style={formStyles.input}
              type="text"
              value={content.features.title}
              onChange={(e) => handleChange('features', 'title', e.target.value)}
            />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle</label>
            <textarea
              style={formStyles.textarea}
              value={content.features.subtitle}
              onChange={(e) => handleChange('features', 'subtitle', e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {/* CTA Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Call to Action (CTA)</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Title</label>
            <input
              style={formStyles.input}
              type="text"
              value={content.cta.title}
              onChange={(e) => handleChange('cta', 'title', e.target.value)}
            />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle</label>
            <textarea
              style={formStyles.textarea}
              value={content.cta.subtitle}
              onChange={(e) => handleChange('cta', 'subtitle', e.target.value)}
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}

function AboutUsForm({ content, setContent }: { content: LocaleSpecificAboutUsContent, setContent: (content: LocaleSpecificAboutUsContent) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (sectionKey: keyof LocaleSpecificAboutUsContent, field: keyof AboutUsSection, value: string) => {
    setContent({
      ...content,
      [sectionKey]: {
        ...content[sectionKey],
        [field]: value,
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async (sectionKey: keyof LocaleSpecificAboutUsContent) => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const downloadURL = await uploadImage(selectedFile, `images/about-us/${sectionKey}`, setUploadProgress);
      handleChange(sectionKey, 'imageUrl', downloadURL);
      setUploading(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      setUploading(false);
    }
  };

  return (
    <div>
      {Object.keys(content).map((sectionKeyStr) => {
        const sectionKey = sectionKeyStr as keyof LocaleSpecificAboutUsContent;
        const section = content[sectionKey];
        return (
          <fieldset key={sectionKey} style={formStyles.fieldset}>
            <legend style={formStyles.legend}>{section.title}</legend>
            <div>
              <label style={formStyles.label}>Title</label>
              <input
                style={formStyles.input}
                type="text"
                value={section.title}
                onChange={(e) => handleChange(sectionKey, 'title', e.target.value)}
              />
            </div>
            <div style={{marginTop: '1rem'}}>
              <label style={formStyles.label}>Text</label>
              <textarea
                style={formStyles.textarea}
                value={section.text}
                onChange={(e) => handleChange(sectionKey, 'text', e.target.value)}
              />
            </div>

            {sectionKey === 'history' && (
              <div style={{ marginTop: '1rem' }}>
                <label style={formStyles.label}>History Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {section.imageUrl && <Image src={section.imageUrl} alt="History" width={150} height={150} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />}
                  <div>
                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'block', marginBottom: '0.5rem' }} />
                    <button onClick={() => handleImageUpload('history')} disabled={!selectedFile || uploading}>
                      {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload New Image'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

export default function ContentManagement() {
  const { user } = useAuth();
  const [homePageContent, setHomePageContent] = useState<FirestoreHomePageContent | null>(null);
  const [aboutUsContent, setAboutUsContent] = useState<FirestoreAboutUsPageContent | null>(null);
  const [activePage, setActivePage] = useState<'home' | 'about'>('home');
  const [activeLocale, setActiveLocale] = useState<'en-US' | 'ar-SA'>('en-US');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const [homeContent, aboutContent] = await Promise.all([
        fetchAllHomePageContent(),
        fetchAllAboutUsPageContent()
      ]);
      if (homeContent) setHomePageContent(homeContent);
      if (aboutContent) setAboutUsContent(aboutContent);
      setLoading(false);
    };
    loadContent();
  }, []);

  const handleSave = async () => {
    if (!user) {
      setNotification({ type: 'error', message: 'You must be logged in to save.' });
      return;
    }
    setSaving(true);
    setNotification(null);

    try {
      const token = await user.getIdToken();
      let functionName;
      let contentToSave;

      if (activePage === 'home') {
        functionName = 'saveHomePageContent';
        contentToSave = homePageContent;
      } else {
        functionName = 'saveAboutUsPageContent';
        contentToSave = aboutUsContent;
      }

      if (!contentToSave) {
        throw new Error('No content to save.');
      }

      const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/${functionName}`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contentToSave),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update content.');
      }

      setNotification({ type: 'success', message: 'Content updated successfully!' });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setNotification({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading Content Editor...</div>;

  return (
    <div style={formStyles.container}>
      {/* Page Tabs */}
      <div style={{ marginBottom: '1rem', borderBottom: '2px solid #ccc' }}>
        <button onClick={() => setActivePage('home')} style={{ padding: '1rem', border: 'none', background: activePage === 'home' ? '#eee' : 'transparent', fontWeight: activePage === 'home' ? 'bold' : 'normal' }}>Homepage</button>
        <button onClick={() => setActivePage('about')} style={{ padding: '1rem', border: 'none', background: activePage === 'about' ? '#eee' : 'transparent', fontWeight: activePage === 'about' ? 'bold' : 'normal' }}>About Us</button>
      </div>

      {/* Locale Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setActiveLocale('en-US')} style={{ padding: '0.5rem 1rem', border: `2px solid ${activeLocale === 'en-US' ? 'var(--primary-blue)' : '#ccc'}`, background: activeLocale === 'en-US' ? 'var(--light-blue)' : 'transparent', marginRight: '1rem' }}>English</button>
        <button onClick={() => setActiveLocale('ar-SA')} style={{ padding: '0.5rem 1rem', border: `2px solid ${activeLocale === 'ar-SA' ? 'var(--primary-blue)' : '#ccc'}`, background: activeLocale === 'ar-SA' ? 'var(--light-blue)' : 'transparent' }}>Arabic</button>
      </div>

      {/* Forms */}
      {activePage === 'home' && homePageContent && (
        <HomePageForm
          content={homePageContent[activeLocale]}
          setContent={(newContent) => setHomePageContent({ ...homePageContent, [activeLocale]: newContent })}
        />
      )}
      {activePage === 'about' && aboutUsContent && (
        <AboutUsForm
          content={aboutUsContent[activeLocale]}
          setContent={(newContent) => setAboutUsContent({ ...aboutUsContent, [activeLocale]: newContent })}
        />
      )}

      {/* Save Button & Notification */}
      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', background: saving ? '#ccc' : 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {notification && <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: notification.type === 'success' ? '#d4edda' : '#f8d7da', color: notification.type === 'success' ? '#155724' : '#721c24' }}>{notification.message}</div>}
    </div>
  );
}
