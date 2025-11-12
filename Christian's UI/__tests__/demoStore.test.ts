import { describe, it, expect, beforeEach } from "vitest";
import {
  seedDemoData,
  claimLot,
  releaseLot,
  adjustCount,
  getLotsSnapshot,
} from "@/lib/data-store/demoStore";

const user = "attendant-1";

describe("demoStore transactions", () => {
  beforeEach(() => {
    seedDemoData();
  });

  it("prevents double claim", async () => {
    const [lot] = getLotsSnapshot("buff-broncos");
    await claimLot(lot.id, user);
    await expect(claimLot(lot.id, "other"))
      .rejects.toThrow(/already claimed/);
    await releaseLot(lot.id, user);
    await expect(claimLot(lot.id, "other")).resolves.toBeUndefined();
  });

  it("clamps counts between zero and capacity", async () => {
    const [lot] = getLotsSnapshot("buff-broncos");
    await adjustCount(lot.id, -999, user);
    const [afterDecrease] = getLotsSnapshot("buff-broncos");
    expect(afterDecrease.count).toBeGreaterThanOrEqual(0);
    await adjustCount(lot.id, 9999, user);
    const [afterIncrease] = getLotsSnapshot("buff-broncos");
    expect(afterIncrease.count).toBeLessThanOrEqual(afterIncrease.capacity);
  });
});
