// Role-based permission utilities for kindergarten management system

export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'parent' | 'content-manager';

// Define what each role can access
export const ROLE_PERMISSIONS = {
  superadmin: [
    'manage_users',
    'manage_classes',
    'view_reports',
    'manage_fees',
    'system_settings',
    'manage_content',
    'upload_media',
    'view_students',
    'view_child_progress'
  ],
  admin: [
    'manage_users',
    'manage_classes',
    'view_reports',
    'manage_fees',
    'manage_content',
    'view_students'
  ],
  teacher: [
    'manage_classes',
    'view_students',
    'upload_media'
  ],
  parent: [
    'view_child_progress'
  ],
  'content-manager': [
    'manage_content',
    'upload_media'
  ]
} as const;

// Check if a role has a specific permission
export function hasPermission(userRole: UserRole | undefined, permission: string): boolean {
  if (!userRole) return false;
  return (ROLE_PERMISSIONS[userRole] as readonly string[]).includes(permission);
}

// Check if user can access admin areas
export function canAccessAdmin(userRole: UserRole | undefined): boolean {
  return userRole === 'superadmin' || userRole === 'admin' || userRole === 'content-manager';
}

// Check if user can manage other users  
export function canManageUsers(userRole: UserRole | undefined): boolean {
  return userRole === 'superadmin' || userRole === 'admin';
}

// Check if user can manage classes
export function canManageClasses(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'manage_classes');
}

// Check if user can view reports
export function canViewReports(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'view_reports');
}

// Check if user can manage fees
export function canManageFees(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'manage_fees');
}

// Get user-friendly role name
export function getRoleName(role: UserRole, locale: string = 'en-US'): string {
  const roleNames = {
    'en-US': {
      superadmin: 'Super Admin',
      admin: 'Admin', 
      teacher: 'Teacher',
      parent: 'Parent',
      'content-manager': 'Content Manager'
    },
    'ar-SA': {
      superadmin: 'مدير عام',
      admin: 'مدير',
      teacher: 'معلم', 
      parent: 'ولي أمر',
      'content-manager': 'مدير المحتوى'
    }
  };
  
  return roleNames[locale as keyof typeof roleNames]?.[role] || role;
}

// Get role color for UI
export function getRoleColor(role: UserRole): string {
  const colors = {
    superadmin: '#e74c3c',
    admin: '#8e44ad',
    teacher: '#3498db', 
    parent: '#27ae60',
    'content-manager': '#f39c12'
  };
  
  return colors[role] || '#95a5a6';
}

// Get role icon for UI
export function getRoleIcon(role: UserRole): string {
  const icons = {
    superadmin: '👑',
    admin: '🛡️',
    teacher: '👩‍🏫',
    parent: '👨‍👩‍👧‍👦', 
    'content-manager': '📝'
  };
  
  return icons[role] || '👤';
}
