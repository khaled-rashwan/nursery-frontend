'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

// Admin Portal Interfaces
interface SystemStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  pendingFees: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSignIn?: string;
  customClaims: {
    role: 'superadmin' | 'admin' | 'teacher' | 'parent' | 'content-manager';
    permissions?: string[];
    [key: string]: unknown;
  };
}

interface UserFormData {
  email: string;
  displayName: string;
  phoneNumber: string;
  password: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'parent' | 'content-manager';
  permissions: string[];
}

interface UserClaims {
  role?: 'superadmin' | 'admin' | 'teacher' | 'parent' | 'content-manager';
  permissions?: string[];
  [key: string]: unknown;
}

// Mock data for demonstration
// const mockAdminUser: AdminUser = {
//   name: 'Dr. Sarah Ahmed',
//   email: 'admin@futurestep.edu.sa',
//   avatar: '/principal-image.png',
//   role: 'Super Admin',
//   permissions: ['manage_users', 'manage_classes', 'view_reports', 'manage_fees', 'system_settings']
// };

const mockSystemStats: SystemStats = {
  totalStudents: 156,
  totalTeachers: 24,
  totalParents: 312,
  totalClasses: 12,
  pendingFees: 45000,
  monthlyRevenue: 234000
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: 1,
    type: 'user_created',
    description: 'New teacher account created for Ms. Fatima Al-Zahra',
    timestamp: '2025-01-30 14:30',
    user: 'admin@futurestep.edu.sa'
  },
  {
    id: 2,
    type: 'fee_payment',
    description: 'Payment received for student Ahmed Mohamed (KG1-A)',
    timestamp: '2025-01-30 13:15',
    user: 'parent@example.com'
  },
  {
    id: 3,
    type: 'class_updated',
    description: 'Class schedule updated for KG2-B',
    timestamp: '2025-01-30 12:45',
    user: 'teacher@futurestep.edu.sa'
  },
  {
    id: 4,
    type: 'report_generated',
    description: 'Monthly attendance report generated',
    timestamp: '2025-01-30 11:20',
    user: 'admin@futurestep.edu.sa'
  },
  {
    id: 5,
    type: 'system_backup',
    description: 'Daily system backup completed successfully',
    timestamp: '2025-01-30 03:00',
    user: 'system'
  }
];

// Mock users data for demonstration
const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'admin@futurestep.edu.sa',
    displayName: 'Dr. Sarah Ahmed',
    phoneNumber: '+966501234567',
    photoURL: '/principal-image.png',
    disabled: false,
    emailVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    lastSignIn: '2025-01-30T14:25:00Z',
    customClaims: {
      role: 'superadmin',
      permissions: ['manage_users', 'manage_classes', 'view_reports', 'manage_fees', 'system_settings']
    }
  },
  {
    id: 'user2',
    email: 'principal@futurestep.edu.sa',
    displayName: 'Mr. Ahmed Al-Rashid',
    phoneNumber: '+966507654321',
    photoURL: '/portal-image.png',
    disabled: false,
    emailVerified: true,
    createdAt: '2024-02-01T09:15:00Z',
    lastSignIn: '2025-01-30T13:45:00Z',
    customClaims: {
      role: 'admin',
      permissions: ['manage_classes', 'view_reports', 'manage_fees']
    }
  },
  {
    id: 'user3',
    email: 'teacher1@futurestep.edu.sa',
    displayName: 'Ms. Fatima Al-Zahra',
    phoneNumber: '+966509876543',
    disabled: false,
    emailVerified: true,
    createdAt: '2024-03-10T08:00:00Z',
    lastSignIn: '2025-01-30T12:30:00Z',
    customClaims: {
      role: 'teacher',
      permissions: ['manage_classes', 'view_students']
    }
  },
  {
    id: 'user4',
    email: 'parent1@example.com',
    displayName: 'Mr. Mohammed Al-Sayed',
    phoneNumber: '+966501111111',
    disabled: false,
    emailVerified: true,
    createdAt: '2024-04-05T14:20:00Z',
    lastSignIn: '2025-01-29T16:10:00Z',
    customClaims: {
      role: 'parent',
      permissions: ['view_child_progress']
    }
  },
  {
    id: 'user5',
    email: 'content@futurestep.edu.sa',
    displayName: 'Ms. Layla Hassan',
    phoneNumber: '+966502222222',
    disabled: false,
    emailVerified: false,
    createdAt: '2024-05-15T11:45:00Z',
    lastSignIn: '2025-01-28T10:15:00Z',
    customClaims: {
      role: 'content-manager',
      permissions: ['manage_content', 'upload_media']
    }
  },
  {
    id: 'user6',
    email: 'teacher2@futurestep.edu.sa',
    displayName: 'Ms. Aisha Abdullah',
    phoneNumber: '+966503333333',
    disabled: true,
    emailVerified: true,
    createdAt: '2024-06-20T07:30:00Z',
    customClaims: {
      role: 'teacher',
      permissions: ['manage_classes', 'view_students']
    }
  },
  {
    id: 'user7',
    email: 'parent2@example.com',
    displayName: 'Mrs. Nadia Al-Mansouri',
    phoneNumber: '+966504444444',
    disabled: false,
    emailVerified: true,
    createdAt: '2024-07-10T15:00:00Z',
    lastSignIn: '2025-01-30T09:20:00Z',
    customClaims: {
      role: 'parent',
      permissions: ['view_child_progress']
    }
  }
];

// Login Component
function AdminLoginForm({ locale }: { locale: string }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await login(credentials.email, credentials.password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '500px',
        border: '3px solid #3498db'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3498db, #2c3e50)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1rem auto',
            color: 'white'
          }}>
            🛡️
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            margin: '0 0 0.5rem 0'
          }}>
            {locale === 'ar-SA' ? 'بوابة الإدارة' : 'Admin Portal'}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#7f8c8d',
            margin: 0
          }}>
            {locale === 'ar-SA' 
              ? 'تسجيل الدخول للوصول إلى لوحة التحكم' 
              : 'Sign in to access the admin dashboard'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'البريد الإلكتروني الإداري' : 'Admin Email Address'}
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({
                ...credentials,
                email: e.target.value
              })}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder="admin@futurestep.edu.sa"
              required
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              {locale === 'ar-SA' ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              placeholder="••••••••"
              required
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#ffebee',
              border: '2px solid #f44336',
              borderRadius: '8px',
              color: '#d32f2f',
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.2rem',
              background: loading 
                ? '#95a5a6' 
                : 'linear-gradient(135deg, #3498db, #2c3e50)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(52, 152, 219, 0.3)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(52, 152, 219, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(52, 152, 219, 0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                {locale === 'ar-SA' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
              </span>
            ) : (
              <>🚀 {locale === 'ar-SA' ? 'تسجيل الدخول' : 'Sign In'}</>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #e9ecef'
        }}>
          <p style={{ 
            fontSize: '0.9rem',
            color: '#6c757d',
            margin: 0
          }}>
            {locale === 'ar-SA' 
              ? '⚠️ مخصص للمديرين والإداريين المعتمدين فقط' 
              : '⚠️ For authorized administrators only'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// Access Denied Component
function AccessDenied({ locale, onSignOut }: { locale: string; onSignOut: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        border: '3px solid #e74c3c'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          margin: '0 auto 2rem auto',
          color: 'white'
        }}>
          🚫
        </div>
        
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#e74c3c',
          margin: '0 0 1rem 0'
        }}>
          {locale === 'ar-SA' ? 'الوصول مرفوض' : 'Access Denied'}
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#7f8c8d',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {locale === 'ar-SA' 
            ? 'عذراً، ليس لديك الصلاحية للوصول إلى بوابة الإدارة. يرجى تسجيل الخروج وإعادة تسجيل الدخول بحساب إداري معتمد.'
            : 'Sorry, you do not have permission to access the admin portal. Please sign out and sign in with an authorized admin account.'
          }
        </p>
        
        <button
          onClick={onSignOut}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 15px rgba(231, 76, 60, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.3)';
          }}
        >
          🚪 {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

// User Management Component
function UserManagement({ locale }: { locale: string }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
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
  // Move useAuth hook to top-level of component
  const { user } = useAuth();

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

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    setShowDeleteConfirm(null);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, disabled: !user.disabled } : user
    ));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return '#e74c3c';
      case 'admin': return '#8e44ad';
      case 'teacher': return '#3498db';
      case 'parent': return '#27ae60';
      case 'content-manager': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return '👑';
      case 'admin': return '🛡️';
      case 'teacher': return '👩‍🏫';
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'content-manager': return '📝';
      default: return '👤';
    }
  };

  // Fetch real users from Firebase Function and log to console
  useEffect(() => {
    if (!user) return; // Only fetch if user is available
    async function fetchUsers() {
      try {
        let idToken: string | null = null;
        // Use a type guard for Firebase user with getIdToken method
        type FirebaseUserWithToken = { getIdToken: () => Promise<string> };
        if (user && typeof (user as FirebaseUserWithToken).getIdToken === 'function') {
          idToken = await (user as FirebaseUserWithToken).getIdToken();
        } else if (typeof window !== 'undefined' && window.localStorage) {
          idToken = window.localStorage.getItem('firebase_id_token');
        }
        if (!idToken) {
          throw new Error('No auth token found. Please sign in as admin.');
        }
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
        const data = await response.json();
        console.log('Fetched users from Firebase:', data.users);
        // Uncomment below to use real users in UI
        // setUsers(data.users.map(u => ({
        //   id: u.uid,
        //   email: u.email,
        //   displayName: u.displayName || '',
        //   phoneNumber: u.phoneNumber,
        //   photoURL: u.photoURL,
        //   disabled: u.disabled,
        //   emailVerified: u.emailVerified,
        //   createdAt: u.createdAt,
        //   lastSignIn: u.lastSignIn,
        //   customClaims: u.customClaims || {}
        // })));
      } catch (err) {
        console.error('Error fetching users:', err);
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
            style={{
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ➕ {locale === 'ar-SA' ? 'إضافة مستخدم' : 'Add User'}
          </button>
        </div>

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
                        background: user.photoURL ? `url(${user.photoURL})` : getRoleColor(user.customClaims.role),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
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
                      {locale === 'ar-SA' ? {
                        'superadmin': 'مدير عام',
                        'admin': 'مدير',
                        'teacher': 'معلم',
                        'parent': 'ولي أمر',
                        'content-manager': 'مدير المحتوى'
                      }[user.customClaims.role] : user.customClaims.role}
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
                        style={{
                          padding: '0.5rem',
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        title={locale === 'ar-SA' ? 'تعديل' : 'Edit'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        style={{
                          padding: '0.5rem',
                          background: user.disabled ? '#27ae60' : '#f39c12',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        title={user.disabled 
                          ? (locale === 'ar-SA' ? 'تفعيل' : 'Enable')
                          : (locale === 'ar-SA' ? 'تعطيل' : 'Disable')
                        }
                      >
                        {user.disabled ? '✅' : '🚫'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        style={{
                          padding: '0.5rem',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        title={locale === 'ar-SA' ? 'حذف' : 'Delete'}
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

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          locale={locale}
          onSave={(userData) => {
            if (editingUser) {
              // Update existing user
              setUsers(users.map(user =>
                user.id === editingUser.id
                  ? { ...user, ...userData, customClaims: { ...user.customClaims, role: userData.role, permissions: userData.permissions } }
                  : user
              ));
            } else {
              // Create new user
              const newUser: User = {
                id: `user${Date.now()}`,
                email: userData.email,
                displayName: userData.displayName,
                phoneNumber: userData.phoneNumber,
                disabled: false,
                emailVerified: false,
                createdAt: new Date().toISOString(),
                customClaims: {
                  role: userData.role,
                  permissions: userData.permissions
                }
              };
              setUsers([...users, newUser]);
            }
            setShowUserModal(false);
          }}
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

// Table styles
const tableHeaderStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#2c3e50',
  borderBottom: '2px solid #e9ecef'
};

const tableCellStyle: React.CSSProperties = {
  padding: '1rem',
  verticalAlign: 'top'
};

// User Modal Component
function UserModal({ 
  user, 
  locale, 
  onSave, 
  onCancel 
}: { 
  user: User | null; 
  locale: string; 
  onSave: (userData: UserFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    password: '',
    role: user?.customClaims.role || 'parent',
    permissions: user?.customClaims.permissions || []
  });

  const [showPassword, setShowPassword] = useState(false);

  const availablePermissions = [
    'manage_users',
    'manage_classes',
    'view_reports',
    'manage_fees',
    'system_settings',
    'manage_content',
    'upload_media',
    'view_students',
    'view_child_progress'
  ];

  const rolePermissions = {
    superadmin: ['manage_users', 'manage_classes', 'view_reports', 'manage_fees', 'system_settings', 'manage_content', 'upload_media'],
    admin: ['manage_classes', 'view_reports', 'manage_fees', 'manage_content'],
    teacher: ['manage_classes', 'view_students'],
    parent: ['view_child_progress'],
    'content-manager': ['manage_content', 'upload_media']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleRoleChange = (newRole: UserFormData['role']) => {
    setFormData({
      ...formData,
      role: newRole,
      permissions: rolePermissions[newRole] || []
    });
  };

  const handlePermissionToggle = (permission: string) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({
      ...formData,
      permissions: updatedPermissions
    });
  };

  return (
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
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#2c3e50',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {user ? '✏️' : '➕'} 
          {user 
            ? (locale === 'ar-SA' ? 'تعديل المستخدم' : 'Edit User')
            : (locale === 'ar-SA' ? 'إضافة مستخدم جديد' : 'Add New User')
          }
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email Address'} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="user@futurestep.edu.sa"
              />
            </div>

            {/* Display Name */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'الاسم الكامل' : 'Full Name'} *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder={locale === 'ar-SA' ? 'أحمد محمد' : 'John Doe'}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="+966501234567"
              />
            </div>

            {/* Password (only for new users) */}
            {!user && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {locale === 'ar-SA' ? 'كلمة المرور' : 'Password'} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '2px solid #bdc3c7',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      paddingRight: '3rem'
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            {/* Role */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'الدور' : 'Role'} *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as UserFormData['role'])}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              >
                <option value="superadmin">{locale === 'ar-SA' ? 'مدير عام' : 'Super Admin'}</option>
                <option value="admin">{locale === 'ar-SA' ? 'مدير' : 'Admin'}</option>
                <option value="teacher">{locale === 'ar-SA' ? 'معلم' : 'Teacher'}</option>
                <option value="parent">{locale === 'ar-SA' ? 'ولي أمر' : 'Parent'}</option>
                <option value="content-manager">{locale === 'ar-SA' ? 'مدير المحتوى' : 'Content Manager'}</option>
              </select>
            </div>

            {/* Permissions */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {locale === 'ar-SA' ? 'الصلاحيات' : 'Permissions'}
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '2px solid #e9ecef'
              }}>
                {availablePermissions.map(permission => (
                  <label key={permission} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      style={{ cursor: 'pointer' }}
                    />
                    {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '1rem 2rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {user 
                ? (locale === 'ar-SA' ? 'حفظ التغييرات' : 'Save Changes')
                : (locale === 'ar-SA' ? 'إنشاء المستخدم' : 'Create User')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ 
  userName, 
  locale, 
  onConfirm, 
  onCancel 
}: { 
  userName: string; 
  locale: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) {
  return (
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
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          ⚠️
        </div>
        
        <h2 style={{
          fontSize: '1.5rem',
          color: '#e74c3c',
          marginBottom: '1rem'
        }}>
          {locale === 'ar-SA' ? 'تأكيد الحذف' : 'Confirm Delete'}
        </h2>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#2c3e50',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {locale === 'ar-SA' 
            ? `هل أنت متأكد من حذف المستخدم "${userName}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
          }
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '1rem 2rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {locale === 'ar-SA' ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ onLogout, locale }: { onLogout: () => void; locale: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, getUserCustomClaims } = useAuth();
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);

  useEffect(() => {
    const fetchUserClaims = async () => {
      if (user && getUserCustomClaims) {
        const claims = await getUserCustomClaims();
        setUserClaims(claims);
      }
    };
    fetchUserClaims();
    
  }, [user, getUserCustomClaims]);

  const StatCard = ({ icon, title, value, color }: { icon: string; title: string; value: string | number; color: string }) => (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      textAlign: 'center',
      transition: 'transform 0.3s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '1.2rem',
        color: '#2c3e50',
        margin: '0 0 0.5rem 0'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: color,
        margin: 0
      }}>
        {value}
      </p>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '3px solid #3498db'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid #3498db',
            background: user?.photoURL ? `url(${user.photoURL})` : 'linear-gradient(135deg, #3498db, #2c3e50)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {!user?.photoURL && (user?.displayName?.charAt(0)?.toUpperCase() || '👤')}
          </div>
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              color: '#2c3e50',
              margin: '0 0 0.5rem 0'
            }}>
              {locale === 'ar-SA' ? 'مرحباً، ' : 'Welcome, '}
              {user?.displayName || 'Name is missing'}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#7f8c8d',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: userClaims?.role ? 
                  (userClaims.role === 'superadmin' ? '#e74c3c' :
                   userClaims.role === 'admin' ? '#8e44ad' :
                   userClaims.role === 'teacher' ? '#3498db' :
                   userClaims.role === 'parent' ? '#27ae60' :
                   userClaims.role === 'content-manager' ? '#f39c12' : '#95a5a6') : '#95a5a6',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {userClaims?.role === 'superadmin' && '👑'}
                {userClaims?.role === 'admin' && '🛡️'}
                {userClaims?.role === 'teacher' && '👩‍🏫'}
                {userClaims?.role === 'parent' && '👨‍👩‍👧‍👦'}
                {userClaims?.role === 'content-manager' && '📝'}
                {!userClaims?.role && '❓'}
                {' '}
                {userClaims?.role ? 
                  (locale === 'ar-SA' ? 
                    (userClaims.role === 'superadmin' ? 'مدير عام' :
                     userClaims.role === 'admin' ? 'مدير' :
                     userClaims.role === 'teacher' ? 'معلم' :
                     userClaims.role === 'parent' ? 'ولي أمر' :
                     userClaims.role === 'content-manager' ? 'مدير المحتوى' : userClaims.role) : 
                    userClaims.role) : 
                  (locale === 'ar-SA' ? 'الدور مفقود' : 'Role is missing')
                }
              </span>
              • {user?.email || 'Email is missing'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          style={{
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🚪 {locale === 'ar-SA' ? 'تسجيل الخروج' : 'Sign Out'}
        </button>
      </div>

      {/* Navigation Tabs */}
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
            { id: 'overview', label: locale === 'ar-SA' ? 'نظرة عامة' : 'Overview', icon: '📊' },
            { id: 'users', label: locale === 'ar-SA' ? 'إدارة المستخدمين' : 'User Management', icon: '👥' },
            { id: 'classes', label: locale === 'ar-SA' ? 'إدارة الفصول' : 'Class Management', icon: '🏫' },
            { id: 'reports', label: locale === 'ar-SA' ? 'التقارير' : 'Reports', icon: '📈' },
            { id: 'settings', label: locale === 'ar-SA' ? 'الإعدادات' : 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #3498db, #2c3e50)' 
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : '#2c3e50',
                border: activeTab === tab.id ? 'none' : '2px solid #bdc3c7',
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* System Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <StatCard 
              icon="👨‍🎓" 
              title={locale === 'ar-SA' ? 'إجمالي الطلاب' : 'Total Students'} 
              value={mockSystemStats.totalStudents} 
              color="#3498db" 
            />
            <StatCard 
              icon="👩‍🏫" 
              title={locale === 'ar-SA' ? 'إجمالي المعلمين' : 'Total Teachers'} 
              value={mockSystemStats.totalTeachers} 
              color="#2ecc71" 
            />
            <StatCard 
              icon="👨‍👩‍👧‍👦" 
              title={locale === 'ar-SA' ? 'إجمالي أولياء الأمور' : 'Total Parents'} 
              value={mockSystemStats.totalParents} 
              color="#9b59b6" 
            />
            <StatCard 
              icon="🏫" 
              title={locale === 'ar-SA' ? 'إجمالي الفصول' : 'Total Classes'} 
              value={mockSystemStats.totalClasses} 
              color="#f39c12" 
            />
            <StatCard 
              icon="💳" 
              title={locale === 'ar-SA' ? 'الرسوم المعلقة' : 'Pending Fees'} 
              value={`${mockSystemStats.pendingFees.toLocaleString()} ${locale === 'ar-SA' ? 'ريال' : 'SAR'}`} 
              color="#e74c3c" 
            />
            <StatCard 
              icon="💰" 
              title={locale === 'ar-SA' ? 'الإيرادات الشهرية' : 'Monthly Revenue'} 
              value={`${mockSystemStats.monthlyRevenue.toLocaleString()} ${locale === 'ar-SA' ? 'ريال' : 'SAR'}`} 
              color="#27ae60" 
            />
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            border: '3px solid #95a5a6'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#2c3e50',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 {locale === 'ar-SA' ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {mockRecentActivity.map(activity => (
                <div key={activity.id} style={{
                  padding: '1rem',
                  borderBottom: '1px solid #ecf0f1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: activity.type === 'user_created' ? '#3498db' : 
                               activity.type === 'fee_payment' ? '#27ae60' :
                               activity.type === 'class_updated' ? '#f39c12' :
                               activity.type === 'report_generated' ? '#9b59b6' : '#95a5a6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem'
                  }}>
                    {activity.type === 'user_created' ? '👤' :
                     activity.type === 'fee_payment' ? '💰' :
                     activity.type === 'class_updated' ? '📚' :
                     activity.type === 'report_generated' ? '📊' : '🔧'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#2c3e50',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {activity.description}
                    </p>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#7f8c8d',
                      margin: 0
                    }}>
                      👤 {activity.user} • 🕒 {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other tabs content */}
      {activeTab === 'users' && (
        <UserManagement locale={locale} />
      )}

      {activeTab !== 'overview' && activeTab !== 'users' && (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '3px solid #bdc3c7'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            🚧
          </div>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2c3e50',
            marginBottom: '1rem'
          }}>
            {locale === 'ar-SA' ? 'قيد التطوير' : 'Under Development'}
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#7f8c8d'
          }}>
            {locale === 'ar-SA' 
              ? 'هذا القسم قيد التطوير وسيكون متاحاً قريباً'
              : 'This section is under development and will be available soon'
            }
          </p>
        </div>
      )}
    </div>
  );
}

// Main Admin Portal Component
export default function AdminPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);
  const { user, loading: authLoading, logout, getUserCustomClaims } = useAuth();

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user && getUserCustomClaims) {
        setIsCheckingRole(true);
        try {
          const claims = await getUserCustomClaims();
          const userRole = claims?.role;
          
          // Check if user has admin or superadmin role
          const hasAccess = userRole === 'admin' || userRole === 'superadmin';
          setHasAdminAccess(hasAccess);
        } catch (error) {
          console.error('Error checking admin role:', error);
          setHasAdminAccess(false);
        } finally {
          setIsCheckingRole(false);
        }
      } else if (user === null) {
        // User is not authenticated
        setHasAdminAccess(null);
        setIsCheckingRole(false);
      }
    };

    if (mounted && !authLoading) {
      checkAdminRole();
    }
  }, [user, mounted, authLoading]); // Removed getUserCustomClaims from dependency array to prevent infinite loop

  if (!mounted || authLoading || isCheckingRole) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
          <p style={{ 
            color: 'white', 
            fontSize: '1.2rem', 
            fontWeight: 'bold' 
          }}>
            {isCheckingRole 
              ? (locale === 'ar-SA' ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...') 
              : (locale === 'ar-SA' ? 'جاري التحميل...' : 'Loading...')
            }
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setHasAdminAccess(null);
  };

  // Not authenticated - show login form
  if (!user) {
    return <AdminLoginForm locale={locale} />;
  }

  // Authenticated but no admin access - show access denied
  if (hasAdminAccess === false) {
    return <AccessDenied locale={locale} onSignOut={handleLogout} />;
  }

  // Authenticated with admin access - show dashboard
  if (hasAdminAccess === true) {
    return <AdminDashboard onLogout={handleLogout} locale={locale} />;
  }

  // This should not happen, but fallback to login
  return <AdminLoginForm locale={locale} />;
}
