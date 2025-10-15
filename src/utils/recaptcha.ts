/**
 * reCAPTCHA Enterprise utility for loading and executing Google reCAPTCHA Enterprise
 * 
 * This uses reCAPTCHA Enterprise which provides enhanced security features and
 * integrates with Google Cloud's reCAPTCHA Enterprise API for backend verification.
 */

// reCAPTCHA Enterprise Site Key - Must be configured via NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SITE_KEY) {
  console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable is not set');
}

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

/**
 * Load reCAPTCHA Enterprise script
 */
export const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if site key is configured
    if (!RECAPTCHA_SITE_KEY) {
      reject(new Error('reCAPTCHA site key not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable.'));
      return;
    }

    // Check if script is already loaded
    if (window.grecaptcha?.enterprise) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src*="recaptcha/enterprise.js"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA Enterprise script')));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA Enterprise script'));
    
    document.head.appendChild(script);
  });
};

/**
 * Execute reCAPTCHA Enterprise and get token
 * @param action - The action name (e.g., 'submit_admission', 'submit_career', 'submit_contact')
 * @returns Promise that resolves to the reCAPTCHA token
 */
export const executeRecaptcha = async (action: string): Promise<string> => {
  try {
    if (!RECAPTCHA_SITE_KEY) {
      throw new Error('reCAPTCHA site key not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable.');
    }

    await loadRecaptchaScript();
    
    return new Promise((resolve, reject) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
          resolve(token);
        } catch (error) {
          console.error('reCAPTCHA Enterprise execution failed:', error);
          reject(new Error('Failed to execute reCAPTCHA Enterprise'));
        }
      });
    });
  } catch (error) {
    console.error('reCAPTCHA Enterprise loading failed:', error);
    throw new Error('Failed to load reCAPTCHA Enterprise');
  }
};
