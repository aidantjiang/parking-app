import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import React, { useState } from "react";
import EventPicker from "../../components/EventPicker";
import DeviceClaimForm from "../../components/DeviceClaimForm";
import CounterAdjust from "../../components/CounterAdjust";
import AvailabilityTable from "../../components/AvailabilityTable";
import { ToastProvider } from "../../components/providers/ToastProvider";
import type { EventDoc, LotDoc } from "../../lib/types";

const mockEvent: EventDoc = {
  id: "evt",
  name: "Demo Event",
  startAt: new Date().toISOString(),
  endAt: new Date(Date.now() + 3600000).toISOString(),
  location: "Practice Field",
  createdBy: "seed",
  visibility: "public",
  createdAt: Date.now(),
};

const mockLots: LotDoc[] = [
  {
    id: "lot-1",
    eventId: "evt",
    name: "North Lot",
    group: "General",
    capacity: 100,
    count: 10,
    claimedBy: undefined,
    deviceCode: "NORTH",
    updatedAt: Date.now(),
    lastUpdatedBy: undefined,
  },
];

function FlowHarness() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [lots, setLots] = useState(mockLots);
  const [highlightLot, setHighlightLot] = useState<string | null>(null);

  const handleOpenLot = async (lotId: string) => {
    setHighlightLot(lotId);
  };

  const handleAdjust = async (delta: number) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.id === highlightLot
          ? {
              ...lot,
              count: Math.min(
                lot.capacity,
                Math.max(0, lot.count + delta)
              ),
            }
          : lot
      )
    );
  };

  return (
    <ToastProvider>
      <div>
        <EventPicker
          events={[mockEvent]}
          query=""
          onQueryChange={() => undefined}
          onSelect={(id) => setSelectedEvent(id)}
          loading={false}
        />
        {selectedEvent && (
          <div>
            <DeviceClaimForm
              lots={lots}
              onClaim={handleOpenLot}
            />
            {highlightLot && (
              <CounterAdjust
                count={lots.find((l) => l.id === highlightLot)!.count}
                capacity={lots.find((l) => l.id === highlightLot)!.capacity}
                onAdjust={handleAdjust}
              />
            )}
            <AvailabilityTable
              lots={lots}
              highlightLotId={highlightLot ?? undefined}
            />
          </div>
        )}
      </div>
    </ToastProvider>
  );
}

describe("Join flow UI harness", () => {
  it("allows selection, claim, and adjustment", async () => {
    render(<FlowHarness />);
    const eventButton = screen.getByRole("button", { name: /demo event/i });
    await userEvent.click(eventButton);

    const select = screen.getByLabelText(/jump into a lot/i);
    await userEvent.selectOptions(select, "lot-1");
    const openButton = screen.getByRole("button", { name: /open lot workspace/i });
    await userEvent.click(openButton);

    const increment = screen.getByRole("button", { name: /\+1/i });
    await userEvent.click(increment);

    const card = screen.getByText(/north lot/i).closest("button");
    expect(card).toBeTruthy();
    const { getByText } = within(card!);
    expect(getByText(/11\/100/i)).toBeInTheDocument();
  });
});
