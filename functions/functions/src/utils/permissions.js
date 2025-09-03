// Permission matrix for user management
const canEditUser = (editorRole, targetRole) => {
  if (targetRole === 'superadmin') {
    return false;
  }
  if (targetRole === 'admin') {
    return editorRole === 'superadmin';
  }
  return ['superadmin', 'admin'].includes(editorRole);
};

const canDeleteUser = (deleterRole, targetRole) => {
  if (targetRole === 'superadmin') {
    return false;
  }
  if (targetRole === 'admin') {
    return deleterRole === 'superadmin';
  }
  return ['superadmin', 'admin'].includes(deleterRole);
};

const canCreateRole = (creatorRole, targetRole) => {
  if (targetRole === 'superadmin') {
    return false;
  }
  if (targetRole === 'admin') {
    return creatorRole === 'superadmin';
  }
  return ['superadmin', 'admin'].includes(creatorRole);
};

const canAssignRole = (assignerRole, targetRole) => {
  if (targetRole === 'superadmin') {
    return false;
  }
  if (targetRole === 'admin') {
    return assignerRole === 'superadmin';
  }
  return ['superadmin', 'admin'].includes(assignerRole);
};

// Permission check for student/enrollment management

const canManageStudents = (role) => {
  return ['admin', 'superadmin'].includes(role);
};

const canManageEnrollments = (role) => {
  return ['admin', 'superadmin'].includes(role);
};

// Permission check for viewing enrollments (teachers, admins, superadmins, parents)
const canViewEnrollments = (role) => {
  return ['teacher', 'admin', 'superadmin', 'parent'].includes(role);
};

module.exports = {
  canEditUser,
  canDeleteUser,
  canCreateRole,
  canAssignRole,
  canManageStudents,
  canManageEnrollments,
  canViewEnrollments
};
