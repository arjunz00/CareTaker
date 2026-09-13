import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";

// Environment variables or fallback default Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAHD9J1ne35JFdzN92L4YRuEdGn_OkZc0A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "caretaker-c02b5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "caretaker-c02b5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "caretaker-c02b5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1010051495873",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1010051495873:web:b733f56bb0868ea6e7a140",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8B7E3BXYPB"
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, googleProvider };
