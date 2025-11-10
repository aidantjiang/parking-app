#!/usr/bin/env node

import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FB_PROJECT_ID;

if (!projectId) {
  console.error("Set FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FB_PROJECT_ID.");
  process.exit(1);
}

let credential;
if (
  process.env.FIREBASE_ADMIN_CREDENTIALS &&
  process.env.FIREBASE_ADMIN_CREDENTIALS.trim().startsWith("{")
) {
  credential = cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS));
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = applicationDefault();
} else {
  console.error(
    "Set FIREBASE_ADMIN_CREDENTIALS (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (path)."
  );
  process.exit(1);
}

initializeApp({
  credential,
  projectId,
});

const db = getFirestore();

const lots = [
  { name: "Green Lot A", group: "General", capacity: 120 },
  { name: "Green Lot B", group: "General", capacity: 140 },
  { name: "VIP Lot", group: "VIP", capacity: 60 },
  { name: "Overflow North", group: "Overflow", capacity: 200 },
];

async function seed() {
  const eventRef = await db.collection("events").add({
    name: "Demo Stadium Event",
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    location: "Folsom Field",
    createdBy: "seed-script",
    visibility: "public",
    createdAt: Date.now(),
    capacityDefaults: { perLot: 120 },
  });

  const batch = db.batch();
  lots.forEach((lot) => {
    const ref = db.collection("lots").doc();
    batch.set(ref, {
      eventId: eventRef.id,
      name: lot.name,
      group: lot.group,
      capacity: lot.capacity,
      count: Math.floor(lot.capacity * 0.3),
      claimedBy: null,
      deviceCode: lot.name.replace(/\s+/g, "").slice(0, 6).toUpperCase(),
      updatedAt: FieldValue.serverTimestamp(),
      lastUpdatedBy: "seed-script",
    });
  });

  await batch.commit();
  console.log(
    `Seeded event ${eventRef.id} with ${lots.length} lots. Visit /events to verify.`
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
