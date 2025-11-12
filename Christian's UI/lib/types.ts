export interface EventDoc {
  id: string;
  name: string;
  startAt: string; // ISO
  endAt: string; // ISO
  location?: string;
  createdBy: string; // uid
  visibility: "private" | "public";
  createdAt: number;
  capacityDefault?: number;
  lotGroups?: string[];
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
  email?: string;
}

export type DeviceClaim = {
  lotId: string;
  userId: string;
  claimedAt: number;
};

export type LiveBadge = {
  label: string;
  ageMs: number;
};
