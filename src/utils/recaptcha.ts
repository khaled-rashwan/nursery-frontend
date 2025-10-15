/**
 * reCAPTCHA v3 utility for loading and executing Google reCAPTCHA
 */

// reCAPTCHA v3 Site Key (public key)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc1Y-orAAAAAB-fkrBM-fkrBM-fkrBM-fkrBM';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Load reCAPTCHA v3 script
 */
export const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.grecaptcha) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src*="recaptcha"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script')));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    
    document.head.appendChild(script);
  });
};

/**
 * Execute reCAPTCHA v3 and get token
 * @param action - The action name (e.g., 'submit_admission', 'submit_career', 'submit_contact')
 * @returns Promise that resolves to the reCAPTCHA token
 */
export const executeRecaptcha = async (action: string): Promise<string> => {
  try {
    await loadRecaptchaScript();
    
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
          resolve(token);
        } catch (error) {
          console.error('reCAPTCHA execution failed:', error);
          reject(new Error('Failed to execute reCAPTCHA'));
        }
      });
    });
  } catch (error) {
    console.error('reCAPTCHA loading failed:', error);
    throw new Error('Failed to load reCAPTCHA');
  }
};
