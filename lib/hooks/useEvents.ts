"use client";

import { useCallback, useEffect, useState } from "react";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import type { EventDoc, LotDoc } from "../types";
import {
  fetchEventsPage,
  listenEvent,
  listenLots,
} from "../firebase/firestore";

export function useEventsFeed(
  search: string,
  visibility: "all" | "public" | "private" = "all"
) {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<EventDoc> | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchEventsPage(search, visibility)
      .then((res) => {
        if (!mounted) return;
        setEvents(res.events);
        setCursor(res.cursor);
        setHasMore(Boolean(res.cursor));
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [search, visibility]);

  const loadMore = useCallback(async () => {
    if (!cursor) return;
    setLoading(true);
    const res = await fetchEventsPage(search, visibility, 20, cursor);
    setEvents((prev) => {
      const ids = new Set(prev.map((evt) => evt.id));
      const merged = [...prev];
      res.events.forEach((evt) => {
        if (!ids.has(evt.id)) {
          merged.push(evt);
        }
      });
      return merged;
    });
    setCursor(res.cursor);
    setHasMore(Boolean(res.cursor));
    setLoading(false);
  }, [cursor, search, visibility]);

  return {
    events,
    loading,
    error,
    hasMore,
    loadMore,
  };
}

export function useEvent(eventId?: string) {
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = listenEvent(
      eventId,
      (evt) => {
        setEvent(evt);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [eventId]);

  return { event, loading, error };
}

export function useLots(eventId?: string) {
  const [lots, setLots] = useState<LotDoc[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = listenLots(
      eventId,
      (data) => {
        setLots(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [eventId]);

  return { lots, loading, error };
}
