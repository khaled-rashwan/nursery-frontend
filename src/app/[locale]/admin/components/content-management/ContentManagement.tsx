'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchAllHomePageContent, fetchAllAboutUsPageContent, fetchAllAcademicProgramPageContent } from '../../../../fetchContent';
import {
  FirestoreHomePageContent,
  LocaleSpecificContent,
  FirestoreAboutUsPageContent,
  LocaleSpecificAboutUsContent,
  AboutUsSection,
  FirestoreAcademicProgramPageContent,
  LocaleSpecificAcademicProgramContent,
  AcademicProgram
} from '../../../../types';
import { useAuth } from '../../../../../hooks/useAuth';
import MediaLibraryModal, { MediaItem } from '../media-library/MediaLibrary';
import MediaManagement from '../media-library/MediaManagement';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (section: keyof LocaleSpecificContent, field: string, value: string) => {
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: value,
      },
    });
  };

  const handleImageSelect = (media: MediaItem) => {
    handleChange('hero', 'heroImageUrl', media.url);
  };

  return (
    <div>
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleImageSelect}
      />
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
                <button type="button" onClick={() => setIsModalOpen(true)} style={{padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--primary-purple)', color: 'white'}}>
                  Choose from Library
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

function AcademicProgramForm({ content, setContent }: { content: LocaleSpecificAcademicProgramContent, setContent: (content: LocaleSpecificAcademicProgramContent) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProgramIndex, setActiveProgramIndex] = useState<number | null>(null);

  const handleChange = (field: keyof LocaleSpecificAcademicProgramContent, value: string) => {
    setContent({
      ...content,
      [field]: value,
    });
  };

  const handleProgramChange = (index: number, field: keyof AcademicProgram, value: string) => {
    const newPrograms = [...content.programs];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    setContent({ ...content, programs: newPrograms });
  };

  const handleImageSelect = (media: MediaItem) => {
    if (activeProgramIndex !== null) {
      handleProgramChange(activeProgramIndex, 'image', media.url);
    }
  };

  const openMediaLibrary = (index: number) => {
    setActiveProgramIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div>
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleImageSelect}
      />
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Main Content</legend>
        <div>
          <label style={formStyles.label}>Title</label>
          <input
            style={formStyles.input}
            type="text"
            value={content.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={formStyles.label}>Description</label>
          <textarea
            style={formStyles.textarea}
            value={content.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </fieldset>

      {content.programs.map((program, index) => (
        <fieldset key={index} style={formStyles.fieldset}>
          <legend style={formStyles.legend}>{program.title || `Program ${index + 1}`}</legend>
          <div>
            <label style={formStyles.label}>Program Title</label>
            <input
              style={formStyles.input}
              type="text"
              value={program.title}
              onChange={(e) => handleProgramChange(index, 'title', e.target.value)}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={formStyles.label}>Age Range</label>
            <input
              style={formStyles.input}
              type="text"
              value={program.age}
              onChange={(e) => handleProgramChange(index, 'age', e.target.value)}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={formStyles.label}>Description</label>
            <textarea
              style={formStyles.textarea}
              value={program.description}
              onChange={(e) => handleProgramChange(index, 'description', e.target.value)}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={formStyles.label}>Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {program.image && <Image src={program.image} alt={program.title} width={150} height={150} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />}
              <div>
                <button type="button" onClick={() => openMediaLibrary(index)} style={{padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--primary-purple)', color: 'white'}}>
                  Choose from Library
                </button>
              </div>
            </div>
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function AboutUsForm({ content, setContent }: { content: LocaleSpecificAboutUsContent, setContent: (content: LocaleSpecificAboutUsContent) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof LocaleSpecificAboutUsContent | null>(null);


  const handleChange = (sectionKey: keyof LocaleSpecificAboutUsContent, field: keyof AboutUsSection, value: string) => {
    setContent({
      ...content,
      [sectionKey]: {
        ...content[sectionKey],
        [field]: value,
      },
    });
  };

  const handleImageSelect = (media: MediaItem) => {
    if (activeSection) {
      handleChange(activeSection, 'imageUrl', media.url);
    }
  };

  const openMediaLibrary = (sectionKey: keyof LocaleSpecificAboutUsContent) => {
    setActiveSection(sectionKey);
    setIsModalOpen(true);
  }

  return (
    <div>
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleImageSelect}
      />
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
                    <button type="button" onClick={() => openMediaLibrary(sectionKey)} style={{padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--primary-purple)', color: 'white'}}>
                      Choose from Library
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
  const [academicProgramContent, setAcademicProgramContent] = useState<FirestoreAcademicProgramPageContent | null>(null);
  const [activePage, setActivePage] = useState<'home' | 'about' | 'academic' | 'media'>('home');
  const [activeLocale, setActiveLocale] = useState<'en-US' | 'ar-SA'>('en-US');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const [homeContent, aboutContent, academicContent] = await Promise.all([
        fetchAllHomePageContent(),
        fetchAllAboutUsPageContent(),
        fetchAllAcademicProgramPageContent()
      ]);
      if (homeContent) setHomePageContent(homeContent);
      if (aboutContent) setAboutUsContent(aboutContent);
      if (academicContent) setAcademicProgramContent(academicContent);
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
      } else if (activePage === 'about') {
        functionName = 'saveAboutUsPageContent';
        contentToSave = aboutUsContent;
      } else if (activePage === 'academic') {
        functionName = 'saveAcademicProgramPageContent';
        contentToSave = academicProgramContent;
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
        <button onClick={() => setActivePage('academic')} style={{ padding: '1rem', border: 'none', background: activePage === 'academic' ? '#eee' : 'transparent', fontWeight: activePage === 'academic' ? 'bold' : 'normal' }}>Academic Program</button>
        <button onClick={() => setActivePage('media')} style={{ padding: '1rem', border: 'none', background: activePage === 'media' ? '#eee' : 'transparent', fontWeight: activePage === 'media' ? 'bold' : 'normal' }}>Media Library</button>
      </div>

      {/* Locale Tabs (hide for media library) */}
      {activePage !== 'media' && (
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => setActiveLocale('en-US')} style={{ padding: '0.5rem 1rem', border: `2px solid ${activeLocale === 'en-US' ? 'var(--primary-blue)' : '#ccc'}`, background: activeLocale === 'en-US' ? 'var(--light-blue)' : 'transparent', marginRight: '1rem' }}>English</button>
          <button onClick={() => setActiveLocale('ar-SA')} style={{ padding: '0.5rem 1rem', border: `2px solid ${activeLocale === 'ar-SA' ? 'var(--primary-blue)' : '#ccc'}`, background: activeLocale === 'ar-SA' ? 'var(--light-blue)' : 'transparent' }}>Arabic</button>
        </div>
      )}

      {/* Forms and Media Library */}
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
      {activePage === 'academic' && academicProgramContent && (
        <AcademicProgramForm
          content={academicProgramContent[activeLocale]}
          setContent={(newContent) => setAcademicProgramContent({ ...academicProgramContent, [activeLocale]: newContent })}
        />
      )}
      {activePage === 'media' && (
        <MediaManagement locale={activeLocale} />
      )}

      {/* Save Button & Notification (hide for media library) */}
      {activePage !== 'media' && (
        <>
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', background: saving ? '#ccc' : 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {notification && <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: notification.type === 'success' ? '#d4edda' : '#f8d7da', color: notification.type === 'success' ? '#155724' : '#721c24' }}>{notification.message}</div>}
        </>
      )}
    </div>
  );
}
