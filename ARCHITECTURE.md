# Architecture

```
[Firebase Auth] ──> lib/firebase/auth.ts ──> lib/hooks/useAuth.ts
[Firestore]    ──> lib/firebase/firestore.ts ──> lib/hooks/useEvents.ts
               (transactions: claimLot, releaseLot, adjustCount)

UI Flow (App Router)

/login ──> /events ──> /events/:eventId/claim ──> /events/:eventId/home
                                         └──> /events/:eventId/overview
```

## Modules

- **lib/firebase/client.ts** – Initializes the Firebase SDK for Auth, Firestore, and Functions (with optional emulator connection).
- **lib/firebase/firestore.ts** – All reads/writes run through typed helpers with transaction guardrails.
- **lib/services/lotLogic.ts** – Pure helpers that enforce count clamping and claim permissions (testable without Firebase).
- **lib/hooks/** – React hooks for auth, events, lots, and memoized derived data (claimed lot, etc.).
- **components/** – Pure UI with explicit props:
  - `EventPicker`, `LotCard`, `AvailabilityTable`, `DeviceClaimForm`, `CounterAdjust`.
  - `providers/ToastProvider` surfaces retry/success toasts across the app.
- **app/** – App Router pages orchestrate the flow and compose the components/hooks.

## Data model

- `events` collection – See `lib/types.ts#EventDoc`.
- `lots` collection – Includes `claimedBy`, `deviceCode`, `count`, `capacity`.
- `users` collection – Stores attendant/admin roles created on first login.

## Flow summary

1. `/login` authenticates via Firebase Auth (email/password or anonymous bypass).
2. `/events` uses `EventPicker` with search + infinite scroll and exposes the admin-only CTA to `/events/create`.
3. `/events/create` lets admins define event metadata and pre-seed lot groups.
4. `/events/:eventId/claim` combines `DeviceClaimForm`, `AvailabilityTable`, and `LotCard` to pair a vision node to a lot (selection or short code).
5. `/events/:eventId/home` shows the claimed lot with `CounterAdjust`, optimistic updates, and quick actions. Release returns to the claim pool.
6. `/events/:eventId/overview` renders `AvailabilityTable` for all lots with live badges and color-coded occupancy.

Each request includes explicit loading, error, and retry states plus toast notifications for resilience.
