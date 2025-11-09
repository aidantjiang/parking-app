import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./client";
import { ensureUserProfile } from "./firestore";

type AuthSubscriber = (user: User | null) => void;

const subscribers = new Set<AuthSubscriber>();
let unsubscribeInternal: (() => void) | null = null;

const init = () => {
  if (unsubscribeInternal) return;
  unsubscribeInternal = onAuthStateChanged(auth, (user) => {
    if (user) {
      void ensureUserProfile(
        user.uid,
        user.displayName || user.email || undefined
      ).catch((error) => {
        // Swallow profile sync failures so auth state still resolves.
        console.error("Failed to ensure user profile", error);
      });
    }
    subscribers.forEach((cb) => cb(user));
  });
};

export function subscribeToAuth(cb: AuthSubscriber) {
  subscribers.add(cb);
  init();
  // Provide the latest synchronous value so screens can render immediately
  // instead of waiting for the async onAuthStateChanged tick.
  cb(auth.currentUser);
  return () => {
    subscribers.delete(cb);
  };
}

export async function emailPasswordLogin(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function emailPasswordRegister(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function bypassLogin(displayName = "Demo Attendant") {
  const credential = await signInAnonymously(auth);
  if (credential.user) {
    await ensureUserProfile(credential.user.uid, displayName);
  }
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}
