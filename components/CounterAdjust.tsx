"use client";

import React, { useEffect, useMemo, useState } from "react";
import { clampCount } from "../lib/utils/lots";
import { useToast } from "./providers/ToastProvider";

interface Props {
  count: number;
  capacity: number;
  onAdjust: (delta: number) => Promise<void>;
  disabled?: boolean;
}

const quickDeltas = [-10, -5, 5, 10];

export default function CounterAdjust({
  count,
  capacity,
  onAdjust,
  disabled,
}: Props) {
  const { push } = useToast();
  const [optimisticCount, setOptimisticCount] = useState(count);
  const [busy, setBusy] = useState(false);
  const [customDelta, setCustomDelta] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!busy) {
      setOptimisticCount(count);
    }
  }, [count, busy]);

  useEffect(() => {
    if (!pulse) return;
    const timer = setTimeout(() => setPulse(false), 200);
    return () => clearTimeout(timer);
  }, [pulse]);

  const remaining = useMemo(
    () => Math.max(0, capacity - optimisticCount),
    [capacity, optimisticCount]
  );

  // Optimistically apply the delta while we wait for the Firestore transaction.
  const handleAdjust = async (delta: number) => {
    if (disabled || busy || delta === 0) return;
    setBusy(true);
    const next = clampCount(optimisticCount + delta, capacity);
    const appliedDelta = next - optimisticCount;
    if (appliedDelta === 0) {
      setBusy(false);
      push({
        title: "Limit reached",
        description: "Counts cannot exceed capacity or drop below zero.",
        type: "info",
      });
      return;
    }
    setOptimisticCount(next);
    try {
      await onAdjust(appliedDelta);
      setPulse(true);
      push({
        title: "Count updated",
        description: `Δ ${appliedDelta > 0 ? "+" : ""}${appliedDelta}`,
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setOptimisticCount(count);
      push({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Please retry the update.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const applyCustomDelta = () => {
    handleAdjust(customDelta);
    setCustomDelta(0);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Current count
          </p>
          <p
            className={`text-6xl font-bold text-slate-900 transition-transform ${
              pulse ? "scale-105" : "scale-100"
            }`}
          >
            {optimisticCount}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Remaining capacity</p>
          <p className="text-xl font-semibold">{remaining}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleAdjust(-1)}
          disabled={disabled || busy}
          className="flex-1 rounded-2xl bg-rose-600 text-white py-4 text-lg font-semibold shadow-sm hover:bg-rose-500 disabled:opacity-50"
        >
          −1
        </button>
        <button
          onClick={() => handleAdjust(1)}
          disabled={disabled || busy}
          className="flex-1 rounded-2xl bg-emerald-600 text-white py-4 text-lg font-semibold shadow-sm hover:bg-emerald-500 disabled:opacity-50"
        >
          +1
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2">
          Quick adjustments
        </p>
        <div className="grid grid-cols-4 gap-3">
          {quickDeltas.map((delta) => (
            <button
              key={delta}
              onClick={() => handleAdjust(delta)}
              disabled={disabled || busy}
              className={`rounded-2xl py-3 text-sm font-semibold disabled:opacity-50 ${
                delta > 0
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 p-4 space-y-2">
        <p className="text-xs text-slate-500 font-semibold">
          Custom delta (use negative to subtract)
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            value={customDelta}
            onChange={(e) => setCustomDelta(Number(e.target.value))}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyCustomDelta}
            disabled={disabled || busy || customDelta === 0}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-white font-semibold disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
