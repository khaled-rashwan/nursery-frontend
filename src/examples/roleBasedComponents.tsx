// Example usage of role-based authorization in kindergarten components

import { UserRole, hasPermission, canAccessAdmin, canManageUsers, canManageClasses } from '../utils/rolePermissions';

// Example: Protecting a component based on user role
export function AdminOnlyComponent({ userRole }: { userRole: UserRole | undefined }) {
  if (!canAccessAdmin(userRole)) {
    return (
      <div>
        <h3>Access Denied</h3>
        <p>You don&apos;t have permission to view this admin content.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Admin Content</h3>
      <p>This content is only visible to admins and superadmins.</p>
    </div>
  );
}

// Example: Conditional rendering based on permissions
export function ClassManagementPanel({ userRole }: { userRole: UserRole | undefined }) {
  return (
    <div>
      <h3>Class Management</h3>
      
      {/* Show basic class info to all authorized users */}
      {canManageClasses(userRole) && (
        <div>
          <h4>Your Classes</h4>
          {/* List of classes... */}
        </div>
      )}
      
      {/* Show advanced features only to admins */}
      {canAccessAdmin(userRole) && (
        <div>
          <h4>Admin Actions</h4>
          <button>Create New Class</button>
          <button>Delete Class</button>
        </div>
      )}
      
      {/* Show user management only to superadmins */}
      {canManageUsers(userRole) && (
        <div>
          <h4>User Management</h4>
          <button>Add Teacher</button>
          <button>Remove User</button>
        </div>
      )}
    </div>
  );
}

// Example: Using specific permission checks
export function ReportsSection({ userRole }: { userRole: UserRole | undefined }) {
  const canViewReports = hasPermission(userRole, 'view_reports');
  const canManageFees = hasPermission(userRole, 'manage_fees');

  if (!canViewReports) {
    return null; // Don't show anything if user can't view reports
  }

  return (
    <div>
      <h3>Reports</h3>
      
      <div>
        <button>View Attendance Report</button>
        <button>View Academic Progress</button>
      </div>
      
      {canManageFees && (
        <div>
          <h4>Financial Reports</h4>
          <button>View Fee Collection</button>
          <button>Generate Invoice</button>
        </div>
      )}
    </div>
  );
}

// Example: Role-based navigation menu
export function NavigationMenu({ userRole }: { userRole: UserRole | undefined }) {
  const menuItems = [];

  // Common items for all authenticated users
  if (userRole) {
    menuItems.push({ label: 'Dashboard', href: '/dashboard' });
  }

  // Teacher and admin items
  if (canManageClasses(userRole)) {
    menuItems.push({ label: 'Classes', href: '/classes' });
    menuItems.push({ label: 'Students', href: '/students' });
  }

  // Admin only items
  if (canAccessAdmin(userRole)) {
    menuItems.push({ label: 'Reports', href: '/reports' });
    menuItems.push({ label: 'Settings', href: '/settings' });
  }

  // Superadmin only items
  if (canManageUsers(userRole)) {
    menuItems.push({ label: 'User Management', href: '/users' });
  }

  // Parent specific items
  if (userRole === 'parent') {
    menuItems.push({ label: 'My Children', href: '/children' });
    menuItems.push({ label: 'Fees', href: '/fees' });
  }

  return (
    <nav>
      <ul>
        {menuItems.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
