'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { teacherAPI, classAPI, handleAPIError } from '../../services/api';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';
import { useAcademicYear } from '../../../../../contexts/AcademicYearContext';
import { exportToExcel, formatFirestoreTimestamp } from '../../../../../utils/excelExport';

interface ClassInfo {
  classId: string;
  className: string;
  academicYear?: string;
  subjects: string[];
}

interface AvailableClass {
  id: string;
  name: string;
  level: string;
  academicYear?: string;
  subjects?: string[];
}

interface Teacher {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  disabled?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  lastSignIn?: string;
  classes?: ClassInfo[];
  assignedAt?: unknown;
  updatedAt?: unknown;
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
  const [showClassAssignment, setShowClassAssignment] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Use global academic year context
  const { selectedAcademicYear } = useAcademicYear();
  // Keep showAllYears as local state since it's specific to teacher management
  const [showAllYears, setShowAllYears] = useState(false);

  const { user } = useAuth();

  // Filter teacher classes by academic year
  const getFilteredTeacherClasses = (teacher: Teacher) => {
    if (showAllYears || !teacher.classes) {
      return teacher.classes || [];
    }
    return teacher.classes.filter(classInfo => 
      classInfo.academicYear === selectedAcademicYear
    );
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleViewTeacher = async (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleAssignClasses = async (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowClassAssignment(true);
  };

  const handleTeacherUpdate = async (teacherData: { classes?: ClassInfo[] }) => {
    if (!editingTeacher || !user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await teacherAPI.updateTeacherData(user, editingTeacher.id, teacherData);
      setSuccess(response.message || 'Teacher updated successfully');
      fetchTeachers();
      setShowForm(false);
      setShowClassAssignment(false);
      setEditingTeacher(null);
    } catch (error) {
      setError(handleAPIError(error, locale));
    } finally {
      setLoading(false);
    }
  };

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

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    try {
      const data = await classAPI.list(user, {});
      setAvailableClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAvailableClasses([]);
    }
  }, [user]);

  const handleExportToExcel = async () => {
    if (teachers.length === 0) {
      alert(locale === 'ar-SA' ? 'لا توجد بيانات للتصدير' : 'No data available to export');
      return;
    }

    setIsExporting(true);
    try {
      const exportData = teachers.map(teacher => {
        const filteredClasses = getFilteredTeacherClasses(teacher);
        return {
          teacherId: teacher.id,
          displayName: teacher.displayName,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber || '',
          numberOfClasses: filteredClasses.length,
          classes: filteredClasses.map(c => c.className).join(', '),
          disabled: teacher.disabled ? 'Yes' : 'No',
          createdAt: teacher.createdAt ? formatFirestoreTimestamp(teacher.createdAt) : ''
        };
      });

      const columns = locale === 'ar-SA' ? [
        { header: 'معرف المعلم', key: 'teacherId', width: 30 },
        { header: 'الاسم', key: 'displayName', width: 25 },
        { header: 'البريد الإلكتروني', key: 'email', width: 30 },
        { header: 'رقم الهاتف', key: 'phoneNumber', width: 20 },
        { header: 'عدد الصفوف', key: 'numberOfClasses', width: 12 },
        { header: 'الصفوف', key: 'classes', width: 40 },
        { header: 'معطل', key: 'disabled', width: 10 },
        { header: 'تاريخ الإنشاء', key: 'createdAt', width: 20 }
      ] : [
        { header: 'Teacher ID', key: 'teacherId', width: 30 },
        { header: 'Display Name', key: 'displayName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone Number', key: 'phoneNumber', width: 20 },
        { header: 'Number of Classes', key: 'numberOfClasses', width: 12 },
        { header: 'Classes', key: 'classes', width: 40 },
        { header: 'Disabled', key: 'disabled', width: 10 },
        { header: 'Created At', key: 'createdAt', width: 20 }
      ];

      await exportToExcel({
        fileName: locale === 'ar-SA' ? 'المعلمون' : 'teachers',
        sheetName: locale === 'ar-SA' ? 'المعلمون' : 'Teachers',
        columns,
        data: exportData,
        locale
      });
    } catch (error) {
      console.error('Error exporting teachers:', error);
      alert(locale === 'ar-SA' ? 'فشل تصدير البيانات' : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, [fetchTeachers, fetchClasses]);

  return (
    <div style={{ 
      background: 'white', 
      padding: '2rem', 
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      border: '1px solid #e9ecef'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '1rem'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            👨‍🏫 {locale === 'ar-SA' ? 'إدارة المعلمين' : 'Teacher Management'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleExportToExcel}
            disabled={isExporting || loading || teachers.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isExporting || teachers.length === 0 ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isExporting || teachers.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
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
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#7f8c8d',
            padding: '0.5rem 1rem',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            💡 {locale === 'ar-SA' ? 'لإضافة معلم جديد، استخدم إدارة المستخدمين' : 'To add new teachers, use User Management'}
          </div>
        </div>
      </div>

      {/* Local Filter Options */}
      <div style={{
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
          📅 {locale === 'ar-SA' ? 'خيارات التصفية:' : 'Filter Options:'}
        </span>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          background: showAllYears ? '#e3f2fd' : 'white',
          border: `2px solid ${showAllYears ? '#2196f3' : '#ddd'}`,
          borderRadius: '6px',
          transition: 'all 0.3s ease'
        }}>
          <input
            type="checkbox"
            checked={showAllYears}
            onChange={(e) => setShowAllYears(e.target.checked)}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
            {locale === 'ar-SA' ? 'عرض جميع السنوات' : 'Show All Years'}
          </span>
        </label>
        <div style={{
          fontSize: '0.8rem',
          color: '#7f8c8d',
          padding: '0.25rem 0.5rem',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px'
        }}>
          {showAllYears 
            ? (locale === 'ar-SA' ? 'عرض فصول جميع السنوات' : 'Showing classes from all years')
            : (locale === 'ar-SA' ? `عرض فصول ${selectedAcademicYear}` : `Showing classes from ${selectedAcademicYear}`)
          }
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '1rem',
          background: '#ffebee',
          border: '2px solid #f44336',
          borderRadius: '8px',
          color: '#d32f2f',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div style={{
          padding: '1rem',
          background: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          color: '#2e7d32',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: '#7f8c8d',
          fontSize: '1.1rem'
        }}>
          ⏳ {locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={tableHeaderStyle}>
                  {locale === 'ar-SA' ? 'المعلم' : 'Teacher'}
                </th>
                <th style={tableHeaderStyle}>
                  {locale === 'ar-SA' ? 'معلومات الاتصال' : 'Contact Info'}
                </th>
                <th style={tableHeaderStyle}>
                  {locale === 'ar-SA' ? 'الفصول المعينة' : 'Assigned Classes'}
                </th>
                <th style={tableHeaderStyle}>
                  {locale === 'ar-SA' ? 'الحالة' : 'Status'}
                </th>
                <th style={tableHeaderStyle}>
                  {locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => (
                <tr key={teacher.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  {/* Teacher Info */}
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: teacher.photoURL ? 'transparent' : '#3498db',
                        backgroundImage: teacher.photoURL ? `url(${teacher.photoURL})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        border: '3px solid #ecf0f1'
                      }}>
                        {!teacher.photoURL && '👨‍🏫'}
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold', 
                          color: '#2c3e50',
                          marginBottom: '0.25rem'
                        }}>
                          {teacher.displayName}
                        </div>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#7f8c8d'
                        }}>
                          {teacher.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td style={tableCellStyle}>
                    <div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#2c3e50',
                        marginBottom: '0.25rem'
                      }}>
                        📞 {teacher.phoneNumber || (locale === 'ar-SA' ? 'غير محدد' : 'Not provided')}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        background: teacher.emailVerified ? '#e8f5e8' : '#fff3cd',
                        border: `1px solid ${teacher.emailVerified ? '#4caf50' : '#ffc107'}`,
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: teacher.emailVerified ? '#2e7d32' : '#856404'
                      }}>
                        {teacher.emailVerified ? '✅' : '⚠️'}
                        {teacher.emailVerified 
                          ? (locale === 'ar-SA' ? 'محقق' : 'Verified')
                          : (locale === 'ar-SA' ? 'غير محقق' : 'Unverified')
                        }
                      </div>
                    </div>
                  </td>

                  {/* Classes */}
                  <td style={tableCellStyle}>
                    {(() => {
                      const filteredClasses = getFilteredTeacherClasses(teacher);
                      return filteredClasses.length > 0 ? (
                        <div>
                          {filteredClasses.map((classInfo, index) => (
                            <div key={index} style={{
                              display: 'inline-block',
                              margin: '0.25rem',
                              padding: '0.5rem 0.75rem',
                              background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                              color: 'white',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              🏫 {classInfo.className}
                              {classInfo.academicYear && (
                                <div style={{ fontSize: '0.7rem', marginTop: '0.1rem', opacity: 0.9 }}>
                                  📅 {classInfo.academicYear}
                                </div>
                              )}
                              <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                📚 {classInfo.subjects.join(', ')}
                              </div>
                            </div>
                          ))}
                          {!showAllYears && teacher.classes && teacher.classes.length > filteredClasses.length && (
                            <div style={{
                              display: 'inline-block',
                              margin: '0.25rem',
                              padding: '0.5rem 0.75rem',
                              background: '#95a5a6',
                              color: 'white',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontStyle: 'italic'
                            }}>
                              +{teacher.classes.length - filteredClasses.length} {locale === 'ar-SA' ? 'سنوات أخرى' : 'other years'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: '#95a5a6', 
                          fontStyle: 'italic'
                        }}>
                          📝 {showAllYears ? 
                            (locale === 'ar-SA' ? 'لم يتم تعيين فصول' : 'No classes assigned') :
                            (locale === 'ar-SA' ? `لا توجد فصول للعام ${selectedAcademicYear}` : `No classes for ${selectedAcademicYear}`)}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Status */}
                  <td style={tableCellStyle}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.75rem',
                      background: teacher.disabled ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {teacher.disabled ? '🚫' : '✅'}
                      {teacher.disabled 
                        ? (locale === 'ar-SA' ? 'معطل' : 'Disabled')
                        : (locale === 'ar-SA' ? 'نشط' : 'Active')
                      }
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleViewTeacher(teacher)}
                        style={{ 
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #3498db, #2980b9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(52, 152, 219, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(52, 152, 219, 0.3)';
                        }}
                      >
                        👁️ {locale === 'ar-SA' ? 'عرض' : 'View'}
                      </button>
                      <button 
                        onClick={() => handleAssignClasses(teacher)}
                        style={{ 
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(243, 156, 18, 0.3)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(243, 156, 18, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(243, 156, 18, 0.3)';
                        }}
                      >
                        📚 {locale === 'ar-SA' ? 'تعيين فصول' : 'Assign Classes'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {teachers.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#7f8c8d',
              background: '#f8f9fa',
              borderRadius: '8px',
              margin: '1rem 0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {locale === 'ar-SA' ? 'لا يوجد معلمون حاليًا' : 'No Teachers Found'}
              </div>
              <div style={{ fontSize: '1rem' }}>
                {locale === 'ar-SA' ? 'استخدم إدارة المستخدمين لإضافة معلمين جدد' : 'Use User Management to add new teachers'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TeacherDetailsModal
          locale={locale}
          teacher={editingTeacher}
          onClose={() => setShowForm(false)}
          onUpdate={handleTeacherUpdate}
          loading={loading}
        />
      )}

      {showClassAssignment && (
        <ClassAssignmentModal
          locale={locale}
          teacher={editingTeacher}
          availableClasses={availableClasses}
          onClose={() => setShowClassAssignment(false)}
          onUpdate={handleTeacherUpdate}
          loading={loading}
        />
      )}
    </div>
  );
}

interface TeacherDetailsModalProps {
    locale: string;
    teacher: Teacher | null;
    onClose: () => void;
    onUpdate: (data: { classes?: ClassInfo[] }) => void;
    loading: boolean;
}

function TeacherDetailsModal({ locale, teacher, onClose }: TeacherDetailsModalProps) {
    if (!teacher) return null;

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
        }}>
            <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '12px', 
                width: '700px', 
                maxHeight: '85vh', 
                overflow: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                border: '1px solid #e9ecef'
            }}>
                {/* Header */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem',
                    borderBottom: '2px solid #e9ecef',
                    paddingBottom: '1rem'
                }}>
                    <h3 style={{ 
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        👨‍🏫 {locale === 'ar-SA' ? 'تفاصيل المعلم' : 'Teacher Details'}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                            color: 'white',
                            border: 'none', 
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(231, 76, 60, 0.3)';
                        }}
                    >
                        ×
                    </button>
                </div>
                
                {/* Teacher Profile */}
                <div style={{ 
                    marginBottom: '2rem',
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: teacher.photoURL ? 'transparent' : '#3498db',
                            backgroundImage: teacher.photoURL ? `url(${teacher.photoURL})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            border: '4px solid white',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>
                            {!teacher.photoURL && '👨‍🏫'}
                        </div>
                        <div>
                            <h4 style={{ 
                                margin: '0 0 0.5rem 0',
                                fontSize: '1.4rem',
                                fontWeight: 'bold',
                                color: '#2c3e50'
                            }}>
                                {teacher.displayName}
                            </h4>
                            <div style={{ 
                                fontSize: '1rem',
                                color: '#7f8c8d',
                                marginBottom: '0.5rem'
                            }}>
                                📧 {teacher.email}
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                background: teacher.disabled ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {teacher.disabled ? '🚫' : '✅'}
                                {teacher.disabled 
                                    ? (locale === 'ar-SA' ? 'معطل' : 'Disabled')
                                    : (locale === 'ar-SA' ? 'نشط' : 'Active')
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div style={{ 
                    marginBottom: '2rem',
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h4 style={{ 
                        margin: '0 0 1rem 0',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📞 {locale === 'ar-SA' ? 'معلومات الاتصال' : 'Contact Information'}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ 
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                        }}>
                            <strong style={{ color: '#2c3e50' }}>
                                {locale === 'ar-SA' ? 'رقم الهاتف:' : 'Phone Number:'}
                            </strong>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#34495e' }}>
                                {teacher.phoneNumber || (locale === 'ar-SA' ? 'غير محدد' : 'Not provided')}
                            </p>
                        </div>
                        <div style={{ 
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                        }}>
                            <strong style={{ color: '#2c3e50' }}>
                                {locale === 'ar-SA' ? 'حالة البريد الإلكتروني:' : 'Email Status:'}
                            </strong>
                            <p style={{ 
                                margin: '0.5rem 0 0 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    background: teacher.emailVerified ? '#e8f5e8' : '#fff3cd',
                                    border: `1px solid ${teacher.emailVerified ? '#4caf50' : '#ffc107'}`,
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    color: teacher.emailVerified ? '#2e7d32' : '#856404'
                                }}>
                                    {teacher.emailVerified ? '✅' : '⚠️'}
                                    {teacher.emailVerified 
                                        ? (locale === 'ar-SA' ? 'محقق' : 'Verified')
                                        : (locale === 'ar-SA' ? 'غير محقق' : 'Unverified')
                                    }
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Assigned Classes */}
                <div style={{ 
                    marginBottom: '2rem',
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h4 style={{ 
                        margin: '0 0 1rem 0',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🏫 {locale === 'ar-SA' ? 'الفصول المعينة' : 'Assigned Classes'}
                    </h4>
                    {teacher.classes && teacher.classes.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            {teacher.classes.map((classInfo, index) => (
                                <div key={index} style={{ 
                                    border: '1px solid #e9ecef', 
                                    padding: '1rem', 
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                                    color: 'white',
                                    boxShadow: '0 2px 4px rgba(243, 156, 18, 0.2)'
                                }}>
                                    <div style={{ 
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        🏫 {classInfo.className}
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        📚 <strong>{locale === 'ar-SA' ? 'المواد:' : 'Subjects:'}</strong> {classInfo.subjects.join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center',
                            padding: '2rem',
                            color: '#7f8c8d',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px dashed #bdc3c7'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                            <p style={{ margin: 0, fontSize: '1rem' }}>
                                {locale === 'ar-SA' ? 'لم يتم تعيين فصول بعد' : 'No classes assigned yet'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Additional Information */}
                <div style={{ 
                    marginBottom: '2rem',
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h4 style={{ 
                        margin: '0 0 1rem 0',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ℹ️ {locale === 'ar-SA' ? 'معلومات إضافية' : 'Additional Information'}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div style={{ 
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
                            <strong style={{ color: '#2c3e50', fontSize: '0.9rem' }}>
                                {locale === 'ar-SA' ? 'تاريخ الإنشاء' : 'Created'}
                            </strong>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#34495e' }}>
                                {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div style={{ 
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🕐</div>
                            <strong style={{ color: '#2c3e50', fontSize: '0.9rem' }}>
                                {locale === 'ar-SA' ? 'آخر تسجيل دخول' : 'Last Login'}
                            </strong>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#34495e' }}>
                                {teacher.lastSignIn ? new Date(teacher.lastSignIn).toLocaleDateString() : (locale === 'ar-SA' ? 'أبداً' : 'Never')}
                            </p>
                        </div>
                        <div style={{ 
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🆔</div>
                            <strong style={{ color: '#2c3e50', fontSize: '0.9rem' }}>
                                {locale === 'ar-SA' ? 'معرف المستخدم' : 'User ID'}
                            </strong>
                            <p style={{ 
                                margin: '0.25rem 0 0 0', 
                                fontSize: '0.8rem', 
                                color: '#34495e',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                            }}>
                                {teacher.uid}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '1rem',
                    borderTop: '1px solid #e9ecef',
                    paddingTop: '1rem'
                }}>
                    <button 
                        onClick={onClose}
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(149, 165, 166, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(149, 165, 166, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(149, 165, 166, 0.3)';
                        }}
                    >
                        {locale === 'ar-SA' ? 'إغلاق' : 'Close'}
                    </button>
                    <button 
                        onClick={() => {
                            onClose();
                            // Open class assignment modal - we'll need to pass this through props
                            alert(locale === 'ar-SA' ? 'سيتم تطبيق تعيين الفصول قريباً' : 'Class assignment will be implemented soon');
                        }}
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(243, 156, 18, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(243, 156, 18, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(243, 156, 18, 0.3)';
                        }}
                    >
                        📚 {locale === 'ar-SA' ? 'تعيين فصول' : 'Assign Classes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ClassAssignmentModalProps {
    locale: string;
    teacher: Teacher | null;
    availableClasses: AvailableClass[];
    onClose: () => void;
    onUpdate: (data: { classes?: ClassInfo[] }) => void;
    loading: boolean;
}

function ClassAssignmentModal({ locale, teacher, availableClasses, onClose, onUpdate }: ClassAssignmentModalProps) {
    const [selectedClasses, setSelectedClasses] = useState<ClassInfo[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (teacher && teacher.classes) {
            setSelectedClasses([...teacher.classes]);
        } else {
            setSelectedClasses([]);
        }
    }, [teacher]);

    if (!teacher) return null;

    const handleAddClass = () => {
        setSelectedClasses([...selectedClasses, { classId: '', className: '', academicYear: '', subjects: [''] }]);
    };

    const handleRemoveClass = (index: number) => {
        const newClasses = selectedClasses.filter((_: ClassInfo, i: number) => i !== index);
        setSelectedClasses(newClasses);
    };

    const handleClassChange = (index: number, field: string, value: string | string[]) => {
        const newClasses = [...selectedClasses];
        if (field === 'classId' && typeof value === 'string') {
            const selectedClass = availableClasses.find(c => c.id === value);
            newClasses[index] = {
                ...newClasses[index],
                classId: value,
                className: selectedClass?.name || '',
                academicYear: selectedClass?.academicYear || ''
            };
        } else if (field === 'subjects') {
            newClasses[index] = {
                ...newClasses[index],
                subjects: Array.isArray(value) ? value : [value]
            };
        }
        setSelectedClasses(newClasses);
    };

    const handleSubjectChange = (classIndex: number, subjectIndex: number, value: string) => {
        const newClasses = [...selectedClasses];
        const newSubjects = [...newClasses[classIndex].subjects];
        newSubjects[subjectIndex] = value;
        newClasses[classIndex] = {
            ...newClasses[classIndex],
            subjects: newSubjects
        };
        setSelectedClasses(newClasses);
    };

    const handleAddSubject = (classIndex: number) => {
        const newClasses = [...selectedClasses];
        newClasses[classIndex] = {
            ...newClasses[classIndex],
            subjects: [...newClasses[classIndex].subjects, '']
        };
        setSelectedClasses(newClasses);
    };

    const handleRemoveSubject = (classIndex: number, subjectIndex: number) => {
        const newClasses = [...selectedClasses];
        const newSubjects = newClasses[classIndex].subjects.filter((_: string, i: number) => i !== subjectIndex);
        newClasses[classIndex] = {
            ...newClasses[classIndex],
            subjects: newSubjects
        };
        setSelectedClasses(newClasses);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter out classes with no classId or empty subjects
            const validClasses = selectedClasses.filter((c: ClassInfo) => 
                c.classId && 
                c.subjects && 
                c.subjects.length > 0 && 
                c.subjects.some((s: string) => s.trim())
            ).map((c: ClassInfo) => ({
                ...c,
                subjects: c.subjects.filter((s: string) => s.trim())
            }));

            await onUpdate({ classes: validClasses });
            onClose();
        } catch (error) {
            console.error('Error updating teacher classes:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
        }}>
            <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '12px', 
                width: '800px', 
                maxHeight: '85vh', 
                overflow: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                border: '1px solid #e9ecef'
            }}>
                {/* Header */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem',
                    borderBottom: '2px solid #e9ecef',
                    paddingBottom: '1rem'
                }}>
                    <h3 style={{ 
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📚 {locale === 'ar-SA' ? `تعيين فصول - ${teacher.displayName}` : `Assign Classes - ${teacher.displayName}`}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                            color: 'white',
                            border: 'none', 
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(231, 76, 60, 0.3)';
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Current Classes */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '1rem' 
                    }}>
                        <h4 style={{ 
                            margin: 0,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#2c3e50',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            🏫 {locale === 'ar-SA' ? 'الفصول المعينة' : 'Assigned Classes'}
                        </h4>
                        <button
                            onClick={handleAddClass}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(39, 174, 96, 0.3)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(39, 174, 96, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(39, 174, 96, 0.3)';
                            }}
                        >
                            ➕ {locale === 'ar-SA' ? 'إضافة فصل' : 'Add Class'}
                        </button>
                    </div>

                    {selectedClasses.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center',
                            padding: '2rem',
                            color: '#7f8c8d',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px dashed #bdc3c7'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                            <p style={{ margin: 0, fontSize: '1rem' }}>
                                {locale === 'ar-SA' ? 'لا توجد فصول معينة حتى الآن' : 'No classes assigned yet'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {selectedClasses.map((classInfo, classIndex) => (
                                <div key={classIndex} style={{
                                    border: '2px solid #e9ecef',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    background: '#f8f9fa'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: '1rem'
                                    }}>
                                        <h5 style={{ 
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            color: '#2c3e50'
                                        }}>
                                            🏫 {locale === 'ar-SA' ? `فصل ${classIndex + 1}` : `Class ${classIndex + 1}`}
                                        </h5>
                                        <button
                                            onClick={() => handleRemoveClass(classIndex)}
                                            style={{
                                                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Class Selection */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: 'bold',
                                            color: '#2c3e50'
                                        }}>
                                            {locale === 'ar-SA' ? 'اختر الفصل:' : 'Select Class:'}
                                        </label>
                                        <select
                                            value={classInfo.classId || ''}
                                            onChange={(e) => handleClassChange(classIndex, 'classId', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontSize: '1rem',
                                                background: 'white'
                                            }}
                                        >
                                            <option value="">
                                                {locale === 'ar-SA' ? 'اختر فصل...' : 'Select a class...'}
                                            </option>
                                            {availableClasses.length === 0 ? (
                                                <option value="" disabled>
                                                    {locale === 'ar-SA' ? 'لا توجد فصول متاحة' : 'No classes available'}
                                                </option>
                                            ) : (
                                                availableClasses.map(cls => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.name} - {cls.level} ({cls.academicYear})
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    {/* Subjects */}
                                    <div>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <label style={{
                                                fontWeight: 'bold',
                                                color: '#2c3e50'
                                            }}>
                                                {locale === 'ar-SA' ? 'المواد المُدرَّسة:' : 'Subjects Taught:'}
                                            </label>
                                            <button
                                                onClick={() => handleAddSubject(classIndex)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    background: 'linear-gradient(135deg, #3498db, #2980b9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                + {locale === 'ar-SA' ? 'مادة' : 'Subject'}
                                            </button>
                                        </div>
                                        
                                        {classInfo.subjects && classInfo.subjects.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {classInfo.subjects.map((subject: string, subjectIndex: number) => (
                                                    <div key={subjectIndex} style={{ 
                                                        display: 'flex', 
                                                        gap: '0.5rem',
                                                        alignItems: 'center'
                                                    }}>
                                                        <input
                                                            type="text"
                                                            value={subject}
                                                            onChange={(e) => handleSubjectChange(classIndex, subjectIndex, e.target.value)}
                                                            placeholder={locale === 'ar-SA' ? 'اسم المادة' : 'Subject name'}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.5rem',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                fontSize: '0.9rem'
                                                            }}
                                                        />
                                                        {classInfo.subjects.length > 1 && (
                                                            <button
                                                                onClick={() => handleRemoveSubject(classIndex, subjectIndex)}
                                                                style={{
                                                                    background: '#e74c3c',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem'
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '1rem',
                                                color: '#7f8c8d',
                                                background: 'white',
                                                borderRadius: '4px',
                                                border: '1px dashed #bdc3c7'
                                            }}>
                                                {locale === 'ar-SA' ? 'انقر على "+ مادة" لإضافة مواد' : 'Click "+ Subject" to add subjects'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '1rem',
                    borderTop: '1px solid #e9ecef',
                    paddingTop: '1rem'
                }}>
                    <button 
                        onClick={onClose}
                        disabled={saving}
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(149, 165, 166, 0.3)',
                            opacity: saving ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!saving) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(149, 165, 166, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!saving) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(149, 165, 166, 0.3)';
                            }
                        }}
                    >
                        {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            background: saving 
                                ? 'linear-gradient(135deg, #95a5a6, #7f8c8d)' 
                                : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: saving 
                                ? '0 2px 4px rgba(149, 165, 166, 0.3)'
                                : '0 2px 4px rgba(39, 174, 96, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!saving) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(39, 174, 96, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!saving) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(39, 174, 96, 0.3)';
                            }
                        }}
                    >
                        {saving ? '⏳' : '💾'} {saving 
                            ? (locale === 'ar-SA' ? 'جاري الحفظ...' : 'Saving...')
                            : (locale === 'ar-SA' ? 'حفظ التغييرات' : 'Save Changes')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
