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
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface ContactManagementProps {
  locale: string;
}

export default function ContactManagement({ locale }: ContactManagementProps) {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const { user } = useAuth();

  const fetchContacts = useCallback(async () => {
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
      setContacts(data.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
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
        setContacts(prev => prev.filter(c => c.id !== id));
        setShowDeleteConfirm(null);
    } catch (error) {
        console.error("Failed to delete contact submission", error);
    }
  };

  const handleContactClick = (contact: ContactSubmission) => {
    setSelectedContact(contact);
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    return new Date(timestamp._seconds * 1000).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#007bff';
      case 'in-progress': return '#ffc107';
      case 'resolved': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getStatusText = (status: string) => {
    if (locale === 'ar-SA') {
      switch (status) {
        case 'new': return 'جديد';
        case 'in-progress': return 'قيد المعالجة';
        case 'resolved': return 'تم الحل';
        case 'closed': return 'مغلق';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      margin: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#2d3748', fontSize: '1.8rem', fontWeight: 'bold' }}>
          {locale === 'ar-SA' ? 'إدارة رسائل التواصل' : 'Contact Submissions Management'}
        </h2>
        <button 
          onClick={fetchContacts}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? (locale === 'ar-SA' ? 'جاري التحديث...' : 'Refreshing...') : (locale === 'ar-SA' ? 'تحديث' : 'Refresh')}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fed7d7',
          border: '1px solid #feb2b2',
          color: '#c53030',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Contact List */}
        <div style={{ flex: 1 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الاسم' : 'Name'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الهاتف' : 'Phone'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الحالة' : 'Status'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'التاريخ' : 'Date'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    style={{ 
                      backgroundColor: selectedContact?.id === contact.id ? '#e6f3ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleContactClick(contact)}
                  >
                    <td style={tableCellStyle}>{contact.fullName}</td>
                    <td style={tableCellStyle}>{contact.phoneNumber}</td>
                    <td style={tableCellStyle}>
                      <select
                        value={contact.status}
                        onChange={(e) => handleUpdateStatus(contact.id, e.target.value as ContactSubmission['status'])}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '0.25rem',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          background: getStatusColor(contact.status),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        <option value="new">{getStatusText('new')}</option>
                        <option value="in-progress">{getStatusText('in-progress')}</option>
                        <option value="resolved">{getStatusText('resolved')}</option>
                        <option value="closed">{getStatusText('closed')}</option>
                      </select>
                    </td>
                    <td style={tableCellStyle}>{formatDate(contact.createdAt)}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(contact.id);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {locale === 'ar-SA' ? 'حذف' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contacts.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
              {locale === 'ar-SA' ? 'لا توجد رسائل تواصل' : 'No contact submissions found'}
            </div>
          )}
        </div>

        {/* Contact Details Panel */}
        {selectedContact && (
          <div style={{
            width: '400px',
            background: '#f7fafc',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>
              {locale === 'ar-SA' ? 'تفاصيل الرسالة' : 'Message Details'}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>{locale === 'ar-SA' ? 'الاسم:' : 'Name:'}</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{selectedContact.fullName}</p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>{locale === 'ar-SA' ? 'رقم الهاتف:' : 'Phone Number:'}</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{selectedContact.phoneNumber}</p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>{locale === 'ar-SA' ? 'الحالة:' : 'Status:'}</strong>
              <p style={{ 
                margin: '0.25rem 0 0 0',
                color: getStatusColor(selectedContact.status),
                fontWeight: 'bold'
              }}>
                {getStatusText(selectedContact.status)}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>{locale === 'ar-SA' ? 'الرسالة:' : 'Message:'}</strong>
              <p style={{ 
                margin: '0.25rem 0 0 0',
                background: 'white',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                minHeight: '100px',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedContact.message}
              </p>
            </div>
            
            <div>
              <strong>{locale === 'ar-SA' ? 'تاريخ الإرسال:' : 'Submitted:'}</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{formatDate(selectedContact.createdAt)}</p>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDelete(showDeleteConfirm)}
          title={locale === 'ar-SA' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={locale === 'ar-SA' ? 'هل أنت متأكد من أنك تريد حذف هذه الرسالة؟' : 'Are you sure you want to delete this contact submission?'}
        />
      )}
    </div>
  );
}