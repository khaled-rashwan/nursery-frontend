'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { getRoleColor, getRoleIcon, getRoleName } from '../../../../../utils/rolePermissions';
import { User, UserFormData } from '../../types/admin.types';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorHandler';
import { DeleteConfirmModal } from '../DeleteConfirmModal';
import { tableHeaderStyle, tableCellStyle } from '../../styles/tableStyles';
import { UserModal } from './UserModal';

interface UserManagementProps {
  locale: string;
}

export function UserManagement({ locale }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('displayName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingInProgress, setEditingInProgress] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const { user } = useAuth();

  // Permission helper functions
  const canCreateRole = (targetRole: string): boolean => {
    if (!currentUserRole) return false;
    if (currentUserRole === 'superadmin') {
      return ['admin', 'teacher', 'parent'].includes(targetRole);
    }
    if (currentUserRole === 'admin') {
      return ['teacher', 'parent'].includes(targetRole);
    }
    return false;
  };

  const canEditUser = (targetUser: User): boolean => {
    if (!currentUserRole) return false;
    const targetRole = targetUser.customClaims.role;
    
    if (targetRole === 'superadmin') return false;
    if (targetRole === 'admin' && currentUserRole !== 'superadmin') return false;
    return true;
  };

  const canDeleteUser = (targetUser: User): boolean => {
    if (!currentUserRole) return false;
    const targetRole = targetUser.customClaims.role;
    
    if (targetRole === 'superadmin') return false;
    if (targetRole === 'admin' && currentUserRole !== 'superadmin') return false;
    return true;
  };

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.customClaims.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => !user.disabled);
      } else if (statusFilter === 'disabled') {
        filtered = filtered.filter(user => user.disabled);
      } else if (statusFilter === 'verified') {
        filtered = filtered.filter(user => user.emailVerified);
      } else if (statusFilter === 'unverified') {
        filtered = filtered.filter(user => !user.emailVerified);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof User] as string | number;
      let bValue: string | number = b[sortBy as keyof User] as string | number;

      if (sortBy === 'role') {
        aValue = a.customClaims.role;
        bValue = b.customClaims.role;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setError(null);
      
      let idToken: string | null = null;
      type FirebaseUserWithToken = { getIdToken: () => Promise<string> };
      if (user && typeof (user as FirebaseUserWithToken).getIdToken === 'function') {
        idToken = await (user as FirebaseUserWithToken).getIdToken();
      }
      
      if (!idToken) {
        throw new Error('No auth token found. Please sign in as admin.');
      }
      
      const region = process.env.NEXT_PUBLIC_FIREBASE_REGION || 'us-central1';
      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'future-step-nursery';
      const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/deleteUser`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: userId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete user: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('User deleted successfully:', result);
      
      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteConfirm(null);
      
      alert(locale === 'ar-SA' 
        ? `تم حذف المستخدم "${result.deletedUser.displayName}" بنجاح!`
        : `User "${result.deletedUser.displayName}" deleted successfully!`
      );
      
    } catch (error) {
      console.error('Error deleting user:', error);
      const friendlyMessage = getFirebaseErrorMessage(error, locale);
      setError(friendlyMessage);
      alert(locale === 'ar-SA' 
        ? `خطأ في حذف المستخدم: ${friendlyMessage}`
        : `Error deleting user: ${friendlyMessage}`
      );
      setShowDeleteConfirm(null);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    // Note: In a real implementation, you would call a Firebase Function to update user status
    console.warn('Toggle user status functionality needs Firebase Function implementation');
    setUsers(users.map(user =>
      user.id === userId ? { ...user, disabled: !user.disabled } : user
    ));
  };

  const handleUserSave = async (userData: UserFormData) => {
    if (editingUser) {
      // Update existing user via Firebase Function
      try {
        setEditingInProgress(editingUser.id);
        setError(null);
        
        let idToken: string | null = null;
        type FirebaseUserWithToken = { getIdToken: () => Promise<string> };
        if (user && typeof (user as FirebaseUserWithToken).getIdToken === 'function') {
          idToken = await (user as FirebaseUserWithToken).getIdToken();
        }
        
        if (!idToken) {
          throw new Error('No auth token found. Please sign in as admin.');
        }
        
        const region = process.env.NEXT_PUBLIC_FIREBASE_REGION || 'us-central1';
        const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'future-step-nursery';
        const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/editUser`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: editingUser.id,
            userData: {
              email: userData.email,
              displayName: userData.displayName,
              phoneNumber: userData.phoneNumber,
              role: userData.role
            }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to update user: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('User updated successfully:', result);
        
        // Update local state with the server response
        setUsers(users.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                email: result.user.email,
                displayName: result.user.displayName,
                phoneNumber: result.user.phoneNumber,
                customClaims: result.user.customClaims || { role: userData.role }
              }
            : u
        ));
        
        alert(locale === 'ar-SA' ? 'تم تحديث المستخدم بنجاح!' : 'User updated successfully!');
        
      } catch (error) {
        console.error('Error updating user:', error);
        const friendlyMessage = getFirebaseErrorMessage(error, locale);
        setError(friendlyMessage);
        alert(locale === 'ar-SA' 
          ? `خطأ في تحديث المستخدم: ${friendlyMessage}`
          : `Error updating user: ${friendlyMessage}`
        );
      } finally {
        setEditingInProgress(null);
      }
    } else {
      // Create new user via Firebase Function
      try {
        setEditingInProgress('creating');
        setError(null);
        
        let idToken: string | null = null;
        type FirebaseUserWithToken = { getIdToken: () => Promise<string> };
        if (user && typeof (user as FirebaseUserWithToken).getIdToken === 'function') {
          idToken = await (user as FirebaseUserWithToken).getIdToken();
        }
        
        if (!idToken) {
          throw new Error('No auth token found. Please sign in as admin.');
        }
        
        const region = process.env.NEXT_PUBLIC_FIREBASE_REGION || 'us-central1';
        const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'future-step-nursery';
        const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/createUser`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userData: {
              email: userData.email,
              displayName: userData.displayName,
              phoneNumber: userData.phoneNumber,
              password: userData.password,
              role: userData.role
            }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to create user: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('User created successfully:', result);
        
        // Add new user to local state
        const newUser: User = {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          phoneNumber: result.user.phoneNumber,
          photoURL: result.user.photoURL,
          disabled: result.user.disabled,
          emailVerified: result.user.emailVerified,
          createdAt: result.user.createdAt,
          lastSignIn: result.user.lastSignIn,
          customClaims: result.user.customClaims || { role: userData.role }
        };
        
        setUsers([newUser, ...users]);
        
        alert(locale === 'ar-SA' ? 'تم إنشاء المستخدم بنجاح!' : 'User created successfully!');
        
      } catch (error) {
        console.error('Error creating user:', error);
        const friendlyMessage = getFirebaseErrorMessage(error, locale);
        setError(friendlyMessage);
        alert(locale === 'ar-SA' 
          ? `خطأ في إنشاء المستخدم: ${friendlyMessage}`
          : `Error creating user: ${friendlyMessage}`
        );
      } finally {
        setEditingInProgress(null);
      }
    }
    setShowUserModal(false);
  };

  // Fetch real users from Firebase Function
  useEffect(() => {
    if (!user) return; // Only fetch if user is available
    
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      
      try {
        let idToken: string | null = null;
        // Use a type guard for Firebase user with getIdToken method
        type FirebaseUserWithToken = { getIdToken: () => Promise<string> };
        if (user && typeof (user as FirebaseUserWithToken).getIdToken === 'function') {
          idToken = await (user as FirebaseUserWithToken).getIdToken();
        }
        
        if (!idToken) {
          throw new Error('No auth token found. Please sign in as admin.');
        }
        
        // Get current user's role from token
        const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
        const userRole = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);
        setCurrentUserRole(userRole);
        
        // Use env variables for region and project id
        const region = process.env.NEXT_PUBLIC_FIREBASE_REGION || 'us-central1';
        const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'future-step-nursery';
        const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/listUsers?maxResults=100`;
        
        const response = await fetch(functionUrl, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched users from Firebase:', data.users);
        
        // Transform Firebase users to match our User interface
        const transformedUsers: User[] = data.users.map((u: {
          uid: string;
          email: string;
          displayName?: string;
          phoneNumber?: string;
          photoURL?: string;
          disabled: boolean;
          emailVerified: boolean;
          createdAt: string;
          lastSignIn?: string;
          customClaims?: {
            role?: 'superadmin' | 'admin' | 'teacher' | 'parent' | 'content-manager';
            permissions?: string[];
            [key: string]: unknown;
          };
        }) => ({
          id: u.uid,
          email: u.email,
          displayName: u.displayName || u.email.split('@')[0], // Fallback to email prefix if no display name
          phoneNumber: u.phoneNumber,
          photoURL: u.photoURL,
          disabled: u.disabled,
          emailVerified: u.emailVerified,
          createdAt: u.createdAt,
          lastSignIn: u.lastSignIn,
          customClaims: u.customClaims || { role: 'parent' as const }
        }));
        
        setUsers(transformedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        // Fallback to empty array on error
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [user]);

  return (
    <div>
      {/* Header with filters and search */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
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
            👥 {locale === 'ar-SA' ? 'إدارة المستخدمين' : 'User Management'}
          </h2>
          
          <button
            onClick={handleCreateUser}
            disabled={!currentUserRole || (!canCreateRole('admin') && !canCreateRole('teacher') && !canCreateRole('parent'))}
            style={{
              padding: '1rem 1.5rem',
              background: (!currentUserRole || (!canCreateRole('admin') && !canCreateRole('teacher') && !canCreateRole('parent')))
                ? '#95a5a6' 
                : 'linear-gradient(135deg, #27ae60, #2ecc71)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: (!currentUserRole || (!canCreateRole('admin') && !canCreateRole('teacher') && !canCreateRole('parent')))
                ? 'not-allowed' 
                : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: (!currentUserRole || (!canCreateRole('admin') && !canCreateRole('teacher') && !canCreateRole('parent')))
                ? 0.6 
                : 1
            }}
            onMouseEnter={(e) => {
              if (currentUserRole && (canCreateRole('admin') || canCreateRole('teacher') || canCreateRole('parent'))) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentUserRole && (canCreateRole('admin') || canCreateRole('teacher') || canCreateRole('parent'))) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            title={!currentUserRole ? 'Loading permissions...' : 
              (!canCreateRole('admin') && !canCreateRole('teacher') && !canCreateRole('parent')) 
                ? (locale === 'ar-SA' ? 'ليس لديك صلاحية لإنشاء مستخدمين' : 'You do not have permission to create users')
                : (locale === 'ar-SA' ? 'إضافة مستخدم جديد' : 'Add New User')
            }
          >
            ➕ {locale === 'ar-SA' ? 'إضافة مستخدم' : 'Add User'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#ffebee',
            border: '2px solid #f44336',
            borderRadius: '8px',
            color: '#d32f2f',
            fontSize: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚠️ {error}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginLeft: 'auto',
                padding: '0.5rem 1rem',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {locale === 'ar-SA' ? 'إعادة تحميل' : 'Retry'}
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#7f8c8d',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #bdc3c7',
              borderTop: '2px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            {locale === 'ar-SA' ? 'جاري تحميل المستخدمين...' : 'Loading users...'}
          </div>
        )}

        {/* Search and filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'البحث' : 'Search'}
            </label>
            <input
              type="text"
              placeholder={locale === 'ar-SA' ? 'البحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Role filter */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'الدور' : 'Role'}
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="all">{locale === 'ar-SA' ? 'جميع الأدوار' : 'All Roles'}</option>
              <option value="superadmin">{locale === 'ar-SA' ? 'مدير عام' : 'Super Admin'}</option>
              <option value="admin">{locale === 'ar-SA' ? 'مدير' : 'Admin'}</option>
              <option value="teacher">{locale === 'ar-SA' ? 'معلم' : 'Teacher'}</option>
              <option value="parent">{locale === 'ar-SA' ? 'ولي أمر' : 'Parent'}</option>
              <option value="content-manager">{locale === 'ar-SA' ? 'مدير المحتوى' : 'Content Manager'}</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'الحالة' : 'Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="all">{locale === 'ar-SA' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="active">{locale === 'ar-SA' ? 'نشط' : 'Active'}</option>
              <option value="disabled">{locale === 'ar-SA' ? 'معطل' : 'Disabled'}</option>
              <option value="verified">{locale === 'ar-SA' ? 'محقق' : 'Verified'}</option>
              <option value="unverified">{locale === 'ar-SA' ? 'غير محقق' : 'Unverified'}</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'ترتيب بـ' : 'Sort By'}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="createdAt">{locale === 'ar-SA' ? 'تاريخ الإنشاء' : 'Created Date'}</option>
              <option value="displayName">{locale === 'ar-SA' ? 'الاسم' : 'Name'}</option>
              <option value="email">{locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}</option>
              <option value="role">{locale === 'ar-SA' ? 'الدور' : 'Role'}</option>
              <option value="lastSignIn">{locale === 'ar-SA' ? 'آخر تسجيل دخول' : 'Last Sign In'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      {!loading && !error && users.length === 0 && (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          border: '3px solid #f39c12',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
          <h3 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '1rem' }}>
            {locale === 'ar-SA' ? 'لا توجد مستخدمين' : 'No Users Found'}
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#7f8c8d', margin: 0 }}>
            {locale === 'ar-SA' 
              ? 'لم يتم العثور على أي مستخدمين في النظام حالياً'
              : 'No users found in the system currently'
            }
          </p>
        </div>
      )}

      {/* Users table */}
      {!loading && !error && users.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          border: '3px solid #34495e',
          overflow: 'hidden'
        }}>
          {/* Results summary */}
          <div style={{
            padding: '1rem 2rem',
            background: '#f8f9fa',
            borderBottom: '2px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>
              {locale === 'ar-SA' 
                ? `عرض ${indexOfFirstUser + 1}-${Math.min(indexOfLastUser, filteredUsers.length)} من ${filteredUsers.length} مستخدم`
                : `Showing ${indexOfFirstUser + 1}-${Math.min(indexOfLastUser, filteredUsers.length)} of ${filteredUsers.length} users`
              }
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                {locale === 'ar-SA' ? 'ترتيب:' : 'Sort:'}
              </span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '0.3rem 0.8rem',
                  background: 'transparent',
                  border: '1px solid #bdc3c7',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'المستخدم' : 'User'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الدور' : 'Role'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الحالة' : 'Status'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'تاريخ الإنشاء' : 'Created'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'آخر تسجيل دخول' : 'Last Sign In'}</th>
                  <th style={tableHeaderStyle}>{locale === 'ar-SA' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: user.photoURL ? 'transparent' : getRoleColor(user.customClaims.role),
                          backgroundImage: user.photoURL ? `url(${user.photoURL})` : 'none',
                          backgroundSize: user.photoURL ? 'cover' : 'auto',
                          backgroundPosition: user.photoURL ? 'center' : 'initial',
                          backgroundRepeat: 'no-repeat',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}>
                          {!user.photoURL && (user.displayName.charAt(0).toUpperCase())}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#2c3e50' }}>
                            {user.displayName}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                              📞 {user.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: getRoleColor(user.customClaims.role),
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {getRoleIcon(user.customClaims.role)}
                        {getRoleName(user.customClaims.role, locale)}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          background: user.disabled ? '#e74c3c' : '#27ae60',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {user.disabled ? '🚫' : '✅'}
                          {user.disabled 
                            ? (locale === 'ar-SA' ? 'معطل' : 'Disabled')
                            : (locale === 'ar-SA' ? 'نشط' : 'Active')
                          }
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          background: user.emailVerified ? '#3498db' : '#f39c12',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {user.emailVerified ? '✉️' : '⚠️'}
                          {user.emailVerified 
                            ? (locale === 'ar-SA' ? 'محقق' : 'Verified')
                            : (locale === 'ar-SA' ? 'غير محقق' : 'Unverified')
                          }
                        </div>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
                        {new Date(user.createdAt).toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US')}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                        {new Date(user.createdAt).toLocaleTimeString(locale === 'ar-SA' ? 'ar-SA' : 'en-US')}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      {user.lastSignIn ? (
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
                            {new Date(user.lastSignIn).toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US')}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                            {new Date(user.lastSignIn).toLocaleTimeString(locale === 'ar-SA' ? 'ar-SA' : 'en-US')}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.9rem', color: '#95a5a6', fontStyle: 'italic' }}>
                          {locale === 'ar-SA' ? 'لم يسجل دخول بعد' : 'Never signed in'}
                        </span>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={editingInProgress === user.id || !canEditUser(user)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: (editingInProgress === user.id || !canEditUser(user))
                              ? '#95a5a6' 
                              : 'linear-gradient(135deg, #3498db, #2980b9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (editingInProgress === user.id || !canEditUser(user)) ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            boxShadow: (editingInProgress === user.id || !canEditUser(user))
                              ? 'none' 
                              : '0 2px 4px rgba(52, 152, 219, 0.3)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            opacity: (editingInProgress === user.id || !canEditUser(user)) ? 0.7 : 1
                          }}
                          title={editingInProgress === user.id 
                            ? (locale === 'ar-SA' ? 'جاري التحديث...' : 'Updating...')
                            : !canEditUser(user)
                            ? (locale === 'ar-SA' ? 'ليس لديك صلاحية لتعديل هذا المستخدم' : 'You cannot edit this user')
                            : (locale === 'ar-SA' ? 'تعديل المستخدم' : 'Edit User')
                          }
                          onMouseEnter={(e) => {
                            if (editingInProgress !== user.id && canEditUser(user)) {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(52, 152, 219, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (editingInProgress !== user.id && canEditUser(user)) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(52, 152, 219, 0.3)';
                            }
                          }}
                        >
                          {editingInProgress === user.id ? (
                            <>⏳ {locale === 'ar-SA' ? 'جاري التحديث...' : 'Updating...'}</>
                          ) : (
                            <>✏️ {locale === 'ar-SA' ? 'تعديل' : 'Edit'}</>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          disabled={!canEditUser(user)}
                          style={{
                            padding: '0.5rem',
                            background: !canEditUser(user) 
                              ? '#95a5a6'
                              : user.disabled ? '#27ae60' : '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: !canEditUser(user) ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            opacity: !canEditUser(user) ? 0.6 : 1
                          }}
                          title={!canEditUser(user)
                            ? (locale === 'ar-SA' ? 'ليس لديك صلاحية لتعديل حالة هذا المستخدم' : 'You cannot modify this user status')
                            : user.disabled 
                            ? (locale === 'ar-SA' ? 'تفعيل' : 'Enable')
                            : (locale === 'ar-SA' ? 'تعطيل' : 'Disable')
                          }
                        >
                          {user.disabled ? '✅' : '🚫'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          disabled={!canDeleteUser(user)}
                          style={{
                            padding: '0.5rem',
                            background: !canDeleteUser(user) ? '#95a5a6' : '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: !canDeleteUser(user) ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            opacity: !canDeleteUser(user) ? 0.6 : 1
                          }}
                          title={!canDeleteUser(user)
                            ? (locale === 'ar-SA' ? 'ليس لديك صلاحية لحذف هذا المستخدم' : 'You cannot delete this user')
                            : (locale === 'ar-SA' ? 'حذف' : 'Delete')
                          }
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
              padding: '1rem 2rem',
              background: '#f8f9fa',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPage === 1 ? '#ecf0f1' : '#3498db',
                  color: currentPage === 1 ? '#95a5a6' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ◀️ {locale === 'ar-SA' ? 'السابق' : 'Previous'}
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentPage === pageNum ? '#2c3e50' : '#ecf0f1',
                      color: currentPage === pageNum ? 'white' : '#2c3e50',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPage === totalPages ? '#ecf0f1' : '#3498db',
                  color: currentPage === totalPages ? '#95a5a6' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                {locale === 'ar-SA' ? 'التالي' : 'Next'} ▶️
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          locale={locale}
          currentUserRole={currentUserRole}
          canEditUser={canEditUser}
          onSave={handleUserSave}
          onCancel={() => setShowUserModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          userName={users.find(u => u.id === showDeleteConfirm)?.displayName || ''}
          locale={locale}
          onConfirm={() => handleDeleteUser(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
