import { createDirectus, rest, readItem } from '@directus/sdk';
import { unstable_noStore as noStore } from 'next/cache';
import { HomePageAPIResponse, HomePageContent } from "../app/types";

const directusUrl: string = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "";
if (!directusUrl) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set in environment variables.");
}
const directus = createDirectus(directusUrl).with(rest());

function logDirectusError(error: any, context: string) {
  console.error(`[DIRECTUS_ERROR] in ${context}:`);
  if (error.errors) {
    console.error(JSON.stringify(error.errors, null, 2));
  } else {
    console.error(error);
  }
}

export async function fetchHomePageContent(locale: string): Promise<HomePageContent | null> {
  noStore();
  try {
    const apiData = await directus.request<HomePageAPIResponse>(
      readItem('home_page', 1, { fields: ['*', { translations: ['*'] }] })
    );
    if (!apiData) return null;
    const arabicTranslation = apiData.translations?.find(t => t.languages_code === 'ar-SA');
    const source = (locale === 'ar-SA' && arabicTranslation) ? arabicTranslation : apiData;
    return {
      principal_title: source.principal_title,
      principal_message: source.principal_message,
      principal_name: source.principal_name,
      why_future_step_title: source.why_future_step_title,
      why_future_step_points: source.why_future_step_points || [],
      philosophy_title: source.philosophy_title,
      philosophy_content: source.philosophy_content,
      portal_promo_title: source.portal_promo_title,
      portal_features: source.portal_features || [],
      program_preview_title: source.program_preview_title,
    };
  } catch (error) {
    logDirectusError(error, 'fetchHomePageContent');
    return null;
  }
}
