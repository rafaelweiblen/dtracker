import { db } from "@/db";
import { entries } from "@/db/schema";
import type { Entry } from "@/db/schema";
import { and, eq, like, desc } from "drizzle-orm";

export async function getEntriesForDate(
  userId: string,
  date: string
): Promise<Entry[]> {
  return db
    .select()
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.date, date)));
}

// ---------- types ----------

export type DaySummary = {
  escapeCount: number;
  exerciseCount: number;
};

export type Streaks = {
  exerciseStreak: number;
  daysSinceEscape: number | null;
};

// ---------- pure helpers (exported for unit tests) ----------

export function computeMonthSummary(
  rows: Pick<Entry, "date" | "type">[]
): Record<string, DaySummary> {
  const summary: Record<string, DaySummary> = {};
  for (const row of rows) {
    if (!summary[row.date])
      summary[row.date] = { escapeCount: 0, exerciseCount: 0 };
    if (row.type === "escape") summary[row.date].escapeCount++;
    else summary[row.date].exerciseCount++;
  }
  return summary;
}

export function computeStreaks(
  rows: Pick<Entry, "date" | "type">[],
  today: string
): Streaks {
  const yesterday = isoOffset(today, -1);

  const exerciseDates = new Set(
    rows.filter((r) => r.type === "exercise").map((r) => r.date)
  );

  // Count consecutive exercise days ending today or yesterday
  let exerciseStreak = 0;
  let cursor = exerciseDates.has(today)
    ? today
    : exerciseDates.has(yesterday)
      ? yesterday
      : null;

  while (cursor && exerciseDates.has(cursor)) {
    exerciseStreak++;
    cursor = isoOffset(cursor, -1);
  }

  // Days since last escape
  const escapeDates = rows
    .filter((r) => r.type === "escape")
    .map((r) => r.date)
    .sort()
    .reverse();

  const daysSinceEscape =
    escapeDates.length > 0
      ? daysBetween(escapeDates[0], today)
      : null;

  return { exerciseStreak, daysSinceEscape };
}

function isoOffset(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) /
      86_400_000
  );
}

// ---------- DB queries ----------

export async function getMonthSummary(
  userId: string,
  month: string
): Promise<Record<string, DaySummary>> {
  const rows = await db
    .select({ date: entries.date, type: entries.type })
    .from(entries)
    .where(and(eq(entries.userId, userId), like(entries.date, `${month}%`)));

  return computeMonthSummary(rows);
}

export async function getStreaks(userId: string, today?: string): Promise<Streaks> {
  const rows = await db
    .select({ date: entries.date, type: entries.type })
    .from(entries)
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.date));

  const resolvedToday = today ?? new Date().toISOString().slice(0, 10);
  return computeStreaks(rows, resolvedToday);
}
