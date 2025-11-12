import type { LotDoc } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface AvailabilityTableProps {
  lots: LotDoc[];
}

function getFill(lot: LotDoc) {
  const pct = Math.floor((lot.count / lot.capacity) * 100);
  let variant: "success" | "warning" | "danger" = "success";
  if (pct >= 90) variant = "danger";
  else if (pct >= 50) variant = "warning";
  return { pct, variant };
}

function getLiveLabel(updatedAt: number) {
  const diff = Date.now() - updatedAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    const seconds = Math.max(1, Math.floor(diff / 1000));
    return `${seconds}s ago`;
  }
  return `${minutes}m ago`;
}

export function AvailabilityTable({ lots }: AvailabilityTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-onyx-500/15 bg-white/80 shadow-xl">
      <div className="grid grid-cols-4 gap-4 border-b border-onyx-500/10 bg-buff-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-onyx-500">
        <span>Lot</span>
        <span>Group</span>
        <span>Status</span>
        <span className="text-right">Count</span>
      </div>
      <ul className="divide-y divide-onyx-500/10">
        {lots.map((lot) => {
          const fill = getFill(lot);
          return (
            <li key={lot.id} className="grid grid-cols-4 items-center gap-4 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-onyx-700">{lot.name}</p>
                <p className="text-xs text-onyx-400">Vision node {lot.deviceCode ?? "—"}</p>
                <p className="text-xs text-onyx-400">LIVE • {getLiveLabel(lot.updatedAt)}</p>
              </div>
              <p className="text-onyx-500">{lot.group ?? "—"}</p>
              <Badge label={`${fill.pct}%`} variant={fill.variant} />
              <div className="text-right font-mono text-lg text-onyx-700">
                {lot.count} / {lot.capacity}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
