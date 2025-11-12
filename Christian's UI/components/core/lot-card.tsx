"use client";

import type { LotDoc } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";

interface LotCardProps {
  lot: LotDoc;
  currentUserId?: string;
  onClaim?: (lot: LotDoc) => void;
  onRelease?: (lot: LotDoc) => void;
  onAdjust?: () => void;
}

function getStatus(lot: LotDoc) {
  const fill = lot.count / lot.capacity;
  if (fill >= 0.9) return { label: "Full", variant: "danger" as const };
  if (fill >= 0.5) return { label: "Busy", variant: "warning" as const };
  return { label: "Open", variant: "success" as const };
}

function getLiveLabel(updatedAt: number) {
  const diff = Date.now() - updatedAt;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export function LotCard({ lot, currentUserId, onClaim, onRelease, onAdjust }: LotCardProps) {
  const status = useMemo(() => getStatus(lot), [lot]);
  const isMine = lot.claimedBy && lot.claimedBy === currentUserId;

  return (
    <Card
      title={`${lot.name}`}
      subtitle={`${lot.group ?? "Ungrouped"} • Capacity ${lot.capacity}`}
      badge={<Badge label={`${status.label}`} variant={status.variant} pulse />}
      className="space-y-3"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-5xl font-display text-onyx-700">{lot.count}</p>
        <div className="text-xs uppercase tracking-widest text-onyx-400">
          <p>Vision node: {lot.deviceCode ?? "—"}</p>
          <p>LIVE • {getLiveLabel(lot.updatedAt)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {lot.claimedBy ? (
          <Badge label={isMine ? "Claimed by you" : "Claimed"} variant={isMine ? "info" : "muted"} />
        ) : (
          <Badge label="Available" variant="success" />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {!lot.claimedBy && onClaim && (
          <Button onClick={() => onClaim(lot)} variant="primary">
            Claim lot
          </Button>
        )}
        {isMine && onAdjust && (
          <Button onClick={onAdjust} variant="secondary">
            Adjust count
          </Button>
        )}
        {isMine && onRelease && (
          <Button onClick={() => onRelease(lot)} variant="ghost">
            Release
          </Button>
        )}
      </div>
    </Card>
  );
}
