// src/app/fetchHomePageContent.ts

import { unstable_noStore as noStore } from 'next/cache';
import { app } from '../firebase'; // Import the initialized Firebase app
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FirestoreHomePageContent, LocaleSpecificContent } from './types';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Get a reference to the getHomePageContent cloud function
const getHomePageContentCallable = httpsCallable(functions, 'getHomePageContent');

/**
 * Fetches the homepage content from the 'getHomePageContent' Cloud Function.
 *
 * @param locale The desired locale ('en-US' or 'ar-SA').
 * @returns A promise that resolves to the locale-specific content, or null if an error occurs.
 */
export async function fetchHomePageContent(locale: string): Promise<LocaleSpecificContent | null> {
  // Ensure that this fetch is not cached and runs on every request.
  noStore();

  try {
    // Call the cloud function
    const result = await getHomePageContentCallable();

    // The result.data will contain the full document from Firestore.
    // We need to cast it to our defined type to get type safety.
    const fullContent = result.data as FirestoreHomePageContent;

    // Check if the locale is valid and return the corresponding content
    if (locale === 'en-US' || locale === 'ar-SA') {
      return fullContent[locale];
    }

    // Fallback to English if the locale is not supported
    return fullContent['en-US'];

  } catch (error) {
    console.error('[FIREBASE_FUNCTIONS_ERROR] in fetchHomePageContent:', error);
    // In case of an error, return null. The frontend component will handle this state.
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
