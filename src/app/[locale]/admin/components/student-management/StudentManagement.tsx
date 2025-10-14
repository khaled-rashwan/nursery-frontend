'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { useAcademicYear } from '../../../../../components/academic-year';
import { StudentRegistration } from './StudentRegistration';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';

interface ParentInfo {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: string;
}

interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
  parentInfo: ParentInfo;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface PaymentInfo {
  remainingBalance: number;
  hasPaymentRecord: boolean;
}

interface StudentFormData {
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentUID: string;
}

interface StudentManagementProps {
  locale: string;
}

export function StudentManagement({ locale }: StudentManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<Map<string, PaymentInfo>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingInProgress, setEditingInProgress] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageInfo, setNextPageInfo] = useState<{
    hasNextPage: boolean;
    endCursor?: string;
    startAfterTimestamp?: number;
    startAfterName?: string;
  } | null>(null);
  
  const { user } = useAuth();
  const { selectedAcademicYear } = useAcademicYear();

  // Enhanced fetch students with filtering and pagination
  const fetchStudents = useCallback(async (resetPage = false) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      if (!token) throw new Error('No authentication token');

      // Build query parameters
      const params = new URLSearchParams({
        limit: studentsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }



      if (parentFilter !== 'all') {
        params.append('parentUID', parentFilter);
      }

      // Handle pagination
      if (!resetPage && nextPageInfo && currentPage > 1) {
        if (nextPageInfo.startAfterTimestamp) {
          params.append('startAfterTimestamp', nextPageInfo.startAfterTimestamp.toString());
        }
        if (nextPageInfo.startAfterName) {
          params.append('startAfterName', nextPageInfo.startAfterName);
        }
      }

      const response = await fetch(
        `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/listStudents?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (resetPage || currentPage === 1) {
        setStudents(data.students || []);
      } else {
        setStudents(prev => [...prev, ...(data.students || [])]);
      }
      
      setTotalCount(data.totalCount || 0);
      setNextPageInfo(data.nextPageInfo || null);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, parentFilter, sortBy, sortOrder, studentsPerPage, currentPage, nextPageInfo]);

  // Fetch payment data for students
  const fetchPaymentData = useCallback(async (studentList: Student[]) => {
    if (!user || !selectedAcademicYear || studentList.length === 0) return;

    try {
      const token = await user.getIdToken();
      const paymentMap = new Map<string, PaymentInfo>();

      // Fetch payment data for each student
      for (const student of studentList) {
        try {
          const url = new URL('https://us-central1-future-step-nursery.cloudfunctions.net/managePayments/getPayments');
          url.searchParams.append('studentId', student.id);
          url.searchParams.append('academicYear', selectedAcademicYear);

          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.payments && data.payments.length > 0) {
              const payment = data.payments[0]; // Get the first payment record
              paymentMap.set(student.id, {
                remainingBalance: payment.remainingBalance,
                hasPaymentRecord: true
              });
            } else {
              paymentMap.set(student.id, {
                remainingBalance: 0,
                hasPaymentRecord: false
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching payment for student ${student.id}:`, error);
          paymentMap.set(student.id, {
            remainingBalance: 0,
            hasPaymentRecord: false
          });
        }
      }

      setPaymentInfo(paymentMap);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  }, [user, selectedAcademicYear]);

  // Update payment data when students change
  useEffect(() => {
    if (students.length > 0) {
      fetchPaymentData(students);
    }
  }, [students, fetchPaymentData]);

  // Handle payment column click
  const handlePaymentClick = (student: Student, payment: PaymentInfo | undefined) => {
    // Store the target student ID for the payment tracker
    sessionStorage.setItem('targetStudentId', student.id);
    sessionStorage.setItem('hasPaymentRecord', payment?.hasPaymentRecord ? 'true' : 'false');
    
    // Navigate to payments tab in the admin dashboard
    const event = new CustomEvent('navigateToPayments', {
      detail: {
        studentId: student.id,
        hasPaymentRecord: payment?.hasPaymentRecord || false
      }
    });
    window.dispatchEvent(event);
  };

  // Create student
  const handleCreateStudent = async (studentData: StudentFormData) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/createStudent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ studentData })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student');
      }

      await response.json();
      
      // Refresh the student list
      await fetchStudents(true);
      setActiveSubTab('list');
      
      // Show success message
      alert(locale === 'ar-SA' ? 'تم إنشاء الطالب بنجاح' : 'Student created successfully');
      
    } catch (error) {
      console.error('Error creating student:', error);
      setError(error instanceof Error ? error.message : 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  // Update student
  const handleUpdateStudent = async (studentId: string, studentData: StudentFormData) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setEditingInProgress(studentId);
    setError(null);

    try {
      const token = await user.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/updateStudent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ studentId, studentData })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update student');
      }

      const data = await response.json();
      
      // Update the student in the list
      setStudents(prev => prev.map(student => 
        student.id === studentId ? data.student : student
      ));
      
      setEditingStudent(null);
      setActiveSubTab('list');
      
      // Show success message
      alert(locale === 'ar-SA' ? 'تم تحديث الطالب بنجاح' : 'Student updated successfully');
      
    } catch (error) {
      console.error('Error updating student:', error);
      setError(error instanceof Error ? error.message : 'Failed to update student');
    } finally {
      setEditingInProgress(null);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setEditingInProgress(studentId);
    setError(null);

    try {
      const token = await user.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(
        `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net/deleteStudent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ studentId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete student');
      }

      const data = await response.json();
      
      // Remove student from the list or refresh
      setStudents(prev => prev.filter(student => student.id !== studentId));
      setShowDeleteConfirm(null);
      
      // Show success message
      alert(
        data.softDelete 
          ? (locale === 'ar-SA' ? 'تم حذف الطالب (محفوظ للأرشيف)' : 'Student deleted (archived)')
          : (locale === 'ar-SA' ? 'تم حذف الطالب نهائياً' : 'Student permanently deleted')
      );
      
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete student');
    } finally {
      setEditingInProgress(null);
    }
  };

  // Filter and sort students
  useEffect(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentInfo.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentInfo.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply parent filter
    if (parentFilter !== 'all') {
      filtered = filtered.filter(student => student.parentUID === parentFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof Student] as string | number;
      let bValue: string | number = b[sortBy as keyof Student] as string | number;

      // Handle nested parentInfo sorting
      if (sortBy.startsWith('parentInfo.')) {
        const field = sortBy.split('.')[1] as keyof ParentInfo;
        aValue = a.parentInfo[field] as string || '';
        bValue = b.parentInfo[field] as string || '';
      }

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dateOfBirth') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'desc' ? -comparison : comparison;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, searchTerm, parentFilter, sortBy, sortOrder]);

  // Paginated students
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get unique parents for filter dropdown
  const uniqueParents = Array.from(
    new Map(students.map(s => [s.parentUID, s.parentInfo])).entries()
  ).map(([parentUID, info]) => ({ parentUID, ...info }));

  useEffect(() => {
    if (activeSubTab === 'list') {
      fetchStudents(true);
    }
  }, [activeSubTab, fetchStudents, searchTerm, parentFilter, sortBy, sortOrder]);

  return (
    <div>
      {/* Sub Navigation */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        border: '3px solid #34495e'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'list', label: locale === 'ar-SA' ? 'قائمة الطلاب' : 'Students List', icon: '📋' },
            { id: 'register', label: locale === 'ar-SA' ? 'تسجيل طالب جديد' : 'Register New Student', icon: '➕' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: activeSubTab === tab.id 
                  ? 'linear-gradient(135deg, #e67e22, #d35400)' 
                  : 'transparent',
                color: activeSubTab === tab.id ? 'white' : '#2c3e50',
                border: activeSubTab === tab.id ? 'none' : '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '2px solid #ef5350'
        }}>
          <strong>{locale === 'ar-SA' ? 'خطأ: ' : 'Error: '}</strong>{error}
        </div>
      )}

      {/* Students List */}
      {activeSubTab === 'list' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          border: '3px solid #3498db'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#2c3e50',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 {locale === 'ar-SA' ? 'قائمة الطلاب' : 'Students List'}
              <span style={{
                fontSize: '1rem',
                color: '#7f8c8d',
                fontWeight: 'normal'
              }}>
                ({totalCount} {locale === 'ar-SA' ? 'طالب' : 'students'})
              </span>
            </h2>

            <button
              onClick={() => {
                setEditingStudent(null);
                setActiveSubTab('register');
              }}
              style={{
                background: 'linear-gradient(135deg, #27ae60, #219a52)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ➕ {locale === 'ar-SA' ? 'إضافة طالب' : 'Add Student'}
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '10px',
            border: '2px solid #e9ecef'
          }}>
            {/* Search */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                🔍 {locale === 'ar-SA' ? 'البحث' : 'Search'}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  locale === 'ar-SA' 
                    ? 'البحث بالاسم أو بيانات ولي الأمر...' 
                    : 'Search by name or parent info...'
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Parent Filter */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                👨‍👩‍👧‍👦 {locale === 'ar-SA' ? 'ولي الأمر' : 'Parent'}
              </label>
              <select
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="all">{locale === 'ar-SA' ? 'جميع أولياء الأمور' : 'All Parents'}</option>
                {uniqueParents.map(parent => (
                  <option key={parent.parentUID} value={parent.parentUID}>
                    {parent.displayName} ({parent.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                📊 {locale === 'ar-SA' ? 'ترتيب حسب' : 'Sort By'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="fullName">{locale === 'ar-SA' ? 'الاسم' : 'Name'}</option>
                <option value="dateOfBirth">{locale === 'ar-SA' ? 'تاريخ الميلاد' : 'Birth Date'}</option>
                <option value="createdAt">{locale === 'ar-SA' ? 'تاريخ التسجيل' : 'Registration Date'}</option>
                <option value="parentInfo.displayName">{locale === 'ar-SA' ? 'اسم ولي الأمر' : 'Parent Name'}</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                🔄 {locale === 'ar-SA' ? 'الترتيب' : 'Order'}
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="asc">{locale === 'ar-SA' ? 'تصاعدي' : 'Ascending'}</option>
                <option value="desc">{locale === 'ar-SA' ? 'تنازلي' : 'Descending'}</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>{locale === 'ar-SA' ? 'جاري تحميل الطلاب...' : 'Loading students...'}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#7f8c8d'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍🎓</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
                {searchTerm || parentFilter !== 'all'
                  ? (locale === 'ar-SA' ? 'لا توجد نتائج' : 'No results found')
                  : (locale === 'ar-SA' ? 'لا توجد طلاب مسجلين' : 'No students registered')
                }
              </h3>
              <p style={{ color: '#95a5a6' }}>
                {searchTerm || parentFilter !== 'all'
                  ? (locale === 'ar-SA' ? 'حاول تغيير معايير البحث' : 'Try adjusting your search criteria')
                  : (locale === 'ar-SA' ? 'قم بتسجيل طلاب جدد' : 'Register new students to get started')
                }
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{...tableHeaderStyle, cursor: 'pointer'}} onClick={() => handleSort('fullName')}>
                        {locale === 'ar-SA' ? 'اسم الطالب' : 'Student Name'}
                        {sortBy === 'fullName' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </th>
                      <th style={{...tableHeaderStyle, cursor: 'pointer'}} onClick={() => handleSort('dateOfBirth')}>
                        {locale === 'ar-SA' ? 'تاريخ الميلاد' : 'Birth Date'}
                        {sortBy === 'dateOfBirth' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </th>
                      <th style={tableHeaderStyle}>
                        {locale === 'ar-SA' ? 'الرسوم المتبقية' : 'Remaining Payment'}
                      </th>
                      <th style={{...tableHeaderStyle, cursor: 'pointer'}} onClick={() => handleSort('parentInfo.displayName')}>
                        {locale === 'ar-SA' ? 'ولي الأمر' : 'Parent'}
                        {sortBy === 'parentInfo.displayName' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </th>
                      <th style={{...tableHeaderStyle, cursor: 'pointer'}} onClick={() => handleSort('createdAt')}>
                        {locale === 'ar-SA' ? 'تاريخ التسجيل' : 'Registration'}
                        {sortBy === 'createdAt' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </th>
                      <th style={tableHeaderStyle}>
                        {locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student) => (
                      <tr key={student.id}>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: student.gender === 'Male' ? '#3498db' : '#e91e63',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem'
                            }}>
                              {student.gender === 'Male' ? '👦' : '👧'}
                            </div>
                            <strong>{student.fullName}</strong>
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          {new Date(student.dateOfBirth).toLocaleDateString()}
                        </td>
                        <td style={{...tableCellStyle, cursor: 'pointer'}} onClick={() => handlePaymentClick(student, paymentInfo.get(student.id))}>
                          {(() => {
                            const payment = paymentInfo.get(student.id);
                            if (!payment) {
                              return (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  color: '#7f8c8d',
                                  fontSize: '0.9rem'
                                }}>
                                  ⏳ {locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}
                                </div>
                              );
                            }
                            
                            if (!payment.hasPaymentRecord) {
                              return (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  color: '#e67e22',
                                  fontWeight: 'bold'
                                }}>
                                  ➕ {locale === 'ar-SA' ? 'إنشاء سجل دفع' : 'Create Payment Record'}
                                </div>
                              );
                            }
                            
                            if (payment.remainingBalance === 0) {
                              return (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  color: '#27ae60',
                                  fontWeight: 'bold'
                                }}>
                                  ✅ {locale === 'ar-SA' ? 'مدفوع بالكامل' : 'Fully Paid'}
                                </div>
                              );
                            }
                            
                            return (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                color: '#e74c3c',
                                fontWeight: 'bold'
                              }}>
                                💰 {payment.remainingBalance} {locale === 'ar-SA' ? 'ج.م' : 'EGP'}
                              </div>
                            );
                          })()}
                        </td>
                        <td style={tableCellStyle}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {student.parentInfo.displayName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              {student.parentInfo.email}
                            </div>
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setActiveSubTab('register');
                              }}
                              disabled={editingInProgress === student.id}
                              style={{
                                background: '#f39c12',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(student.id)}
                              disabled={editingInProgress === student.id}
                              style={{
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.5rem',
                                cursor: 'pointer',
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '2rem',
                  padding: '1rem'
                }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '2px solid #3498db',
                      background: currentPage === 1 ? '#ecf0f1' : '#3498db',
                      color: currentPage === 1 ? '#95a5a6' : 'white',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← {locale === 'ar-SA' ? 'السابق' : 'Previous'}
                  </button>

                  <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                    {locale === 'ar-SA' ? 'صفحة' : 'Page'} {currentPage} {locale === 'ar-SA' ? 'من' : 'of'} {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '2px solid #3498db',
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
        </div>
      )}

      {/* Student Registration/Edit Form */}
      {activeSubTab === 'register' && (
        <StudentRegistration
          locale={locale}
          onSubmit={editingStudent 
            ? (data) => handleUpdateStudent(editingStudent.id, data)
            : handleCreateStudent
          }
          onCancel={() => {
            setActiveSubTab('list');
            setEditingStudent(null);
          }}
          loading={loading || editingInProgress !== null}
          initialData={editingStudent ? {
            fullName: editingStudent.fullName,
            dateOfBirth: editingStudent.dateOfBirth,
            gender: editingStudent.gender,
            parentUID: editingStudent.parentUID
          } : undefined}
          isEditing={!!editingStudent}
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
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>
              🗑️ {locale === 'ar-SA' ? 'حذف الطالب' : 'Delete Student'}
            </h3>
            <p style={{ marginBottom: '2rem', color: '#2c3e50' }}>
              {locale === 'ar-SA' 
                ? 'هل أنت متأكد من حذف هذا الطالب؟ هذا الإجراء لا يمكن التراجع عنه.'
                : 'Are you sure you want to delete this student? This action cannot be undone.'
              }
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #95a5a6',
                  background: 'transparent',
                  color: '#2c3e50',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm)}
                disabled={editingInProgress === showDeleteConfirm}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: '#e74c3c',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {editingInProgress === showDeleteConfirm 
                  ? (locale === 'ar-SA' ? 'جاري الحذف...' : 'Deleting...')
                  : (locale === 'ar-SA' ? 'حذف' : 'Delete')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
