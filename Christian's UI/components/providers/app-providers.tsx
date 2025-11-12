"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/auth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Space Grotesk, sans-serif" } }} />
    </AuthProvider>
  );
}
