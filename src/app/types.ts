export interface RepeaterPoint {
  icon: string;
  content: string;
}

export interface RepeaterFeature {
  feature: string;
}

export interface HomePageContent {
  principal_title: string;
  principal_message: string;
  principal_name: string;
  why_future_step_title: string;
  why_future_step_points: RepeaterPoint[];
  philosophy_title: string;
  philosophy_content: string;
  portal_promo_title: string;
  portal_features: RepeaterFeature[];
  program_preview_title: string;
}

export interface HomePageAPIResponse extends HomePageContent {
  translations: (HomePageContent & { languages_code: string })[] | null;
}
