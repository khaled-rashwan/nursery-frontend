import { CareerSubmission } from '../app/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://us-central1-future-step-nursery.cloudfunctions.net'
  : 'http://localhost:5001/future-step-nursery/us-central1';

export interface CareerFormData {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  jobTitle: string;
  message: string;
  resumeUrl?: string;
  recaptchaToken?: string;
}

/**
 * Submit a career application form
 */
export const submitCareerForm = async (formData: CareerFormData): Promise<{ message: string; submissionId: string }> => {
  const response = await fetch(`${API_BASE_URL}/submitCareerForm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit career form');
  }

  return await response.json();
};

/**
 * Get all career submissions (admin only)
 */
export const getCareerSubmissions = async (authToken: string): Promise<CareerSubmission[]> => {
  const response = await fetch(`${API_BASE_URL}/manageCareerSubmissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch career submissions');
  }

  const data = await response.json();
  return data.careerSubmissions;
};

/**
 * Update career submission status (admin only)
 */
export const updateCareerSubmissionStatus = async (
  authToken: string,
  submissionId: string,
  status: CareerSubmission['status']
): Promise<{ id: string; status: string }> => {
  const response = await fetch(`${API_BASE_URL}/manageCareerSubmissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation: 'updateStatus',
      id: submissionId,
      status,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update career submission status');
  }

  return await response.json();
};

/**
 * Delete career submission (admin only)
 */
export const deleteCareerSubmission = async (
  authToken: string,
  submissionId: string
): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/manageCareerSubmissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation: 'delete',
      id: submissionId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete career submission');
  }

  return await response.json();
};