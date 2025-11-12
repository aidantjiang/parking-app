import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./client";
import type { EventDoc, LotDoc } from "@/lib/types";

function requireDb(): Firestore {
  if (!db) {
    throw new Error("Firestore is not initialized. Set NEXT_PUBLIC_USE_DEMO=false with Firebase creds.");
  }
  return db;
}

export function listenEvent(eventId: string, cb: (event: EventDoc | null) => void): Unsubscribe {
  const instance = requireDb();
  const ref = doc(collection(instance, "events"), eventId);
  return onSnapshot(ref, (snap) => cb(snap.exists() ? ({ id: snap.id, ...(snap.data() as EventDoc) }) : null));
}

export function listenLots(eventId: string, cb: (lots: LotDoc[]) => void): Unsubscribe {
  const instance = requireDb();
  const lotsRef = collection(instance, "lots");
  const q = query(lotsRef, where("eventId", "==", eventId), orderBy("group"), orderBy("name"));
  return onSnapshot(q, (snapshot) => {
    const docs: LotDoc[] = [];
    snapshot.forEach((docSnap) => docs.push({ id: docSnap.id, ...(docSnap.data() as LotDoc) }));
    cb(docs);
  });
}

export async function claimLot(lotId: string, uid: string) {
  const instance = requireDb();
  const lotRef = doc(instance, "lots", lotId);
  await runTransaction(instance, async (tx) => {
    const snap = await tx.get(lotRef);
    if (!snap.exists()) {
      throw new Error("Lot no longer exists.");
    }
    const data = snap.data() as LotDoc;
    if (data.claimedBy && data.claimedBy !== uid) {
      throw new Error("Lot already claimed.");
    }
    tx.update(lotRef, { claimedBy: uid, updatedAt: Date.now() });
  });
}

export async function releaseLot(lotId: string, uid: string) {
  const instance = requireDb();
  const lotRef = doc(instance, "lots", lotId);
  await runTransaction(instance, async (tx) => {
    const snap = await tx.get(lotRef);
    if (!snap.exists()) {
      throw new Error("Lot no longer exists.");
    }
    const data = snap.data() as LotDoc;
    if (data.claimedBy && data.claimedBy !== uid) {
      throw new Error("You can only release lots you claimed.");
    }
    tx.update(lotRef, { claimedBy: null, updatedAt: Date.now() });
  });
}

export async function adjustCount(lotId: string, delta: number, uid: string) {
  const instance = requireDb();
  const lotRef = doc(instance, "lots", lotId);
  await runTransaction(instance, async (tx) => {
    const snap = await tx.get(lotRef);
    if (!snap.exists()) {
      throw new Error("Lot no longer exists.");
    }
    const data = snap.data() as LotDoc;
    const nextCount = Math.min(Math.max(data.count + delta, 0), data.capacity);
    tx.update(lotRef, {
      count: nextCount,
      updatedAt: Date.now(),
      lastUpdatedBy: uid,
    });
  });
}

export async function touchLotHeartbeat(lotId: string) {
  const instance = requireDb();
  const lotRef = doc(instance, "lots", lotId);
  await updateDoc(lotRef, { updatedAt: serverTimestamp() });
}
