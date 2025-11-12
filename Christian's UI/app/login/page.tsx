"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/layout/pageshell";
import { useAuthContext } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const { signIn, continueAsGuest, federatedEnabled } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell hideNav heading="Welcome back, Buff." subheading="Authenticate">
      <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-xl">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Sign in
          </Button>
          <Button type="button" variant="ghost" onClick={() => continueAsGuest("attendant")} fullWidth>
            Skip for now (Attendant)
          </Button>
          <Button type="button" variant="secondary" onClick={() => continueAsGuest("admin")} fullWidth>
            Continue as Admin Demo
          </Button>
        </form>
        <div className="rounded-3xl border border-onyx-500/10 bg-onyx-800 p-6 text-buff-100 shadow-2xl">
          <h2 className="font-display text-2xl">Federated / SAML</h2>
          <p className="mt-2 text-sm text-buff-200">
            Campus SSO (FedAuth) slots in here once IT shares the metadata. Until then, use demo mode.
          </p>
          <Button className="mt-6 w-full" variant="ghost" disabled={!federatedEnabled}>
            {federatedEnabled ? "Sign in with FedAuth" : "FedAuth coming soon"}
          </Button>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-buff-300">
            Need an account? <Link href="/events" className="underline">Request access</Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
