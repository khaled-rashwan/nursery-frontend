// src/app/types.ts

// Represents a single program in the "Academic Program" section
export interface Program {
  title: string;
  age: string;
  description: string;
}

// Represents a single feature in the "Features" section
export interface Feature {
  icon: string;
  title: string;
  description: string;
}

// Represents a single additional feature in the CTA section
export interface AdditionalFeature {
  icon: string;
  title: string;
  desc: string;
}

// This interface defines the structure of the content for a single locale (e.g., 'en-US' or 'ar-SA')
export interface LocaleSpecificContent {
  hero: {
    welcome: string;
    title: string;
    subtitle: string;
    description: string;
    enrollButton: string;
    learnMoreButton: string;
    heroImageUrl: string;
  };
  principalMessage: {
    title: string;
    message: string;
    specialMessageTag: string;
  };
  academicProgram: {
    title: string;
    subtitle: string;
    programs: Program[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
  };
  features: {
    title: string;
    subtitle: string;
    featureList: Feature[];
  };
  cta: {
    title: string;
    subtitle: string;
    contactButton: string;
    portalButton: string;
    startNowBadge: string;
    additionalFeatures: AdditionalFeature[];
  };
}

// This is the main type for the entire 'homePage' document in Firestore.
// It contains the content for both English and Arabic locales.
export interface FirestoreHomePageContent {
  'en-US': LocaleSpecificContent;
  'ar-SA': LocaleSpecificContent;
}

// Types for the "About Us" page content
export interface AboutUsSection {
  title: string;
  text: string;
  imageUrl?: string;
}

export interface LocaleSpecificAboutUsContent {
  vision: AboutUsSection;
  mission: AboutUsSection;
  principal: AboutUsSection;
  history: AboutUsSection;
}

export interface FirestoreAboutUsPageContent {
  'en-US': LocaleSpecificAboutUsContent;
  'ar-SA': LocaleSpecificAboutUsContent;
}

// Types for the "Contact Us" page content
export interface Faq {
  q: string;
  a: string;
}

export interface LocaleSpecificContactUsContent {
  title: string;
  section1_title: string;
  phone: string;
  address: string;
  workingHours: string;
  email: string;
  section2_title: string;
  section2_subtitle: string;
  section2_text: string;
  form_fullName: string;
  form_phoneNumber: string;
  form_yourMessage: string;
  form_submitButton: string;
  section3_title: string;
  faqs: Faq[];
}

export interface FirestoreContactUsPageContent {
  'en-US': LocaleSpecificContactUsContent;
  'ar-SA': LocaleSpecificContactUsContent;
}

// Types for the "Academic Program" page content
export interface CoreValue {
  icon: string;
  title: string;
}

export interface EducationalPhilosophy {
  title:string;
  framework: string;
  frameworkDescription: string;
  philosophy: string;
  coreValues: CoreValue[];
}

export interface Program {
  id: string;
  title: string;
  ageRange: string;
  icon: string;
  image: string;
  overview: string;
  experiencesTitle: string;
  experiences: string[];
}

export interface Cta {
  title: string;
  subtitle: string;
  enrollButton: string;
  contactButton: string;
}

export interface LocaleSpecificAcademicProgramContent {
  educationalPhilosophy: EducationalPhilosophy;
  programs: Program[];
  cta: Cta;
}

export interface FirestoreAcademicProgramPageContent {
  'en-US': LocaleSpecificAcademicProgramContent;
  'ar-SA': LocaleSpecificAcademicProgramContent;
}

// Types for the "Careers" page content
export interface CareersSection {
  title: string;
  body: string;
  image?: string;
}

export interface LocaleSpecificCareersContent {
  section1: CareersSection;
  section2: CareersSection;
}

export interface FirestoreCareersPageContent {
  'en-US': LocaleSpecificCareersContent;
  'ar-SA': LocaleSpecificCareersContent;
}
