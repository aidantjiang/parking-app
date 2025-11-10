"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import AvailabilityTable from "../../../../components/AvailabilityTable";
import { useAuthUser } from "../../../../lib/hooks/useAuth";
import { useEvent, useLots } from "../../../../lib/hooks/useEvents";

export default function OverviewPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthUser();
  const { event, loading: eventLoading } = useEvent(params?.eventId);
  const { lots, loading: lotsLoading } = useLots(params?.eventId);
  const highlightedLotId = searchParams?.get("lotId") ?? undefined;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking authentication…</p>
      </main>
    );
  }

  if (!authLoading && !user) {
    return null;
  }

  if (eventLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading event…</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            Event not found
          </h1>
          <Link href="/events" className="text-blue-600 underline text-sm">
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              {event.name}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              All lots availability
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Last synced {lots.length ? new Date(lots[0].updatedAt).toLocaleTimeString() : "—"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/events/${params?.eventId}/home`}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Back to home
            </Link>
            <Link
              href={`/events/${params?.eventId}/claim`}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Claim screen
            </Link>
          </div>
        </header>

        <AvailabilityTable
          lots={lots}
          highlightLotId={highlightedLotId}
        />

        {lotsLoading && (
          <p className="text-sm text-slate-500">Listening for live updates…</p>
        )}
      </div>
    </main>
  );
}
