import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LotDoc } from "@/lib/types";

const mockClaimLot = vi.fn();
const mockFindLotByCode = vi.fn();
const mockAdjustCount = vi.fn();

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/data-store", () => ({
  dataStore: {
    claimLot: (...args: unknown[]) => mockClaimLot(...args),
    findLotByCode: (...args: unknown[]) => mockFindLotByCode(...args),
    adjustCount: (...args: unknown[]) => mockAdjustCount(...args),
  },
}));

import { DeviceClaimForm } from "@/components/core/device-claim-form";
import { CounterAdjust } from "@/components/core/counter-adjust";

const lot: LotDoc = {
  id: "lot-test",
  eventId: "evt",
  name: "Test Lot",
  group: "General",
  capacity: 100,
  count: 10,
  updatedAt: Date.now(),
};

describe("Join flow UI", () => {
  beforeEach(() => {
    mockClaimLot.mockReset();
    mockFindLotByCode.mockReset();
    mockAdjustCount.mockReset();
  });

  it("claims a lot via dropdown", async () => {
    const user = userEvent.setup();
    render(<DeviceClaimForm lots={[lot]} currentUserId="attendant" />);
    await user.click(screen.getByRole("button", { name: /claim lot/i }));
    expect(mockClaimLot).toHaveBeenCalledWith("lot-test", "attendant");
  });

  it("claims via device code input", async () => {
    const user = userEvent.setup();
    mockFindLotByCode.mockResolvedValue(lot);
    render(<DeviceClaimForm lots={[lot]} currentUserId="attendant" />);
    await user.type(screen.getByLabelText(/vision node code/i), "buff-a");
    await user.click(screen.getByRole("button", { name: /device code/i }));
    expect(mockFindLotByCode).toHaveBeenCalledWith("BUFF-A");
  });

  it("adjusts count optimistically", async () => {
    mockAdjustCount.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CounterAdjust lot={{ ...lot }} userId="attendant" />);
    await user.click(screen.getByRole("button", { name: "+10" }));
    expect(mockAdjustCount).toHaveBeenCalledWith("lot-test", 10, "attendant");
  });
});
