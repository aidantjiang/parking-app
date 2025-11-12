import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Safari private mode and older browsers can throw here; ignore and fall back to in-memory auth state.
  });
  db = getFirestore(app);
}

export { app as firebaseApp, auth, db };
export const isFirebaseReady = Boolean(app && auth && db);
