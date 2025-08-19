"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ClassInfo } from '../types';
import type { User } from 'firebase/auth';
import type { HomeworkSubmission } from '../../parent-portal/services/api';

// Homework Types
export interface HomeworkItem {
  id: string;
  classId: string;
  subjectId: string;
  teacherUID: string;
  title: string;
  description: string;
  dueDate: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  teacherInfo: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
  };
}

interface CreateHomeworkData {
  classId: string;
  subjectId: string;
  teacherUID: string;
  title: string;
  description: string;
  dueDate: string;
  attachments: string[];
}

// API Functions
const API_BASE_URL = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net`;

const makeHomeworkAPICall = async (
  endpoint: string,
  user: User,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    queryParams?: Record<string, string>;
  } = {}
) => {
  const { method = 'GET', body, queryParams } = options;
  
  try {
    const token = await user.getIdToken();
    if (!token) throw new Error('No authentication token');

    let url = `${API_BASE_URL}/${endpoint}`;
    
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to:`, url);
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `HTTP ${response.status}: Request failed`);
      } catch (parseError) {
        // If we can't parse the error, throw a generic message with status
        throw new Error(`HTTP ${response.status}: ${errorText || 'Request failed'}`);
      }
    }

    const result = await response.json();
    console.log(`API Response from ${endpoint}:`, result);
    return result;
  } catch (networkError) {
    console.error('Network or parsing error:', networkError);
    throw networkError;
  }
};

const homeworkAPI = {
  create: async (user: User, homeworkData: CreateHomeworkData) => {
    return makeHomeworkAPICall('createHomework', user, {
      method: 'POST',
      body: { homeworkData }
    });
  },

  getById: async (user: User, homeworkId: string) => {
    return makeHomeworkAPICall('getHomework', user, {
      queryParams: { homeworkId }
    });
  },

  listByClass: async (user: User, classId: string) => {
    return makeHomeworkAPICall('listHomeworkByClass', user, {
      queryParams: { classId }
    });
  },

  update: async (user: User, homeworkId: string, homeworkData: CreateHomeworkData) => {
    return makeHomeworkAPICall('updateHomework', user, {
      method: 'PUT',
      body: { homeworkId, homeworkData }
    });
  },

  delete: async (user: User, homeworkId: string) => {
    return makeHomeworkAPICall('deleteHomework', user, {
      method: 'DELETE',
      queryParams: { homeworkId }
    });
  }
};

// Available subjects for each class level
const getSubjectsForLevel = (level: string): { id: string; name: string; nameAr: string }[] => {
  const subjects = {
    'Pre-KG': [
      { id: 'basic-skills', name: 'Basic Skills', nameAr: 'المهارات الأساسية' },
      { id: 'play-time', name: 'Play Time', nameAr: 'وقت اللعب' },
      { id: 'art-craft', name: 'Art & Craft', nameAr: 'الفنون والحرف' }
    ],
    'KG1': [
      { id: 'arabic', name: 'Arabic', nameAr: 'العربية' },
      { id: 'english', name: 'English', nameAr: 'الإنجليزية' },
      { id: 'math', name: 'Mathematics', nameAr: 'الرياضيات' },
      { id: 'science', name: 'Science', nameAr: 'العلوم' },
      { id: 'art', name: 'Art', nameAr: 'الفنون' }
    ],
    'KG2': [
      { id: 'arabic', name: 'Arabic', nameAr: 'العربية' },
      { id: 'english', name: 'English', nameAr: 'الإنجليزية' },
      { id: 'math', name: 'Mathematics', nameAr: 'الرياضيات' },
      { id: 'science', name: 'Science', nameAr: 'العلوم' },
      { id: 'social-studies', name: 'Social Studies', nameAr: 'الدراسات الاجتماعية' },
      { id: 'art', name: 'Art', nameAr: 'الفنون' }
    ]
  };
  
  return subjects[level as keyof typeof subjects] || [];
};

// Extend HomeworkSubmission for teacher fields
interface TeacherHomeworkSubmission extends HomeworkSubmission {
  teacherComment?: string;
  grade?: string;
}

export default function HomeworkManagement({ 
  locale, 
  selectedClass, 
  classes, 
  user 
}: { 
  locale: string; 
  selectedClass: string; 
  classes: ClassInfo[]; 
  user: User | null; 
}) {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null);
  const [saving, setSaving] = useState(false);
  // Debug state for development
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Modal state for reviewing submissions
  const [reviewHomework, setReviewHomework] = useState<HomeworkItem | null>(null);
  const [submissions, setSubmissions] = useState<TeacherHomeworkSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [submissionEdits, setSubmissionEdits] = useState<Record<string, { comment: string; grade: string }>>({});
  const [submissionSaving, setSubmissionSaving] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    attachments: ['']
  });

  // Helper: fetch submissions for a homework (teacher)
  async function fetchHomeworkSubmissions(user: User, homeworkId: string): Promise<TeacherHomeworkSubmission[]> {
    const token = await user.getIdToken();
    const url = new URL(`https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/listHomeworkSubmissions`);
    url.searchParams.set('homeworkId', homeworkId);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch submissions');
    const data = await res.json();
    return data.submissions || [];
  }

  // Helper: update submission (comment/grade)
  async function updateHomeworkSubmission(user: User, homeworkId: string, studentId: string, comment?: string, grade?: string) {
    const token = await user.getIdToken();
    const res = await fetch(`https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/updateHomeworkSubmission`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ homeworkId, studentId, comment, grade })
    });
    if (!res.ok) throw new Error('Failed to update submission');
    return res.json();
  }

  // Open review modal and fetch submissions
  const handleReviewClick = async (hw: HomeworkItem) => {
    setReviewHomework(hw);
    setSubmissions([]);
    setSubmissionsError(null);
    setSubmissionsLoading(true);
    try {
      if (user) {
        const subs = await fetchHomeworkSubmissions(user, hw.id);
        setSubmissions(subs);
        // Initialize edits state
        const edits: Record<string, { comment: string; grade: string }> = {};
        subs.forEach(s => {
          edits[s.studentId] = { comment: s.teacherComment || '', grade: s.grade || '' };
        });
        setSubmissionEdits(edits);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setSubmissionsError(e.message || 'Failed to load submissions');
      } else {
        setSubmissionsError('An unknown error occurred while loading submissions');
      }
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Save comment/grade for a submission
  const handleSubmissionSave = async (studentId: string) => {
    if (!user || !reviewHomework) return;
    setSubmissionSaving(prev => ({ ...prev, [studentId]: true }));
    setSubmissionsError(null);
    try {
      const { comment, grade } = submissionEdits[studentId] || {};
      await updateHomeworkSubmission(user, reviewHomework.id, studentId, comment, grade);
      // Optionally, reload submissions
      const subs = await fetchHomeworkSubmissions(user, reviewHomework.id);
      setSubmissions(subs);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setSubmissionsError(e.message || 'Failed to update submission');
      } else {
        setSubmissionsError('An unknown error occurred while updating submission');
      }
    } finally {
      setSubmissionSaving(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const selectedClassInfo = classes.find((c) => c.id === selectedClass);
  const availableSubjects = selectedClassInfo ? getSubjectsForLevel(selectedClassInfo.level) : [];

  const loadHomework = useCallback(async () => {
    if (!selectedClass || !user) return;

    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const response = await homeworkAPI.listByClass(user, selectedClass);
      setHomework(response.homework || []);
      setDebugInfo(null); // Clear debug info on success
    } catch (err) {
      console.error('Error loading homework:', err);
      
      // Handle specific error cases
      const errorMessage = err instanceof Error ? err.message : 'Failed to load homework';
      
      if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
        // This likely means the homework collection doesn't exist yet or there's a backend issue
        console.warn('Homework collection may not exist yet for this class');
        setHomework([]); // Show empty state instead of error
        setError(null); // Don't show error to user for this case
        setDebugInfo(process.env.NODE_ENV === 'development' 
          ? `Backend 500 error - homework collection may not exist yet for class ${selectedClass}` 
          : null
        );
      } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
        setError(locale === 'ar-SA' ? 'ليس لديك صلاحية للوصول إلى واجبات هذا الصف' : 'You don\'t have permission to access homework for this class');
        setHomework([]);
      } else if (errorMessage.includes('404')) {
        setError(locale === 'ar-SA' ? 'الصف المحدد غير موجود' : 'The selected class was not found');
        setHomework([]);
      } else {
        // Show a user-friendly error message
        setError(locale === 'ar-SA' ? 'حدث خطأ أثناء تحميل الواجبات. يرجى المحاولة مرة أخرى.' : 'An error occurred while loading homework. Please try again.');
        setHomework([]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedClass, user, locale]);

  // Load homework when class changes
  useEffect(() => {
    if (selectedClass && user) {
      loadHomework();
    } else {
      setHomework([]);
    }
  }, [selectedClass, user, loadHomework]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subjectId: '',
      dueDate: '',
      attachments: ['']
    });
    setEditingHomework(null);
    setShowCreateForm(false);
  };

  const handleCreateClick = () => {
    resetForm();
    setShowCreateForm(true);
  };

  const handleEditClick = (homeworkItem: HomeworkItem) => {
    setFormData({
      title: homeworkItem.title,
      description: homeworkItem.description,
      subjectId: homeworkItem.subjectId,
      dueDate: homeworkItem.dueDate.split('T')[0], // Format for date input
      attachments: homeworkItem.attachments.length > 0 ? homeworkItem.attachments : ['']
    });
    setEditingHomework(homeworkItem);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClassInfo) return;

    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.subjectId || !formData.dueDate) {
      setError(locale === 'ar-SA' ? 'جميع الحقول مطلوبة' : 'All fields are required');
      return;
    }

    const dueDate = new Date(formData.dueDate);
    const now = new Date();
    if (dueDate <= now) {
      setError(locale === 'ar-SA' ? 'تاريخ التسليم يجب أن يكون في المستقبل' : 'Due date must be in the future');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const homeworkData: CreateHomeworkData = {
        classId: selectedClass,
        subjectId: formData.subjectId,
        teacherUID: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
        attachments: formData.attachments.filter(url => url.trim() !== '')
      };

      if (editingHomework) {
        await homeworkAPI.update(user, editingHomework.id, homeworkData);
      } else {
        await homeworkAPI.create(user, homeworkData);
      }

      resetForm();
      await loadHomework();
      
      // Success message
      const message = editingHomework 
        ? (locale === 'ar-SA' ? 'تم تحديث الواجب بنجاح!' : 'Homework updated successfully!')
        : (locale === 'ar-SA' ? 'تم إنشاء الواجب بنجاح!' : 'Homework created successfully!');
      
      // You could implement a toast notification here instead of alert
      alert(message);
      
    } catch (err) {
      console.error('Error saving homework:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save homework';
      
      // Provide more specific error messages
      if (errorMessage.includes('403') || errorMessage.includes('permission')) {
        setError(locale === 'ar-SA' ? 'ليس لديك صلاحية لإنشاء واجبات لهذا الصف' : 'You don\'t have permission to create homework for this class');
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        setError(locale === 'ar-SA' ? 'يرجى التحقق من صحة البيانات المدخلة' : 'Please check that all required fields are filled correctly');
      } else if (errorMessage.includes('500')) {
        setError(locale === 'ar-SA' ? 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً' : 'Server error occurred. Please try again later');
      } else {
        setError(locale === 'ar-SA' ? 'حدث خطأ أثناء حفظ الواجب. يرجى المحاولة مرة أخرى.' : 'An error occurred while saving homework. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (homeworkItem: HomeworkItem) => {
    if (!user) return;

    const confirmMessage = locale === 'ar-SA' 
      ? `هل أنت متأكد من حذف الواجب "${homeworkItem.title}"؟`
      : `Are you sure you want to delete homework "${homeworkItem.title}"?`;
    
    if (!confirm(confirmMessage)) return;

    setSaving(true);
    setError(null);

    try {
      await homeworkAPI.delete(user, homeworkItem.id);
      await loadHomework();
      
      const message = locale === 'ar-SA' ? 'تم حذف الواجب بنجاح!' : 'Homework deleted successfully!';
      alert(message);
      
    } catch (err) {
      console.error('Error deleting homework:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete homework');
    } finally {
      setSaving(false);
    }
  };

  const addAttachmentField = () => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, '']
    }));
  };

  const removeAttachmentField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const updateAttachment = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map((att, i) => i === index ? value : att)
    }));
  };

  type DateInput =
    | string
    | { toDate: () => Date }
    | { seconds: number; nanoseconds: number };

  const formatDate = (dateValue: DateInput) => {
    let date: Date | null = null;
    if (!dateValue) return '';
    if (typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else if (typeof dateValue === 'object' && 'seconds' in dateValue) {
      date = new Date((dateValue as { seconds: number }).seconds * 1000);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return '';
    }
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSubjectName = (subjectId: string) => {
    const subject = availableSubjects.find(s => s.id === subjectId);
    return subject ? (locale === 'ar-SA' ? subject.nameAr : subject.name) : subjectId;
  };

  // Helper to get student name from studentId
  const getStudentName = (studentId: string) => {
    const student = selectedClassInfo?.students?.find(s => s.id === studentId);
    return student ? (locale === 'ar-SA' ? student.name : student.nameEn) : studentId;
  };

  if (!selectedClassInfo) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        margin: '2rem 0',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
        <h3 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--primary-blue-dark)',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {locale === 'ar-SA' ? 'إدارة الواجبات المنزلية' : 'Homework Management'}
        </h3>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          {locale === 'ar-SA' ? 'اختر صفًا لعرض وإدارة الواجبات المنزلية' : 'Select a class to view and manage homework'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      margin: '2rem 0',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '2rem', 
            color: 'var(--primary-blue-dark)',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📚 {locale === 'ar-SA' ? 'إدارة الواجبات المنزلية' : 'Homework Management'}
          </h3>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {locale === 'ar-SA' ? `صف: ${selectedClassInfo.name}` : `Class: ${selectedClassInfo.name}`}
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '15px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
        >
          ➕ {locale === 'ar-SA' ? 'إضافة واجب جديد' : 'Add New Homework'}
        </button>
      </div>

      {/* Debug Info (Development Only) */}
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#856404',
          fontSize: '0.9rem'
        }}>
          <strong>Debug Info:</strong> {debugInfo}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#c33',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span>{error}</span>
          <button
            onClick={() => {
              setError(null);
              loadHomework();
            }}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {locale === 'ar-SA' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div style={{
          background: '#f8f9fa',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '2px solid var(--light-blue)'
        }}>
          <h4 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--primary-blue-dark)',
            marginBottom: '1.5rem'
          }}>
            {editingHomework 
              ? (locale === 'ar-SA' ? 'تعديل الواجب' : 'Edit Homework')
              : (locale === 'ar-SA' ? 'إضافة واجب جديد' : 'Add New Homework')
            }
          </h4>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: 'var(--primary-blue-dark)'
                }}>
                  {locale === 'ar-SA' ? 'عنوان الواجب *' : 'Homework Title *'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={locale === 'ar-SA' ? 'أدخل عنوان الواجب' : 'Enter homework title'}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: 'var(--primary-blue-dark)'
                }}>
                  {locale === 'ar-SA' ? 'المادة *' : 'Subject *'}
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  required
                >
                  <option value="">
                    {locale === 'ar-SA' ? 'اختر المادة' : 'Select Subject'}
                  </option>
                  {availableSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {locale === 'ar-SA' ? subject.nameAr : subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: 'var(--primary-blue-dark)'
                }}>
                  {locale === 'ar-SA' ? 'تاريخ التسليم *' : 'Due Date *'}
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: 'var(--primary-blue-dark)'
              }}>
                {locale === 'ar-SA' ? 'وصف الواجب *' : 'Homework Description *'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={locale === 'ar-SA' ? 'أدخل تفاصيل الواجب والتعليمات' : 'Enter homework details and instructions'}
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  resize: 'vertical',
                  transition: 'all 0.3s ease'
                }}
                required
              />
            </div>

            {/* Attachments */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: 'var(--primary-blue-dark)'
              }}>
                {locale === 'ar-SA' ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}
              </label>
              
              {formData.attachments.map((attachment, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  alignItems: 'center'
                }}>
                  <input
                    type="url"
                    value={attachment}
                    onChange={(e) => updateAttachment(index, e.target.value)}
                    placeholder={locale === 'ar-SA' ? 'رابط المرفق (http://...)' : 'Attachment URL (http://...)'}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0',
                      fontSize: '1rem'
                    }}
                  />
                  
                  {formData.attachments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttachmentField(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              
              {formData.attachments.length < 10 && (
                <button
                  type="button"
                  onClick={addAttachmentField}
                  style={{
                    background: 'var(--light-blue)',
                    color: 'var(--primary-blue-dark)',
                    border: '2px solid var(--primary-blue)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginTop: '0.5rem'
                  }}
                >
                  ➕ {locale === 'ar-SA' ? 'إضافة مرفق' : 'Add Attachment'}
                </button>
              )}
            </div>

            {/* Form Actions */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving 
                    ? '#6c757d' 
                    : 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {saving ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                    {locale === 'ar-SA' ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    💾 {editingHomework 
                      ? (locale === 'ar-SA' ? 'تحديث الواجب' : 'Update Homework')
                      : (locale === 'ar-SA' ? 'إنشاء الواجب' : 'Create Homework')
                    }
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homework List */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--primary-blue-dark)'
        }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.1rem' }}>
            {locale === 'ar-SA' ? 'جاري تحميل الواجبات...' : 'Loading homework...'}
          </p>
        </div>
      ) : homework.length === 0 && !error ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {locale === 'ar-SA' ? 'لا توجد واجبات منزلية' : 'No Homework Available'}
          </h4>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            {locale === 'ar-SA' 
              ? 'لم يتم إنشاء أي واجبات منزلية لهذا الصف بعد.'
              : 'No homework has been created for this class yet.'
            }
          </p>
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem' }}>
            {locale === 'ar-SA' 
              ? 'ابدأ بإضافة واجب جديد باستخدام الزر أعلاه.'
              : 'Start by adding a new homework using the button above.'
            }
          </p>
          
          {/* Add a test create button */}
          <button
            onClick={handleCreateClick}
            style={{
              background: 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '15px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            ➕ {locale === 'ar-SA' ? 'إنشاء أول واجب منزلي' : 'Create First Homework'}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {homework.map((homeworkItem) => (
            <div
              key={homeworkItem.id}
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                border: '2px solid var(--light-blue)',
                borderRadius: '15px',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              {/* Homework Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h5 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue-dark)',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3
                  }}>
                    {homeworkItem.title}
                  </h5>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      background: 'var(--primary-green)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {getSubjectName(homeworkItem.subjectId)}
                    </span>
                    
                    <span style={{
                      color: '#666',
                      fontSize: '0.9rem'
                    }}>
                      📅 {formatDate(homeworkItem.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginLeft: '1rem'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(homeworkItem);
                    }}
                    disabled={saving}
                    style={{
                      background: 'var(--primary-blue)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      fontSize: '0.9rem'
                    }}
                    title={locale === 'ar-SA' ? 'تعديل' : 'Edit'}
                  >
                    ✏️
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(homeworkItem);
                    }}
                    disabled={saving}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      fontSize: '0.9rem'
                    }}
                    title={locale === 'ar-SA' ? 'حذف' : 'Delete'}
                  >
                    🗑️
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewClick(homeworkItem);
                    }}
                    disabled={saving}
                    style={{
                      background: 'var(--light-blue)',
                      color: 'var(--primary-blue-dark)',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      fontSize: '0.9rem'
                    }}
                    title={locale === 'ar-SA' ? 'مراجعة الواجبات' : 'Review Submissions'}
                  >
                    📬
                  </button>
                </div>
              </div>

              {/* Description */}
              <p style={{
                color: '#555',
                lineHeight: 1.6,
                marginBottom: '1rem',
                fontSize: '1rem'
              }}>
                {homeworkItem.description}
              </p>

              {/* Attachments */}
              {homeworkItem.attachments && homeworkItem.attachments.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h6 style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue-dark)',
                    marginBottom: '0.5rem'
                  }}>
                    {locale === 'ar-SA' ? 'المرفقات:' : 'Attachments:'}
                  </h6>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {homeworkItem.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'var(--light-orange)',
                          color: 'var(--primary-blue-dark)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        📎 {locale === 'ar-SA' ? `مرفق ${index + 1}` : `Attachment ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: '#888'
              }}>
                <span>
                  {locale === 'ar-SA' ? 'تم الإنشاء:' : 'Created:'} {formatDate(homeworkItem.createdAt)}
                </span>
                {homeworkItem.updatedAt !== homeworkItem.createdAt && (
                  <span>
                    {locale === 'ar-SA' ? 'آخر تحديث:' : 'Updated:'} {formatDate(homeworkItem.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submissions Modal (Hidden by default) */}
      {reviewHomework && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            width: '90%',
            maxWidth: '800px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setReviewHomework(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: '#666'
              }}
            >
              &times;
            </button>

            <h4 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--primary-blue-dark)',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {locale === 'ar-SA' ? 'مراجعة الواجبات' : 'Review Homework Submissions'}
            </h4>

            {submissionsLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--primary-blue-dark)'
              }}>
                <div className="loading-spinner" style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ fontSize: '1.1rem' }}>
                  {locale === 'ar-SA' ? 'جاري تحميل الواجبات...' : 'Loading submissions...'}
                </p>
              </div>
            ) : submissions.length === 0 && !submissionsError ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                  {locale === 'ar-SA' ? 'لا توجد واجبات مرسلة' : 'No Submissions Found'}
                </h4>
                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                  {locale === 'ar-SA' 
                    ? 'لم يقم أي طالب بإرسال واجبات بعد.'
                    : 'No students have submitted homework yet.'
                  }
                </p>
                <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem' }}>
                  {locale === 'ar-SA' 
                    ? 'تظهر هنا الواجبات المرسلة من الطلاب.'
                    : 'This is where student submissions will appear.'
                  }
                </p>
              </div>
            ) : (
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                marginBottom: '1.5rem'
              }}>
                {submissions.map((submission) => (
                  <div key={submission.studentId} style={{
                    background: 'var(--light-orange)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    position: 'relative',
                    border: '1px solid var(--primary-orange)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h5 style={{
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: 'var(--primary-blue-dark)',
                          marginBottom: '0.5rem'
                        }}>
                          {getStudentName(submission.studentId)}
                        </h5>
                        
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            background: 'var(--primary-green)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            {locale === 'ar-SA' ? 'تم الإرسال' : 'Submitted'}
                          </span>
                          
                          <span style={{
                            color: '#666',
                            fontSize: '0.9rem'
                          }}>
                            📅 {formatDate(submission.submittedAt || '')}
                          </span>
                        </div>
                      </div>

                      {/* Edit buttons for teacher */}
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginLeft: '1rem'
                      }}>
                        <button
                          onClick={() => handleSubmissionSave(submission.studentId)}
                          disabled={submissionSaving[submission.studentId]}
                          style={{
                            background: submissionSaving[submission.studentId] 
                              ? '#6c757d' 
                              : 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: submissionSaving[submission.studentId] ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                          }}
                        >
                          {submissionSaving[submission.studentId] ? (
                            <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                          ) : (
                            <>
                              💾 {locale === 'ar-SA' ? 'حفظ' : 'Save'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Student Comment */}
                    {submission.comment && (
                      <div style={{
                        marginBottom: '1rem',
                        background: '#f1f3f4',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        color: '#333',
                        fontStyle: 'italic',
                        fontSize: '1.05rem',
                        borderLeft: '4px solid var(--primary-blue)'
                      }}>
                        <strong>{locale === 'ar-SA' ? 'تعليق الطالب:' : 'Student Comment:'}</strong>
                        <div style={{ marginTop: 4 }}>{submission.comment}</div>
                      </div>
                    )}

                    {/* Comment and Grade Inputs */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                          color: 'var(--primary-blue-dark)'
                        }}>
                          {locale === 'ar-SA' ? 'تعليق المعلم' : 'Teacher Comment'}
                        </label>
                        <textarea
                          value={submissionEdits[submission.studentId]?.comment || ''}
                          onChange={(e) => setSubmissionEdits(prev => ({
                            ...prev,
                            [submission.studentId]: { ...prev[submission.studentId], comment: e.target.value }
                          }))}
                          placeholder={locale === 'ar-SA' ? 'أدخل تعليقك هنا' : 'Enter your comment here'}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border: '2px solid #e0e0e0',
                            fontSize: '1rem',
                            resize: 'vertical',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                          color: 'var(--primary-blue-dark)'
                        }}>
                          {locale === 'ar-SA' ? 'الدرجة' : 'Grade'}
                        </label>
                        <input
                          type="number"
                          value={submissionEdits[submission.studentId]?.grade || ''}
                          onChange={(e) => setSubmissionEdits(prev => ({
                            ...prev,
                            [submission.studentId]: { ...prev[submission.studentId], grade: e.target.value }
                          }))}
                          placeholder={locale === 'ar-SA' ? 'أدخل الدرجة' : 'Enter grade'}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border: '2px solid #e0e0e0',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    {/* Attachments */}
                    {submission.attachments && submission.attachments.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          color: 'var(--primary-blue-dark)',
                          marginBottom: '0.5rem'
                        }}>
                          {locale === 'ar-SA' ? 'المرفقات:' : 'Attachments:'}
                        </h6>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {submission.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: 'var(--light-orange)',
                                color: 'var(--primary-blue-dark)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '15px',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              📎 {locale === 'ar-SA' ? `مرفق ${index + 1}` : `Attachment ${index + 1}`}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Error Display for submissions */}
            {submissionsError && (
              <div style={{
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#c33',
                textAlign: 'center'
              }}>
                {submissionsError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
