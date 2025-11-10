"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventPicker from "../../components/EventPicker";
import { useAuthUser, useUserProfile } from "../../lib/hooks/useAuth";
import { useEventsFeed } from "../../lib/hooks/useEvents";
import { logout } from "../../lib/firebase/auth";
import { useToast } from "../../components/providers/ToastProvider";

export default function EventsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const { user, loading: authLoading } = useAuthUser();
  const { profile } = useUserProfile(user?.uid);
  const { events, loading, hasMore, loadMore, error } = useEventsFeed(query);
  const { push } = useToast();

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const handleSelect = (eventId: string) => {
    router.push(`/events/${eventId}/claim`);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
      push({
        title: "Signed out",
        description: "You can sign back in any time.",
        type: "success",
      });
    } catch (err) {
      push({
        title: "Sign out failed",
        description:
          err instanceof Error
            ? err.message
            : "Please retry in a few seconds.",
        type: "error",
      });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Events
          </p>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <h1 className="text-3xl font-bold text-slate-900">
              Join or create an event
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
              <Link
                href="/events/create"
                className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
                  isAdmin
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
                aria-disabled={!isAdmin}
              >
                Create event {isAdmin ? "" : "(admin only)"}
              </Link>
            </div>
          </div>
        </header>

        {authLoading ? (
          <p className="text-sm text-slate-500">Loading your events…</p>
        ) : (
          <EventPicker
            events={events}
            query={query}
            onQueryChange={setQuery}
            onSelect={handleSelect}
            onLoadMore={hasMore ? loadMore : undefined}
            loading={loading}
            hasMore={hasMore}
            error={error}
          />
        )}
      </div>
    </main>
  );
}
