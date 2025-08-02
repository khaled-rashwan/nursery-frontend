// Debug component to help troubleshoot parent portal access issues

import React from 'react';
import { User } from 'firebase/auth';
import { UserRole } from './rolePermissions';

interface DebugInfoProps {
  user: User | null;
  userRole: UserRole | null;
  claims: Record<string, unknown> | null;
  locale: string;
}

export function DebugInfo({ user, userRole, claims }: DebugInfoProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: '#000',
      color: '#00ff00',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      zIndex: 10000,
      opacity: 0.9
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        🐛 DEBUG INFO
      </div>
      
      <div><strong>User:</strong></div>
      <div>• ID: {user?.uid || 'null'}</div>
      <div>• Email: {user?.email || 'null'}</div>
      <div>• Email Verified: {user?.emailVerified ? 'true' : 'false'}</div>
      
      <div style={{ marginTop: '0.5rem' }}><strong>Role:</strong></div>
      <div>• Current Role: {userRole || 'null'}</div>
      <div>• Expected: parent</div>
      <div>• Match: {userRole === 'parent' ? '✅ YES' : '❌ NO'}</div>
      
      <div style={{ marginTop: '0.5rem' }}><strong>Claims:</strong></div>
      <div>• Claims Object: {claims ? 'exists' : 'null'}</div>
      <div>• Role in Claims: {claims?.role as string || 'null'}</div>
      <div>• Claims Keys: {claims ? Object.keys(claims).join(', ') : 'none'}</div>
      
      <div style={{ marginTop: '0.5rem' }}><strong>Access:</strong></div>
      <div>• Should Allow: {userRole === 'parent' ? '✅ YES' : '❌ NO'}</div>
      
      <div style={{ 
        marginTop: '0.5rem', 
        fontSize: '10px', 
        opacity: 0.7 
      }}>
        This debug info only shows in development mode
      </div>
    </div>
  );
}

export default DebugInfo;
