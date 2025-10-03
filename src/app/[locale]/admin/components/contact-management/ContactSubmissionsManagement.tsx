'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

interface ContactSubmission {
  id: string;
  fullName: string;
  phoneNumber: string;
  message: string;
  status: 'new' | 'replied' | 'resolved' | 'archived';
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface ContactSubmissionsManagementProps {
  locale: string;
}

export default function ContactSubmissionsManagement({ locale }: ContactSubmissionsManagementProps) {
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const { user } = useAuth();

  const fetchContactSubmissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/manageContactSubmissions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch contact submissions');
      const data = await response.json();
      setContactSubmissions(data.contactSubmissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContactSubmissions();
  }, [fetchContactSubmissions]);

  const handleUpdateStatus = async (id: string, status: ContactSubmission['status']) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/manageContactSubmissions`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ operation: 'updateStatus', id, status })
      });
      setContactSubmissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
        const token = await user.getIdToken();
        await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/manageContactSubmissions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operation: 'delete', id })
        });
        setContactSubmissions(prev => prev.filter(c => c.id !== id));
        setShowDeleteConfirm(null);
    } catch (error) {
        console.error("Failed to delete contact submission", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#e74c3c';
      case 'replied': return '#f39c12';
      case 'resolved': return '#27ae60';
      case 'archived': return '#95a5a6';
      default: return '#2c3e50';
    }
  };

  const getStatusText = (status: string) => {
    if (locale === 'ar-SA') {
      switch (status) {
        case 'new': return 'جديد';
        case 'replied': return 'تم الرد';
        case 'resolved': return 'تم الحل';
        case 'archived': return 'مؤرشف';
        default: return status;
      }
    }
    switch (status) {
      case 'new': return 'New';
      case 'replied': return 'Replied';
      case 'resolved': return 'Resolved';
      case 'archived': return 'Archived';
      default: return status;
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
        {locale === 'ar-SA' ? 'إدارة رسائل الاتصال' : 'Contact Submissions Management'}
      </h2>

      {loading && <p>{locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الاسم الكامل' : 'Full Name'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'رقم الهاتف' : 'Phone Number'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الحالة' : 'Status'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'تاريخ الإرسال' : 'Submission Date'}</th>
              <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {contactSubmissions.length > 0 ? contactSubmissions.map((submission) => (
              <tr key={submission.id}>
                <td style={tableCellStyle}>{submission.fullName}</td>
                <td style={tableCellStyle}>{submission.phoneNumber}</td>
                <td style={tableCellStyle}>
                   <select
                        value={submission.status}
                        onChange={(e) => handleUpdateStatus(submission.id, e.target.value as ContactSubmission['status'])}
                        style={{ 
                          padding: '5px', 
                          borderRadius: '5px',
                          backgroundColor: getStatusColor(submission.status),
                          color: 'white',
                          border: 'none'
                        }}
                    >
                        <option value="new" style={{ backgroundColor: '#e74c3c' }}>
                          {locale === 'ar-SA' ? 'جديد' : 'New'}
                        </option>
                        <option value="replied" style={{ backgroundColor: '#f39c12' }}>
                          {locale === 'ar-SA' ? 'تم الرد' : 'Replied'}
                        </option>
                        <option value="resolved" style={{ backgroundColor: '#27ae60' }}>
                          {locale === 'ar-SA' ? 'تم الحل' : 'Resolved'}
                        </option>
                        <option value="archived" style={{ backgroundColor: '#95a5a6' }}>
                          {locale === 'ar-SA' ? 'مؤرشف' : 'Archived'}
                        </option>
                    </select>
                </td>
                <td style={tableCellStyle}>
                  {new Date(submission.createdAt._seconds * 1000).toLocaleDateString()}
                </td>
                <td style={tableCellStyle}>
                    <button 
                      onClick={() => setSelectedSubmission(submission)} 
                      style={{ 
                        marginRight: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {locale === 'ar-SA' ? 'عرض' : 'View'}
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(submission.id)}
                      style={{ 
                        padding: '5px 10px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {locale === 'ar-SA' ? 'حذف' : 'Delete'}
                    </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', padding: '2rem' }}>
                  {locale === 'ar-SA' ? 'لا توجد رسائل اتصال حالياً.' : 'No contact submissions found.'}
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
          itemName={`the contact submission from ${contactSubmissions.find(c => c.id === showDeleteConfirm)?.fullName}`}
        />
      )}

    {selectedSubmission && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                  {locale === 'ar-SA' ? 'تفاصيل رسالة الاتصال' : 'Contact Submission Details'}
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{locale === 'ar-SA' ? 'الاسم الكامل:' : 'Full Name:'}</strong> {selectedSubmission.fullName}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{locale === 'ar-SA' ? 'رقم الهاتف:' : 'Phone Number:'}</strong> {selectedSubmission.phoneNumber}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{locale === 'ar-SA' ? 'الحالة:' : 'Status:'}</strong> 
                  <span style={{ 
                    marginLeft: '10px', 
                    padding: '2px 8px', 
                    borderRadius: '3px', 
                    backgroundColor: getStatusColor(selectedSubmission.status),
                    color: 'white',
                    fontSize: '0.9rem'
                  }}>
                    {getStatusText(selectedSubmission.status)}
                  </span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{locale === 'ar-SA' ? 'تاريخ الإرسال:' : 'Submission Date:'}</strong> {new Date(selectedSubmission.createdAt._seconds * 1000).toLocaleString()}
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <strong>{locale === 'ar-SA' ? 'الرسالة:' : 'Message:'}</strong>
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '1rem', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '5px',
                    border: '1px solid #dee2e6',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5'
                  }}>
                    {selectedSubmission.message}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {locale === 'ar-SA' ? 'إغلاق' : 'Close'}
                </button>
            </div>
        </div>
    )}
    </div>
  );
}