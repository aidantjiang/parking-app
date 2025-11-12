# Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                   Next.js App Router (app/)                    │
│                                                                │
│  /login   /events   /events/:id/{claim,home,overview}          │
│   │         │                    │                             │
│   │   uses  │ uses               │ uses                        │
│   ▼         ▼                    ▼                             │
│ Components: EventPicker, DeviceClaimForm, CounterAdjust, etc.  │
│   │                   │                                        │
│   └────── relies on hooks/use-data for live Firestore/Demo data│
└────────────────────────────────────────────────────────────────┘
                │                             │
                ▼                             ▼
      lib/data-store (demo ↔ firestore switch) │
                │                             │
        ┌───────┴─────────┐        ┌──────────┴─────────┐
        │ demoStore.ts    │        │ firebase/client.ts │
        │ in-memory lots  │        │ firebase/firestore │
        │ seed + listeners│        │ listen/transactions│
        └───────┬─────────┘        └──────────┬─────────┘
                │                             │
                ▼                             ▼
            UI state                 Firestore / Emulator
```

## Notes
- `components/providers/auth-provider.tsx` exposes `useUser` and `useRequireRole`, sharing auth state with the entire tree.
- Toasts + loading skeletons live inside the UI components; data integrity lives inside `lib/data-store` and Firebase transactions.
- Security rules (`firebase/firestore.rules`) mirror the role checks enforced in the UI.
