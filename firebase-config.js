import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - Update with your credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "perpex-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "perpex-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "perpex-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
