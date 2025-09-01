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
  LocaleSpecificCareersPageContent
} from './types';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Get a reference to the Cloud Functions
const getHomePageContentCallable = httpsCallable(functions, 'getHomePageContent');
const getAboutUsPageContentCallable = httpsCallable(functions, 'getAboutUsPageContent');
const getContactUsPageContentCallable = httpsCallable(functions, 'getContactUsPageContent');
const getAcademicProgramPageContentCallable = httpsCallable(functions, 'getAcademicProgramPageContent');
const getCareersPageContentCallable = httpsCallable(functions, 'getCareersPageContent');

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
 * Fetches the "Careers" page content from the 'getCareersPageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchCareersPageContent(locale: string): Promise<LocaleSpecificCareersPageContent | null> {
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
