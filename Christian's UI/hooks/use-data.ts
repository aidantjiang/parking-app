"use client";

import { useEffect, useMemo, useState } from "react";
import { dataStore } from "@/lib/data-store";
import type { EventDoc, LotDoc } from "@/lib/types";

export function useEvent(eventId?: string) {
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    const unsubscribe = dataStore.listenEvent(eventId, (evt) => {
      setEvent(evt);
      setLoading(false);
    });
    return () => unsubscribe?.();
  }, [eventId]);

  return { event, loading, error };
}

export function useLots(eventId?: string) {
  const [lots, setLots] = useState<LotDoc[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId));

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    const unsubscribe = dataStore.listenLots(eventId, (incoming) => {
      setLots(incoming);
      setLoading(false);
    });
    return () => unsubscribe?.();
  }, [eventId]);

  return { lots, loading };
}

export function useLot(eventId: string | undefined, lotId: string | undefined) {
  const { lots } = useLots(eventId);
  return useMemo(() => lots.find((lot) => lot.id === lotId), [lots, lotId]);
}
