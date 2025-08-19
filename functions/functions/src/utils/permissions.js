// Permission matrix for user management
const canEditUser = (editorRole, targetRole) => {
  if (targetRole === 'superadmin') return false;
  if (targetRole === 'admin' && editorRole !== 'superadmin') return false;
  return true;
};

const canDeleteUser = (deleterRole, targetRole) => {
  if (targetRole === 'superadmin') return false;
  if (targetRole === 'admin' && deleterRole !== 'superadmin') return false;
  return true;
};

const canCreateRole = (creatorRole, targetRole) => {
  if (targetRole === 'superadmin') return false;
  if (targetRole === 'admin' && creatorRole !== 'superadmin') return false;
  return true;
};

const canAssignRole = (assignerRole, targetRole) => {
  if (targetRole === 'superadmin') return false;
  if (targetRole === 'admin' && assignerRole !== 'superadmin') return false;
  return true;
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
