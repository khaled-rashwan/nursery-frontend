'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { teacherAPI, handleAPIError } from '../../services/api';

interface Teacher {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  classes?: { classId: string; className: string; subjects: string[] }[];
}

interface TeacherManagementProps {
  locale: string;
}

export function TeacherManagement({ locale }: TeacherManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const { user } = useAuth();

  const fetchTeachers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await teacherAPI.list(user);
      setTeachers(data.teachers || []);
    } catch (error) {
      setError(handleAPIError(error, locale));
    } finally {
      setLoading(false);
    }
  }, [user, locale]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleSubmit = async (teacherData: Partial<Teacher>) => {
    if (!user) return;
    setLoading(true);
    try {
      if (editingTeacher) {
        await teacherAPI.update(user, editingTeacher.id, teacherData);
      } else {
        await teacherAPI.create(user, teacherData);
      }
      fetchTeachers();
      setShowForm(false);
      setEditingTeacher(null);
    } catch (error) {
      setError(handleAPIError(error, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>{locale === 'ar-SA' ? 'إدارة المعلمين' : 'Teacher Management'}</h2>
        <button onClick={() => { setEditingTeacher(null); setShowForm(true); }}>
          {locale === 'ar-SA' ? 'إضافة معلم جديد' : 'Add New Teacher'}
        </button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
      {loading && <div>{locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}</div>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>{locale === 'ar-SA' ? 'الاسم' : 'Name'}</th>
              <th>{locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}</th>
              <th>{locale === 'ar-SA' ? 'الفصول' : 'Classes'}</th>
              <th>{locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td>{teacher.displayName}</td>
                <td>{teacher.email}</td>
                <td>{teacher.classes && teacher.classes.map(c => `${c.className} (${c.subjects.join(', ')})`).join(', ')}</td>
                <td>
                  <button onClick={() => { setEditingTeacher(teacher); setShowForm(true); }}>
                    {locale === 'ar-SA' ? 'تعديل' : 'Edit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <TeacherForm
          locale={locale}
          initialData={editingTeacher}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

interface TeacherFormProps {
    locale: string;
    initialData: Teacher | null;
    onSubmit: (data: Partial<Teacher>) => void;
    onCancel: () => void;
    loading: boolean;
}

function TeacherForm({ locale, initialData, onSubmit, onCancel, loading }: TeacherFormProps) {
    const [formData, setFormData] = useState({
        displayName: initialData?.displayName || '',
        email: initialData?.email || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.displayName) {
            newErrors.displayName = locale === 'ar-SA' ? 'الاسم مطلوب' : 'Name is required';
        }
        if (!formData.email) {
            newErrors.email = locale === 'ar-SA' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = locale === 'ar-SA' ? 'البريد الإلكتروني غير صالح' : 'Invalid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
                <h3 style={{ margin: '0 0 2rem 0' }}>{initialData ? (locale === 'ar-SA' ? 'تعديل معلم' : 'Edit Teacher') : (locale === 'ar-SA' ? 'إضافة معلم جديد' : 'Add New Teacher')}</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{locale === 'ar-SA' ? 'الاسم' : 'Name'}</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: `1px solid ${errors.displayName ? 'red' : '#ccc'}`, borderRadius: '4px' }}
                        />
                        {errors.displayName && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.displayName}</div>}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: `1px solid ${errors.email ? 'red' : '#ccc'}`, borderRadius: '4px' }}
                        />
                        {errors.email && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</div>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>{locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', background: '#27ae60', color: 'white' }}>{locale === 'ar-SA' ? 'حفظ' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
