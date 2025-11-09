import type { LotDoc } from "../types";
import { clampCount } from "../utils/lots";

export function computeNextCount(lot: Pick<LotDoc, "capacity" | "count">, delta: number) {
  const nextValue = clampCount(lot.count + delta, lot.capacity);
  return {
    nextCount: nextValue,
    appliedDelta: nextValue - lot.count,
  };
}

export function ensureClaimAccess(_: Pick<LotDoc, "claimedBy">, uid: string) {
  if (!uid) {
    throw new Error("User must be signed in.");
  }
  // Multi-attendant mode: no exclusive locking. Server-side Cloud Functions
  // can reintroduce coordination if hardware pairing requires it later.
}
