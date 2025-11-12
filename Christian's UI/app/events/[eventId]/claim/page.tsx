"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/pageshell";
import { useEvent, useLots } from "@/hooks/use-data";
import { Skeleton } from "@/components/ui/skeleton";
import { DeviceClaimForm } from "@/components/core/device-claim-form";
import { LotCard } from "@/components/core/lot-card";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ClaimPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params.eventId;
  const { event, loading } = useEvent(eventId);
  const { lots, loading: lotsLoading } = useLots(eventId);
  const { user } = useAuthContext();
  const claimedLot = lots.find((lot) => lot.claimedBy === user?.uid);

  return (
    <PageShell heading={event?.name ?? "Claim a lot"} subheading={event?.location ?? ""}>
      {(loading || lotsLoading) && <Skeleton className="h-32" />}

      {event && (
        <p className="mb-4 text-sm text-onyx-500">
          Confirm you are on-site, then pair the vision node by selecting the lot or entering the short code.
        </p>
      )}

      {!!event?.lotGroups?.length && (
        <div className="mb-4 flex flex-wrap gap-2">
          {event.lotGroups.map((group) => (
            <Badge key={group} label={group} variant="info" />
          ))}
        </div>
      )}

      {lots.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DeviceClaimForm lots={lots} currentUserId={user?.uid} onClaimed={() => router.push(`/events/${eventId}/home`)} />
          {claimedLot ? (
            <LotCard lot={claimedLot} currentUserId={user?.uid} onAdjust={() => router.push(`/events/${eventId}/home`)} />
          ) : (
            <div className="rounded-3xl border border-dashed border-onyx-500/20 p-6 text-sm text-onyx-500">
              No claim yet. Claim a lot to unlock controls.
            </div>
          )}
        </div>
      )}
      {!lots.length && !lotsLoading && (
        <p className="rounded-3xl border border-onyx-500/15 bg-white/80 p-4 text-sm text-onyx-500">
          No lots configured yet. Admins can add lots via the Firebase console or future UI.
        </p>
      )}

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-onyx-700">All lots</h2>
          <Button variant="ghost" onClick={() => router.push(`/events/${eventId}/overview`)}>
            View overview
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} currentUserId={user?.uid} onAdjust={() => router.push(`/events/${eventId}/home`)} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
