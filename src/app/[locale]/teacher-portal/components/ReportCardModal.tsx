import { auth } from '../../../../firebase';
// Helper to get Firebase ID token for Authorization header
async function getAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    const user = auth.currentUser;
    if (user) return await user.getIdToken();
  } catch {}
  // Fallback to localStorage
  return localStorage.getItem('token');
}
import React, { useEffect, useState } from 'react';

export interface GradeEntry {
  subject: string;
  grade: string;
}

export interface ReportCard {
  studentId: string;
  academicYear: string;
  period: string;
  grades: GradeEntry[];
  overallPerformance?: string;
  comments?: string;
  createdBy?: string;
  createdAt?: string;
}

interface ReportCardModalProps {
  studentId: string;
  studentName: string;
  academicYear: string;
  open: boolean;
  onClose: () => void;
  locale: string;
}

// Use env variables for region and project id
const region = process.env.NEXT_PUBLIC_FIREBASE_REGION || 'us-central1';
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'future-step-nursery';
const API_BASE = `https://${region}-${projectId}.cloudfunctions.net`;

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ studentId, studentName, academicYear, open, onClose, locale }) => {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReportCard | null>(null);

  // Fetch report cards
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      const token = await getAuthToken();
      fetch(`${API_BASE}/manageReportCards?operation=list&studentId=${studentId}&academicYear=${academicYear}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      })
        .then(res => res.json())
        .then(data => {
          if (data.reportCards) {
            setReportCards(data.reportCards.map((rc: any) => ({
              ...rc,
              grades: Array.isArray(rc.grades)
                ? rc.grades
                : Object.entries(rc.grades || {}).map(([subject, grade]) => ({ subject: String(subject), grade: String(grade) }))
            })));
          } else setError(data.error || 'Failed to load report cards');
        })
        .catch(() => setError('Failed to load report cards'))
        .finally(() => setLoading(false));
    })();
  }, [open, studentId, academicYear]);

  // Form state
  const [form, setForm] = useState<Partial<ReportCard>>({ grades: [] });
  const handleFormChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };
  const handleGradeChange = (idx: number, field: 'subject' | 'grade', value: string) => {
    setForm(f => ({
      ...f,
      grades: (f.grades || []).map((entry, i) => i === idx ? { ...entry, [field]: value } : entry)
    }));
  };
  const addGradeField = () => {
    setForm(f => ({ ...f, grades: [...(f.grades || []), { subject: '', grade: '' }] }));
  };
  const removeGradeField = (idx: number) => {
    setForm(f => ({ ...f, grades: (f.grades || []).filter((_, i) => i !== idx) }));
  };

  // Open form for new or edit
  const openForm = (rc?: ReportCard) => {
    setEditing(rc || null);
    setForm(rc
      ? { ...rc, grades: Array.isArray(rc.grades) ? rc.grades.map(g => ({ subject: String(g.subject), grade: String(g.grade) })) : Object.entries(rc.grades || {}).map(([subject, grade]) => ({ subject: String(subject), grade: String(grade) })) }
      : { grades: [] });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ grades: [] });
  };

  // Save report card
  const saveReportCard = async () => {
    setLoading(true);
    setError(null);
    const method = editing ? 'PUT' : 'POST';
    // Convert grades array to object for backend compatibility
    const gradesObj = (form.grades || []).reduce((acc, curr) => {
      if (curr.subject.trim()) acc[curr.subject] = curr.grade;
      return acc;
    }, {} as Record<string, string>);
    const body = {
      studentId,
      academicYear,
      period: form.period,
      grades: gradesObj,
      overallPerformance: form.overallPerformance,
      comments: form.comments
    };
  const url = `${API_BASE}/manageReportCards?operation=${editing ? 'update' : 'create'}`;
    const token = await getAuthToken();
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          closeForm();
          // Refresh list
          const refresh = async () => {
            const token2 = await getAuthToken();
            fetch(`${API_BASE}/manageReportCards?operation=list&studentId=${studentId}&academicYear=${academicYear}`, {
              headers: { 'Authorization': token2 ? `Bearer ${token2}` : '' }
            })
              .then(res => res.json())
              .then(data => {
                if (data.reportCards) setReportCards(data.reportCards.map((rc: any) => ({
                  ...rc,
                  grades: Array.isArray(rc.grades)
                    ? rc.grades
                    : Object.entries(rc.grades || {}).map(([subject, grade]) => ({ subject, grade }))
                })));
              });
          };
          refresh();
        } else setError(data.error || 'Failed to save report card');
      })
      .catch(() => setError('Failed to save report card'))
      .finally(() => setLoading(false));
  };

  // Delete report card
  const deleteReportCard = async (rc: ReportCard) => {
    if (!window.confirm('Delete this report card?')) return;
    setLoading(true);
    const token = await getAuthToken();
    fetch(`${API_BASE}/manageReportCards?operation=delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ studentId, academicYear, period: rc.period })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setReportCards(reportCards.filter(r => r.period !== rc.period));
        else setError(data.error || 'Failed to delete report card');
      })
      .catch(() => setError('Failed to delete report card'))
      .finally(() => setLoading(false));
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, minWidth: 350, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer' }}>×</button>
        <h2 style={{ marginBottom: 8 }}>{locale === 'ar-SA' ? 'بطاقات تقرير الطالب' : 'Student Report Cards'} - {studentName}</h2>
        <div style={{ color: '#666', marginBottom: 16, fontSize: '1rem' }}>
          {locale === 'ar-SA'
            ? 'يمكنك هنا إضافة أو تعديل أو حذف بطاقات التقرير لهذا الطالب. كل بطاقة تقرير تمثل فترة (شهر، فصل، أو نهاية العام).' 
            : 'Here you can add, edit, or delete report cards for this student. Each report card represents a period (month, term, or final).'}
        </div>
        {loading && <div style={{ color: '#888', marginBottom: 12 }}>{locale === 'ar-SA' ? 'جار التحميل...' : 'Loading...'}</div>}
        {error && <div style={{ color: 'var(--primary-red)', marginBottom: 12 }}>{error}</div>}
        {!showForm && (
          <>
            <button onClick={() => openForm()} style={{ background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: 10, padding: '0.5rem 1.5rem', marginBottom: 16, fontWeight: 'bold', cursor: 'pointer' }}>{locale === 'ar-SA' ? 'إضافة بطاقة تقرير' : 'Add Report Card'}</button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {reportCards.length === 0 && <li style={{ color: '#888', fontSize: '1.1rem', margin: '1rem 0' }}>{locale === 'ar-SA' ? 'لا توجد بطاقات تقرير بعد. اضغط على "إضافة بطاقة تقرير" لبدء إضافة أول بطاقة.' : 'No report cards yet. Click "Add Report Card" to create the first one.'}</li>}
              {reportCards.map(rc => (
                <li key={rc.period} style={{ background: 'var(--light-blue)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 16 }}>{locale === 'ar-SA' ? 'الفترة:' : 'Period:'} {rc.period}</div>
                  <details open style={{ marginTop: 4 }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary-purple)', fontWeight: 'bold' }}>{locale === 'ar-SA' ? 'عرض المواد/المعايير' : 'Show Subjects/Criteria'}</summary>
                    <ul style={{ marginTop: 8 }}>
                      {Array.isArray(rc.grades) && rc.grades.map((entry: GradeEntry, idx: number) => (
                        <li key={entry.subject + idx}><strong>{entry.subject}:</strong> {entry.grade}</li>
                      ))}
                    </ul>
                  </details>
                  <div>{locale === 'ar-SA' ? 'الأداء العام:' : 'Overall Performance:'} {rc.overallPerformance}</div>
                  <div>{locale === 'ar-SA' ? 'الملاحظات:' : 'Comments:'} {rc.comments}</div>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => openForm(rc)} style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', marginRight: 8, cursor: 'pointer' }}>{locale === 'ar-SA' ? 'تعديل' : 'Edit'}</button>
                    <button onClick={() => deleteReportCard(rc)} style={{ background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', cursor: 'pointer' }}>{locale === 'ar-SA' ? 'حذف' : 'Delete'}</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {showForm && (
          <form onSubmit={e => { e.preventDefault(); saveReportCard(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {editing ? (
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
                {(form.period || '') + ' | ' + (form.academicYear || academicYear)}
              </div>
            ) : (
              <label>{locale === 'ar-SA' ? 'الفترة' : 'Period'}
                <input
                  type="text"
                  value={form.period || ''}
                  onChange={e => handleFormChange('period', e.target.value)}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />
              </label>
            )}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{locale === 'ar-SA' ? 'المواد/المعايير' : 'Subjects/Criteria'}</div>
              {form.grades && form.grades.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <input
                    type="text"
                    value={entry.subject}
                    onChange={e => handleGradeChange(idx, 'subject', e.target.value)}
                    placeholder={locale === 'ar-SA' ? 'المادة/المعيار' : 'Subject/Criteria'}
                    style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    value={entry.grade}
                    onChange={e => handleGradeChange(idx, 'grade', e.target.value)}
                    placeholder={locale === 'ar-SA' ? 'التقدير' : 'Grade'}
                    style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
                  />
                  <button type="button" onClick={() => removeGradeField(idx)} style={{ background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer' }}>×</button>
                </div>
              ))}
              <button type="button" onClick={addGradeField} style={{ background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: 6, padding: '0.3rem 1rem', marginTop: 4, cursor: 'pointer' }}>{locale === 'ar-SA' ? 'إضافة مادة/معيار' : 'Add Subject/Criteria'}</button>
            </div>
            <label>{locale === 'ar-SA' ? 'الأداء العام' : 'Overall Performance'}
              <input type="text" value={form.overallPerformance || ''} onChange={e => handleFormChange('overallPerformance', e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
            </label>
            <label>{locale === 'ar-SA' ? 'الملاحظات' : 'Comments'}
              <textarea value={form.comments || ''} onChange={e => handleFormChange('comments', e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
            </label>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="submit" style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{locale === 'ar-SA' ? 'حفظ' : 'Save'}</button>
              <button type="button" onClick={closeForm} style={{ background: '#ccc', color: 'black', border: 'none', borderRadius: 8, padding: '0.5rem 1.5rem', cursor: 'pointer' }}>{locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportCardModal;
