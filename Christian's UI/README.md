# CU Boulder Parking Attendant UI

A CU Boulder–branded Next.js console that lets attendants authenticate, join or create events, claim vision nodes (lots), and manage live occupancy counts with optimistic updates.

## Features
- **Join/Create flow:** Login → Event selection → Device claim → Home screen → All-lots overview.
- **Role-aware UI:** Admin-only event creation & settings; attendants focus on claiming lots.
- **Vision node pairing:** Claim via dropdown or short device code, with live status chips and conflict handling.
- **Safety & resilience:** Optimistic count adjustments with rollback, toasts, skeleton states, explicit retry, and server-side guard rails.
- **CU Theme:** Gold/black palette, buffalo-inspired cards, mobile-friendly controls inspired by the provided mock.

## Getting Started
1. Install deps
   ```bash
   npm install
   ```
2. Copy env template
   ```bash
   cp .env.example .env.local
   ```
3. Choose data mode:
   - **Demo (default):** `NEXT_PUBLIC_USE_DEMO=true` seeds rich fake data in-memory.
   - **Firestore:** set your Firebase web config, set `NEXT_PUBLIC_USE_DEMO=false`.

4. Run the dev server
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000.

## Firebase & Auth
- Credentials live in `.env.local` (see template).
- Auth provider initializes Firebase if keys exist, otherwise falls back to demo/guest accounts.
- SAML/FedAuth button is wired for when campus metadata arrives; currently disabled unless Firebase Auth is configured.

### Switching Firestore vs Realtime DB
This UI currently ships with Firestore helpers (`lib/firebase/firestore.ts`) plus an abstraction layer (`lib/data-store`). To experiment with Realtime DB:
1. Create equivalent helpers in `lib/firebase/rtdb.ts`.
2. Swap the imports inside `lib/data-store/index.ts` to use RTDB functions.
3. Update `firebase/firestore.rules` to the RTDB equivalent (`database.rules.json`).

## Firebase Emulator & Seeding
1. Start your emulators (Firestore/Auth).
2. Run the seed script to dump demo data you can import:
   ```bash
   npm run seed
   ```
   The script outputs `seed/demo-data.json` with event and lot docs.
3. Use `firebase firestore:delete` + `firebase firestore:import` (or the Emulator UI) to load that JSON.

## Testing
- **Unit & UI tests:**
  ```bash
  npm test
  ```
  - `__tests__/demoStore.test.ts` covers claim & count transaction rules.
  - `__tests__/join-flow.test.tsx` exercises the Event → Claim → Adjust happy path with mocked data store.

## Project Layout
- `app/` – App Router pages (`/login`, `/events`, `/events/[eventId]/claim|home|overview`, etc.).
- `components/` – CU-themed UI primitives plus core modules (EventPicker, LotCard, CounterAdjust, AvailabilityTable, DeviceClaimForm).
- `lib/` – Data models, Firebase bootstrap, and the dual data store (demo vs Firestore).
- `hooks/` – Live event/lot listeners.
- `scripts/seed-demo.ts` – Demo JSON generator.
- `firebase/firestore.rules` – First-pass security rules (attendants read/claim within their events; admins manage everything).

See `ARCHITECTURE.md` for a diagram of the data & UI layers.

## Terminology
- **Vision node** – Raspberry Pi edge device mounted at a lot entrance.
- **Count** – Current occupancy streamed from attendants or vision nodes.
- **Capacity** – Maximum vehicles allowed in the lot.

## Common Tasks
- **Start fresh demo data:** delete `localStorage` keys (`cu-demo-user`, `cu-role:*`) or set `NEXT_PUBLIC_USE_DEMO=true` and refresh.
- **Switch roles quickly:** visit `/settings` to toggle between attendant/admin without logging out.
- **Monitor availability:** use `/events/:eventId/overview` for live fill percentages with color coding and last-updated badges.

## TODOs / Follow-ups
- Plug in actual SAML metadata once provided.
- Implement RTDB adapters for deployments that prefer it over Firestore.
- Add lot group management UI beyond the basic comma-separated input.
