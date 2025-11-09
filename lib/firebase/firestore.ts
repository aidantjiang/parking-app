import {
  addDoc,
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QueryConstraint,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./client";
import type { CreateEventInput, EventDoc, LotDoc, UserDoc } from "../types";
import { computeNextCount, ensureClaimAccess } from "../services/lotLogic";

const withTimestamps = <T extends { updatedAt: number }>(
  data: T,
  snapshot?: DocumentData
): T => {
  if (!snapshot) {
    return data;
  }
  const updatedAt =
    snapshot.updatedAt instanceof Timestamp
      ? snapshot.updatedAt.toMillis()
      : typeof snapshot.updatedAt === "number"
        ? snapshot.updatedAt
        : Date.now();

  return { ...data, updatedAt };
};

const eventConverter: FirestoreDataConverter<EventDoc> = {
  toFirestore(data: EventDoc): DocumentData {
    return {
      name: data.name,
      startAt: data.startAt,
      endAt: data.endAt,
      location: data.location || null,
      createdBy: data.createdBy,
      visibility: data.visibility,
      createdAt: data.createdAt,
      capacityDefaults: data.capacityDefaults || null,
    };
  },
  fromFirestore(snapshot): EventDoc {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      startAt: data.startAt,
      endAt: data.endAt,
      location: data.location ?? undefined,
      createdBy: data.createdBy,
      visibility: data.visibility,
      createdAt: data.createdAt,
      capacityDefaults: data.capacityDefaults ?? undefined,
    };
  },
};

const lotConverter: FirestoreDataConverter<LotDoc> = {
  toFirestore(data: LotDoc): DocumentData {
    return {
      eventId: data.eventId,
      name: data.name,
      group: data.group ?? null,
      capacity: data.capacity,
      count: data.count,
      claimedBy: data.claimedBy ?? null,
      deviceCode: data.deviceCode ?? null,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: data.lastUpdatedBy ?? null,
    };
  },
  fromFirestore(snapshot): LotDoc {
    const data = snapshot.data();
    const base: LotDoc = {
      id: snapshot.id,
      eventId: data.eventId,
      name: data.name,
      group: data.group ?? undefined,
      capacity: data.capacity,
      count: data.count ?? 0,
      claimedBy: data.claimedBy ?? undefined,
      deviceCode: data.deviceCode ?? undefined,
      updatedAt: Date.now(),
      lastUpdatedBy: data.lastUpdatedBy ?? undefined,
    };
    return withTimestamps(base, data);
  },
};

const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore(data: UserDoc): DocumentData {
    return {
      role: data.role,
      displayName: data.displayName ?? null,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt ?? Date.now(),
    };
  },
  fromFirestore(snapshot): UserDoc {
    const data = snapshot.data();
    return {
      uid: snapshot.id,
      role: data.role ?? "attendant",
      displayName: data.displayName ?? undefined,
      createdAt: data.createdAt ?? Date.now(),
      lastLoginAt: data.lastLoginAt ?? undefined,
    };
  },
};

export const eventCollection = collection(db, "events").withConverter(
  eventConverter
);
export const lotCollection = collection(db, "lots").withConverter(lotConverter);
export const userCollection = collection(db, "users").withConverter(
  userConverter
);

export function listenEvent(
  eventId: string,
  onData: (evt: EventDoc | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(eventCollection, eventId);
  return onSnapshot(
    ref,
    (snap) => onData(snap.exists() ? snap.data() : null),
    (err) => onError?.(err)
  );
}

export function listenLots(
  eventId: string,
  onData: (lots: LotDoc[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const lotsQuery = query(
    lotCollection,
    where("eventId", "==", eventId),
    orderBy("group", "asc"),
    orderBy("name", "asc")
  );
  return onSnapshot(
    lotsQuery,
    (snap) => onData(snap.docs.map((d) => d.data())),
    (err) => onError?.(err)
  );
}

export function listenUserProfile(
  uid: string,
  onData: (user: UserDoc | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(userCollection, uid);
  return onSnapshot(
    ref,
    (snap) => onData(snap.exists() ? snap.data() : null),
    (err) => onError?.(err)
  );
}

export async function ensureUserProfile(uid: string, displayName?: string) {
  const ref = doc(userCollection, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      lastLoginAt: Date.now(),
      displayName: displayName ?? snap.data().displayName ?? undefined,
    });
    return;
  }
  await setDoc(ref, {
    uid,
    role: "attendant",
    displayName: displayName ?? undefined,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  });
}

export interface EventsPage {
  events: EventDoc[];
  cursor: QueryDocumentSnapshot<EventDoc> | null;
}

export async function fetchEventsPage(
  searchTerm: string,
  visibility: "all" | "public" | "private" = "all",
  pageSize = 20,
  cursor?: QueryDocumentSnapshot<EventDoc> | null
): Promise<EventsPage> {
  const baseQuery = query(eventCollection, orderBy("startAt", "desc"));
  const filters: QueryConstraint[] = [];

  if (visibility !== "all") {
    filters.push(where("visibility", "==", visibility));
  }

  let q = baseQuery;
  if (filters.length) {
    q = query(eventCollection, ...filters, orderBy("startAt", "desc"));
  }

  if (cursor) {
    q = query(q, startAfter(cursor), limit(pageSize));
  } else {
    q = query(q, limit(pageSize));
  }

  const docs = await getDocs(q);
  const filtered = docs.docs
    .map((d) => d.data())
    .filter((evt) =>
      evt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return {
    events: filtered,
    cursor: docs.docs.length ? docs.docs[docs.docs.length - 1] : null,
  };
}

export async function createEvent(
  payload: CreateEventInput,
  uid: string
): Promise<string> {
  const eventDoc: EventDoc = {
    id: "",
    name: payload.name,
    startAt: payload.startAt,
    endAt: payload.endAt,
    location: payload.location,
    createdBy: uid,
    visibility: payload.visibility,
    createdAt: Date.now(),
    capacityDefaults: payload.capacityDefaults,
  };

  const ref = await addDoc(eventCollection, eventDoc);
  const eventId = ref.id;

  if (payload.initialLots?.length) {
    const batch = writeBatch(db);
    payload.initialLots.forEach((lot) => {
      const lotRef = doc(lotCollection);
      batch.set(lotRef, {
        id: lotRef.id,
        eventId,
        name: lot.name,
        group: lot.group ?? undefined,
        capacity: lot.capacity,
        count: 0,
        claimedBy: undefined,
        deviceCode: lot.name.slice(0, 3).toUpperCase(),
        updatedAt: serverTimestamp(),
        lastUpdatedBy: uid,
      });
    });
    await batch.commit();
  }

  return eventId;
}

export async function claimLot(lotId: string, uid: string): Promise<void> {
  const ref = doc(lotCollection, lotId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Lot not found");
    const lot = snap.data();
    ensureClaimAccess(lot, uid);
    tx.update(ref, {
      claimedBy: uid,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function releaseLot(lotId: string, uid: string): Promise<void> {
  const ref = doc(lotCollection, lotId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Lot not found");
    const lot = snap.data();
    ensureClaimAccess(lot, uid);
    tx.update(ref, {
      claimedBy: null,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function adjustCount(
  lotId: string,
  delta: number,
  uid: string
): Promise<number> {
  const ref = doc(lotCollection, lotId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Lot not found");
    const lot = snap.data() as LotDoc;
    ensureClaimAccess(lot, uid);
    const { nextCount, appliedDelta } = computeNextCount(lot, delta);
    if (appliedDelta === 0) {
      throw new Error("Count already at requested boundary.");
    }
    tx.update(ref, {
      count: nextCount,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: uid,
    });
    return nextCount;
  });
}

export async function findLotByCode(
  eventId: string,
  code: string
): Promise<LotDoc | null> {
  const codeQuery = query(
    lotCollection,
    where("eventId", "==", eventId),
    where("deviceCode", "==", code.toUpperCase())
  );
  const snap = await getDocs(codeQuery);
  if (!snap.empty) {
    return snap.docs[0].data();
  }
  return null;
}
