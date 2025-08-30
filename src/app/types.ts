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

export interface FirestoreAcademicProgramPageContent {
  'en-US': LocaleSpecificAcademicProgramContent;
  'ar-SA': LocaleSpecificAcademicProgramContent;
}

export interface LocaleSpecificAcademicProgramContent {
  educationalPhilosophy: EducationalPhilosophy;
  programs: AcademicProgram[];
  cta: Cta;
}

export interface EducationalPhilosophy {
  title: string;
  eyfsFramework: string;
  frameworkDescription: string;
  nurturingTheWholeChild: string;
  coreValues: CoreValue[];
}

export interface CoreValue {
  icon: string;
  title: string;
  color: string;
}

export interface AcademicProgram {
  id: string;
  title: string;
  ageRange: string;
  icon: string;
  image: string;
  primaryColor: string;
  lightColor1: string;
  lightColor2: string;
  bgIcon1: string;
  bgIcon2: string;
  overview: string;
  experiences: string[];
}

export interface Cta {
  title: string;
  description: string;
  enrollButton: string;
  contactButton: string;
}
