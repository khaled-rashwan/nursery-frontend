// File: ./fetchAndLogUsers.js

// Import the necessary Firebase SDK modules
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * Fetches the list of users from the 'listUsers' Cloud Function.
 * This function must be called only AFTER a user has successfully logged in.
 * It will log the results or errors directly to the console.
 */
export const fetchAndLogUsers = async () => {
  try {
    // 1. Get the current authenticated user
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // 2. Check if a user is actually logged in
    if (!currentUser) {
      console.error("❌ Error: No user is currently logged in. Please log in first.");
      // In a real app, you might throw an error or return a specific status
      return; 
    }

    console.log("Authenticated as:", currentUser.email, "- Preparing to call listUsers function...");

    // 3. Get a reference to the Firebase Functions service
    const functions = getFunctions();

    // 4. Create a reference to the 'listUsers' callable function
    const listUsersFn = httpsCallable(functions, 'listUsers');

    // 5. Call the function. You can pass parameters here if needed.
    // For example: listUsersFn({ pageSize: 10, searchEmail: 'test@' })
    const result = await listUsersFn();

    // 6. Log the successful result from the function to the console
    console.log("✅ Success! Fetched data from Cloud Function:");
    if (
      result &&
      typeof result === "object" &&
      result.data &&
      typeof result.data === "object" &&
      Array.isArray((result.data as { users: unknown[] }).users)
    ) {
      const data = result.data as { users: Record<string, unknown>[] };
      console.table(data.users);
      console.log("Full response:", data);
    } else {
      console.warn("⚠️ Unexpected response format from Cloud Function:", result);
    }

  } catch (error) {
    // 7. Handle and log any errors that occur during the process
    console.error("❌ Error calling listUsers function:", error);
  }
};
