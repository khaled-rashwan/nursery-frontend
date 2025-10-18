'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';
import { DeleteConfirmModal } from '../DeleteConfirmModal';
import { exportToExcel, formatFirestoreTimestamp } from '../../../../../utils/excelExport';

interface Admission {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  relationship: string;
  status: 'new' | 'contacted' | 'enrolled' | 'rejected';
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  message?: string;
  bestTime?: string;
  whatsapp?: string;
  preferredLang?: string;
}

interface AdmissionsManagementProps {
  locale: string;
}

export default function AdmissionsManagement({ locale }: AdmissionsManagementProps) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const fetchAdmissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/manageAdmissions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch admissions');
      const data = await response.json();
      setAdmissions(data.admissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const handleUpdateStatus = async (id: string, status: Admission['status']) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/manageAdmissions`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ operation: 'updateStatus', id, status })
      });
      setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
        const token = await user.getIdToken();
        await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/manageAdmissions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operation: 'delete', id })
        });
        setAdmissions(prev => prev.filter(a => a.id !== id));
        setShowDeleteConfirm(null);
    } catch (error) {
        console.error("Failed to delete admission", error);
    }
  };

  const handleExportToExcel = async () => {
    if (admissions.length === 0) {
      alert(locale === 'ar-SA' ? 'لا توجد بيانات للتصدير' : 'No data available to export');
      return;
    }

    setIsExporting(true);
    try {
      const exportData = admissions.map(admission => ({
        parentName: admission.parentName,
        email: admission.email,
        phone: admission.phone,
        relationship: admission.relationship,
        status: admission.status,
        submissionDate: formatFirestoreTimestamp(admission.createdAt),
        bestTime: admission.bestTime || '',
        whatsapp: admission.whatsapp || '',
        preferredLang: admission.preferredLang || '',
        message: admission.message || ''
      }));

      const columns = locale === 'ar-SA' ? [
        { header: 'اسم ولي الأمر', key: 'parentName', width: 20 },
        { header: 'البريد الإلكتروني', key: 'email', width: 25 },
        { header: 'الهاتف', key: 'phone', width: 15 },
        { header: 'العلاقة', key: 'relationship', width: 15 },
        { header: 'الحالة', key: 'status', width: 15 },
        { header: 'تاريخ التقديم', key: 'submissionDate', width: 20 },
        { header: 'أفضل وقت للاتصال', key: 'bestTime', width: 20 },
        { header: 'واتساب', key: 'whatsapp', width: 15 },
        { header: 'اللغة المفضلة', key: 'preferredLang', width: 15 },
        { header: 'الرسالة', key: 'message', width: 30 }
      ] : [
        { header: 'Parent Name', key: 'parentName', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Relationship', key: 'relationship', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Submission Date', key: 'submissionDate', width: 20 },
        { header: 'Best Time to Contact', key: 'bestTime', width: 20 },
        { header: 'WhatsApp', key: 'whatsapp', width: 15 },
        { header: 'Preferred Language', key: 'preferredLang', width: 15 },
        { header: 'Message', key: 'message', width: 30 }
      ];

      await exportToExcel({
        fileName: locale === 'ar-SA' ? 'بيانات_القبول' : 'admissions_data',
        sheetName: locale === 'ar-SA' ? 'القبول' : 'Admissions',
        columns,
        data: exportData,
        locale
      });
    } catch (error) {
      console.error('Error exporting admissions data:', error);
      alert(locale === 'ar-SA' ? 'فشل تصدير البيانات' : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#2c3e50', margin: 0 }}>
          {locale === 'ar-SA' ? 'إدارة القبول' : 'Admissions Management'}
        </h2>
        <button
          onClick={handleExportToExcel}
          disabled={isExporting || loading || admissions.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: isExporting || admissions.length === 0 ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isExporting || admissions.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isExporting ? (
            locale === 'ar-SA' ? 'جاري التصدير...' : 'Exporting...'
          ) : (
            <>
              <span>📊</span>
              {locale === 'ar-SA' ? 'تصدير إلى Excel' : 'Export to Excel'}
            </>
          )}
        </button>
      </div>

      {loading && <p>{locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'اسم ولي الأمر' : 'Parent Name'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الهاتف' : 'Phone'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الحالة' : 'Status'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'تاريخ التقديم' : 'Submission Date'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {admissions.length > 0 ? admissions.map((admission) => (
              <tr key={admission.id}>
                <td style={tableCellStyle}>{admission.parentName}</td>
                <td style={tableCellStyle}>{admission.email}</td>
                <td style={tableCellStyle}>{admission.phone}</td>
                <td style={tableCellStyle}>
                   <select
                        value={admission.status}
                        onChange={(e) => handleUpdateStatus(admission.id, e.target.value as Admission['status'])}
                        style={{ padding: '5px', borderRadius: '5px' }}
                    >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </td>
                <td style={tableCellStyle}>
                  {new Date(admission.createdAt._seconds * 1000).toLocaleDateString()}
                </td>
                <td style={tableCellStyle}>
                    <button onClick={() => setSelectedAdmission(admission)} style={{ marginRight: '10px' }}>View</button>
                    <button onClick={() => setShowDeleteConfirm(admission.id)}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ ...tableCellStyle, textAlign: 'center', padding: '2rem' }}>
                  {locale === 'ar-SA' ? 'لا توجد طلبات قبول حالياً.' : 'No admission submissions found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDelete(showDeleteConfirm)}
          itemName={`the admission for ${admissions.find(a => a.id === showDeleteConfirm)?.parentName}`}
        />
      )}

    {selectedAdmission && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', width: '500px' }}>
                <h2>Admission Details</h2>
                <p><strong>Parent Name:</strong> {selectedAdmission.parentName}</p>
                <p><strong>Email:</strong> {selectedAdmission.email}</p>
                <p><strong>Phone:</strong> {selectedAdmission.phone}</p>
                <p><strong>Relationship:</strong> {selectedAdmission.relationship}</p>
                <p><strong>Best time to contact:</strong> {selectedAdmission.bestTime}</p>
                <p><strong>Can contact via WhatsApp:</strong> {selectedAdmission.whatsapp}</p>
                <p><strong>Preferred Language:</strong> {selectedAdmission.preferredLang}</p>
                <p><strong>Message:</strong> {selectedAdmission.message}</p>
                <button onClick={() => setSelectedAdmission(null)}>Close</button>
            </div>
        </div>
    )}
    </div>
  );
}
