import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCqDlIxPDp-QU6mzthkWnmzM6rZ8rnJdiI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dev1-b3973.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dev1-b3973",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dev1-b3973.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "658150387877",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:658150387877:web:ac90e7b1597a45258f5d4c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7W2BNH8MQ7",
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Initialize analytics if supported
isSupported().then(supported => {
  if (supported) {
    getAnalytics(app);
  }
});

export default app;