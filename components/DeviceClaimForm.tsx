"use client";

import React, { useEffect, useState } from "react";
import type { LotDoc } from "../lib/types";
import { useToast } from "./providers/ToastProvider";

interface Props {
  lots: LotDoc[];
  onClaim: (lotId: string) => Promise<void>;
  busy?: boolean;
  currentLotId?: string;
}

export default function DeviceClaimForm({
  lots,
  onClaim,
  busy,
  currentLotId,
}: Props) {
  const { push } = useToast();
  const [selectedLot, setSelectedLot] = useState(currentLotId ?? "");
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    setSelectedLot(currentLotId ?? "");
  }, [currentLotId]);

  const handleOpen = async () => {
    if (!selectedLot) return;
    setOpening(true);
    try {
      await onClaim(selectedLot);
    } catch (err) {
      push({
        title: "Unable to open lot",
        description:
          err instanceof Error ? err.message : "Please choose another lot.",
        type: "error",
      });
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-600">
          Pick a lot workspace
        </label>
        <p className="text-xs text-slate-500">
          Attendants must explicitly pick which lot they are operating.
        </p>
        <select
          value={selectedLot}
          onChange={(e) => setSelectedLot(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a lot</option>
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.name} ({lot.count}/{lot.capacity})
            </option>
          ))}
        </select>
        <button
          onClick={handleOpen}
          disabled={!selectedLot || busy || opening}
          className="mt-3 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {opening ? "Opening…" : "Open lot workspace"}
        </button>
      </div>
    </div>
  );
}
