"use client";

import React from "react";
import type { EventDoc } from "../lib/types";
import { formatLiveBadge } from "../lib/utils/lots";

interface Props {
  events: EventDoc[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (eventId: string) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  error?: string | null;
}

export default function EventPicker({
  events,
  query,
  onQueryChange,
  onSelect,
  onLoadMore,
  loading,
  hasMore,
  error,
}: Props) {
  return (
    <div className="rounded-3xl bg-white shadow-lg border border-slate-100 p-6 space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-600">
          Search or filter events
        </label>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="e.g. Saturday Stadium Parking"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onSelect(event.id)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-left hover:border-blue-400 hover:bg-blue-50/40 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{event.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(event.startAt).toLocaleString()} –{" "}
                  {new Date(event.endAt).toLocaleString()}
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
                {formatLiveBadge(event.createdAt)}
              </span>
            </div>
            {event.location && (
              <p className="text-sm text-slate-600 mt-2">{event.location}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Visibility: {event.visibility}
            </p>
          </button>
        ))}
        {!events.length && !loading && (
          <p className="text-center text-sm text-slate-500 py-8">
            No events match your filters yet.
          </p>
        )}
        {loading && (
          <p className="text-center text-sm text-slate-500 py-4">Loading…</p>
        )}
      </div>
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          Load more
        </button>
      )}
    </div>
  );
}
