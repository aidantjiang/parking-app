"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createEvent } from "../../../lib/firebase/firestore";
import { useRoleGuard } from "../../../lib/hooks/useAuth";
import { useToast } from "../../../components/providers/ToastProvider";

interface LotInput {
  name: string;
  group: string;
  capacity: number;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { allowed, loading, user } = useRoleGuard("admin");
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [eventName, setEventName] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [lots, setLots] = useState<LotInput[]>([
    { name: "Main Lot", group: "General", capacity: 100 },
  ]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking permissions…</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            Admin access required
          </h1>
          <p className="text-sm text-slate-600">
            Only admins can create events and lot groups. Please ask an admin to
            elevate your role.
          </p>
        </div>
      </main>
    );
  }

  const addLot = () => {
    setLots((prev) => [
      ...prev,
      { name: `Lot ${prev.length + 1}`, group: "General", capacity: 100 },
    ]);
  };

  const updateLot = (index: number, field: keyof LotInput, value: string) => {
    setLots((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === "capacity" ? Number(value) : value,
      };
      return copy;
    });
  };

  const removeLot = (index: number) => {
    setLots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const eventId = await createEvent(
        {
          name: eventName,
          startAt,
          endAt,
          location,
          visibility,
          capacityDefaults: {
            perLot: 100,
          },
          initialLots: lots,
        },
        user.uid
      );
      push({
        title: "Event created",
        description: "You can now claim a lot.",
        type: "success",
      });
      router.push(`/events/${eventId}/claim`);
    } catch (error) {
      push({
        title: "Creation failed",
        description:
          error instanceof Error ? error.message : "Please retry shortly.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        <header>
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Create event
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Event details & lot groups
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Event name
              </label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Start
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">
                End
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "public" | "private")
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Lot groups
              </h2>
              <button
                type="button"
                onClick={addLot}
                className="rounded-2xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-500 transition-colors"
              >
                Add lot
              </button>
            </div>
            <div className="space-y-4">
              {lots.map((lot, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-4 grid md:grid-cols-4 gap-4"
                >
                  <div>
                    <label className="text-xs font-semibold text-slate-500">
                      Lot name
                    </label>
                    <input
                      value={lot.name}
                      onChange={(e) => updateLot(index, "name", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">
                      Group
                    </label>
                    <input
                      value={lot.group}
                      onChange={(e) =>
                        updateLot(index, "group", e.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={lot.capacity}
                      onChange={(e) =>
                        updateLot(index, "capacity", e.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeLot(index)}
                      className="w-full rounded-2xl bg-rose-600 text-white py-2 text-sm font-semibold shadow-sm hover:bg-rose-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-blue-600 py-4 text-white font-semibold text-lg disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create event"}
          </button>
        </form>
      </div>
    </main>
  );
}
