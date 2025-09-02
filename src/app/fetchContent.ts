// src/app/fetchContent.ts

import { unstable_noStore as noStore } from 'next/cache';
import { app } from '../firebase'; // Import the initialized Firebase app
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  FirestoreHomePageContent,
  LocaleSpecificContent,
  FirestoreAboutUsPageContent,
  LocaleSpecificAboutUsContent,
  FirestoreContactUsPageContent,
  LocaleSpecificContactUsContent,
  FirestoreAcademicProgramPageContent,
  LocaleSpecificAcademicProgramContent,
  FirestoreCareersPageContent,
  LocaleSpecificCareersContent,
  FirestoreAdmissionsPageContent,
  LocaleSpecificAdmissionsContent,
  FirestoreGalleryPageContent,
  LocaleSpecificGalleryContent,
  FirestoreFooterContent,
  LocaleSpecificFooterContent
} from './types';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Get a reference to the Cloud Functions
const getHomePageContentCallable = httpsCallable(functions, 'getHomePageContent');
const getAboutUsPageContentCallable = httpsCallable(functions, 'getAboutUsPageContent');
const getContactUsPageContentCallable = httpsCallable(functions, 'getContactUsPageContent');
const getAcademicProgramPageContentCallable = httpsCallable(functions, 'getAcademicProgramPageContent');
const getCareersPageContentCallable = httpsCallable(functions, 'getCareersPageContent');
const getAdmissionsPageContentCallable = httpsCallable(functions, 'getAdmissionsPageContent');
const getGalleryPageContentCallable = httpsCallable(functions, 'getGalleryPageContent');
const getFooterContentCallable = httpsCallable(functions, 'getFooterContent');

/**
 * Fetches the homepage content from the 'getHomePageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchHomePageContent(locale: string): Promise<LocaleSpecificContent | null> {
  noStore();
  try {
    const result = await getHomePageContentCallable();
    const fullContent = result.data as FirestoreHomePageContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchHomePageContent:', error);
    return null;
  }
}

/**
 * Fetches the "Academic Program" page content from the 'getAcademicProgramPageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchAcademicProgramPageContent(locale: string): Promise<LocaleSpecificAcademicProgramContent | null> {
  noStore();
  try {
    const result = await getAcademicProgramPageContentCallable();
    const fullContent = result.data as FirestoreAcademicProgramPageContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAcademicProgramPageContent:', error);
    return null;
  }
}

/**
 * Fetches the entire "Academic Program" page content object (both locales) from the 'getAcademicProgramPageContent' Cloud Function.
 *
 * @returns A promise that resolves to the full content object, or null if an error occurs.
 */
export async function fetchAllAcademicProgramPageContent(): Promise<FirestoreAcademicProgramPageContent | null> {
  noStore();
  try {
    const result = await getAcademicProgramPageContentCallable();
    return result.data as FirestoreAcademicProgramPageContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllAcademicProgramPageContent:', error);
    return null;
  }
}

/**
 * Fetches the "Contact Us" page content from the 'getContactUsPageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchContactUsPageContent(locale: string): Promise<LocaleSpecificContactUsContent | null> {
  noStore();
  try {
    const result = await getContactUsPageContentCallable();
    const fullContent = result.data as FirestoreContactUsPageContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchContactUsPageContent:', error);
    return null;
  }
}

/**
 * Fetches the entire "Contact Us" page content object (both locales) from the 'getContactUsPageContent' Cloud Function.
 *
 * @returns A promise that resolves to the full content object, or null if an error occurs.
 */
export async function fetchAllContactUsPageContent(): Promise<FirestoreContactUsPageContent | null> {
  noStore();
  try {
    const result = await getContactUsPageContentCallable();
    return result.data as FirestoreContactUsPageContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllContactUsPageContent:', error);
    return null;
  }
}

export async function fetchAllAboutUsPageContent(): Promise<FirestoreAboutUsPageContent | null> {
  noStore();
  try {
    const result = await getAboutUsPageContentCallable();
    return result.data as FirestoreAboutUsPageContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllAboutUsPageContent:', error);
    return null;
  }
}

/**
 * Fetches the "About Us" page content from the 'getAboutUsPageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchAboutUsPageContent(locale: string): Promise<LocaleSpecificAboutUsContent | null> {
  noStore();
  try {
    const result = await getAboutUsPageContentCallable();
    const fullContent = result.data as FirestoreAboutUsPageContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAboutUsPageContent:', error);
    return null;
  }
}

/**
 * Fetches the entire homepage content object (both locales) from the 'getHomePageContent' Cloud Function.
 *
 * @returns A promise that resolves to the full content object, or null if an error occurs.
 */
export async function fetchAllHomePageContent(): Promise<FirestoreHomePageContent | null> {
  noStore();
  try {
    const result = await getHomePageContentCallable();
    return result.data as FirestoreHomePageContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllHomePageContent:', error);
    return null;
  }
}

/**
 * Fetches the "Careers" page content from the 'getCareersPageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchCareersPageContent(locale: string): Promise<LocaleSpecificCareersContent | null> {
  noStore();
  try {
    const result = await getCareersPageContentCallable();
    const fullContent = result.data as FirestoreCareersPageContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchCareersPageContent:', error);
    return null;
  }
}

/**
 * Fetches the entire "Careers" page content object (both locales) from the 'getCareersPageContent' Cloud Function.
 *
 * @returns A promise that resolves to the full content object, or null if an error occurs.
 */
export async function fetchAllCareersPageContent(): Promise<FirestoreCareersPageContent | null> {
  noStore();
  try {
    const result = await getCareersPageContentCallable();
    return result.data as FirestoreCareersPageContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllCareersPageContent:', error);
    return null;
  }
}

/**
 * Fetches the "Admissions" page content from the 'getAdmissionsPageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchAdmissionsPageContent(locale: string): Promise<LocaleSpecificAdmissionsContent | null> {
  noStore();
  try {
    const result = await getAdmissionsPageContentCallable();
    const fullContent = result.data as FirestoreAdmissionsPageContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAdmissionsPageContent:', error);
    return null;
  }
}

/**
 * Fetches the entire "Admissions" page content object (both locales) from the 'getAdmissionsPageContent' Cloud Function.
 *
 * @returns A promise that resolves to the full content object, or null if an error occurs.
 */
export async function fetchAllAdmissionsPageContent(): Promise<FirestoreAdmissionsPageContent | null> {
  noStore();
  try {
    const result = await getAdmissionsPageContentCallable();
    return result.data as FirestoreAdmissionsPageContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllAdmissionsPageContent:', error);
    return null;
  }
}

/**
 * Fetches the gallery page content from the 'getGalleryPageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchGalleryPageContent(locale: string): Promise<LocaleSpecificGalleryContent | null> {
  noStore();
  try {
    const result = await getGalleryPageContentCallable();
    const fullContent = result.data as FirestoreGalleryPageContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchGalleryPageContent:', error);
    return null;
  }
}

/**
 * Fetches the complete gallery page content from the 'getGalleryPageContent' Cloud Function.
 *
 * @returns A promise that resolves to the complete content object, or null if an error occurs.
 */
export async function fetchAllGalleryPageContent(): Promise<FirestoreGalleryPageContent | null> {
  noStore();
  try {
    const result = await getGalleryPageContentCallable();
    return result.data as FirestoreGalleryPageContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllGalleryPageContent:', error);
    return null;
  }
}

/**
 * Fetches the footer content from the 'getFooterContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchFooterContent(locale: string): Promise<LocaleSpecificFooterContent | null> {
  noStore();
  try {
    const result = await getFooterContentCallable();
    const fullContent = result.data as FirestoreFooterContent;
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }
    return fullContent['en-US'];
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchFooterContent:', error);
    return null;
  }
}

/**
 * Fetches all footer content from the 'getFooterContent' Cloud Function.
 */
export async function fetchAllFooterContent(): Promise<FirestoreFooterContent | null> {
  noStore();
  try {
    const result = await getFooterContentCallable();
    return result.data as FirestoreFooterContent;
  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchAllFooterContent:', error);
    return null;
  }
}
