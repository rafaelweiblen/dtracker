import type { EntryType } from "@/db/schema";

export type SyncStatus = "pending" | "failed";

export interface PendingEntry {
  id: string;
  type: EntryType;
  description: string;
  date: string;
  createdAt: number; // timestamp ms
  retries: number;
  status: SyncStatus;
}
