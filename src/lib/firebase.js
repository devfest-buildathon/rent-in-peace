import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBwuUu1BwRx02ZD4KKfgWauUDF9VIcOr2s",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "rentinpeace.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "rentinpeace",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "rentinpeace.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "260558415707",
  appId: env.VITE_FIREBASE_APP_ID || "1:260558415707:web:8e47bbf742c648138b1c7e",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-NBJT1DT6EM"
};

// Initialize Firebase App safely (singleton)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  deleteUser
};

// Initialize Firebase Storage
export const storage = getStorage(app);
export { ref, uploadBytes, uploadString, getDownloadURL };

// Initialize Firebase Analytics safely for browser / PWA environments
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
