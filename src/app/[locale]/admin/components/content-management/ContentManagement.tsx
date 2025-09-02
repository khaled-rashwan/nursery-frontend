'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchAllHomePageContent, fetchAllAboutUsPageContent, fetchAllContactUsPageContent, fetchAllAcademicProgramPageContent, fetchAllCareersPageContent, fetchAllAdmissionsPageContent, fetchAllGalleryPageContent, fetchAllFooterContent } from '../../../../fetchContent';
import {
  FirestoreHomePageContent,
  LocaleSpecificContent,
  FirestoreAboutUsPageContent,
  LocaleSpecificAboutUsContent,
  AboutUsSection,
  FirestoreContactUsPageContent,
  LocaleSpecificContactUsContent,
  Faq,
  FirestoreAcademicProgramPageContent,
  LocaleSpecificAcademicProgramContent,
  Program,
  FirestoreCareersPageContent,
  LocaleSpecificCareersContent,
  FirestoreAdmissionsPageContent,
  LocaleSpecificAdmissionsContent,
  FirestoreGalleryPageContent,
  LocaleSpecificGalleryContent,
  GalleryImage,
  FirestoreFooterContent,
  LocaleSpecificFooterContent
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

function ContactUsForm({ content, setContent }: { content: LocaleSpecificContactUsContent, setContent: (content: LocaleSpecificContactUsContent) => void }) {
  const handleChange = (section: keyof LocaleSpecificContactUsContent, value: string | Faq[], index?: number) => {
    if (typeof value === 'string') {
      setContent({
        ...content,
        [section]: value,
      });
    } else {
      // Handle FAQ updates
      const newFaqs = [...content.faqs];
      if (index !== undefined) {
        newFaqs[index] = value[0] as Faq;
      }
      setContent({
        ...content,
        faqs: newFaqs,
      });
    }
  };

  const handleFaqChange = (index: number, field: 'q' | 'a', value: string) => {
    const newFaqs = [...content.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setContent({ ...content, faqs: newFaqs });
  };

  return (
    <div>
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Contact Information</legend>
        <div style={formStyles.grid}>
          <input style={formStyles.input} type="text" value={content.title} onChange={(e) => handleChange('title', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.section1_title} onChange={(e) => handleChange('section1_title', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.address} onChange={(e) => handleChange('address', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.workingHours} onChange={(e) => handleChange('workingHours', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.email} onChange={(e) => handleChange('email', e.target.value)} />
        </div>
      </fieldset>

      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Contact Form</legend>
        <div style={formStyles.grid}>
          <input style={formStyles.input} type="text" value={content.section2_title} onChange={(e) => handleChange('section2_title', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.section2_subtitle} onChange={(e) => handleChange('section2_subtitle', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.section2_text} onChange={(e) => handleChange('section2_text', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.form_fullName} onChange={(e) => handleChange('form_fullName', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.form_phoneNumber} onChange={(e) => handleChange('form_phoneNumber', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.form_yourMessage} onChange={(e) => handleChange('form_yourMessage', e.target.value)} />
          <input style={formStyles.input} type="text" value={content.form_submitButton} onChange={(e) => handleChange('form_submitButton', e.target.value)} />
        </div>
      </fieldset>

      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>FAQs</legend>
        <input style={formStyles.input} type="text" value={content.section3_title} onChange={(e) => handleChange('section3_title', e.target.value)} />
        {content.faqs.map((faq, index) => (
          <div key={index} style={{ ...formStyles.grid, borderTop: '1px solid #ccc', paddingTop: '1rem', marginTop: '1rem' }}>
            <textarea style={formStyles.textarea} value={faq.q} onChange={(e) => handleFaqChange(index, 'q', e.target.value)} placeholder="Question" />
            <textarea style={formStyles.textarea} value={faq.a} onChange={(e) => handleFaqChange(index, 'a', e.target.value)} placeholder="Answer" />
          </div>
        ))}
      </fieldset>
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

function AcademicProgramForm({ content, setContent }: { content: LocaleSpecificAcademicProgramContent, setContent: (content: LocaleSpecificAcademicProgramContent) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProgramIndex, setActiveProgramIndex] = useState<number | null>(null);

  const handleImageSelect = (media: MediaItem) => {
    if (activeProgramIndex !== null) {
      const newPrograms = [...content.programs];
      newPrograms[activeProgramIndex].image = media.url;
      setContent({ ...content, programs: newPrograms });
    }
  };

  const openMediaLibrary = (index: number) => {
    setActiveProgramIndex(index);
    setIsModalOpen(true);
  };

  const handlePhilosophyChange = (field: keyof LocaleSpecificAcademicProgramContent['educationalPhilosophy'], value: string) => {
    setContent({
      ...content,
      educationalPhilosophy: {
        ...content.educationalPhilosophy,
        [field]: value,
      },
    });
  };

  const handleProgramChange = (index: number, field: keyof Program, value: string) => {
    const newPrograms = [...content.programs];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    setContent({ ...content, programs: newPrograms });
  };

  const handleExperienceChange = (programIndex: number, experienceIndex: number, value: string) => {
    const newPrograms = [...content.programs];
    newPrograms[programIndex].experiences[experienceIndex] = value;
    setContent({ ...content, programs: newPrograms });
  };

  const handleCtaChange = (field: keyof LocaleSpecificAcademicProgramContent['cta'], value: string) => {
    setContent({
      ...content,
      cta: {
        ...content.cta,
        [field]: value,
      },
    });
  };

  return (
    <div>
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleImageSelect}
      />
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Educational Philosophy</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Title</label>
            <input style={formStyles.input} type="text" value={content.educationalPhilosophy.title} onChange={(e) => handlePhilosophyChange('title', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Framework</label>
            <input style={formStyles.input} type="text" value={content.educationalPhilosophy.framework} onChange={(e) => handlePhilosophyChange('framework', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Framework Description</label>
            <textarea style={formStyles.textarea} value={content.educationalPhilosophy.frameworkDescription} onChange={(e) => handlePhilosophyChange('frameworkDescription', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Philosophy</label>
            <textarea style={formStyles.textarea} value={content.educationalPhilosophy.philosophy} onChange={(e) => handlePhilosophyChange('philosophy', e.target.value)} />
          </div>
        </div>
      </fieldset>

      {content.programs.map((program, index) => (
        <fieldset key={program.id} style={formStyles.fieldset}>
          <legend style={formStyles.legend}>{program.title}</legend>
          <div style={formStyles.grid}>
            <div>
              <label style={formStyles.label}>Title</label>
              <input style={formStyles.input} type="text" value={program.title} onChange={(e) => handleProgramChange(index, 'title', e.target.value)} />
            </div>
            <div>
              <label style={formStyles.label}>Age Range</label>
              <input style={formStyles.input} type="text" value={program.ageRange} onChange={(e) => handleProgramChange(index, 'ageRange', e.target.value)} />
            </div>
            <div>
              <label style={formStyles.label}>Icon</label>
              <input style={formStyles.input} type="text" value={program.icon} onChange={(e) => handleProgramChange(index, 'icon', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={formStyles.label}>Overview</label>
              <textarea style={formStyles.textarea} value={program.overview} onChange={(e) => handleProgramChange(index, 'overview', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={formStyles.label}>Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Image src={program.image} alt={program.title} width={150} height={150} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
                <div>
                  <button type="button" onClick={() => openMediaLibrary(index)} style={{padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--primary-purple)', color: 'white'}}>
                    Choose from Library
                  </button>
                </div>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={formStyles.label}>Experiences Title</label>
              <input style={formStyles.input} type="text" value={program.experiencesTitle} onChange={(e) => handleProgramChange(index, 'experiencesTitle', e.target.value)} />
            </div>
            {program.experiences.map((experience, expIndex) => (
              <div key={expIndex} style={{ gridColumn: '1 / -1' }}>
                <label style={formStyles.label}>Experience {expIndex + 1}</label>
                <textarea style={formStyles.textarea} value={experience} onChange={(e) => handleExperienceChange(index, expIndex, e.target.value)} />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Call to Action</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Title</label>
            <input style={formStyles.input} type="text" value={content.cta.title} onChange={(e) => handleCtaChange('title', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Subtitle</label>
            <textarea style={formStyles.textarea} value={content.cta.subtitle} onChange={(e) => handleCtaChange('subtitle', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Enroll Button Text</label>
            <input style={formStyles.input} type="text" value={content.cta.enrollButton} onChange={(e) => handleCtaChange('enrollButton', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Contact Button Text</label>
            <input style={formStyles.input} type="text" value={content.cta.contactButton} onChange={(e) => handleCtaChange('contactButton', e.target.value)} />
          </div>
        </div>
      </fieldset>
    </div>
  );
}

function CareersForm({ content, setContent }: { content: LocaleSpecificCareersContent, setContent: (content: LocaleSpecificCareersContent) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (field: keyof LocaleSpecificCareersContent, value: string | string[]) => {
    setContent({
      ...content,
      [field]: value
    });
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...content.section2_points];
    newPoints[index] = value;
    setContent({
      ...content,
      section2_points: newPoints
    });
  };

  const addPoint = () => {
    setContent({
      ...content,
      section2_points: [...content.section2_points, '']
    });
  };

  const removePoint = (index: number) => {
    const newPoints = content.section2_points.filter((_, i) => i !== index);
    setContent({
      ...content,
      section2_points: newPoints
    });
  };

  const handlePositionChange = (index: number, value: string) => {
    const newPositions = [...content.section3_positions];
    newPositions[index] = value;
    setContent({
      ...content,
      section3_positions: newPositions
    });
  };

  const addPosition = () => {
    setContent({
      ...content,
      section3_positions: [...content.section3_positions, '']
    });
  };

  const removePosition = (index: number) => {
    const newPositions = content.section3_positions.filter((_, i) => i !== index);
    setContent({
      ...content,
      section3_positions: newPositions
    });
  };

  const handleImageSelect = (mediaItem: MediaItem) => {
    setContent({
      ...content,
      section2_image: mediaItem.url
    });
    setIsModalOpen(false);
  };

  return (
    <div>
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Hero Section</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Page Title</label>
            <input style={formStyles.input} type="text" value={content.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>
        </div>
      </fieldset>

      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Section 1: Be Part of Our Family</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.section1_title} onChange={(e) => handleChange('section1_title', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Paragraph 1</label>
            <textarea style={formStyles.textarea} value={content.section1_p1} onChange={(e) => handleChange('section1_p1', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Paragraph 2</label>
            <textarea style={formStyles.textarea} value={content.section1_p2} onChange={(e) => handleChange('section1_p2', e.target.value)} />
          </div>
        </div>
      </fieldset>

      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Section 2: Why Work With Us</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.section2_title} onChange={(e) => handleChange('section2_title', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Image src={content.section2_image} alt="Section 2" width={150} height={150} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
              <div>
                <button type="button" onClick={() => setIsModalOpen(true)} style={{padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--primary-purple)', color: 'white'}}>
                  Choose from Library
                </button>
              </div>
            </div>
          </div>
          {content.section2_points.map((point, index) => (
            <div key={index} style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={formStyles.label}>Point {index + 1}</label>
              <input style={formStyles.input} type="text" value={point} onChange={(e) => handlePointChange(index, e.target.value)} />
              <button type="button" onClick={() => removePoint(index)} style={{padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Remove</button>
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="button" onClick={addPoint} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>Add Point</button>
          </div>
        </div>
      </fieldset>

      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Section 3: Open Positions</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.section3_title} onChange={(e) => handleChange('section3_title', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Text</label>
            <textarea style={formStyles.textarea} value={content.section3_p1} onChange={(e) => handleChange('section3_p1', e.target.value)} />
          </div>
          {content.section3_positions.map((position, index) => (
            <div key={index} style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={formStyles.label}>Position {index + 1}</label>
              <input style={formStyles.input} type="text" value={position} onChange={(e) => handlePositionChange(index, e.target.value)} />
              <button type="button" onClick={() => removePosition(index)} style={{padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Remove</button>
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="button" onClick={addPosition} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>Add Position</button>
          </div>
        </div>
      </fieldset>

      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Section 4: Submit CV & Contact Form</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.section4_title} onChange={(e) => handleChange('section4_title', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Email Instruction</label>
            <textarea style={formStyles.textarea} value={content.section4_p1} onChange={(e) => handleChange('section4_p1', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Form Instruction</label>
            <textarea style={formStyles.textarea} value={content.section4_p2} onChange={(e) => handleChange('section4_p2', e.target.value)} />
          </div>
          
          {/* Note about hardcoded form fields */}
          <div style={{ gridColumn: '1 / -1', padding: '1rem', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
              <strong>Note:</strong> Form field labels below are hardcoded for consistency and cannot be edited via CMS. 
              Only job position options can be managed above.
            </p>
          </div>
          
          <div>
            <label style={formStyles.label}>Full Name Label (Read-only)</label>
            <input 
              style={{...formStyles.input, background: '#f8f9fa', cursor: 'not-allowed'}} 
              type="text" 
              value={content.form_fullName} 
              readOnly 
              title="This field is hardcoded and cannot be edited"
            />
          </div>
          <div>
            <label style={formStyles.label}>Phone Number Label (Read-only)</label>
            <input 
              style={{...formStyles.input, background: '#f8f9fa', cursor: 'not-allowed'}} 
              type="text" 
              value={content.form_phoneNumber} 
              readOnly 
              title="This field is hardcoded and cannot be edited"
            />
          </div>
          <div>
            <label style={formStyles.label}>Email Address Label (Read-only)</label>
            <input 
              style={{...formStyles.input, background: '#f8f9fa', cursor: 'not-allowed'}} 
              type="text" 
              value={content.form_emailAddress} 
              readOnly 
              title="This field is hardcoded and cannot be edited"
            />
          </div>
          <div>
            <label style={formStyles.label}>Job Title Label (Read-only)</label>
            <input 
              style={{...formStyles.input, background: '#f8f9fa', cursor: 'not-allowed'}} 
              type="text" 
              value={content.form_jobTitle} 
              readOnly 
              title="This field is hardcoded and cannot be edited"
            />
          </div>
          <div>
            <label style={formStyles.label}>Attach Resume Label (Read-only)</label>
            <input 
              style={{...formStyles.input, background: '#f8f9fa', cursor: 'not-allowed'}} 
              type="text" 
              value={content.form_attachResume} 
              readOnly 
              title="This field is hardcoded and cannot be edited"
            />
          </div>
          <div>
            <label style={formStyles.label}>Your Message Label (Read-only)</label>
            <input 
              style={{...formStyles.input, background: '#f8f9fa', cursor: 'not-allowed'}} 
              type="text" 
              value={content.form_yourMessage} 
              readOnly 
              title="This field is hardcoded and cannot be edited"
            />
          </div>
          <div>
            <label style={formStyles.label}>Submit Button Text (Read-only)</label>
            <input 
              style={{...formStyles.input, background: '#f8f9fa', cursor: 'not-allowed'}} 
              type="text" 
              value={content.form_submitButton} 
              readOnly 
              title="This field is hardcoded and cannot be edited"
            />
          </div>
        </div>
      </fieldset>

      {isModalOpen && (
        <MediaLibraryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleImageSelect}
        />
      )}
    </div>
  );
}

function AdmissionsForm({ content, setContent }: { content: LocaleSpecificAdmissionsContent, setContent: (content: LocaleSpecificAdmissionsContent) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<'boy' | 'girl' | null>(null);
  const [activeKeyDateIndex, setActiveKeyDateIndex] = useState<number | null>(null);

  const handleChange = (field: keyof LocaleSpecificAdmissionsContent, value: string) => {
    setContent({
      ...content,
      [field]: value
    });
  };

  const handleKeyDateChange = (index: number, field: 'title' | 'image', value: string) => {
    const newItems = [...content.keyDates.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setContent({
      ...content,
      keyDates: {
        ...content.keyDates,
        items: newItems
      }
    });
  };

  const handleEnrollmentStepChange = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...content.enrollmentProcess.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setContent({
      ...content,
      enrollmentProcess: {
        ...content.enrollmentProcess,
        steps: newSteps
      }
    });
  };

  const handleDocumentChange = (index: number, value: string) => {
    const newDocuments = [...content.requiredDocuments.documents];
    newDocuments[index] = value;
    setContent({
      ...content,
      requiredDocuments: {
        ...content.requiredDocuments,
        documents: newDocuments
      }
    });
  };

  const addDocument = () => {
    setContent({
      ...content,
      requiredDocuments: {
        ...content.requiredDocuments,
        documents: [...content.requiredDocuments.documents, '']
      }
    });
  };

  const removeDocument = (index: number) => {
    const newDocuments = content.requiredDocuments.documents.filter((_, i) => i !== index);
    setContent({
      ...content,
      requiredDocuments: {
        ...content.requiredDocuments,
        documents: newDocuments
      }
    });
  };

  const handleFormFieldChange = (field: keyof typeof content.admissionForm.fields, value: string) => {
    setContent({
      ...content,
      admissionForm: {
        ...content.admissionForm,
        fields: {
          ...content.admissionForm.fields,
          [field]: value
        }
      }
    });
  };

  const handleImageSelect = (mediaItem: MediaItem) => {
    if (activeImageField) {
      setContent({
        ...content,
        images: {
          ...content.images,
          [activeImageField]: mediaItem.url
        }
      });
      setIsModalOpen(false);
      setActiveImageField(null);
    } else if (activeKeyDateIndex !== null) {
      // Handle Key Date image selection
      const newItems = [...content.keyDates.items];
      newItems[activeKeyDateIndex] = { ...newItems[activeKeyDateIndex], image: mediaItem.url };
      setContent({
        ...content,
        keyDates: {
          ...content.keyDates,
          items: newItems
        }
      });
      setIsModalOpen(false);
      setActiveKeyDateIndex(null);
    }
  };

  const openMediaLibrary = (imageField: 'boy' | 'girl') => {
    setActiveImageField(imageField);
    setIsModalOpen(true);
  };

  const openKeyDateMediaLibrary = (keyDateIndex: number) => {
    setActiveKeyDateIndex(keyDateIndex);
    setIsModalOpen(true);
  };

  return (
    <div>
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveImageField(null);
          setActiveKeyDateIndex(null);
        }}
        onSelect={handleImageSelect}
      />

      {/* Hero Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Hero Section</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Page Title</label>
            <input style={formStyles.input} type="text" value={content.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Subtitle</label>
            <input style={formStyles.input} type="text" value={content.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Welcome Text</label>
            <textarea style={formStyles.textarea} value={content.welcome} onChange={(e) => handleChange('welcome', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Look Forward Text</label>
            <textarea style={formStyles.textarea} value={content.lookForward} onChange={(e) => handleChange('lookForward', e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* Key Dates Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Key Dates & Deadlines</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.keyDates.title} onChange={(e) => setContent({...content, keyDates: {...content.keyDates, title: e.target.value}})} />
          </div>
          {content.keyDates.items.map((item, index) => (
            <div key={index} style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4>Key Date {index + 1}</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={formStyles.label}>Title</label>
                <input style={formStyles.input} type="text" value={item.title} onChange={(e) => handleKeyDateChange(index, 'title', e.target.value)} />
              </div>
              <div>
                <label style={formStyles.label}>Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Image 
                    src={item.image || '/placeholder.jpg'} 
                    alt={item.title} 
                    width={150} 
                    height={150} 
                    style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => openKeyDateMediaLibrary(index)} 
                    style={{
                      padding: '0.8rem 1.5rem', 
                      borderRadius: '8px', 
                      border: 'none', 
                      cursor: 'pointer', 
                      background: 'var(--primary-purple)', 
                      color: 'white'
                    }}
                  >
                    Choose Image
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Enrollment Process Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Enrollment Process</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.enrollmentProcess.title} onChange={(e) => setContent({...content, enrollmentProcess: {...content.enrollmentProcess, title: e.target.value}})} />
          </div>
          {content.enrollmentProcess.steps.map((step, index) => (
            <div key={index} style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4>Step {index + 1}</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={formStyles.label}>Step Title</label>
                <input style={formStyles.input} type="text" value={step.title} onChange={(e) => handleEnrollmentStepChange(index, 'title', e.target.value)} />
              </div>
              <div>
                <label style={formStyles.label}>Step Description</label>
                <textarea style={formStyles.textarea} value={step.description} onChange={(e) => handleEnrollmentStepChange(index, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Required Documents Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Required Documents</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.requiredDocuments.title} onChange={(e) => setContent({...content, requiredDocuments: {...content.requiredDocuments, title: e.target.value}})} />
          </div>
          {content.requiredDocuments.documents.map((doc, index) => (
            <div key={index} style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={formStyles.label}>Document {index + 1}</label>
              <input style={formStyles.input} type="text" value={doc} onChange={(e) => handleDocumentChange(index, e.target.value)} />
              <button type="button" onClick={() => removeDocument(index)} style={{padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Remove</button>
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="button" onClick={addDocument} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>Add Document</button>
          </div>
        </div>
      </fieldset>

      {/* Tuition & Fees Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Tuition & Fees</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Section Title</label>
            <input style={formStyles.input} type="text" value={content.tuitionFees.title} onChange={(e) => setContent({...content, tuitionFees: {...content.tuitionFees, title: e.target.value}})} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Description</label>
            <textarea style={formStyles.textarea} value={content.tuitionFees.description} onChange={(e) => setContent({...content, tuitionFees: {...content.tuitionFees, description: e.target.value}})} />
          </div>
        </div>
      </fieldset>

      {/* Images Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Images</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Boy Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Image src={content.images.boy || '/placeholder.jpg'} alt="Boy" width={150} height={150} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
              <button type="button" onClick={() => openMediaLibrary('boy')} style={{padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--primary-purple)', color: 'white'}}>
                Choose Boy Image
              </button>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Girl Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Image src={content.images.girl || '/placeholder.jpg'} alt="Girl" width={150} height={150} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
              <button type="button" onClick={() => openMediaLibrary('girl')} style={{padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--primary-purple)', color: 'white'}}>
                Choose Girl Image
              </button>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Admission Form Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Admission Form Labels</legend>
        <div style={formStyles.grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Form Title</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.title} onChange={(e) => setContent({...content, admissionForm: {...content.admissionForm, title: e.target.value}})} />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle 1</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.subtitle1} onChange={(e) => setContent({...content, admissionForm: {...content.admissionForm, subtitle1: e.target.value}})} />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle 2</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.subtitle2} onChange={(e) => setContent({...content, admissionForm: {...content.admissionForm, subtitle2: e.target.value}})} />
          </div>
          <div>
            <label style={formStyles.label}>Parent Name Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.parentName} onChange={(e) => handleFormFieldChange('parentName', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Email Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.email} onChange={(e) => handleFormFieldChange('email', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Phone Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.phone} onChange={(e) => handleFormFieldChange('phone', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Best Time Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.bestTime} onChange={(e) => handleFormFieldChange('bestTime', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>WhatsApp Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.whatsapp} onChange={(e) => handleFormFieldChange('whatsapp', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Preferred Language Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.preferredLang} onChange={(e) => handleFormFieldChange('preferredLang', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Relationship Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.relationship} onChange={(e) => handleFormFieldChange('relationship', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Message Label</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.fields.message} onChange={(e) => handleFormFieldChange('message', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Submit Button Text</label>
            <input style={formStyles.input} type="text" value={content.admissionForm.submit} onChange={(e) => setContent({...content, admissionForm: {...content.admissionForm, submit: e.target.value}})} />
          </div>
        </div>
      </fieldset>
    </div>
  );
}

function GalleryForm({ content, setContent }: { content: LocaleSpecificGalleryContent, setContent: (content: LocaleSpecificGalleryContent) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (field: keyof LocaleSpecificGalleryContent, value: string) => {
    setContent({
      ...content,
      [field]: value,
    });
  };

  const handleImageSelect = (media: MediaItem) => {
    const newImage: GalleryImage = {
      id: media.id,
      url: media.url,
      filename: media.filename,
      description: '',
      uploadedAt: media.uploadedAt
    };
    
    setContent({
      ...content,
      images: [...content.images, newImage]
    });
    setIsModalOpen(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...content.images];
    newImages.splice(index, 1);
    setContent({
      ...content,
      images: newImages
    });
  };

  const updateImageDescription = (index: number, description: string) => {
    const newImages = [...content.images];
    newImages[index] = { ...newImages[index], description };
    setContent({
      ...content,
      images: newImages
    });
  };

  return (
    <div>
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleImageSelect}
      />
      
      {/* Basic Content Fields */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Page Content</legend>
        <div style={formStyles.grid}>
          <div>
            <label style={formStyles.label}>Title</label>
            <input 
              style={formStyles.input} 
              type="text" 
              value={content.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
            />
          </div>
          <div>
            <label style={formStyles.label}>Subtitle</label>
            <input 
              style={formStyles.input} 
              type="text" 
              value={content.subtitle} 
              onChange={(e) => handleChange('subtitle', e.target.value)} 
            />
          </div>
          <div>
            <label style={formStyles.label}>Heading</label>
            <input 
              style={formStyles.input} 
              type="text" 
              value={content.heading} 
              onChange={(e) => handleChange('heading', e.target.value)} 
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Description 1</label>
            <textarea 
              style={formStyles.textarea} 
              value={content.description1} 
              onChange={(e) => handleChange('description1', e.target.value)} 
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Description 2</label>
            <textarea 
              style={formStyles.textarea} 
              value={content.description2} 
              onChange={(e) => handleChange('description2', e.target.value)} 
            />
          </div>
          <div>
            <label style={formStyles.label}>Images Section Title</label>
            <input 
              style={formStyles.input} 
              type="text" 
              value={content.imagesTitle} 
              onChange={(e) => handleChange('imagesTitle', e.target.value)} 
            />
          </div>
        </div>
      </fieldset>

      {/* Gallery Images Section */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Gallery Images</legend>
        <div style={{ marginBottom: '1rem' }}>
          <button 
            type="button" 
            onClick={() => setIsModalOpen(true)} 
            style={{
              padding: '0.8rem 1.5rem', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer', 
              background: 'var(--primary-purple)', 
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Add Image from Library
          </button>
        </div>
        
        {content.images.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {content.images.map((image, index) => (
              <div 
                key={image.id || index} 
                style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: '#f9f9f9'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <Image
                    src={image.url}
                    alt={image.description || image.filename}
                    width={250}
                    height={200}
                    style={{ 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      width: '100%',
                      height: '200px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={formStyles.label}>Description (Optional)</label>
                  <textarea 
                    style={{...formStyles.textarea, minHeight: '80px'}} 
                    value={image.description || ''} 
                    placeholder="Add a description for this image..."
                    onChange={(e) => updateImageDescription(index, e.target.value)} 
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#f0f0f0',
            borderRadius: '8px',
            color: '#666'
          }}>
            <p>No images added yet. Click &quot;Add Image from Library&quot; to get started.</p>
          </div>
        )}
      </fieldset>
    </div>
  );
}

function FooterForm({ content, setContent }: { content: LocaleSpecificFooterContent, setContent: (content: LocaleSpecificFooterContent) => void }) {
  const handleSectionChange = (index: number, field: 'icon' | 'title' | 'content', value: string) => {
    const updatedSections = [...content.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
    };
    setContent({
      ...content,
      sections: updatedSections,
    });
  };

  const handleCopyrightChange = (value: string) => {
    setContent({
      ...content,
      copyright: value,
    });
  };

  const addSection = () => {
    setContent({
      ...content,
      sections: [...content.sections, { icon: '📍', title: '', content: '' }],
    });
  };

  const removeSection = (index: number) => {
    const updatedSections = content.sections.filter((_, i) => i !== index);
    setContent({
      ...content,
      sections: updatedSections,
    });
  };

  return (
    <div style={formStyles.container}>
      {/* Footer Sections */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Footer Sections</legend>
        {content.sections.map((section, index) => (
          <div key={index} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>Section {index + 1}</h4>
              <button 
                type="button" 
                onClick={() => removeSection(index)}
                style={{ padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
            <div style={formStyles.grid}>
              <div>
                <label style={formStyles.label}>Icon</label>
                <input 
                  style={formStyles.input}
                  type="text" 
                  value={section.icon} 
                  onChange={(e) => handleSectionChange(index, 'icon', e.target.value)} 
                />
              </div>
              <div>
                <label style={formStyles.label}>Title</label>
                <input 
                  style={formStyles.input}
                  type="text" 
                  value={section.title} 
                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)} 
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={formStyles.label}>Content</label>
                <textarea 
                  style={formStyles.textarea}
                  value={section.content} 
                  onChange={(e) => handleSectionChange(index, 'content', e.target.value)} 
                />
              </div>
            </div>
          </div>
        ))}
        <button 
          type="button" 
          onClick={addSection}
          style={{ padding: '0.8rem 1.5rem', background: 'var(--primary-purple)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Add Section
        </button>
      </fieldset>

      {/* Copyright */}
      <fieldset style={formStyles.fieldset}>
        <legend style={formStyles.legend}>Copyright</legend>
        <div>
          <label style={formStyles.label}>Copyright Text</label>
          <textarea 
            style={formStyles.textarea}
            value={content.copyright} 
            onChange={(e) => handleCopyrightChange(e.target.value)} 
          />
        </div>
      </fieldset>
    </div>
  );
}


export default function ContentManagement() {
  const { user } = useAuth();
  const [homePageContent, setHomePageContent] = useState<FirestoreHomePageContent | null>(null);
  const [aboutUsContent, setAboutUsContent] = useState<FirestoreAboutUsPageContent | null>(null);
  const [contactUsContent, setContactUsContent] = useState<FirestoreContactUsPageContent | null>(null);
  const [academicProgramContent, setAcademicProgramContent] = useState<FirestoreAcademicProgramPageContent | null>(null);
  const [careersContent, setCareersContent] = useState<FirestoreCareersPageContent | null>(null);
  const [admissionsContent, setAdmissionsContent] = useState<FirestoreAdmissionsPageContent | null>(null);
  const [galleryContent, setGalleryContent] = useState<FirestoreGalleryPageContent | null>(null);
  const [footerContent, setFooterContent] = useState<FirestoreFooterContent | null>(null);
  const [activePage, setActivePage] = useState<'home' | 'about' | 'contact' | 'academic' | 'careers' | 'admissions' | 'gallery' | 'footer' | 'media'>('home');
  const [activeLocale, setActiveLocale] = useState<'en-US' | 'ar-SA'>('en-US');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const [homeContent, aboutContent, contactContent, academicContent, careersContent, admissionsContent, galleryContentData, footerContentData] = await Promise.all([
        fetchAllHomePageContent(),
        fetchAllAboutUsPageContent(),
        fetchAllContactUsPageContent(),
        fetchAllAcademicProgramPageContent(),
        fetchAllCareersPageContent(),
        fetchAllAdmissionsPageContent(),
        fetchAllGalleryPageContent(),
        fetchAllFooterContent()
      ]);
      if (homeContent) setHomePageContent(homeContent);
      if (aboutContent) setAboutUsContent(aboutContent);
      if (contactContent) setContactUsContent(contactContent);
      if (academicContent) setAcademicProgramContent(academicContent);
      if (careersContent) setCareersContent(careersContent);
      if (admissionsContent) setAdmissionsContent(admissionsContent);
      if (galleryContentData) setGalleryContent(galleryContentData);
      if (footerContentData) setFooterContent(footerContentData);
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
      } else if (activePage === 'contact') {
        functionName = 'saveContactUsPageContent';
        contentToSave = contactUsContent;
      } else if (activePage === 'academic') {
        functionName = 'saveAcademicProgramPageContent';
        contentToSave = academicProgramContent;
      } else if (activePage === 'careers') {
        functionName = 'saveCareersPageContent';
        contentToSave = careersContent;
      } else if (activePage === 'admissions') {
        functionName = 'saveAdmissionsPageContent';
        contentToSave = admissionsContent;
      } else if (activePage === 'gallery') {
        functionName = 'saveGalleryPageContent';
        contentToSave = galleryContent;
      } else if (activePage === 'footer') {
        functionName = 'saveFooterContent';
        contentToSave = footerContent;
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
        <button onClick={() => setActivePage('contact')} style={{ padding: '1rem', border: 'none', background: activePage === 'contact' ? '#eee' : 'transparent', fontWeight: activePage === 'contact' ? 'bold' : 'normal' }}>Contact Us</button>
        <button onClick={() => setActivePage('academic')} style={{ padding: '1rem', border: 'none', background: activePage === 'academic' ? '#eee' : 'transparent', fontWeight: activePage === 'academic' ? 'bold' : 'normal' }}>Academic Program</button>
        <button onClick={() => setActivePage('careers')} style={{ padding: '1rem', border: 'none', background: activePage === 'careers' ? '#eee' : 'transparent', fontWeight: activePage === 'careers' ? 'bold' : 'normal' }}>Careers</button>
        <button onClick={() => setActivePage('admissions')} style={{ padding: '1rem', border: 'none', background: activePage === 'admissions' ? '#eee' : 'transparent', fontWeight: activePage === 'admissions' ? 'bold' : 'normal' }}>Admissions</button>
        <button onClick={() => setActivePage('gallery')} style={{ padding: '1rem', border: 'none', background: activePage === 'gallery' ? '#eee' : 'transparent', fontWeight: activePage === 'gallery' ? 'bold' : 'normal' }}>Gallery</button>
        <button onClick={() => setActivePage('footer')} style={{ padding: '1rem', border: 'none', background: activePage === 'footer' ? '#eee' : 'transparent', fontWeight: activePage === 'footer' ? 'bold' : 'normal' }}>Footer</button>
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
      {activePage === 'contact' && contactUsContent && (
        <ContactUsForm
          content={contactUsContent[activeLocale]}
          setContent={(newContent) => setContactUsContent({ ...contactUsContent, [activeLocale]: newContent })}
        />
      )}
      {activePage === 'academic' && academicProgramContent && (
        <AcademicProgramForm
          content={academicProgramContent[activeLocale]}
          setContent={(newContent) => setAcademicProgramContent({ ...academicProgramContent, [activeLocale]: newContent })}
        />
      )}
      {activePage === 'careers' && careersContent && (
        <CareersForm
          content={careersContent[activeLocale]}
          setContent={(newContent) => setCareersContent({ ...careersContent, [activeLocale]: newContent })}
        />
      )}
      {activePage === 'admissions' && admissionsContent && (
        <AdmissionsForm
          content={admissionsContent[activeLocale]}
          setContent={(newContent) => setAdmissionsContent({ ...admissionsContent, [activeLocale]: newContent })}
        />
      )}
      {activePage === 'gallery' && galleryContent && (
        <GalleryForm
          content={galleryContent[activeLocale]}
          setContent={(newContent) => setGalleryContent({ ...galleryContent, [activeLocale]: newContent })}
        />
      )}
      {activePage === 'footer' && footerContent && (
        <FooterForm
          content={footerContent[activeLocale]}
          setContent={(newContent) => setFooterContent({ ...footerContent, [activeLocale]: newContent })}
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
