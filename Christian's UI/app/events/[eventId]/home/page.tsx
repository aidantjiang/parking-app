"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/pageshell";
import { useEvent, useLots } from "@/hooks/use-data";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { CounterAdjust } from "@/components/core/counter-adjust";
import { LotCard } from "@/components/core/lot-card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { dataStore } from "@/lib/data-store";

export default function HomePage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params.eventId;
  const { event, loading } = useEvent(eventId);
  const { lots, loading: lotsLoading } = useLots(eventId);
  const { user } = useAuthContext();
  const claimedLot = lots.find((lot) => lot.claimedBy === user?.uid);

  const release = async () => {
    if (!claimedLot || !user) return;
    try {
      await dataStore.releaseLot(claimedLot.id, user.uid);
      toast.success("Lot released");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <PageShell heading={event?.name ?? "Event"} subheading="Home Screen">
      {(loading || lotsLoading) && <Skeleton className="h-20" />}

      <div className="mb-8 flex flex-wrap gap-4">
        <Button variant="ghost" onClick={() => router.push(`/events/${eventId}/claim`)}>
          Reclaim / change lot
        </Button>
        <Button variant="ghost" onClick={() => router.push(`/events/${eventId}/overview`)}>
          All lots overview
        </Button>
      </div>

      {claimedLot ? (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <CounterAdjust lot={claimedLot} userId={user?.uid ?? "guest"} />
          <div className="space-y-4">
            <LotCard lot={claimedLot} currentUserId={user?.uid} onRelease={release} />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-onyx-500/20 p-6 text-sm text-onyx-500">
          <p>You do not have a claimed lot yet. Head to the claim screen to start syncing counts.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push(`/events/${eventId}/claim`)}>
            Claim a lot
          </Button>
        </div>
      )}
    </PageShell>
  );
}
