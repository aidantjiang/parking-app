"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/pageshell";
import { useEvent, useLots } from "@/hooks/use-data";
import { AvailabilityTable } from "@/components/core/availability-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const { event, loading } = useEvent(eventId);
  const { lots, loading: lotsLoading } = useLots(eventId);

  return (
    <PageShell heading={event?.name ?? "Overview"} subheading="All lots availability">
      {(loading || lotsLoading) && <Skeleton className="h-10" />}
      {lots.length > 0 ? <AvailabilityTable lots={lots} /> : <p className="text-sm text-onyx-500">No lots yet.</p>}
    </PageShell>
  );
}
