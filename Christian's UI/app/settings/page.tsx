"use client";

import { PageShell } from "@/components/layout/pageshell";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user, setRole } = useAuthContext();

  return (
    <PageShell heading="Profile" subheading="Roles & access">
      <div className="rounded-3xl border border-onyx-500/10 bg-white/90 p-6 shadow-xl">
        <p className="text-sm text-onyx-500">Signed in as</p>
        <h2 className="font-display text-3xl text-onyx-700">{user?.displayName ?? "Guest"}</h2>
        <p className="text-sm text-onyx-400">Role: {user?.role ?? "attendant"}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={() => setRole("attendant")}>
            Switch to Attendant
          </Button>
          <Button variant="ghost" onClick={() => setRole("admin")}>
            Switch to Admin
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
