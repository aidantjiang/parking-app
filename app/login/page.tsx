"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  bypassLogin,
  emailPasswordLogin,
  emailPasswordRegister,
} from "../../lib/firebase/auth";
import { useAuthUser } from "../../lib/hooks/useAuth";
import { useToast } from "../../components/providers/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const { push } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/events");
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      if (mode === "login") {
        await emailPasswordLogin(email, password);
      } else {
        await emailPasswordRegister(email, password);
      }
      push({
        title: "Welcome",
        description: "You are now signed in.",
        type: "success",
      });
    } catch (error) {
      push({
        title: "Authentication failed",
        description:
          error instanceof Error ? error.message : "Please check credentials.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleBypass = async () => {
    setBusy(true);
    try {
      await bypassLogin();
    } catch (error) {
      push({
        title: "Bypass failed",
        description:
          error instanceof Error ? error.message : "Retry in a second.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <section>
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Parking Attendant Console
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Join or create an event
          </h1>
          <p className="text-sm text-slate-600 mt-4">
            Use SAML FedAuth when available. Until that is rolled out, sign in
            with email and password or use the demo bypass to explore the flow.
          </p>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
            >
              FedAuth / SAML (coming soon)
            </button>
            <button
              type="button"
              onClick={handleBypass}
              disabled={busy}
              className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Bypass for demo"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 text-sm mb-4">
            <button
              className={`flex-1 rounded-2xl py-2 font-semibold ${
                mode === "login"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-2xl py-2 font-semibold ${
                mode === "register"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy
                ? "Working…"
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
          {loading && (
            <p className="text-xs text-slate-500 mt-4">
              Checking authentication status…
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
