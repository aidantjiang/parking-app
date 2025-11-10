"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import CounterAdjust from "../../../../components/CounterAdjust";
import AvailabilityTable from "../../../../components/AvailabilityTable";
import { useAuthUser } from "../../../../lib/hooks/useAuth";
import { useEvent, useLots } from "../../../../lib/hooks/useEvents";
import { adjustCount } from "../../../../lib/firebase/firestore";
import { useToast } from "../../../../components/providers/ToastProvider";

export default function EventHomePage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthUser();
  const { push } = useToast();
  const { event, loading: eventLoading } = useEvent(params?.eventId);
  const {
    lots,
    loading: lotsLoading,
    error: lotsError,
  } = useLots(params?.eventId);
  const selectedLotId =
    searchParams?.get("lotId") ?? (lots.length ? lots[0].id : null);
  const activeLot = useMemo(
    () => lots.find((lot) => lot.id === selectedLotId) ?? null,
    [lots, selectedLotId]
  );

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
        <p className="text-sm text-slate-500">Loading status…</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            Event not found
          </h1>
          <Link
            href="/events"
            className="text-sm text-blue-600 underline"
          >
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  const handleAdjust = async (delta: number) => {
    if (!user || !activeLot) throw new Error("Select a lot to adjust");
    await adjustCount(activeLot.id, delta, user.uid);
  };

  const handleSelectLot = (lotId: string) => {
    router.replace(`/events/${params?.eventId}/home?lotId=${lotId}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-3 rounded-3xl bg-white px-5 py-6 shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {event.name}
              </p>
              <h1 className="text-3xl font-bold text-slate-900">
                Lot workspace
              </h1>
              <p className="text-sm text-slate-600">
                {activeLot
                  ? `Working on ${activeLot.name}`
                  : "Pick a lot to begin counting"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/events/${params?.eventId}/overview`}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Event overview
              </Link>
              <Link
                href={`/events/${params?.eventId}/claim`}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Switch lot
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={activeLot?.id || ""}
              onChange={(e) => handleSelectLot(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select a lot
              </option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name}
                </option>
              ))}
            </select>
            <div className="rounded-2xl border border-slate-200 px-4 py-2 text-sm">
              <p className="text-slate-500 text-xs uppercase tracking-wide">
                Last synced
              </p>
              <p className="font-semibold text-slate-900">
                {activeLot
                  ? new Date(activeLot.updatedAt).toLocaleTimeString()
                  : "—"}
              </p>
            </div>
          </div>
        </header>

        {activeLot ? (
          <div className="space-y-6">
            <CounterAdjust
              count={activeLot.count}
              capacity={activeLot.capacity}
              onAdjust={handleAdjust}
              disabled={lotsLoading}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  Lot snapshot
                </h2>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-500">Capacity</p>
                  <p className="font-semibold text-slate-900">
                    {activeLot.capacity}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-500">Current count</p>
                  <p className="font-semibold text-slate-900">
                    {activeLot.count}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={async () => {
                      try {
                        await handleAdjust(-Math.min(activeLot.count, 5));
                      } catch (error) {
                        push({
                          title: "Update failed",
                          description:
                            error instanceof Error
                              ? error.message
                              : "Please retry.",
                          type: "error",
                        });
                      }
                    }}
                    className="rounded-2xl bg-rose-100 text-rose-700 py-3 text-sm font-semibold"
                  >
                    −5 quick
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await handleAdjust(5);
                      } catch (error) {
                        push({
                          title: "Update failed",
                          description:
                            error instanceof Error
                              ? error.message
                              : "Please retry.",
                          type: "error",
                        });
                      }
                    }}
                    className="rounded-2xl bg-emerald-100 text-emerald-700 py-3 text-sm font-semibold"
                  >
                    +5 quick
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  Live availability
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lots.map((lot) => (
                    <button
                      key={lot.id}
                      onClick={() => handleSelectLot(lot.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        activeLot.id === lot.id
                          ? "border-blue-400 bg-blue-50 text-blue-900"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {lot.name} • {lot.count}/{lot.capacity}
                    </button>
                  ))}
                  {!lots.length && (
                    <p className="text-xs text-slate-500">
                      No lots configured yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
            {lotsError && (
              <p className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">
                {lotsError}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-4">
            <p className="text-lg font-semibold text-slate-900">
              No lots available yet
            </p>
            <p className="text-sm text-slate-600">
              Once lots are configured for this event you can start adjusting
              counts in real time.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
