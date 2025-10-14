import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface UseRecaptchaFormOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

interface UseRecaptchaFormReturn {
  recaptchaRef: React.RefObject<ReCAPTCHA | null>;
  isSubmitting: boolean;
  formError: string | null;
  formSuccess: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitForm: (formData: any, formType: 'admission' | 'career' | 'contact') => Promise<void>;
  resetForm: () => void;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://us-central1-future-step-nursery.cloudfunctions.net'
  : 'http://localhost:5001/future-step-nursery/us-central1';

export const useRecaptchaForm = (options?: UseRecaptchaFormOptions): UseRecaptchaFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitForm = async (formData: any, formType: 'admission' | 'career' | 'contact') => {
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // Get the reCAPTCHA token
      const recaptchaToken = recaptchaRef.current?.getValue();
      
      if (!recaptchaToken) {
        throw new Error('Please complete the reCAPTCHA verification');
      }

      // Call the unified backend function
      const response = await fetch(`${API_BASE_URL}/submitPublicForm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          recaptchaToken,
          formType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      const successMessage = result.message || 'Form submitted successfully!';
      setFormSuccess(successMessage);
      
      if (options?.onSuccess) {
        options.onSuccess(successMessage);
      }

      // Reset reCAPTCHA
      recaptchaRef.current?.reset();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormError(errorMessage);
      
      if (options?.onError) {
        options.onError(errorMessage);
      }

      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormError(null);
    setFormSuccess(null);
    recaptchaRef.current?.reset();
  };

  return {
    recaptchaRef,
    isSubmitting,
    formError,
    formSuccess,
    submitForm,
    resetForm,
  };
};
