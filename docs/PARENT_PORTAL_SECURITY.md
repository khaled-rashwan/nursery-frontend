# Parent Portal Security Implementation

## Overview
This document describes the role-based access control and security features implemented for the Parent Portal in the Future Step Nursery application.

## Security Features

### 1. Role-Based Access Control (RBAC)
- **Purpose**: Ensures only users with "parent" role can access the parent portal
- **Implementation**: Checks Firebase custom claims for user role
- **Location**: `src/app/[locale]/parent-portal/page.tsx`

### 2. Comprehensive Security Checks
- **Authentication Check**: Verifies user is logged in
- **Email Verification**: Checks if user's email is verified (optional)
- **Role Verification**: Confirms user has "parent" role
- **Session Validation**: Checks token expiration
- **Location**: `src/utils/parentPortalSecurity.ts`

### 3. Security Event Logging
- **Purpose**: Audit trail for security-related events
- **Events Logged**:
  - `access_denied`: When access is denied due to role mismatch
  - `unauthorized_access`: When role check fails
  - `role_mismatch`: When user has wrong role
- **Data Logged**: User ID, role, timestamp, user agent

### 4. Session Monitoring
- **Auto-logout**: Automatically logs out users when session expires
- **Warning System**: Shows warning 5 minutes before session expiry
- **Real-time Updates**: Countdown timer for session expiry

### 5. Access Denied Handling
- **User-Friendly Messages**: Clear explanations for access denial
- **Role Display**: Shows current user role for debugging
- **Action Options**: Logout, retry, or go to home page
- **Multilingual Support**: English and Arabic messages

## User Experience Flow

### 1. Normal Parent Access
```
User Login → Role Check → Parent Role Verified → Dashboard Access
```

### 2. Non-Parent User Access
```
User Login → Role Check → Role Mismatch Detected → Access Denied Screen
```

### 3. Role Check Error
```
User Login → Role Check → Error Occurred → Error Screen with Retry Option
```

## Security Components

### AccessDenied Component
- Displays when user doesn't have parent role
- Shows current role for debugging
- Provides clear instructions for resolution
- Includes contact information for support

### SessionMonitor Component
- Monitors session expiration in real-time
- Shows warning popup before expiry
- Automatically logs out expired sessions
- Dismissible warning interface

### Security Utilities
- `checkParentPortalAccess()`: Comprehensive access validation
- `logSecurityEvent()`: Security event logging
- `getSecureErrorMessage()`: Safe error messages
- `sanitizeUserRoleForDisplay()`: Safe role display

## Error Handling

### 1. Role Check Failures
- Network errors during role verification
- Invalid or missing Firebase claims
- Token parsing errors

### 2. Session Issues
- Expired authentication tokens
- Network connectivity problems
- Firebase service unavailability

### 3. Security Violations
- Users with wrong roles accessing parent portal
- Multiple failed authentication attempts
- Suspicious access patterns

## Configuration

### Required Firebase Custom Claims
```javascript
{
  role: 'parent', // Required for parent portal access
  permissions: ['view_child_progress'] // Optional specific permissions
}
```

### Environment Variables
No additional environment variables required for basic functionality.

## Testing Scenarios

### 1. Valid Parent Access
- User with "parent" role should access dashboard
- Session monitoring should be active
- All features should be accessible

### 2. Invalid Role Access
- User with "admin" role should see access denied
- User with "teacher" role should see access denied
- User with no role should see access denied

### 3. Session Expiry
- Users should see warning before expiry
- Automatic logout should occur on expiry
- Re-authentication should be required

### 4. Error Recovery
- Network errors should show retry option
- Retry should work after network recovery
- Logout option should always be available

## Security Best Practices

### 1. Principle of Least Privilege
- Only "parent" role can access parent portal
- No fallback or default access permissions
- Explicit role checking on every page load

### 2. Defense in Depth
- Multiple layers of security checks
- Client-side and server-side validation
- Session monitoring and automatic cleanup

### 3. Audit Trail
- All security events are logged
- User actions are tracked
- Failed access attempts are recorded

### 4. User Experience
- Clear error messages without exposing sensitive data
- Helpful guidance for resolving access issues
- Multilingual support for international users

## Maintenance

### Regular Tasks
1. Review security logs for suspicious activity
2. Update role permissions as needed
3. Test access control with different user roles
4. Monitor session expiry warnings effectiveness

### Security Updates
- Keep Firebase SDK updated
- Review and update security utilities
- Test new authentication flows
- Audit custom claims implementation

## Troubleshooting

### Common Issues

1. **User sees "Access Denied" but should have access**
   - Check Firebase custom claims in console
   - Verify role is exactly "parent" (case-sensitive)
   - Ensure claims are properly set on user account

2. **Session warnings not appearing**
   - Check token expiration settings in Firebase
   - Verify SessionMonitor component is rendered
   - Check browser console for JavaScript errors

3. **Role check fails with network error**
   - Verify Firebase configuration
   - Check network connectivity
   - Review Firebase service status

### Debug Information
- Current user role is displayed in access denied screen
- Console logs provide detailed error information
- Security events are logged for audit purposes
