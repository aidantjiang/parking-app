import { redirect } from "next/navigation";

interface Params {
  params: { eventId: string };
}

export default function EventIndex({ params }: Params) {
  redirect(`/events/${params.eventId}/home`);
}
