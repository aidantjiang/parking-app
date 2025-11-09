import { describe, expect, it } from "vitest";
import { computeNextCount, ensureClaimAccess } from "../../lib/services/lotLogic";

describe("computeNextCount", () => {
  it("clamps at zero", () => {
    const { nextCount } = computeNextCount({ count: 2, capacity: 100 }, -10);
    expect(nextCount).toBe(0);
  });

  it("clamps at capacity", () => {
    const { nextCount } = computeNextCount({ count: 95, capacity: 100 }, 20);
    expect(nextCount).toBe(100);
  });

  it("returns applied delta", () => {
    const result = computeNextCount({ count: 10, capacity: 100 }, 5);
    expect(result.appliedDelta).toBe(5);
  });
});

describe("ensureClaimAccess", () => {
  it("allows any signed-in user", () => {
    expect(() => ensureClaimAccess({ claimedBy: "a" }, "b")).not.toThrow();
  });

  it("throws if user is missing", () => {
    expect(() => ensureClaimAccess({ claimedBy: undefined }, "" as string)).toThrow(
      "User must be signed in."
    );
  });
});
