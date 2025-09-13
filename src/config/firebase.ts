import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Try to get config from environment variables, with fallbacks to hard-coded values if needed
// This isn't ideal for production, but will help with development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDahwOHVoNH8HEOOMRv7kQ_X8jo3h70y4E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-rating-7dc6d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-rating-7dc6d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-rating-7dc6d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "165544085649",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:165544085649:web:af104da75082a6b4639730",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XNLDXTFRCH"
};

// Log which configuration source is being used
console.log('Using Firebase config from:', import.meta.env.VITE_FIREBASE_API_KEY ? '.env file' : 'fallback values');

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.log('Firebase config used:', JSON.stringify(firebaseConfig, null, 2));
  throw new Error('Failed to initialize Firebase. Check console for details.');
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;