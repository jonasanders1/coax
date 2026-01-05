// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

/**
 * Initialize Firebase Auth only in the browser.
 *
 * This avoids Node/ts-node scripts (like migrations) failing with
 * auth/invalid-api-key when env is not fully configured for Auth,
 * while keeping Auth fully available in the client app.
 */
let authInstance: Auth | undefined;
if (typeof window !== "undefined") {
  authInstance = getAuth(app);
}

export const auth = authInstance as Auth;

/**
 * Initialize Firebase Analytics only in the browser.
 *
 * This follows the same pattern as Auth to avoid Node/ts-node scripts
 * failing when Analytics is not configured, while keeping Analytics
 * fully available in the client app.
 */
let analyticsInstance: Analytics | undefined;
if (typeof window !== "undefined") {
  analyticsInstance = getAnalytics(app);
}

export const firebaseAnalytics = analyticsInstance as Analytics;
