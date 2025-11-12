import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center">
      <h1 className="text-4xl font-bold">Welcome to ParkingServices</h1>
      <p className="text-gray-600">Manage attendants, events, and lots efficiently.</p>
      <Link href="/login">
        <Button variant="primary">Get Started</Button>
      </Link>
    </main>
  );
}
