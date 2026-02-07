import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyBc1nHfDUtw6yprHQQ-B0FkBPPgNnUtIIk",
  authDomain: "sellerpintar-f6927.firebaseapp.com",
  projectId: "sellerpintar-f6927",
  storageBucket: "sellerpintar-f6927.firebasestorage.app",
  messagingSenderId: "625554108337",
  appId: "1:625554108337:web:cd4a295e66d63ed0fad790",
  measurementId: "G-YB6PYWPF74"
};

// --- WAJIB DIAKTIFKAN DI FIREBASE CONSOLE ---
// Agar aplikasi berjalan, pastikan Anda sudah melakukan ini di Console:
// 1. Authentication: Menu Build > Authentication > Sign-in method > Aktifkan "Google".
// 2. Database: Menu Build > Firestore Database > Create Database > Pilih "Start in Test Mode".
// 3. Authorized Domains: Menu Build > Authentication > Settings > Authorized domains > Tambahkan domain aplikasi ini.

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (Safe check)
let analytics;
if (typeof window !== 'undefined') {
  try {
     analytics = getAnalytics(app);
  } catch (e) {
     console.warn("Analytics initialization failed", e);
  }
}
export { analytics };