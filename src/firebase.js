// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAabxrfcCTD08JRzRKmcCX1kyczwwet9cw",
  authDomain: "future-step-nursery.firebaseapp.com",
  projectId: "future-step-nursery",
  storageBucket: "future-step-nursery.firebasestorage.app",
  messagingSenderId: "583089627394",
  appId: "1:583089627394:web:91c351bd5ac2bee3d7a21b",
  measurementId: "G-8ZHEJSLP6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Firebase services you need
const auth = getAuth(app);
const db = getFirestore(app);

// Export them so your components can use them
export { app, auth, db };