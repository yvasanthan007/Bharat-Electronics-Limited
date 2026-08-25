import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForBharatElectronicsLimited',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'bel-trust-platform.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'bel-trust-platform',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'bel-trust-platform.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '102938475610',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:102938475610:web:9876543210abcdef',
};

// Initialize Firebase safely without duplicate initialization
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db: Firestore = getFirestore(app);
export { app };
export const isConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);
