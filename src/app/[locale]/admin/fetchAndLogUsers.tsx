// File: ./fetchAndLogUsers.ts

import { getAuth, User } from "firebase/auth";
import { 
  getFunctions, 
  httpsCallable, 
  connectFunctionsEmulator,
  HttpsCallableResult 
} from "firebase/functions";
import { FirebaseError } from "firebase/app";

// ====================================================================
// 1. DEFINE STRONG TYPES
// These types should exactly match the structure of the data returned 
// by your 'listUsers' Cloud Function.
// ====================================================================

/**
 * Represents a single user record as returned by our backend function.
 */
interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'parent' | 'content-manager';
  disabled: boolean;
  emailVerified: boolean;
  creationTime: string; // ISO date string
  lastSignInTime: string; // ISO date string
}

/**
 * Represents the full response object from the 'listUsers' Cloud Function.
 */
interface ListUsersResult {
  users: UserRecord[];
  pageToken?: string;
  totalUsers: number;
  availableRoles: string[];
}

// ====================================================================
// 2. SETUP FIREBASE FUNCTIONS CONNECTION
// ====================================================================

// Get a single instance of the functions service
const functions = getFunctions();

// Automatically connect to the emulator in development for local testing
if (process.env.NODE_ENV === 'development') {
  try {
    console.log("Development mode: Connecting to local Firebase Functions emulator on localhost:5001");
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (error) {
    console.error("Failed to connect to functions emulator. Is it running?", error);
  }
}

// ====================================================================
// 3. THE BULLETPROOF, STRONGLY-TYPED FUNCTION
// ====================================================================

/**
 * Fetches the list of users from the 'listUsers' Cloud Function,
 * ensuring the user is authenticated and has a fresh ID token.
 * This function is fully type-safe.
 */
export const fetchAndLogUsers = async (): Promise<void> => {
  try {
    const auth = getAuth();
    const currentUser: User | null = auth.currentUser;

    if (!currentUser) {
      console.error("❌ FATAL: No user is currently logged in. This function should not have been called.");
      return;
    }

    console.log(`Authenticated as: ${currentUser.email}. Forcing token refresh before function call...`);

    // CRITICAL FIX: Explicitly force a refresh of the ID token.
    // This guarantees the SDK sends the latest, valid token with all custom claims.
    await currentUser.getIdToken(true);

    console.log("Token refreshed. Calling listUsers function now...");

    // Create a strongly-typed reference to the 'listUsers' callable function.
    // We specify that it takes 'undefined' as input and expects 'ListUsersResult' as output.
    const listUsersFn = httpsCallable<undefined, ListUsersResult>(functions, 'listUsers');

    // Call the function. The result will be strongly typed.
    const result: HttpsCallableResult<ListUsersResult> = await listUsersFn();
    const usersData = result.data;

    console.log("✅ SUCCESS! The Cloud Function call was successful.");
    console.log(`Retrieved ${usersData.totalUsers} users.`);
    console.table(usersData.users); // .table provides a clean, readable output for arrays of objects
    console.log("Full response object:", usersData);

  } catch (error: unknown) {
    // Handle errors in a type-safe way
    console.error("❌ Error calling listUsers function:");
    if (error instanceof FirebaseError) {
      // This is a structured error from the Firebase SDK
      console.error(`  Code: ${error.code}`);
      console.error(`  Message: ${error.message}`);
    } else {
      // This is a generic or unexpected error
      console.error("An unexpected error occurred:", error);
    }
  }
};
