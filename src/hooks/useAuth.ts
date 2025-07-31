import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged, IdTokenResult } from 'firebase/auth';
import { auth } from '../firebase.js';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setAuthState({
        user: userCredential.user,
        loading: false,
        error: null,
      });
      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      const errorMessage = getFirebaseErrorMessage(firebaseError.code || 'unknown');
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      const errorMessage = getFirebaseErrorMessage(firebaseError.code || 'unknown');
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    login,
    logout,
    getUserCustomClaims: async () => {
      if (!authState.user) return null;
      try {
        const idTokenResult: IdTokenResult = await authState.user.getIdTokenResult();
        return idTokenResult.claims;
      } catch (error) {
        console.error('Error getting custom claims:', error);
        return null;
      }
    },
  };
};

const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};
