import { db } from "@/db";
import { entries } from "@/db/schema";
import type { Entry } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getEntriesForDate(
  userId: string,
  date: string
): Promise<Entry[]> {
  return db
    .select()
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.date, date)));
}
