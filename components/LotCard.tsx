"use client";

import React, { useState } from "react";
import type { LotDoc } from "../lib/types";
import {
  formatLiveBadge,
  getLotStatusColor,
  getOccupancyPercent,
} from "../lib/utils/lots";

interface Props {
  lot: LotDoc;
  onOpen: (lotId: string) => Promise<void> | void;
  isActive?: boolean;
}

export default function LotCard({ lot, onOpen, isActive }: Props) {
  const [loading, setLoading] = useState(false);
  const percent = getOccupancyPercent(lot);
  const status = getLotStatusColor(lot);
  const badgeColor =
    status === "green"
      ? "bg-green-50 text-green-700"
      : status === "yellow"
        ? "bg-yellow-50 text-yellow-700"
        : "bg-red-50 text-red-700";

  const handleClick = async () => {
    setLoading(true);
    try {
      await onOpen(lot.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-3xl border bg-white p-4 shadow-sm flex flex-col gap-3 transition ${
        isActive ? "border-blue-400 ring-2 ring-blue-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{lot.name}</h3>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {lot.group || "Ungrouped"}
          </p>
        </div>
        <span
          className={`text-[11px] font-semibold px-3 py-1 rounded-full ${badgeColor}`}
        >
          {percent}% full
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{lot.count}</p>
        <p className="text-sm text-slate-500">/ {lot.capacity} capacity</p>
      </div>
      <p className="text-xs text-slate-500">{formatLiveBadge(lot.updatedAt)}</p>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-2xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Opening…" : "Open lot workspace"}
      </button>
    </div>
  );
}
