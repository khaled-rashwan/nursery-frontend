'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchAllHomePageContent, fetchAllAboutUsPageContent, fetchAllContactUsPageContent, fetchAllAcademicProgramPageContent, fetchAllCareersPageContent } from '../../../../fetchContent';
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
  LocaleSpecificCareersContent
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
          <div>
            <label style={formStyles.label}>Full Name Label</label>
            <input style={formStyles.input} type="text" value={content.form_fullName} onChange={(e) => handleChange('form_fullName', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Phone Number Label</label>
            <input style={formStyles.input} type="text" value={content.form_phoneNumber} onChange={(e) => handleChange('form_phoneNumber', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Email Address Label</label>
            <input style={formStyles.input} type="text" value={content.form_emailAddress} onChange={(e) => handleChange('form_emailAddress', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Job Title Label</label>
            <input style={formStyles.input} type="text" value={content.form_jobTitle} onChange={(e) => handleChange('form_jobTitle', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Attach Resume Label</label>
            <input style={formStyles.input} type="text" value={content.form_attachResume} onChange={(e) => handleChange('form_attachResume', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Your Message Label</label>
            <input style={formStyles.input} type="text" value={content.form_yourMessage} onChange={(e) => handleChange('form_yourMessage', e.target.value)} />
          </div>
          <div>
            <label style={formStyles.label}>Submit Button Text</label>
            <input style={formStyles.input} type="text" value={content.form_submitButton} onChange={(e) => handleChange('form_submitButton', e.target.value)} />
          </div>
        </div>
      </fieldset>

      {isModalOpen && (
        <MediaLibraryModal
          onClose={() => setIsModalOpen(false)}
          onSelectMedia={handleImageSelect}
        />
      )}
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
  const [activePage, setActivePage] = useState<'home' | 'about' | 'contact' | 'academic' | 'careers' | 'media'>('home');
  const [activeLocale, setActiveLocale] = useState<'en-US' | 'ar-SA'>('en-US');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const [homeContent, aboutContent, contactContent, academicContent, careersContent] = await Promise.all([
        fetchAllHomePageContent(),
        fetchAllAboutUsPageContent(),
        fetchAllContactUsPageContent(),
        fetchAllAcademicProgramPageContent(),
        fetchAllCareersPageContent()
      ]);
      if (homeContent) setHomePageContent(homeContent);
      if (aboutContent) setAboutUsContent(aboutContent);
      if (contactContent) setContactUsContent(contactContent);
      if (academicContent) setAcademicProgramContent(academicContent);
      if (careersContent) setCareersContent(careersContent);
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
