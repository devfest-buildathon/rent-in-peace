import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBwuUu1BwRx02ZD4KKfgWauUDF9VIcOr2s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rentinpeace.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rentinpeace",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rentinpeace.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "260558415707",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:260558415707:web:8e47bbf742c648138b1c7e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NBJT1DT6EM"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged 
};

// Initialize Firebase Analytics safely for browser / PWA environments
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
