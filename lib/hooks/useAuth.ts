"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuth } from "../firebase/auth";
import { listenUserProfile } from "../firebase/firestore";
import type { UserDoc } from "../types";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, authenticated: !!user };
}

export function useUserProfile(uid?: string) {
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(uid));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = listenUserProfile(
      uid,
      (data) => {
        setProfile(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid]);

  return { profile, loading, error };
}

export function useRoleGuard(requiredRole: "attendant" | "admin") {
  const { user, loading: authLoading } = useAuthUser();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);

  const loading = authLoading || profileLoading;
  const allowed = useMemo(() => {
    if (!profile) return false;
    if (requiredRole === "attendant") return true;
    return profile.role === "admin";
  }, [profile, requiredRole]);

  return {
    loading,
    allowed,
    role: profile?.role,
    user,
  };
}
