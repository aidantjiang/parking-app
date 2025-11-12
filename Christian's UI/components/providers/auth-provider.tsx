"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth, isFirebaseReady } from "@/lib/firebase/client";
import type { UserDoc } from "@/lib/types";
import toast from "react-hot-toast";

interface AuthContextValue {
  user: UserDoc | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: (role?: UserDoc["role"]) => void;
  setRole: (role: UserDoc["role"]) => void;
  federatedEnabled: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isFirebaseReady) return;
    if (typeof window === \"undefined\") return;
    const cached = localStorage.getItem(\"cu-demo-user\");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserDoc;
        setUser(parsed);
      } catch {
        localStorage.removeItem(\"cu-demo-user\");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isFirebaseReady || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const persistedRole = typeof window !== "undefined" ? localStorage.getItem(`cu-role:${firebaseUser.uid}`) : null;
      const role = (persistedRole as UserDoc["role"]) ?? "attendant";
      setUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? firebaseUser.email ?? "",
        email: firebaseUser.email ?? undefined,
        role,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseReady || !auth) {
      throw new Error("Firebase Auth is not configured in this environment.");
    }
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Signed in");
  }, []);

  const signOut = useCallback(async () => {
    if (isFirebaseReady && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    toast.success("Signed out");
    router.push("/login");
  }, [router]);

  const continueAsGuest = useCallback((role: UserDoc["role"] = "attendant") => {
    const guest: UserDoc = {
      uid: `guest-${Date.now()}`,
      role,
      displayName: role === "admin" ? "Demo Admin" : "Demo Attendant",
    };
    setUser(guest);
    if (typeof window !== "undefined") {
      localStorage.setItem("cu-demo-user", JSON.stringify(guest));
    }
    toast.success(`Continuing as ${role}`);
    router.push(pathname === "/login" ? "/events" : pathname);
  }, [pathname, router]);

  const setRole = useCallback((role: UserDoc["role"]) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(`cu-role:${prev.uid}`, role);
      }
      return { ...prev, role };
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn,
    signOut,
    continueAsGuest,
    setRole,
    federatedEnabled: isFirebaseReady,
  }), [user, loading, signIn, signOut, continueAsGuest, setRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export function useUser() {
  const { user, loading } = useAuthContext();
  return { user, loading };
}

export function useRequireRole(role: UserDoc["role"]) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role === "admin" && user.role !== "admin") {
      router.replace("/events");
    }
  }, [loading, user, router, pathname, role]);
}
