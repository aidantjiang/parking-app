import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase/client";
import {
  listenEvent as fbListenEvent,
  listenLots as fbListenLots,
  claimLot as fbClaimLot,
  releaseLot as fbReleaseLot,
  adjustCount as fbAdjustCount,
} from "@/lib/firebase/firestore";
import * as demoStore from "./demoStore";
import type { EventDoc, LotDoc } from "@/lib/types";

const preferDemo = process.env.NEXT_PUBLIC_USE_DEMO === "true" || !isFirebaseReady;

async function firebaseListEvents({
  search = "",
  cursor,
  limit = 10,
}: {
  search?: string;
  cursor?: string | null;
  limit?: number;
}) {
  if (!db) throw new Error("Firestore not configured");
  let base = query(collection(db, "events"), orderBy("name"), fbLimit(limit));
  if (cursor) {
    const cursorDoc = await getDoc(doc(db, "events", cursor));
    if (cursorDoc.exists()) {
      base = query(base, startAfter(cursorDoc));
    }
  }
  const snap = await getDocs(base);
  let events = snap.docs.map((d) => ({ id: d.id, ...(d.data() as EventDoc) }));
  if (search) {
    const lowered = search.toLowerCase();
    events = events.filter(
      (evt) => evt.name.toLowerCase().includes(lowered) || evt.location?.toLowerCase().includes(lowered)
    );
  }
  const nextCursor = events.length === limit ? events[events.length - 1]?.id : undefined;
  return { events, nextCursor };
}

async function firebaseCreateEvent(payload: {
  name: string;
  startAt: string;
  endAt: string;
  location?: string;
  createdBy: string;
  visibility: "private" | "public";
  capacityDefault?: number;
  lotGroups?: string[];
}) {
  if (!db) throw new Error("Firestore not configured");
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
  const docRef = doc(db, "events", id);
  const event: EventDoc = {
    id,
    name: payload.name,
    startAt: payload.startAt,
    endAt: payload.endAt,
    location: payload.location,
    createdBy: payload.createdBy,
    visibility: payload.visibility,
    capacityDefault: payload.capacityDefault,
    createdAt: Date.now(),
    lotGroups: payload.lotGroups,
  };
  await setDoc(docRef, event);
  return event;
}

async function firebaseFindLotByCode(code: string) {
  if (!db) throw new Error("Firestore not configured");
  const lotsRef = query(collection(db, "lots"), where("deviceCode", "==", code.toUpperCase()), fbLimit(1));
  const snap = await getDocs(lotsRef);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...(docSnap.data() as LotDoc) };
}

async function firebaseGetEvent(eventId: string) {
  if (!db) throw new Error("Firestore not configured");
  const ref = doc(db, "events", eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as EventDoc) };
}

async function firebaseGetLotsSnapshot(eventId: string) {
  if (!db) throw new Error("Firestore not configured");
  const lotsRef = query(collection(db, "lots"), where("eventId", "==", eventId), orderBy("name"));
  const snap = await getDocs(lotsRef);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as LotDoc) }));
}

export const dataStore = preferDemo
  ? {
      listEvents: demoStore.listEvents,
      listenEvent: demoStore.listenEvent,
      listenLots: demoStore.listenLots,
      claimLot: demoStore.claimLot,
      releaseLot: demoStore.releaseLot,
      adjustCount: demoStore.adjustCount,
      createEvent: demoStore.createEvent,
      findLotByCode: demoStore.findLotByCode,
      getEvent: demoStore.getEvent,
      getLotsSnapshot: demoStore.getLotsSnapshot,
      seedDemoData: demoStore.seedDemoData,
    }
  : {
    listEvents: firebaseListEvents,
    listenEvent: fbListenEvent,
    listenLots: fbListenLots,
    claimLot: fbClaimLot,
    releaseLot: fbReleaseLot,
    adjustCount: fbAdjustCount,
    createEvent: firebaseCreateEvent,
    findLotByCode: firebaseFindLotByCode,
    getEvent: firebaseGetEvent,
    getLotsSnapshot: firebaseGetLotsSnapshot,
    seedDemoData: () => Promise.resolve(),
  };

export const usingDemoStore = preferDemo;
