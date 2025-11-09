# Parkingservices Lot Meter

Production-grade Parking Attendant console built with Next.js 16. Attendants can authenticate, join/create events, claim lots by list or short code, adjust counts with optimistic UI, and monitor the All-Lots overview in real time.

## Prerequisites

- Node.js 18+
- Firebase project with Authentication + Firestore (or local Emulator Suite)

## Project structure

- `app/` — App Router pages for `/login`, `/events`, `/events/:id/*`.
- `components/` — Core reusable UI (Pickers, Lot cards, counter, etc.).
- `lib/firebase/` — Auth + Firestore clients and transactional helpers.
- `lib/hooks/` — Client hooks for auth, events, lots, and role guards.
- `scripts/` — Tooling such as the `seed-demo.mjs` bootstrapper.
- `tests/` — Vitest suites for data helpers and the join/claim UI flow.

See `ARCHITECTURE.md` for a diagram of the modules and data flow.

## Environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase project info:

```
cp .env.example .env.local
```

Required keys:

- `NEXT_PUBLIC_FB_API_KEY`, `NEXT_PUBLIC_FB_AUTH_DOMAIN`, `NEXT_PUBLIC_FB_PROJECT_ID`, `NEXT_PUBLIC_FB_APP_ID`
- `NEXT_PUBLIC_FB_FUNCTIONS_REGION` (optional, defaults to Firebase default)
- `NEXT_PUBLIC_USE_EMULATORS=true` when targeting the local Firebase emulator
- `FIREBASE_ADMIN_PROJECT_ID` + either `FIREBASE_ADMIN_CREDENTIALS` (JSON string) or `GOOGLE_APPLICATION_CREDENTIALS` (path) for the seed script

> 🔒 Never commit raw service-account JSON (for example `firebase-admin.json`). Keep credentials in environment variables or local, ignored files referenced by `GOOGLE_APPLICATION_CREDENTIALS`.

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/login` to sign in (email/password, register, or bypass). After successful auth you’re redirected to `/events`.

When using the Firebase Emulator Suite, launch it separately and set `NEXT_PUBLIC_USE_EMULATORS=true` so the client connects to the local Auth + Firestore endpoints.

## Authentication

Firebase Auth drives the login flow (`app/login/page.tsx`). You can:

- Register/sign in with email & password (stored in Firebase Auth/Emulator).
- Use the “Bypass for demo” button, which signs in anonymously for quick testing.
- Extend with SAML/OAuth later—UI already surfaces a placeholder CTA.

Every login/create action persists/reads the attendant profile from Firestore via `lib/firebase/firestore.ts#listenUserProfile`.

## Using the Firebase Emulator Suite

1. Ensure `firebase-tools` is installed (`npm install -g firebase-tools` or use `npx`).
2. From the repo root, the included `firebase.json` already defines Firestore (8080) + Auth (9099) + Emulator UI (4000). Start them:
   ```bash
   firebase emulators:start
   ```
3. In `.env.local`, set `NEXT_PUBLIC_USE_EMULATORS=true` so the client SDK points to `localhost`.
4. In a second terminal run `npm run dev` and open `http://localhost:3000/login`.
5. Create accounts or use bypass—the auth + Firestore traffic now hits the emulators, visible in the Emulator UI dashboard at `http://localhost:4000`.

## Firebase data layer

The app currently targets Firestore using the helpers in `lib/firebase/firestore.ts`:

- `listenEvent(eventId)` / `listenLots(eventId)` for real-time updates
- `claimLot`, `releaseLot`, `adjustCount` run inside Firestore transactions
- `createEvent` seeds initial lots with device codes

To switch to Realtime Database instead of Firestore:

1. Update `lib/firebase/firestore.ts` to point to RTDB refs (keep the same exported function signatures).
2. Replace the transactional helpers with RTDB `runTransaction`.
3. Adjust the seed script to write to RTDB paths (e.g., `/events`, `/lots`).

Because the UI only imports the exported helpers, no component changes are required once those functions swap implementations.

## Testing

```bash
npm run test
```

- `tests/services/lotLogic.test.ts` validates the transaction safety helpers.
- `tests/flow/joinFlow.test.tsx` runs a lightweight RTL flow that covers join, claim, adjust, and overview UI behavior.

## Seeding demo data

Use the Firebase Admin SDK script to populate a demo event and lots (works against prod or the emulator):

```bash
FIREBASE_ADMIN_PROJECT_ID=my-project \
FIREBASE_ADMIN_CREDENTIALS="$(cat serviceAccount.json)" \
npm run seed
```

The script prints the created `eventId` so you can join it from the `/events` page.

## Tooling & scripts

- `npm run dev` – Next.js dev server (Turbopack).
- `npm run build` / `npm start` – production build & serve.
- `npm run test` – Vitest + Testing Library suites.
- `npm run seed` – Seed demo data via Firebase Admin.

## Firebase Security Rules (first pass)

Rules should enforce:

- Attendants can read events/lots they are assigned to and update counts only on lots they claimed.
- Admins have read/write access for events they created.

See `lib/firebase/firestore.ts` for the required constraints (claim transactions, count clamps, optimistic updates). Port these invariants to your Firestore/RTDB security rules.
