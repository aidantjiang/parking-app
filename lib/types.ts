export interface EventDoc {
  id: string;
  name: string;
  startAt: string; // ISO string
  endAt: string;
  location?: string;
  createdBy: string;
  visibility: "private" | "public";
  createdAt: number;
  capacityDefaults?: {
    perLot: number;
  };
}

export interface LotDoc {
  id: string;
  eventId: string;
  name: string;
  group?: string;
  capacity: number;
  count: number;
  claimedBy?: string;
  deviceCode?: string;
  updatedAt: number;
  lastUpdatedBy?: string;
}

export interface UserDoc {
  uid: string;
  role: "attendant" | "admin";
  displayName?: string;
  createdAt: number;
  lastLoginAt?: number;
}

export type VisibilityFilter = "all" | "public" | "private";

export interface CreateEventInput {
  name: string;
  startAt: string;
  endAt: string;
  location?: string;
  visibility: "public" | "private";
  capacityDefaults?: {
    perLot: number;
  };
  initialLots?: Array<{
    name: string;
    group?: string;
    capacity: number;
  }>;
}
