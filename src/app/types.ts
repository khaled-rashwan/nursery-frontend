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
export interface LocaleSpecificCareersContent {
  title: string;
  section1_title: string;
  section1_p1: string;
  section1_p2: string;
  section2_title: string;
  section2_points: string[];
  section2_image: string;
  section3_title: string;
  section3_p1: string;
  section3_positions: string[];
  section4_title: string;
  section4_p1: string;
  section4_p2: string;
  form_fullName: string;
  form_phoneNumber: string;
  form_emailAddress: string;
  form_jobTitle: string;
  form_attachResume: string;
  form_yourMessage: string;
  form_submitButton: string;
}

export interface FirestoreCareersPageContent {
  'en-US': LocaleSpecificCareersContent;
  'ar-SA': LocaleSpecificCareersContent;
}

// Types for the "Admissions" page content
export interface KeyDateItem {
  title: string;
  image: string;
}

export interface KeyDates {
  title: string;
  items: KeyDateItem[];
}

export interface EnrollmentStep {
  title: string;
  description: string;
}

export interface EnrollmentProcess {
  title: string;
  steps: EnrollmentStep[];
}

export interface RequiredDocuments {
  title: string;
  documents: string[];
}

export interface TuitionFees {
  title: string;
  description: string;
}

export interface AdmissionFormFields {
  parentName: string;
  email: string;
  phone: string;
  bestTime: string;
  whatsapp: string;
  preferredLang: string;
  relationship: string;
  message: string;
}

export interface AdmissionForm {
  title: string;
  subtitle1: string;
  subtitle2: string;
  fields: AdmissionFormFields;
  submit: string;
}

export interface AdmissionImages {
  boy: string;
  girl: string;
}

export interface LocaleSpecificAdmissionsContent {
  title: string;
  subtitle: string;
  welcome: string;
  lookForward: string;
  keyDates: KeyDates;
  enrollmentProcess: EnrollmentProcess;
  requiredDocuments: RequiredDocuments;
  tuitionFees: TuitionFees;
  images: AdmissionImages;
  admissionForm: AdmissionForm;
}

export interface FirestoreAdmissionsPageContent {
  'en-US': LocaleSpecificAdmissionsContent;
  'ar-SA': LocaleSpecificAdmissionsContent;
}

// Types for the "Gallery" page content
export interface GalleryImage {
  id: string;
  url: string;
  filename: string;
  description?: string;
  uploadedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface LocaleSpecificGalleryContent {
  title: string;
  subtitle: string;
  heading: string;
  description1: string;
  description2: string;
  imagesTitle: string;
  images: GalleryImage[];
}

export interface FirestoreGalleryPageContent {
  'en-US': LocaleSpecificGalleryContent;
  'ar-SA': LocaleSpecificGalleryContent;
}

// Types for the "Footer" content
export interface FooterSection {
  icon: string;
  title: string;
  content: string;
}

export interface LocaleSpecificFooterContent {
  sections: FooterSection[];
  copyright: string;
}

export interface FirestoreFooterContent {
  'en-US': LocaleSpecificFooterContent;
  'ar-SA': LocaleSpecificFooterContent;
}
