"use client";

import { useEffect, useMemo, useState } from "react";
import { dataStore } from "@/lib/data-store";
import type { EventDoc } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface EventPickerProps {
  onSelect?: (event: EventDoc) => void;
  adminBadge?: boolean;
}

export function EventPicker({ onSelect, adminBadge }: EventPickerProps) {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    dataStore
      .listEvents({ search })
      .then(({ events, nextCursor }) => {
        if (!isMounted) return;
        setEvents(events);
        setCursor(nextCursor ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [search, refreshKey]);

  const handleLoadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    const { events: more, nextCursor } = await dataStore.listEvents({ search, cursor });
    setEvents((prev) => [...prev, ...more]);
    setCursor(nextCursor ?? null);
    setLoadingMore(false);
  };

  const emptyCopy = useMemo(() => {
    if (loading) return "Loading CU events...";
    if (error) return error;
    return search ? "No events match that search." : "No events yet. Create one to get started.";
  }, [loading, error, search]);

  return (
    <section className="space-y-4">
      <Input
        label="Search events"
        placeholder="Game day, festival..."
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        hint="Live sync from Firebase"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card
                onClick={() => onSelect?.(event)}
                badge={
                  <Badge
                    variant={event.visibility === "public" ? "success" : "muted"}
                    label={event.visibility === "public" ? "Public" : "Private"}
                  />
                }
                subtitle={`${new Date(event.startAt).toLocaleString()} — ${event.location ?? "TBD"}`}
                title={event.name}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-onyx-400">
                  <span>{event.capacityDefault ? `${event.capacityDefault} cap default` : "Custom capacities"}</span>
                  {adminBadge && event.createdBy === "admin-demo" && <span>Owned by you</span>}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!events.length && (
        <div className="text-center text-sm text-onyx-500">
          <p>{emptyCopy}</p>
          {error && (
            <Button variant="ghost" className="mt-2" onClick={() => setRefreshKey((x) => x + 1)}>
              Retry
            </Button>
          )}
        </div>
      )}

      {cursor && (
        <Button onClick={handleLoadMore} variant="secondary" loading={loadingMore} className="mx-auto block">
          Load more events
        </Button>
      )}
    </section>
  );
}
