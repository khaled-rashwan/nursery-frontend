'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { EnrollmentRegistration } from './EnrollmentRegistration';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';
import { enrollmentAPI, handleAPIError } from '../../services/api';
import { EnrollmentFormData } from '../../types/admin.types';

interface StudentInfo {
  uid: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
  parentInfo: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    role: string;
  };
}

interface TeacherInfo {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: string;
}

interface Enrollment {
  id: string;
  studentUID: string;
  academicYear: string;
  class: string;
  teacherUID: string;
  status: 'enrolled' | 'withdrawn' | 'graduated' | 'pending';
  notes: string;
  previousClass?: string;
  studentInfo: StudentInfo;
  teacherInfo: TeacherInfo;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface EnrollmentManagementProps {
  locale:string;
}

export function EnrollmentManagement({ locale }: EnrollmentManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [sortBy] = useState<keyof Enrollment>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [editingInProgress, setEditingInProgress] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<{
    totalEnrollments: number;
    activeEnrollments: number;
    byClass: Record<string, number>;
    byStatus: Record<string, number>;
  } | null>(null);

  const { user } = useAuth();
  const itemsPerPage = 10;

  // Get unique values for filters
  const uniqueStatuses = [...new Set(enrollments.map(e => e.status))];
  const uniqueClasses = [...new Set(enrollments.map(e => e.class))].sort();
  const uniqueAcademicYears = [...new Set(enrollments.map(e => e.academicYear))].sort().reverse();

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await enrollmentAPI.list(user, { limit: 100, includeDeleted: false });
      setEnrollments(data.enrollments || []);

      // Fetch statistics
      try {
        const statsData = await enrollmentAPI.getStats(user);
        setStatistics(statsData.statistics);
      } catch (statsError) {
        console.warn('Failed to fetch statistics:', statsError);
        // Don't fail the main operation if stats fail
      }

    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError(handleAPIError(error, locale));
    } finally {
      setLoading(false);
    }
  }, [user, locale]);

  // Create enrollment
  const handleCreateEnrollment = async (enrollmentData: EnrollmentFormData) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setEditingInProgress('creating');
    setError(null);

    try {
      const data = await enrollmentAPI.create(user, enrollmentData);
      setEnrollments(prev => [data.enrollment, ...prev]);
      setActiveSubTab('list');

      // Show success message
      alert(locale === 'ar-SA' ? 'تم إنشاء التسجيل بنجاح' : 'Enrollment created successfully');

    } catch (error) {
      console.error('Error creating enrollment:', error);
      setError(handleAPIError(error, locale));
    } finally {
      setEditingInProgress(null);
    }
  };

  // Update enrollment
  const handleUpdateEnrollment = async (enrollmentId: string, enrollmentData: Partial<EnrollmentFormData>) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setEditingInProgress(enrollmentId);
    setError(null);

    try {
      const data = await enrollmentAPI.update(user, enrollmentId, enrollmentData);
      
      // Update the enrollment in the list
      setEnrollments(prev => prev.map(enrollment =>
        enrollment.id === enrollmentId ? data.enrollment : enrollment
      ));
      
      setEditingEnrollment(null);
      setShowEnrollmentModal(false);

      // Show success message
      alert(locale === 'ar-SA' ? 'تم تحديث التسجيل بنجاح' : 'Enrollment updated successfully');

    } catch (error) {
      console.error('Error updating enrollment:', error);
      setError(handleAPIError(error, locale));
    } finally {
      setEditingInProgress(null);
    }
  };

  // Delete enrollment
  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setEditingInProgress(enrollmentId);
    setError(null);

    try {
      const data = await enrollmentAPI.delete(user, enrollmentId);

      // Remove the enrollment from the list
      setEnrollments(prev => prev.filter(enrollment => enrollment.id !== enrollmentId));
      setShowDeleteConfirm(null);

      // Show success message
      const message = data.softDelete 
        ? (locale === 'ar-SA' ? 'تم أرشفة التسجيل بنجاح' : 'Enrollment archived successfully')
        : (locale === 'ar-SA' ? 'تم حذف التسجيل بنجاح' : 'Enrollment deleted successfully');
      
      alert(message);

    } catch (error) {
      console.error('Error deleting enrollment:', error);
      setError(handleAPIError(error, locale));
    } finally {
      setEditingInProgress(null);
    }
  };

  // Load enrollments on component mount
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Filter and sort enrollments
  useEffect(() => {
    let filtered = [...enrollments];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(enrollment => 
        enrollment.studentInfo?.fullName?.toLowerCase().includes(searchLower) ||
        enrollment.academicYear.toLowerCase().includes(searchLower) ||
        enrollment.class.toLowerCase().includes(searchLower) ||
        enrollment.status.toLowerCase().includes(searchLower) ||
        enrollment.teacherInfo?.displayName?.toLowerCase().includes(searchLower) ||
        enrollment.studentInfo?.parentInfo?.email?.toLowerCase().includes(searchLower) ||
        enrollment.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.status === statusFilter);
    }

    // Apply class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.class === classFilter);
    }

    // Apply academic year filter
    if (academicYearFilter !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.academicYear === academicYearFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle nested properties
      if (sortBy === 'studentInfo') {
        aValue = a.studentInfo?.fullName || '';
        bValue = b.studentInfo?.fullName || '';
      } else if (sortBy === 'teacherInfo') {
        aValue = a.teacherInfo?.displayName || '';
        bValue = b.teacherInfo?.displayName || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      // Ensure aValue and bValue are not undefined for comparison
      const aComp = aValue !== undefined && aValue !== null ? aValue : '';
      const bComp = bValue !== undefined && bValue !== null ? bValue : '';
      if (aComp < bComp) return sortOrder === 'asc' ? -1 : 1;
      if (aComp > bComp) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEnrollments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [enrollments, searchTerm, statusFilter, classFilter, academicYearFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'withdrawn': return '#e74c3c';
      case 'graduated': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status: string) => {
    if (locale === 'ar-SA') {
      switch (status) {
        case 'enrolled': return 'مسجل';
        case 'pending': return 'معلق';
        case 'withdrawn': return 'منسحب';
        case 'graduated': return 'متخرج';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && enrollments.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>
          {locale === 'ar-SA' ? 'جاري تحميل التسجيلات...' : 'Loading enrollments...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header with Statistics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: '#2c3e50',
          fontSize: '1.8rem',
          fontWeight: '600'
        }}>
          {locale === 'ar-SA' ? 'إدارة التسجيلات' : 'Enrollment Management'}
        </h2>

        {statistics && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              background: '#3498db', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statistics.totalEnrollments}</div>
              <div>{locale === 'ar-SA' ? 'إجمالي التسجيلات' : 'Total Enrollments'}</div>
            </div>
            <div style={{ 
              background: '#27ae60', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statistics.activeEnrollments}</div>
              <div>{locale === 'ar-SA' ? 'التسجيلات النشطة' : 'Active Enrollments'}</div>
            </div>
            <div style={{ 
              background: '#9b59b6', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Object.keys(statistics.byClass).length}</div>
              <div>{locale === 'ar-SA' ? 'الفصول النشطة' : 'Active Classes'}</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          borderBottom: '2px solid #ecf0f1',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setActiveSubTab('list')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeSubTab === 'list' ? '#3498db' : 'transparent',
              color: activeSubTab === 'list' ? 'white' : '#3498db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '1rem'
            }}
          >
            {locale === 'ar-SA' ? 'قائمة التسجيلات' : 'Enrollment List'}
          </button>
          <button
            onClick={() => setActiveSubTab('register')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeSubTab === 'register' ? '#27ae60' : 'transparent',
              color: activeSubTab === 'register' ? 'white' : '#27ae60',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '1rem'
            }}
          >
            ➕ {locale === 'ar-SA' ? 'تسجيل جديد' : 'New Enrollment'}
          </button>
        </div>
      </div>

      {/* Enrollment List View */}
      {activeSubTab === 'list' && (
        <>
          {/* Filters and Search */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem',
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                {locale === 'ar-SA' ? 'البحث' : 'Search'}
              </label>
              <input
                type="text"
                placeholder={locale === 'ar-SA' ? 'ابحث في التسجيلات...' : 'Search enrollments...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                {locale === 'ar-SA' ? 'الحالة' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="all">{locale === 'ar-SA' ? 'جميع الحالات' : 'All Statuses'}</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                {locale === 'ar-SA' ? 'الفصل' : 'Class'}
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="all">{locale === 'ar-SA' ? 'جميع الفصول' : 'All Classes'}</option>
                {uniqueClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                {locale === 'ar-SA' ? 'العام الدراسي' : 'Academic Year'}
              </label>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="all">{locale === 'ar-SA' ? 'جميع الأعوام' : 'All Years'}</option>
                {uniqueAcademicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ 
            marginBottom: '1rem', 
            padding: '1rem',
            background: '#e8f4f8',
            borderRadius: '6px',
            border: '1px solid #bee5eb'
          }}>
            <div style={{ fontWeight: '500', color: '#0c5460' }}>
              {locale === 'ar-SA' 
                ? `عرض ${paginatedEnrollments.length} من أصل ${filteredEnrollments.length} تسجيل`
                : `Showing ${paginatedEnrollments.length} of ${filteredEnrollments.length} enrollments`}
            </div>
          </div>

          {/* Enrollment Table */}
          <div style={{ 
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={tableHeaderStyle}>
                    {locale === 'ar-SA' ? 'الطالب' : 'Student'}
                  </th>
                  <th style={tableHeaderStyle}>
                    {locale === 'ar-SA' ? 'العام الدراسي' : 'Academic Year'}
                  </th>
                  <th style={tableHeaderStyle}>
                    {locale === 'ar-SA' ? 'الفصل' : 'Class'}
                  </th>
                  <th style={tableHeaderStyle}>
                    {locale === 'ar-SA' ? 'المعلم' : 'Teacher'}
                  </th>
                  <th style={tableHeaderStyle}>
                    {locale === 'ar-SA' ? 'الحالة' : 'Status'}
                  </th>
                  <th style={tableHeaderStyle}>
                    {locale === 'ar-SA' ? 'تاريخ التسجيل' : 'Enrollment Date'}
                  </th>
                  <th style={tableHeaderStyle}>
                    {locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tableCellStyle}>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {enrollment.studentInfo?.fullName || 'Unknown Student'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {enrollment.studentInfo?.parentInfo?.displayName || 'Unknown Parent'}
                        </div>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: '#e8f4f8',
                        color: '#0c5460'
                      }}>
                        {enrollment.academicYear}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: '#f0f8ff',
                        color: '#0066cc'
                      }}>
                        {enrollment.class}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {enrollment.teacherInfo?.displayName || 'Unknown Teacher'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {enrollment.teacherInfo?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: getStatusColor(enrollment.status) + '20',
                        color: getStatusColor(enrollment.status)
                      }}>
                        {getStatusLabel(enrollment.status)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      {new Date(enrollment.enrollmentDate).toLocaleDateString(
                        locale === 'ar-SA' ? 'ar-SA' : 'en-US'
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setEditingEnrollment(enrollment);
                            setShowEnrollmentModal(true);
                          }}
                          disabled={editingInProgress === enrollment.id}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: 'none',
                            background: '#3498db',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: editingInProgress === enrollment.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(enrollment.id)}
                          disabled={editingInProgress === enrollment.id}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: 'none',
                            background: '#e74c3c',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: editingInProgress === enrollment.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedEnrollments.length === 0 && (
              <div style={{ 
                padding: '3rem', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '1.1rem'
              }}>
                {locale === 'ar-SA' ? 'لا توجد تسجيلات مطابقة للفلاتر المحددة' : 'No enrollments match the selected filters'}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  background: currentPage === 1 ? '#ecf0f1' : '#3498db',
                  color: currentPage === 1 ? '#95a5a6' : 'white',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← {locale === 'ar-SA' ? 'السابق' : 'Previous'}
              </button>

              <span style={{ 
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                {locale === 'ar-SA' 
                  ? `صفحة ${currentPage} من ${totalPages}`
                  : `Page ${currentPage} of ${totalPages}`}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  background: currentPage === totalPages ? '#ecf0f1' : '#3498db',
                  color: currentPage === totalPages ? '#95a5a6' : 'white',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                {locale === 'ar-SA' ? 'التالي' : 'Next'} →
              </button>
            </div>
          )}
        </>
      )}

      {/* Enrollment Registration Form */}
      {(activeSubTab === 'register' || showEnrollmentModal) && (
        <EnrollmentRegistration
          locale={locale}
          onSubmit={editingEnrollment
            ? (data) => handleUpdateEnrollment(editingEnrollment.id, data)
            : handleCreateEnrollment
          }
          onCancel={() => {
            if (showEnrollmentModal) {
              setShowEnrollmentModal(false);
              setEditingEnrollment(null);
            } else {
              setActiveSubTab('list');
            }
          }}
          loading={loading || editingInProgress !== null}
          initialData={editingEnrollment ? {
            studentUID: editingEnrollment.studentUID,
            academicYear: editingEnrollment.academicYear,
            class: editingEnrollment.class,
            status: editingEnrollment.status,
            notes: editingEnrollment.notes,
            previousClass: editingEnrollment.previousClass
          } : undefined}
          isEditing={!!editingEnrollment}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e74c3c' }}>
              {locale === 'ar-SA' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h3>
            <p style={{ margin: '0 0 2rem 0', color: '#666' }}>
              {locale === 'ar-SA' 
                ? 'هل أنت متأكد من أنك تريد حذف هذا التسجيل؟ قد يتم أرشفة التسجيل بدلاً من حذفه نهائياً.'
                : 'Are you sure you want to delete this enrollment? The enrollment may be archived instead of permanently deleted.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#666',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDeleteEnrollment(showDeleteConfirm)}
                disabled={editingInProgress === showDeleteConfirm}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: '#e74c3c',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: editingInProgress === showDeleteConfirm ? 'not-allowed' : 'pointer'
                }}
              >
                {editingInProgress === showDeleteConfirm 
                  ? (locale === 'ar-SA' ? 'جاري الحذف...' : 'Deleting...')
                  : (locale === 'ar-SA' ? 'حذف' : 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
