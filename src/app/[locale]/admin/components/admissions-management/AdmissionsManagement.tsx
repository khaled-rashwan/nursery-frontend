'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';
import DeleteConfirmModal from '../DeleteConfirmModal';

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

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '2rem' }}>
        {locale === 'ar-SA' ? 'إدارة القبول' : 'Admissions Management'}
      </h2>

      {loading && <p>{locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ overflowX: 'auto' }}>
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
          message="Are you sure you want to delete this submission?"
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
