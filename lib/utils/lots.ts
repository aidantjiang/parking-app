import type { LotDoc } from "../types";

export function getOccupancyPercent(lot: LotDoc) {
  if (!lot.capacity) return 0;
  return Math.min(100, Math.round((lot.count / lot.capacity) * 100));
}

export function getLotStatusColor(lot: LotDoc) {
  const percent = getOccupancyPercent(lot);
  if (percent < 50) return "green";
  if (percent < 90) return "yellow";
  return "red";
}

export function clampCount(count: number, capacity: number) {
  if (capacity <= 0) return 0;
  return Math.max(0, Math.min(capacity, count));
}

export function formatLiveBadge(timestamp: number) {
  if (!timestamp) return "LIVE";
  const delta = Date.now() - timestamp;
  const seconds = Math.max(0, Math.round(delta / 1000));
  if (seconds < 60) return `LIVE • ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `LIVE • ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `LIVE • ${hours}h ago`;
}

export function lotSummary(lot: LotDoc) {
  return `${lot.name} (${lot.count}/${lot.capacity})`;
}
