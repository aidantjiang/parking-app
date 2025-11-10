"use client";

import React from "react";
import type { LotDoc } from "../lib/types";
import {
  formatLiveBadge,
  getLotStatusColor,
  getOccupancyPercent,
} from "../lib/utils/lots";

interface Props {
  lots: LotDoc[];
  onSelect?: (lotId: string) => void;
  highlightLotId?: string;
}

export default function AvailabilityTable({
  lots,
  onSelect,
  highlightLotId,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lots.map((lot) => {
          const color = getLotStatusColor(lot);
          const percent = getOccupancyPercent(lot);
          const palette =
            color === "green"
              ? "bg-green-50 text-green-900 border-green-100"
              : color === "yellow"
                ? "bg-yellow-50 text-yellow-900 border-yellow-100"
                : "bg-red-50 text-red-900 border-red-100";

          return (
            <button
              key={lot.id}
              onClick={() => onSelect?.(lot.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                palette
              } ${highlightLotId === lot.id ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{lot.name}</p>
                  <p className="text-xs uppercase tracking-wide opacity-70">
                    {lot.group || "Ungrouped"}
                  </p>
                </div>
                <p className="text-sm font-semibold">{percent}%</p>
              </div>
              <p className="text-2xl font-bold mt-2">
                {lot.count}/{lot.capacity}
              </p>
              <p className="text-xs opacity-70 mt-2">
                {formatLiveBadge(lot.updatedAt)}
              </p>
            </button>
          );
        })}
      </div>
      {!lots.length && (
        <p className="text-center text-sm text-slate-500 py-8">
          Lots will appear here once created.
        </p>
      )}
    </div>
  );
}
