"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import AvailabilityTable from "../../../../components/AvailabilityTable";
import DeviceClaimForm from "../../../../components/DeviceClaimForm";
import LotCard from "../../../../components/LotCard";
import { useAuthUser } from "../../../../lib/hooks/useAuth";
import { useEvent, useLots } from "../../../../lib/hooks/useEvents";

export default function ClaimPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();
  const { event, loading: eventLoading } = useEvent(params?.eventId);
  const {
    lots,
    loading: lotsLoading,
    error: lotsError,
  } = useLots(params?.eventId);

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

  const handleOpenLot = async (lotId: string) => {
    router.push(`/events/${params?.eventId}/home?lotId=${lotId}`);
  };

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
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Event not found
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Ask your admin to invite you or create a new event.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              {event.name}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Choose a lot workspace
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              {new Date(event.startAt).toLocaleString()} →{" "}
              {new Date(event.endAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => router.push(`/events/${params?.eventId}/overview`)}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold"
          >
            View overview
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <DeviceClaimForm
            lots={lots}
            onClaim={handleOpenLot}
            busy={lotsLoading}
          />
          <AvailabilityTable
            lots={lots}
            onSelect={(lotId) => handleOpenLot(lotId)}
          />
        </div>
        {lotsError && (
          <p className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {lotsError}
          </p>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Available lots
            </h2>
            <p className="text-sm text-slate-500">
              {lots.length} lots in this event
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {lots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onOpen={handleOpenLot}
              />
            ))}
          </div>
          {!lots.length && (
            <p className="text-sm text-slate-500">
              Lots will appear here once the admin adds them.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
