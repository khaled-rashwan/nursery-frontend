/**
 * Attendance Data Diagnostic Script for Next.js Firebase v9+
 * 
 * Instructions:
 * 1. Open your teacher portal in the browser
 * 2. Make sure you're logged in as a teacher
 * 3. Open Browser Developer Tools (F12)
 * 4. Go to Console tab
 * 5. Copy and paste this entire script
 * 6. Press Enter to run it
 */

const diagnosticAttendanceData = async () => {
  console.log("🔍 Starting Attendance Data Diagnostic...");
  console.log("=====================================");

  try {
    // For Next.js with Firebase v9+, we need to access Firebase differently
    // Try to import Firebase modules dynamically
    let firebaseApp, firestoreDb, collection, doc, getDocs, getDoc;
    
    try {
      // Method 1: Try to access from window (if exposed globally)
      if (window.__FIREBASE_APP__ && window.__FIREBASE_DB__) {
        firestoreDb = window.__FIREBASE_DB__;
        console.log("✅ Found Firebase from global window object");
      } else {
        // Method 2: Try to load Firebase modules dynamically
        console.log("🔧 Attempting to load Firebase modules...");
        
        // Import Firebase modules (this works in modern browsers)
        const firebaseApp = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
        const firebaseFirestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        
        console.log("❌ Dynamic import not working. Trying alternative method...");
      }
    } catch (importError) {
      console.log("⚠️ Could not import Firebase dynamically. Trying alternative approach...");
    }

    // Method 3: Try to find Firebase in React DevTools or component state
    // Look for React components that might have Firebase
    const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
    if (reactRoot && reactRoot._reactInternalFiber) {
      console.log("🔧 Trying to access Firebase through React internals...");
    }

    // Method 4: Check for Firestore requests in network
    console.log("🌐 Alternative: Check Network tab for Firestore requests");
    console.log("📋 Look for requests to: firestore.googleapis.com");
    console.log("🎯 The URL will show you the exact path where data is stored");

    // Method 5: Manual inspection instructions
    console.log("\n🔍 MANUAL INSPECTION METHOD:");
    console.log("1. Open Network tab in DevTools");
    console.log("2. Clear network log");
    console.log("3. Save attendance in your app");
    console.log("4. Look for POST request to firestore.googleapis.com");
    console.log("5. Check the request URL - it will show the exact document path");
    console.log("\n📍 Expected path format:");
    console.log("   projects/future-nursery/databases/(default)/documents/enrollments/{ENROLLMENT_ID}/attendance/{DATE}");

    // Method 6: Check localStorage for any cached data
    console.log("\n💾 Checking browser storage for cached data...");
    
    const storageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('attendance') || key.includes('enrollment') || key.includes('firebase'))) {
        storageKeys.push(key);
        const value = localStorage.getItem(key);
        console.log(`🗂️ LocalStorage ${key}:`, value);
      }
    }
    
    if (storageKeys.length === 0) {
      console.log("📭 No attendance-related data found in localStorage");
    }

    // Method 7: Check sessionStorage
    console.log("\n🔄 Checking sessionStorage...");
    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('attendance') || key.includes('enrollment'))) {
        sessionKeys.push(key);
        console.log(`🗂️ SessionStorage ${key}:`, sessionStorage.getItem(key));
      }
    }

    if (sessionKeys.length === 0) {
      console.log("📭 No attendance-related data found in sessionStorage");
    }
    // Method 8: Show enrollment ID generation logic
    console.log("\n🎯 ENROLLMENT ID ANALYSIS:");
    console.log("Based on your code, enrollment IDs are generated as:");
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    console.log(`   Format: ${currentYear}-${nextYear}_[CLASS_ID]`);
    console.log(`   Example: ${currentYear}-${nextYear}_kg1-a`);
    console.log("\n� To find your data in Firebase Console:");
    console.log("1. Go to Firestore Database");
    console.log("2. Look for 'enrollments' collection");
    console.log("3. Find document with ID like '2025-2026_[your-class-id]'");
    console.log("4. Click on the document (not just expand)");
    console.log("5. Look for 'attendance' subcollection tab at the top");
    console.log("6. If no tab, click 'Start collection' and type 'attendance'");

  } catch (error) {
    console.error("❌ Diagnostic failed:", error);
  }

  console.log("\n🏁 Diagnostic completed!");
  console.log("=====================================");
  console.log("\n💡 NEXT STEPS:");
  console.log("1. Check Network tab when saving attendance");
  console.log("2. Look for firestore.googleapis.com requests");
  console.log("3. The request URL will show exact storage path");
  console.log("4. Navigate to that path in Firebase Console");
};

// Instructions for the user
console.log("🚀 ATTENDANCE DATA DIAGNOSTIC TOOL");
console.log("===================================");
console.log("📋 This script will check where your attendance data is stored.");
console.log("🔧 Make sure you're on the teacher portal page and logged in.");
console.log("▶️  Running diagnostic now...");

// Run the diagnostic
diagnosticAttendanceData();
