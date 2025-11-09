# Mission

Create the **Join Event** user flow for our Parking Attendant App, using what exists so far in the repo and **improving** it for clarity, reliability, and speed. Write production‑grade code with **clear comments** and guardrails (loading, error, retry, and optimistic updates).

---

## Context

- Product: Portable, image‑processing car‑counting system for events.
- Edge device: **Raspberry Pi** ("vision node") runs our custom CV model and syncs counts.
- Backend: **Firebase** (Auth, Firestore or Realtime DB, and Cloud Functions as needed).
- Frontend: This repository (web app used by attendants).
- Core UX: Attendants join or create an **Event**, claim a **Parking Lot )**, and view/update live counts. There’s also an **All Lots Overview** per event.

---

## Scope of this task

Implement the flow shown in the attached diagram and refine it where it’s muddy. The flow must be:

1. **Start → Authentication** (support FedAuth/SAML if available, otherwise email/password or OAuth placeholder). For now just have a bypass button
2. **Join or Create Event** (decision screen).
   - **Join path:** Claim Event → Claim Parking Lot (update/view) → **Home Screen**.
   - **Create path:** Enter general event details → Choose parking lot group → **Home Screen**.
3. From **Home Screen**: tab to **All‑Lots Availability** for the event.

Add the following improvements:

- **Terminology**: “vision node” = device; “count” = current occupancy; “capacity” = lot maximum. Be consistent.

- **Device claim**: Allow claiming a lot by selecting from list

- **Permissions**: Attendant vs Admin. Admins can create events and lot groups; Attendants can claim and adjust counts.

- **Safety**: Prevent negative counts

- **Resilience**: Visible loading, toast on success/fail, retry buttons.

---

## Deliverables

1. **Pages/Routes** (React/Next.js style naming; adapt to the app’s framework):

   - `/login` – Authentication UI (hooks into Firebase Auth).
   - `/events` – List of joinable events; CTA to **Create Event** (admin‑gated).
   - `/events/create` – Form: name, date range, location, capacity defaults, visibility.
   - `/events/:eventId/claim` – *Claim Event* confirmation then *Claim Parking Lot* (either pick from list or enter short code).
   - `/events/:eventId/home` – **Home Screen** for the attendant with: claimed lot status, +/‑ buttons, quick adjustments (mobile friendly big count adjust buttons), and dis/claim action. The claim action will keep them tied to this lot through app refreshed
   - `/events/:eventId/overview` – **All Lots Availability** (table/cards + color coding + last‑updated timestamp).

2. **Core Components** (well‑commented, reusable):

   - `<EventPicker />` – search/filter events; infinite scroll.
   - `<LotCard />` – name, group, capacity, current count, status color, claim button.
   - `<CounterAdjust />` – stepper with +/‑, custom delta dialog, optimistic updates with rollback on error. Nice animation for increment and decrement
   - `<AvailabilityTable />` – responsive grid of lots with live indicators.
   - `<DeviceClaimForm />` – lot select or short‑code input; shows who currently holds the claim.

3. **Data Models** (TypeScript types or JSDoc):

```ts
// Event document
interface EventDoc {
  id: string
  name: string
  startAt: string // ISO
  endAt: string   // ISO
  location?: string
  createdBy: string // uid
  visibility: 'private' | 'public'
  createdAt: number
}

// Lot document
interface LotDoc {
  id: string
  eventId: string
  name: string
  group?: string
  capacity: number
  count: number
  claimedBy?: string // uid
  deviceCode?: string // short code for vision node pairing
  updatedAt: number
}

// User profile
interface UserDoc {
  uid: string
  role: 'attendant' | 'admin'
  displayName?: string
}
```

4. **Firebase Integration**

- **Auth**: Initialize and expose hooks (useUser, requireRole). Stub FedAuth toggle.
- **DB**: Use Firestore (preferred) with converters or RTDB if already chosen; implement helpers:
  - `listenEvent(eventId)` – unsubscribe pattern.
  - `listenLots(eventId)` – ordered by group/name.
  - `claimLot(lotId, uid)` – transaction: only if unclaimed or claimedBy===uid.
  - `releaseLot(lotId, uid)` – transaction: only if claimedBy===uid.
  - `adjustCount(lotId, delta, uid)` – transaction: clamp 0..capacity; record `updatedAt` and `lastUpdatedBy`.

5. **Security Rules** (first pass):

- Attendants: read event and lot in events they’re members of;&#x20;
- Admins: full access for events they created or manage.

6. **UX Details**

- Show **live badges** (e.g., “LIVE • 12s ago”) using server timestamps.
- Color coding: green (<50%), yellow (50–90%), red (≥90%).
- Empty states, skeletons, and clear copy for errors.
- Responsive layout for phone/tablet.

7. **Testing & Tooling**

- Unit tests for data helpers and transactions (mock Firebase).
- Lightweight UI tests for the flow (Cypress/Playwright or RTL) covering join, claim, adjust, overview.
- Add a seed script to populate a demo event with lots.

8. **Docs**

- Update **README** with: local setup, `.env` keys, how to run against Firebase emulator, how to seed demo data, and how to switch between Firestore/RTDB.
- Include a short **ARCHITECTURE.md** diagram of modules.

---

## Acceptance Criteria (must all pass)

- A new user can **authenticate**, **join** or **create** an event, **claim** a lot (by list or short code), **adjust counts** with optimistic UI, and see the **All‑Lots Overview** in real time.
- Transactions prevent double claims and illegal counts.
- Code is **well‑commented**, typed where possible, and organized into components/services.

---

## Notes for Codex

- Prefer small, composable functions; keep UI pure and side‑effects in hooks/services.
- Inline **comments** explaining assumptions, edge cases, and why a transaction is necessary.
- Where the existing repo already has pieces of this, refactor vs rewrite; leave TODOs with pointers to follow‑ups.

