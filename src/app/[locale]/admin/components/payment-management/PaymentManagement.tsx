'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { useAcademicYear } from '../../../../../components/academic-year';
import { exportToExcel, formatFirestoreTimestamp } from '../../../../../utils/excelExport';

// Types
interface PaymentRecord {
  id: string;
  amount: number;
  date: { seconds: number; nanoseconds: number } | Date; // Firestore timestamp or Date
  method: string;
  notes: string;
  recordedBy: string;
  recordedAt: { seconds: number; nanoseconds: number } | Date;
}

interface PaymentData {
  id: string;
  studentId: string;
  parentUID: string;
  academicYear: string;
  totalFees: number;
  paidAmount: number;
  remainingBalance: number;
  paymentRecords: PaymentRecord[];
  studentInfo: {
    name: string;
    nameEn: string;
  };
  createdAt: { seconds: number; nanoseconds: number } | Date;
  updatedAt: { seconds: number; nanoseconds: number } | Date;
  createdBy: string;
}

interface ParentSummary {
  parentInfo: {
    uid: string;
    email: string;
    displayName: string;
  };
  children: PaymentData[];
}

interface PaymentManagementProps {
  locale: string;
}

export function PaymentManagement({ locale }: PaymentManagementProps) {
  const { user } = useAuth();
  const { selectedAcademicYear } = useAcademicYear();
  const [parentSummaries, setParentSummaries] = useState<ParentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null);
  const [showAddPaymentRecord, setShowAddPaymentRecord] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    studentId: '',
    totalFees: 0,
    paidAmount: 0
  });
  const [editForm, setEditForm] = useState({
    totalFees: 0,
    paidAmount: 0
  });
  const [addRecordForm, setAddRecordForm] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    notes: ''
  });

  // Fetch payment summaries
  const fetchPaymentSummaries = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const url = new URL('https://us-central1-future-step-nursery.cloudfunctions.net/managePayments/getPaymentSummaryByParent');
      if (selectedAcademicYear) {
        url.searchParams.append('academicYear', selectedAcademicYear);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment summaries');
      }

      const data = await response.json();
      setParentSummaries(data.parentSummary || []);
    } catch (error) {
      console.error('Error fetching payment summaries:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user, selectedAcademicYear]);

  // Create payment record
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAcademicYear) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('https://us-central1-future-step-nursery.cloudfunctions.net/managePayments/createPayment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...createForm,
          academicYear: selectedAcademicYear,
          paymentRecords: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      setShowCreateForm(false);
      setCreateForm({ studentId: '', totalFees: 0, paidAmount: 0 });
      fetchPaymentSummaries();
    } catch (error) {
      console.error('Error creating payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to create payment');
    }
  };

  // Update payment record
  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingPayment) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/managePayments/updatePayment/${editingPayment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }

      setEditingPayment(null);
      setEditForm({ totalFees: 0, paidAmount: 0 });
      fetchPaymentSummaries();
    } catch (error) {
      console.error('Error updating payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to update payment');
    }
  };

  // Add payment record
  const handleAddPaymentRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !showAddPaymentRecord) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/managePayments/addPaymentRecord/${showAddPaymentRecord}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addRecordForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add payment record');
      }

      setShowAddPaymentRecord(null);
      setAddRecordForm({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        notes: ''
      });
      fetchPaymentSummaries();
    } catch (error) {
      console.error('Error adding payment record:', error);
      setError(error instanceof Error ? error.message : 'Failed to add payment record');
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!user || !confirm(locale === 'ar-SA' ? 'هل أنت متأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this payment record?')) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://us-central1-future-step-nursery.cloudfunctions.net/managePayments/deletePayment/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment');
      }

      fetchPaymentSummaries();
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete payment');
    }
  };

  useEffect(() => {
    fetchPaymentSummaries();
  }, [fetchPaymentSummaries]);

  // Handle targeted student from student management
  useEffect(() => {
    const targetStudentId = sessionStorage.getItem('targetStudentId');
    const hasPaymentRecord = sessionStorage.getItem('hasPaymentRecord') === 'true';
    
    if (targetStudentId) {
      if (parentSummaries.length > 0) {
        // Find the parent who has this student
        let studentFound = false;
        for (const parentSummary of parentSummaries) {
          const targetStudent = parentSummary.children.find(child => child.studentId === targetStudentId);
          if (targetStudent) {
            studentFound = true;
            // Expand the parent section
            setExpandedParents(prev => new Set([...prev, parentSummary.parentInfo.uid]));
            
            if (hasPaymentRecord) {
              // If payment record exists, just expand the parent (the payment card is already visible)
              // Clear the session storage
              sessionStorage.removeItem('targetStudentId');
              sessionStorage.removeItem('hasPaymentRecord');
            } else {
              // If no payment record, open create form with student ID pre-filled
              setCreateForm(prev => ({ ...prev, studentId: targetStudentId }));
              setShowCreateForm(true);
              
              // Clear the session storage
              sessionStorage.removeItem('targetStudentId');
              sessionStorage.removeItem('hasPaymentRecord');
            }
            break;
          }
        }
        
        // If student not found in existing payments and no payment record, open create form
        if (!studentFound && !hasPaymentRecord) {
          setCreateForm(prev => ({ ...prev, studentId: targetStudentId }));
          setShowCreateForm(true);
          
          // Clear the session storage
          sessionStorage.removeItem('targetStudentId');
          sessionStorage.removeItem('hasPaymentRecord');
        }
      } else {
        // No payments exist yet - if student has no payment record, open create form
        if (!hasPaymentRecord) {
          setCreateForm(prev => ({ ...prev, studentId: targetStudentId }));
          setShowCreateForm(true);
          
          // Clear the session storage
          sessionStorage.removeItem('targetStudentId');
          sessionStorage.removeItem('hasPaymentRecord');
        }
      }
    }
  }, [parentSummaries]);

  const toggleParentExpansion = (parentUID: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentUID)) {
      newExpanded.delete(parentUID);
    } else {
      newExpanded.add(parentUID);
    }
    setExpandedParents(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return locale === 'ar-SA' ? `${amount} ريال` : `$${amount}`;
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | Date | string) => {
    if (!timestamp) return '--';
    let date: Date;
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US');
  };

  const handleExportToExcel = async () => {
    if (parentSummaries.length === 0) {
      alert(locale === 'ar-SA' ? 'لا توجد بيانات للتصدير' : 'No data available to export');
      return;
    }

    setIsExporting(true);
    try {
      // Flatten the data structure for export
      const exportData: Record<string, unknown>[] = [];
      
      parentSummaries.forEach(parentSummary => {
        parentSummary.children.forEach(payment => {
          // Add main payment info
          exportData.push({
            studentName: payment.studentInfo.name,
            studentNameEn: payment.studentInfo.nameEn,
            parentName: parentSummary.parentInfo.displayName,
            parentEmail: parentSummary.parentInfo.email,
            academicYear: payment.academicYear,
            totalFees: payment.totalFees,
            paidAmount: payment.paidAmount,
            remainingBalance: payment.remainingBalance,
            createdAt: formatFirestoreTimestamp(payment.createdAt),
            updatedAt: formatFirestoreTimestamp(payment.updatedAt)
          });
        });
      });

      const columns = locale === 'ar-SA' ? [
        { header: 'اسم الطالب', key: 'studentName', width: 25 },
        { header: 'اسم الطالب (إنجليزي)', key: 'studentNameEn', width: 25 },
        { header: 'اسم ولي الأمر', key: 'parentName', width: 25 },
        { header: 'البريد الإلكتروني لولي الأمر', key: 'parentEmail', width: 30 },
        { header: 'السنة الدراسية', key: 'academicYear', width: 15 },
        { header: 'إجمالي الرسوم', key: 'totalFees', width: 15 },
        { header: 'المبلغ المدفوع', key: 'paidAmount', width: 15 },
        { header: 'الرصيد المتبقي', key: 'remainingBalance', width: 15 },
        { header: 'تاريخ الإنشاء', key: 'createdAt', width: 20 },
        { header: 'آخر تحديث', key: 'updatedAt', width: 20 }
      ] : [
        { header: 'Student Name', key: 'studentName', width: 25 },
        { header: 'Student Name (English)', key: 'studentNameEn', width: 25 },
        { header: 'Parent Name', key: 'parentName', width: 25 },
        { header: 'Parent Email', key: 'parentEmail', width: 30 },
        { header: 'Academic Year', key: 'academicYear', width: 15 },
        { header: 'Total Fees', key: 'totalFees', width: 15 },
        { header: 'Paid Amount', key: 'paidAmount', width: 15 },
        { header: 'Remaining Balance', key: 'remainingBalance', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Updated At', key: 'updatedAt', width: 20 }
      ];

      await exportToExcel({
        fileName: locale === 'ar-SA' ? 'سجلات_الدفع' : 'payment_records',
        sheetName: locale === 'ar-SA' ? 'سجلات الدفع' : 'Payment Records',
        columns,
        data: exportData,
        locale
      });
    } catch (error) {
      console.error('Error exporting payment data:', error);
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
      border: '3px solid #2c3e50'
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
          <h1 style={{
            fontSize: '2.5rem',
            color: '#2c3e50',
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            💳 {locale === 'ar-SA' ? 'تتبع المدفوعات' : 'Payment Tracker'}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#7f8c8d',
            margin: 0
          }}>
            {locale === 'ar-SA' 
              ? 'إدارة وتتبع مدفوعات رسوم الطلاب'
              : 'Manage and track student fee payments'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleExportToExcel}
            disabled={isExporting || loading || parentSummaries.length === 0}
            style={{
              padding: '0.8rem 1.5rem',
              backgroundColor: isExporting || parentSummaries.length === 0 ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isExporting || parentSummaries.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
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
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '0.8rem 1.5rem',
              background: 'linear-gradient(135deg, #27ae60, #229954)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ➕ {locale === 'ar-SA' ? 'إضافة سجل دفع' : 'Add Payment Record'}
          </button>
          <button
            onClick={fetchPaymentSummaries}
            disabled={loading}
            style={{
              padding: '0.8rem 1.5rem',
              background: loading ? '#95a5a6' : 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 {loading 
              ? (locale === 'ar-SA' ? 'جاري التحديث...' : 'Refreshing...') 
              : (locale === 'ar-SA' ? 'تحديث' : 'Refresh')
            }
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#ffebee',
          border: '2px solid #f44336',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          color: '#d32f2f'
        }}>
          <strong>{locale === 'ar-SA' ? 'خطأ:' : 'Error:'}</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#7f8c8d'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🔄
          </div>
          <p style={{ fontSize: '1.2rem' }}>
            {locale === 'ar-SA' ? 'جاري تحميل البيانات...' : 'Loading payment data...'}
          </p>
        </div>
      )}

      {/* Payment Summaries */}
      {!loading && parentSummaries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#7f8c8d'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            marginBottom: '1rem'
          }}>
            {locale === 'ar-SA' ? 'لا توجد سجلات دفع' : 'No Payment Records'}
          </h3>
          <p style={{ fontSize: '1.1rem' }}>
            {locale === 'ar-SA' 
              ? 'لم يتم العثور على سجلات دفع للعام الدراسي المحدد'
              : 'No payment records found for the selected academic year'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {parentSummaries.map((parentSummary) => (
            <div key={parentSummary.parentInfo.uid} style={{
              border: '2px solid #bdc3c7',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {/* Parent Header */}
              <div
                onClick={() => toggleParentExpansion(parentSummary.parentInfo.uid)}
                style={{
                  background: 'linear-gradient(135deg, #34495e, #2c3e50)',
                  color: 'white',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.3rem'
                  }}>
                    👨‍👩‍👧‍👦 {parentSummary.parentInfo.displayName}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.8 }}>
                    📧 {parentSummary.parentInfo.email}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {parentSummary.children.length} {locale === 'ar-SA' ? 'طفل' : 'children'}
                  </span>
                  <span style={{
                    fontSize: '1.5rem',
                    transform: expandedParents.has(parentSummary.parentInfo.uid) ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▶️
                  </span>
                </div>
              </div>

              {/* Children Payment Details */}
              {expandedParents.has(parentSummary.parentInfo.uid) && (
                <div style={{ padding: '1.5rem' }}>
                  {parentSummary.children.map((payment) => (
                    <div key={payment.id} style={{
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                        <div>
                          <h4 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.2rem',
                            color: '#2c3e50'
                          }}>
                            👦 {locale === 'ar-SA' ? payment.studentInfo.name : payment.studentInfo.nameEn}
                          </h4>
                          <p style={{
                            margin: '0 0 0.3rem 0',
                            color: '#7f8c8d'
                          }}>
                            🆔 {locale === 'ar-SA' ? 'رقم الطالب:' : 'Student ID:'} {payment.studentId}
                          </p>
                          <p style={{
                            margin: 0,
                            color: '#7f8c8d'
                          }}>
                            📅 {locale === 'ar-SA' ? 'العام الدراسي:' : 'Academic Year:'} {payment.academicYear}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => {
                              setEditingPayment(payment);
                              setEditForm({
                                totalFees: payment.totalFees,
                                paidAmount: payment.paidAmount
                              });
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f39c12',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ {locale === 'ar-SA' ? 'تعديل' : 'Edit'}
                          </button>
                          <button
                            onClick={() => setShowAddPaymentRecord(payment.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#27ae60',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            💰 {locale === 'ar-SA' ? 'إضافة دفعة' : 'Add Payment'}
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ {locale === 'ar-SA' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: payment.paymentRecords?.length > 0 ? '1.5rem' : 0
                      }}>
                        <div style={{
                          background: '#e3f2fd',
                          padding: '1rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '2px solid #2196f3'
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
                          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>
                            {locale === 'ar-SA' ? 'إجمالي الرسوم' : 'Total Fees'}
                          </div>
                          <div style={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: '#2196f3'
                          }}>
                            {formatCurrency(payment.totalFees)}
                          </div>
                        </div>
                        <div style={{
                          background: '#e8f5e8',
                          padding: '1rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '2px solid #4caf50'
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
                          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>
                            {locale === 'ar-SA' ? 'المبلغ المدفوع' : 'Amount Paid'}
                          </div>
                          <div style={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: '#4caf50'
                          }}>
                            {formatCurrency(payment.paidAmount)}
                          </div>
                        </div>
                        <div style={{
                          background: payment.remainingBalance > 0 ? '#fff3e0' : '#e8f5e8',
                          padding: '1rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: `2px solid ${payment.remainingBalance > 0 ? '#ff9800' : '#4caf50'}`
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {payment.remainingBalance > 0 ? '⏰' : '✅'}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>
                            {locale === 'ar-SA' ? 'المبلغ المتبقي' : 'Remaining Balance'}
                          </div>
                          <div style={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: payment.remainingBalance > 0 ? '#ff9800' : '#4caf50'
                          }}>
                            {formatCurrency(payment.remainingBalance)}
                          </div>
                        </div>
                      </div>

                      {/* Payment Records */}
                      {payment.paymentRecords && payment.paymentRecords.length > 0 && (
                        <div>
                          <h5 style={{
                            margin: '0 0 1rem 0',
                            fontSize: '1.1rem',
                            color: '#2c3e50'
                          }}>
                            📝 {locale === 'ar-SA' ? 'سجل المدفوعات' : 'Payment History'}
                          </h5>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            {payment.paymentRecords.map((record) => (
                              <div key={record.id} style={{
                                background: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '6px',
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                              }}>
                                <div>
                                  <span style={{
                                    fontWeight: 'bold',
                                    color: '#27ae60'
                                  }}>
                                    {formatCurrency(record.amount)}
                                  </span>
                                  <span style={{
                                    margin: '0 1rem',
                                    color: '#7f8c8d'
                                  }}>
                                    📅 {formatDate(record.date)}
                                  </span>
                                  <span style={{
                                    background: '#f8f9fa',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    color: '#495057'
                                  }}>
                                    {record.method}
                                  </span>
                                </div>
                                {record.notes && (
                                  <div style={{
                                    fontSize: '0.9rem',
                                    color: '#6c757d',
                                    fontStyle: 'italic'
                                  }}>
                                    💬 {record.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#2c3e50'
            }}>
              ➕ {locale === 'ar-SA' ? 'إضافة سجل دفع جديد' : 'Add New Payment Record'}
            </h3>
            <form onSubmit={handleCreatePayment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'رقم الطالب' : 'Student ID'}
                </label>
                <input
                  type="text"
                  value={createForm.studentId}
                  onChange={(e) => setCreateForm({...createForm, studentId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'إجمالي الرسوم' : 'Total Fees'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={createForm.totalFees}
                  onChange={(e) => setCreateForm({...createForm, totalFees: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'المبلغ المدفوع' : 'Paid Amount'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={createForm.paidAmount}
                  onChange={(e) => setCreateForm({...createForm, paidAmount: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {locale === 'ar-SA' ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#2c3e50'
            }}>
              ✏️ {locale === 'ar-SA' ? 'تعديل سجل الدفع' : 'Edit Payment Record'}
            </h3>
            <form onSubmit={handleUpdatePayment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'إجمالي الرسوم' : 'Total Fees'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.totalFees}
                  onChange={(e) => setEditForm({...editForm, totalFees: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'المبلغ المدفوع' : 'Paid Amount'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.paidAmount}
                  onChange={(e) => setEditForm({...editForm, paidAmount: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#f39c12',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {locale === 'ar-SA' ? 'تحديث' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Record Modal */}
      {showAddPaymentRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#2c3e50'
            }}>
              💰 {locale === 'ar-SA' ? 'إضافة دفعة جديدة' : 'Add New Payment'}
            </h3>
            <form onSubmit={handleAddPaymentRecord}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'المبلغ' : 'Amount'}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={addRecordForm.amount}
                  onChange={(e) => setAddRecordForm({...addRecordForm, amount: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'تاريخ الدفع' : 'Payment Date'}
                </label>
                <input
                  type="date"
                  value={addRecordForm.date}
                  onChange={(e) => setAddRecordForm({...addRecordForm, date: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'طريقة الدفع' : 'Payment Method'}
                </label>
                <select
                  value={addRecordForm.method}
                  onChange={(e) => setAddRecordForm({...addRecordForm, method: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="cash">{locale === 'ar-SA' ? 'نقدي' : 'Cash'}</option>
                  <option value="bank_transfer">{locale === 'ar-SA' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                  <option value="credit_card">{locale === 'ar-SA' ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                  <option value="check">{locale === 'ar-SA' ? 'شيك' : 'Check'}</option>
                  <option value="other">{locale === 'ar-SA' ? 'أخرى' : 'Other'}</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  value={addRecordForm.notes}
                  onChange={(e) => setAddRecordForm({...addRecordForm, notes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder={locale === 'ar-SA' ? 'ملاحظات إضافية (اختياري)' : 'Additional notes (optional)'}
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddPaymentRecord(null)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {locale === 'ar-SA' ? 'إضافة' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}