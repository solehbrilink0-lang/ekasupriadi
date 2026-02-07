import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";

// Konfigurasi sesuai dengan snippet dari Firebase Console Anda
export const firebaseConfig = {
  apiKey: "AIzaSyBc1nHfDUtw6yprHQQ-B0FkBPPgNnUtIIk",
  authDomain: "sellerpintar-f6927.firebaseapp.com",
  projectId: "sellerpintar-f6927",
  storageBucket: "sellerpintar-f6927.firebasestorage.app",
  messagingSenderId: "625554108337",
  appId: "1:625554108337:web:cd4a295e66d63ed0fad790",
  measurementId: "G-YB6PYWPF74"
};

// Singleton Pattern: Mencegah multiple initialization error
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export service yang digunakan di seluruh aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (Browser only)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(console.error);
}

export { analytics };