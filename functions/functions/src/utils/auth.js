const admin = require('firebase-admin');

// Authentication middleware
const authenticate = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: { status: 401, message: 'Unauthorized: No token provided' } };
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { decodedToken };
  } catch (err) {
    return { error: { status: 401, message: 'Unauthorized: Invalid token' } };
  }
};

// Role validation
const requireRole = (decodedToken, allowedRoles) => {
  const role = decodedToken.role || (decodedToken.customClaims && decodedToken.customClaims.role);
  if (!allowedRoles.includes(role)) {
    return { error: { status: 403, message: 'Forbidden: Insufficient permissions' } };
  }
  return { role };
};

// Admin/Superadmin check
const requireAdmin = (decodedToken) => {
  return requireRole(decodedToken, ['admin', 'superadmin']);
};

module.exports = {
  authenticate,
  requireRole,
  requireAdmin
};
