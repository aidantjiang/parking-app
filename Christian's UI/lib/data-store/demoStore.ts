import { nanoid } from "nanoid";
import type { EventDoc, LotDoc } from "@/lib/types";

const events = new Map<string, EventDoc>();
const lots = new Map<string, LotDoc>();

const eventListeners = new Map<string, Set<(evt: EventDoc | null) => void>>();
const lotListeners = new Map<string, Set<(lots: LotDoc[]) => void>>();

function notifyEvent(eventId: string) {
  const listeners = eventListeners.get(eventId);
  if (!listeners) return;
  const payload = events.get(eventId) ?? null;
  listeners.forEach((cb) => cb(payload));
}

function notifyLots(eventId: string) {
  const listeners = lotListeners.get(eventId);
  if (!listeners) return;
  const payload = getLots(eventId);
  listeners.forEach((cb) => cb(payload));
}

function getLots(eventId: string) {
  return Array.from(lots.values())
    .filter((lot) => lot.eventId === eventId)
    .sort((a, b) => (a.group ?? "").localeCompare(b.group ?? "") || a.name.localeCompare(b.name));
}

export function seedDemoData() {
  events.clear();
  lots.clear();
  const demoEvent: EventDoc = {
    id: "buff-broncos",
    name: "CU Boulder Homecoming",
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    location: "Folsom Field",
    createdBy: "admin-demo",
    visibility: "public",
    createdAt: Date.now(),
    capacityDefault: 200,
  };
  events.set(demoEvent.id, demoEvent);

  const demoLots: LotDoc[] = [
    {
      id: "lot-a",
      eventId: demoEvent.id,
      name: "Champion Lot",
      group: "Premium",
      capacity: 120,
      count: 45,
      deviceCode: "BUFF-A",
      updatedAt: Date.now(),
    },
    {
      id: "lot-b",
      eventId: demoEvent.id,
      name: "Flatirons",
      group: "General",
      capacity: 200,
      count: 130,
      deviceCode: "BUFF-B",
      updatedAt: Date.now(),
    },
    {
      id: "lot-c",
      eventId: demoEvent.id,
      name: "Handicap Oasis",
      group: "Accessible",
      capacity: 40,
      count: 15,
      deviceCode: "BUFF-H",
      updatedAt: Date.now(),
    },
  ];

  demoLots.forEach((lot) => lots.set(lot.id, lot));
  notifyEvent(demoEvent.id);
  notifyLots(demoEvent.id);
}

seedDemoData();

export async function listEvents({
  search = "",
  cursor,
  limit = 10,
}: {
  search?: string;
  cursor?: string | null;
  limit?: number;
}) {
  const query = search.trim().toLowerCase();
  const sorted = Array.from(events.values()).sort((a, b) => a.name.localeCompare(b.name));
  const filtered = query
    ? sorted.filter((evt) => evt.name.toLowerCase().includes(query) || evt.location?.toLowerCase().includes(query))
    : sorted;
  const startIndex = cursor ? filtered.findIndex((evt) => evt.id === cursor) + 1 : 0;
  const page = filtered.slice(startIndex, startIndex + limit);
  const nextCursor = startIndex + limit < filtered.length ? page[page.length - 1]?.id : undefined;
  return { events: page, nextCursor };
}

export function listenEvent(eventId: string, cb: (event: EventDoc | null) => void) {
  const listeners = eventListeners.get(eventId) ?? new Set();
  listeners.add(cb);
  eventListeners.set(eventId, listeners);
  // emit immediately
  cb(events.get(eventId) ?? null);
  return () => {
    listeners.delete(cb);
  };
}

export function listenLots(eventId: string, cb: (data: LotDoc[]) => void) {
  const listeners = lotListeners.get(eventId) ?? new Set();
  listeners.add(cb);
  lotListeners.set(eventId, listeners);
  cb(getLots(eventId));
  return () => {
    listeners.delete(cb);
  };
}

export async function claimLot(lotId: string, uid: string) {
  const lot = lots.get(lotId);
  if (!lot) throw new Error("Lot not found");
  if (lot.claimedBy && lot.claimedBy !== uid) {
    throw new Error("Lot already claimed");
  }
  lot.claimedBy = uid;
  lot.updatedAt = Date.now();
  lots.set(lotId, lot);
  notifyLots(lot.eventId);
}

export async function releaseLot(lotId: string, uid: string) {
  const lot = lots.get(lotId);
  if (!lot) throw new Error("Lot not found");
  if (lot.claimedBy && lot.claimedBy !== uid) {
    throw new Error("Lot claimed by another attendant");
  }
  lot.claimedBy = undefined;
  lot.updatedAt = Date.now();
  lots.set(lotId, lot);
  notifyLots(lot.eventId);
}

export async function adjustCount(lotId: string, delta: number, uid: string) {
  const lot = lots.get(lotId);
  if (!lot) throw new Error("Lot not found");
  const next = Math.min(Math.max(lot.count + delta, 0), lot.capacity);
  lot.count = next;
  lot.lastUpdatedBy = uid;
  lot.updatedAt = Date.now();
  lots.set(lotId, lot);
  notifyLots(lot.eventId);
  return lot;
}

export async function createEvent(payload: {
  name: string;
  startAt: string;
  endAt: string;
  location?: string;
  createdBy: string;
  visibility: "private" | "public";
  capacityDefault?: number;
  lotGroups?: string[];
}) {
  const id = nanoid(8);
  const doc: EventDoc = {
    id,
    name: payload.name,
    startAt: payload.startAt,
    endAt: payload.endAt,
    location: payload.location,
    createdBy: payload.createdBy,
    visibility: payload.visibility,
    createdAt: Date.now(),
    capacityDefault: payload.capacityDefault ?? 100,
    lotGroups: payload.lotGroups,
  };
  events.set(id, doc);
  notifyEvent(id);
  return doc;
}

export async function createLot(payload: Omit<LotDoc, "updatedAt">) {
  const doc: LotDoc = { ...payload, updatedAt: Date.now() };
  lots.set(doc.id, doc);
  notifyLots(doc.eventId);
  return doc;
}

export function findLotByCode(code: string) {
  const lot = Array.from(lots.values()).find((l) => l.deviceCode?.toLowerCase() === code.toLowerCase());
  return lot ?? null;
}

export function getEvent(eventId: string) {
  return events.get(eventId) ?? null;
}

export function getLotsSnapshot(eventId: string) {
  return getLots(eventId);
}

export function getDemoSnapshot() {
  return {
    events: Array.from(events.values()),
    lots: Array.from(lots.values()),
  };
}
