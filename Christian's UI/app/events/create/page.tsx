"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/pageshell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthContext, useRequireRole } from "@/components/providers/auth-provider";
import { dataStore } from "@/lib/data-store";
import toast from "react-hot-toast";

export default function CreateEventPage() {
  useRequireRole("admin");
  const { user } = useAuthContext();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    startAt: "",
    endAt: "",
    location: "",
    capacityDefault: "200",
    visibility: "private",
    lotGroups: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const doc = await dataStore.createEvent({
        name: form.name,
        startAt: form.startAt,
        endAt: form.endAt,
        location: form.location,
        visibility: form.visibility as "public" | "private",
        capacityDefault: Number(form.capacityDefault || 0),
        lotGroups: form.lotGroups
          .split(",")
          .map((group) => group.trim())
          .filter(Boolean),
        createdBy: user.uid,
      });
      toast.success("Event created");
      router.push(`/events/${doc.id}/claim`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell heading="Create Event" subheading="Admin only">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-onyx-500/10 bg-white/90 p-6 shadow-xl"
      >
        <Input label="Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Start"
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => handleChange("startAt", e.target.value)}
            required
          />
          <Input
            label="End"
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => handleChange("endAt", e.target.value)}
            required
          />
        </div>
        <Input label="Location" value={form.location} onChange={(e) => handleChange("location", e.target.value)} required />
        <Input
          label="Capacity default"
          type="number"
          value={form.capacityDefault}
          onChange={(e) => handleChange("capacityDefault", e.target.value)}
        />
        <Input
          label="Lot groups"
          value={form.lotGroups}
          onChange={(e) => handleChange("lotGroups", e.target.value)}
          hint="Comma separated list (Premium, General, ADA...)"
        />
        <label className="text-sm font-semibold text-onyx-600">Visibility</label>
        <select
          value={form.visibility}
          onChange={(event) => handleChange("visibility", event.target.value)}
          className="w-full rounded-2xl border border-onyx-500/20 px-3 py-2"
        >
          <option value="private">Private / invite only</option>
          <option value="public">Public</option>
        </select>
        <Button type="submit" loading={loading} variant="primary">
          Save event
        </Button>
      </form>
    </PageShell>
  );
}
