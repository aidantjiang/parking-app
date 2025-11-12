"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/pageshell";
import { Button } from "@/components/ui/button";
import { EventPicker } from "@/components/core/event-picker";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  return (
    <PageShell heading="Join an Event" subheading="Choose adventure">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card title="1. Authenticate" subtitle="Campus or demo access">
          Sign in or hit demo mode. Admins can enable SAML once campus gives metadata.
        </Card>
        <Card title="2. Claim device" subtitle="Vision node pairing">
          Select your event and claim the lot that matches the device short code.
        </Card>
        <Card title="3. Go live" subtitle="Realtime counts">
          Use the Home screen to sync counts, view overview, or release your claim.
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-onyx-500">Tap an event to jump into the claim flow.</p>
        {user?.role === "admin" && (
          <Link href="/events/create">
            <Button variant="primary">Create Event</Button>
          </Link>
        )}
      </div>

      <EventPicker onSelect={(event) => router.push(`/events/${event.id}/claim`)} />
    </PageShell>
  );
}
