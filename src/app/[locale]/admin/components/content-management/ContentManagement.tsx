'use client';

import React, { useState, useEffect } from 'react';
import { fetchAllHomePageContent } from '../../../../fetchHomePageContent';
import { FirestoreHomePageContent, LocaleSpecificContent } from '../../../../types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../../../../firebase';

const functions = getFunctions(app);
const updateHomePageContent = httpsCallable(functions, 'updateHomePageContent');

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

function ContentForm({ content, setContent }: { content: LocaleSpecificContent, setContent: (content: LocaleSpecificContent) => void }) {
  const handleChange = (section: keyof LocaleSpecificContent, field: string, value: string) => {
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: value,
      },
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Hero Section</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Welcome Text</label>
            <input
              style={formStyles.input}
              type="text"
              value={content.hero.welcome}
              onChange={(e) => handleChange('hero', 'welcome', e.target.value)}
            />
          </div>
          <div>
            <label style={formStyles.label}>Title</label>
            <input
              style={formStyles.input}
              type="text"
              value={content.hero.title}
              onChange={(e) => handleChange('hero', 'title', e.target.value)}
            />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle</label>
            <input
              style={formStyles.input}
              type="text"
              value={content.hero.subtitle}
              onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
            />
          </div>
          <div>
            <label style={formStyles.label}>Description</label>
            <textarea
              style={formStyles.textarea}
              value={content.hero.description}
              onChange={(e) => handleChange('hero', 'description', e.target.value)}
            />
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

export default function ContentManagement() {
  const [content, setContent] = useState<FirestoreHomePageContent | null>(null);
  const [activeTab, setActiveTab] = useState<'en-US' | 'ar-SA'>('en-US');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const fetchedContent = await fetchAllHomePageContent();
      if (fetchedContent) {
        setContent(fetchedContent);
      } else {
        setNotification({ type: 'error', message: 'Failed to load content.' });
      }
      setLoading(false);
    };
    loadContent();
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setNotification(null);
    try {
      await updateHomePageContent(content);
      setNotification({ type: 'success', message: 'Content updated successfully!' });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to update content.';
      setNotification({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const setLocaleContent = (localeContent: LocaleSpecificContent) => {
    if (content) {
      setContent({
        ...content,
        [activeTab]: localeContent,
      });
    }
  };

  if (loading) {
    return <div>Loading Content Editor...</div>;
  }

  if (!content) {
    return <div>Error loading content. Please refresh the page.</div>;
  }

  return (
    <div style={formStyles.container}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Homepage Content Management</h1>

      {/* Tabs */}
      <div style={{ marginBottom: '2rem', borderBottom: '2px solid #ccc', display: 'flex' }}>
        <button
          onClick={() => setActiveTab('en-US')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            background: activeTab === 'en-US' ? '#eee' : 'transparent',
            fontWeight: activeTab === 'en-US' ? 'bold' : 'normal',
          }}
        >
          English
        </button>
        <button
          onClick={() => setActiveTab('ar-SA')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            background: activeTab === 'ar-SA' ? '#eee' : 'transparent',
            fontWeight: activeTab === 'ar-SA' ? 'bold' : 'normal',
          }}
        >
          Arabic
        </button>
      </div>

      {/* Form */}
      {activeTab === 'en-US' && <ContentForm content={content['en-US']} setContent={setLocaleContent} />}
      {activeTab === 'ar-SA' && <ContentForm content={content['ar-SA']} setContent={setLocaleContent} />}

      {/* Save Button */}
      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          background: saving ? '#ccc' : 'var(--primary-green)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
        }}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
