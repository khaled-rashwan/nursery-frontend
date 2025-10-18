'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';
import { DeleteConfirmModal } from '../DeleteConfirmModal';
import { CareerSubmission } from '../../../../../app/types';
import { getCareerSubmissions, updateCareerSubmissionStatus, deleteCareerSubmission } from '../../../../../services/careerService';
import { exportToExcel, formatFirestoreTimestamp } from '../../../../../utils/excelExport';

interface CareerSubmissionsManagementProps {
  locale: string;
}

export default function CareerSubmissionsManagement({ locale }: CareerSubmissionsManagementProps) {
  const [careerSubmissions, setCareerSubmissions] = useState<CareerSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<CareerSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const fetchCareerSubmissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const submissions = await getCareerSubmissions(token);
      setCareerSubmissions(submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCareerSubmissions();
  }, [fetchCareerSubmissions]);

  const handleUpdateStatus = async (id: string, status: CareerSubmission['status']) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await updateCareerSubmissionStatus(token, id, status);
      setCareerSubmissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (error) {
      console.error("Failed to update status", error);
      setError("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
        const token = await user.getIdToken();
        await deleteCareerSubmission(token, id);
        setCareerSubmissions(prev => prev.filter(c => c.id !== id));
        setShowDeleteConfirm(null);
    } catch (error) {
        console.error("Failed to delete career submission", error);
        setError("Failed to delete career submission");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#e74c3c';
      case 'reviewed': return '#f39c12';
      case 'interviewed': return '#3498db';
      case 'hired': return '#27ae60';
      case 'rejected': return '#e67e22';
      case 'archived': return '#95a5a6';
      default: return '#2c3e50';
    }
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const openDetailsModal = (submission: CareerSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleExportToExcel = async () => {
    if (careerSubmissions.length === 0) {
      alert(locale === 'ar-SA' ? 'لا توجد بيانات للتصدير' : 'No data available to export');
      return;
    }

    setIsExporting(true);
    try {
      const exportData = careerSubmissions.map(submission => ({
        fullName: submission.fullName,
        emailAddress: submission.emailAddress,
        phoneNumber: submission.phoneNumber,
        jobTitle: submission.jobTitle,
        status: submission.status,
        resumeUrl: submission.resumeUrl || '',
        message: submission.message || '',
        applicationDate: formatFirestoreTimestamp(submission.createdAt)
      }));

      const columns = locale === 'ar-SA' ? [
        { header: 'الاسم الكامل', key: 'fullName', width: 25 },
        { header: 'البريد الإلكتروني', key: 'emailAddress', width: 30 },
        { header: 'رقم الهاتف', key: 'phoneNumber', width: 20 },
        { header: 'المسمى الوظيفي', key: 'jobTitle', width: 25 },
        { header: 'الحالة', key: 'status', width: 15 },
        { header: 'رابط السيرة الذاتية', key: 'resumeUrl', width: 40 },
        { header: 'الرسالة', key: 'message', width: 40 },
        { header: 'تاريخ التقديم', key: 'applicationDate', width: 20 }
      ] : [
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email Address', key: 'emailAddress', width: 30 },
        { header: 'Phone Number', key: 'phoneNumber', width: 20 },
        { header: 'Job Title', key: 'jobTitle', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Resume URL', key: 'resumeUrl', width: 40 },
        { header: 'Message', key: 'message', width: 40 },
        { header: 'Application Date', key: 'applicationDate', width: 20 }
      ];

      await exportToExcel({
        fileName: locale === 'ar-SA' ? 'طلبات_التوظيف' : 'career_applications',
        sheetName: locale === 'ar-SA' ? 'طلبات التوظيف' : 'Career Applications',
        columns,
        data: exportData,
        locale
      });
    } catch (error) {
      console.error('Error exporting career applications:', error);
      alert(locale === 'ar-SA' ? 'فشل تصدير البيانات' : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading career submissions...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-purple)' }}>
          Career Applications Management
        </h2>
        <button
          onClick={handleExportToExcel}
          disabled={isExporting || loading || careerSubmissions.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: isExporting || careerSubmissions.length === 0 ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isExporting || careerSubmissions.length === 0 ? 'not-allowed' : 'pointer',
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
      
      <div style={{ marginBottom: '1rem', color: '#666' }}>
        Total Applications: {careerSubmissions.length}
      </div>

      {careerSubmissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No career applications found.
        </div>
      ) : (
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Phone</th>
                <th style={tableHeaderStyle}>Position</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Resume</th>
                <th style={tableHeaderStyle}>Applied</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {careerSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td style={tableCellStyle}>{submission.fullName}</td>
                  <td style={tableCellStyle}>{submission.emailAddress}</td>
                  <td style={tableCellStyle}>{submission.phoneNumber}</td>
                  <td style={tableCellStyle}>{submission.jobTitle}</td>
                  <td style={tableCellStyle}>
                    <select
                      value={submission.status}
                      onChange={(e) => handleUpdateStatus(submission.id, e.target.value as CareerSubmission['status'])}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        background: getStatusColor(submission.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td style={tableCellStyle}>
                    {submission.resumeUrl ? (
                      <a 
                        href={submission.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}
                      >
                        View Resume
                      </a>
                    ) : (
                      <span style={{ color: '#999' }}>No resume</span>
                    )}
                  </td>
                  <td style={tableCellStyle}>{formatDate(submission.createdAt)}</td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openDetailsModal(submission)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--primary-blue)',
                          background: 'var(--primary-blue)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(submission.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #e74c3c',
                          background: '#e74c3c',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-purple)' }}>
              Career Application Details
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Name:</strong> {selectedSubmission.fullName}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Email:</strong> {selectedSubmission.emailAddress}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Phone:</strong> {selectedSubmission.phoneNumber}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Position Applied:</strong> {selectedSubmission.jobTitle}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Status:</strong> 
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: getStatusColor(selectedSubmission.status),
                color: 'white',
                marginLeft: '8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {selectedSubmission.status.toUpperCase()}
              </span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Applied:</strong> {formatDate(selectedSubmission.createdAt)}
            </div>
            {selectedSubmission.resumeUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Resume:</strong>{' '}
                <a 
                  href={selectedSubmission.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}
                >
                  Download Resume
                </a>
              </div>
            )}
            <div style={{ marginBottom: '2rem' }}>
              <strong>Message:</strong>
              <div style={{
                marginTop: '0.5rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedSubmission.message}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDelete(showDeleteConfirm)}
          itemName="career application"
        />
      )}
    </div>
  );
}