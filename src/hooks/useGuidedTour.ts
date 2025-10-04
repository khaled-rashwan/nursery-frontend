import { useEffect, useCallback, useRef } from 'react';
import introJs from 'intro.js';

interface GuidedTourOptions {
  tourKey: string;
  locale: string;
  steps: Array<{
    element?: string;
    intro: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }>;
  onComplete?: () => void;
}

export const useGuidedTour = ({
  tourKey,
  locale,
  steps,
  onComplete
}: GuidedTourOptions) => {
  const introInstanceRef = useRef<ReturnType<typeof introJs> | null>(null);
  const isArabic = locale === 'ar-SA';

  const startTour = useCallback(() => {
    if (introInstanceRef.current) {
      introInstanceRef.current.exit(true);
    }

    const intro = introJs();
    introInstanceRef.current = intro;

    // Add RTL class to tooltip container for Arabic
    if (isArabic) {
      intro.onafterchange(function() {
        const tooltips = document.querySelectorAll('.introjs-tooltip');
        tooltips.forEach(tooltip => {
          tooltip.classList.add('introjs-rtl');
        });
      });
    }

    intro.setOptions({
      steps,
      nextLabel: isArabic ? 'التالي' : 'Next',
      prevLabel: isArabic ? 'السابق' : 'Previous',
      skipLabel: isArabic ? 'تخطي' : 'Skip',
      doneLabel: isArabic ? 'إنهاء' : 'Done',
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      scrollToElement: true,
      scrollPadding: 30,
      disableInteraction: false,
      overlayOpacity: 0.8,
    });

    // Handle completion
    intro.oncomplete(() => {
      localStorage.setItem(tourKey, 'completed');
      if (onComplete) {
        onComplete();
      }
    });

    // Handle exit without completion
    intro.onexit(() => {
      localStorage.setItem(tourKey, 'skipped');
    });

    intro.start();
  }, [steps, isArabic, tourKey, onComplete]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(tourKey);
    startTour();
  }, [tourKey, startTour]);

  useEffect(() => {
    // Check if tour has been shown before
    const tourCompleted = localStorage.getItem(tourKey);
    
    if (!tourCompleted) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => {
        startTour();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [tourKey, startTour]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (introInstanceRef.current) {
        introInstanceRef.current.exit(true);
      }
    };
  }, []);

  return {
    startTour,
    resetTour
  };
};
