// Security utilities specifically for parent portal access control

import { UserRole } from './rolePermissions';
import { User } from 'firebase/auth';

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  action?: 'retry' | 'logout' | 'redirect';
}

/**
 * Comprehensive security check for parent portal access
 */
export function checkParentPortalAccess(
  user: User | null, 
  userRole: UserRole | null, 
  claims: Record<string, unknown> | null
): SecurityCheckResult {
  // Debug logging for troubleshooting
  console.log('[DEBUG] Security check details:', {
    userExists: !!user,
    userEmail: user?.email,
    emailVerified: user?.emailVerified,
    userRole,
    claims: claims ? Object.keys(claims) : null,
    roleInClaims: claims?.role
  });

  // Check if user is authenticated
  if (!user) {
    return {
      allowed: false,
      reason: 'User not authenticated',
      action: 'redirect'
    };
  }

  // Optional: Check if user has verified email (disabled for now during development)
  // Uncomment this if email verification is required in production
  /*
  if (!user.emailVerified) {
    return {
      allowed: false,
      reason: 'Email not verified',
      action: 'logout'
    };
  }
  */

  // Check if role was retrieved successfully
  if (userRole === null && claims !== null) {
    console.warn('[SECURITY] No role found in claims:', claims);
    return {
      allowed: false,
      reason: 'No role assigned to account',
      action: 'logout'
    };
  }

  // Check if user has parent role
  if (userRole !== 'parent') {
    console.warn('[SECURITY] Role mismatch:', { userRole, expectedRole: 'parent' });
    return {
      allowed: false,
      reason: `Access denied. Current role: ${userRole}`,
      action: 'logout'
    };
  }

  // Check for token expiration (if available)
  if (claims?.exp && typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) {
    console.warn('[SECURITY] Token expired:', { 
      expiry: new Date(claims.exp * 1000),
      current: new Date()
    });
    return {
      allowed: false,
      reason: 'Session expired',
      action: 'logout'
    };
  }

  // All checks passed
  console.log('[DEBUG] Security check passed for user:', user.email);
  return {
    allowed: true
  };
}

/**
 * Sanitize user data for display in access denied screen
 */
export function sanitizeUserRoleForDisplay(role: UserRole | null): string {
  if (!role) return 'No role assigned';
  
  const allowedRoles: UserRole[] = ['superadmin', 'admin', 'teacher', 'parent', 'content-manager'];
  
  if (allowedRoles.includes(role)) {
    return role;
  }
  
  return 'Unknown role';
}

/**
 * Generate a secure error message that doesn't expose sensitive information
 */
export function getSecureErrorMessage(reason: string, locale: string = 'en-US'): string {
  const messages = {
    'en-US': {
      'User not authenticated': 'Please log in to access this page.',
      'Email not verified': 'Please verify your email address to continue.',
      'No role assigned to account': 'Your account does not have the necessary permissions.',
      'Session expired': 'Your session has expired. Please log in again.',
      'default': 'Access denied. Please contact administration for assistance.'
    },
    'ar-SA': {
      'User not authenticated': 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة.',
      'Email not verified': 'يرجى تأكيد عنوان بريدك الإلكتروني للمتابعة.',
      'No role assigned to account': 'حسابك لا يملك الصلاحيات اللازمة.',
      'Session expired': 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
      'default': 'الوصول مرفوض. يرجى التواصل مع الإدارة للمساعدة.'
    }
  };

  const localeMessages = messages[locale as keyof typeof messages] || messages['en-US'];
  return localeMessages[reason as keyof typeof localeMessages] || localeMessages.default;
}

/**
 * Log security events (for future audit trail implementation)
 */
export function logSecurityEvent(
  event: 'access_denied' | 'unauthorized_access' | 'role_mismatch',
  details: {
    userId?: string;
    userRole?: UserRole | null;
    expectedRole: string;
    timestamp: Date;
    userAgent?: string;
  }
) {
  // In production, this would send to a secure logging service
  console.warn('[SECURITY EVENT]', {
    event,
    ...details,
    timestamp: details.timestamp.toISOString()
  });
  
  // Future: Send to audit log service
  // auditService.log(event, details);
}
