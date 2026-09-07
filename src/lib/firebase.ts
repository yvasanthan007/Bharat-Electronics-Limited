import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Fallbacks keep the app booting when no .env file is present.
  // Without them, getAuth() throws "auth/invalid-api-key" during module
  // evaluation, which crashes the entire import graph (blank white page).
  // Must stay in sync with the fallbacks in src/services/firebase.ts.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForBharatElectronicsLimited',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'bel-trust-platform.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'bel-trust-platform',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'bel-trust-platform.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '102938475610',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:102938475610:web:9876543210abcdef',
};

// Initialize Firebase safely without duplicate initialization.
// (src/services/firebase.ts may already have created the default app —
//  calling initializeApp twice with the default name throws app/duplicate-app.)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
