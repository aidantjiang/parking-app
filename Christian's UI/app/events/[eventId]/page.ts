import { Button } from "@/components/ui/Button";

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  return (
    <main className="max-w-2xl mx-auto py-10 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Event #{eventId}</h1>
      <p className="text-gray-600">Attendant assignments and live lot status will appear here.</p>
      <Button variant="primary">Add Attendant</Button>
    </main>
  );
}
