"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LotDoc } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dataStore } from "@/lib/data-store";
import toast from "react-hot-toast";

interface DeviceClaimFormProps {
  lots: LotDoc[];
  currentUserId?: string;
  onClaimed?: (lot: LotDoc) => void;
}

export function DeviceClaimForm({ lots, currentUserId, onClaimed }: DeviceClaimFormProps) {
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id ?? "");
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedLotId && lots[0]) {
      setSelectedLotId(lots[0].id);
    }
  }, [lots, selectedLotId]);

  const selectedLot = lots.find((lot) => lot.id === selectedLotId);

  const submitCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!shortCode.trim()) return;
    setLoading(true);
    try {
      const lot = await dataStore.findLotByCode(shortCode.trim());
      if (!lot) throw new Error("No matching device code");
      await dataStore.claimLot(lot.id, currentUserId ?? "guest");
      onClaimed?.(lot);
      toast.success(`Claimed ${lot.name}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const claimSelected = async () => {
    if (!selectedLotId) return;
    setLoading(true);
    try {
      await dataStore.claimLot(selectedLotId, currentUserId ?? "guest");
      const lot = lots.find((l) => l.id === selectedLotId);
      if (lot) onClaimed?.(lot);
      toast.success("Lot claimed");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const releaseSelected = async () => {
    if (!selectedLotId) return;
    setLoading(true);
    try {
      await dataStore.releaseLot(selectedLotId, currentUserId ?? "guest");
      toast.success("Lot released");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-onyx-500/10 bg-white/90 p-5 shadow-xl">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-onyx-600">Select a lot</label>
        <select
          value={selectedLotId}
          onChange={(event) => setSelectedLotId(event.target.value)}
          className="w-full rounded-2xl border border-onyx-500/20 px-3 py-2"
        >
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.name} • {lot.group ?? "Group"} ({lot.count}/{lot.capacity})
            </option>
          ))}
        </select>
        {selectedLot && (
          <p className="text-xs text-onyx-500">
            {selectedLot.claimedBy
              ? selectedLot.claimedBy === currentUserId
                ? "You currently hold this claim."
                : `Claimed by ${selectedLot.claimedBy}`
              : "Unclaimed"}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="primary" onClick={claimSelected} loading={loading}>
            Claim lot
          </Button>
          <Button
            variant="ghost"
            onClick={releaseSelected}
            disabled={!selectedLot?.claimedBy || selectedLot.claimedBy !== currentUserId}
          >
            Release
          </Button>
        </div>
      </div>

      <form onSubmit={submitCode} className="space-y-2">
        <Input
          label="Or enter vision node code"
          placeholder="BUFF-A"
          value={shortCode}
          onChange={(event) => setShortCode(event.target.value.toUpperCase())}
          hint="Short code etched on the device"
        />
        <Button type="submit" variant="secondary" loading={loading} fullWidth>
          Claim via device code
        </Button>
      </form>
    </div>
  );
}
