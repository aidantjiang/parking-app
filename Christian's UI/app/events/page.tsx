import { Card } from "@/components/ui/Card";
import Link from "next/link";

const dummyEvents = [
  { id: 1, name: "CU Boulder Game", date: "Nov 21, 2025" },
  { id: 2, name: "Downtown Concert", date: "Nov 28, 2025" },
];

export default function EventsPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Your Events</h1>
      <div className="grid gap-4">
        {dummyEvents.map((e) => (
          <Link key={e.id} href={`/events/${e.id}`}>
            <Card title={e.name} subtitle={e.date}>
              Manage parking and attendants
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
