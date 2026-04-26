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

export type StreakRun = {
  startDate: string;
  endDate: string;
  length: number;
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

export function computeStreakHistory(
  rows: Pick<Entry, "date" | "type">[],
  today: string
): StreakRun[] {
  const dates = [
    ...new Set(
      rows.filter((r) => r.type === "exercise").map((r) => r.date)
    ),
  ].sort();

  if (dates.length === 0) return [];

  const runs: StreakRun[] = [];
  let start = dates[0];
  let end = dates[0];

  for (let i = 1; i < dates.length; i++) {
    const expected = isoOffset(end, 1);
    if (dates[i] === expected) {
      end = dates[i];
    } else {
      runs.push({ startDate: start, endDate: end, length: daysBetween(start, end) + 1 });
      start = dates[i];
      end = dates[i];
    }
  }
  runs.push({ startDate: start, endDate: end, length: daysBetween(start, end) + 1 });

  // Active streak: ends today or yesterday — already included via date grouping
  // Sort by length desc, return top 3
  return runs.sort((a, b) => b.length - a.length).slice(0, 3);
}

export function computeEscapeFreeHistory(
  rows: Pick<Entry, "date" | "type">[],
  today: string
): StreakRun[] {
  const escapeDates = [
    ...new Set(rows.filter((r) => r.type === "escape").map((r) => r.date)),
  ].sort();

  const runs: StreakRun[] = [];

  if (escapeDates.length === 0) {
    const allDates = [...new Set(rows.map((r) => r.date))].sort();
    if (allDates.length > 0) {
      runs.push({
        startDate: allDates[0],
        endDate: today,
        length: daysBetween(allDates[0], today) + 1,
      });
    }
    return runs;
  }

  // Period before first escape
  const allDates = [...new Set(rows.map((r) => r.date))].sort();
  if (allDates.length > 0 && allDates[0] < escapeDates[0]) {
    const preLength = daysBetween(allDates[0], escapeDates[0]);
    if (preLength > 0) {
      runs.push({
        startDate: allDates[0],
        endDate: isoOffset(escapeDates[0], -1),
        length: preLength,
      });
    }
  }

  // Gaps between consecutive escapes
  for (let i = 0; i < escapeDates.length - 1; i++) {
    const gap = daysBetween(escapeDates[i], escapeDates[i + 1]) - 1;
    if (gap > 0) {
      runs.push({
        startDate: isoOffset(escapeDates[i], 1),
        endDate: isoOffset(escapeDates[i + 1], -1),
        length: gap,
      });
    }
  }

  // Current ongoing escape-free period (after last escape)
  const lastEscape = escapeDates[escapeDates.length - 1];
  const currentLength = daysBetween(lastEscape, today);
  if (currentLength > 0) {
    runs.push({
      startDate: isoOffset(lastEscape, 1),
      endDate: today,
      length: currentLength,
    });
  }

  return runs.sort((a, b) => b.length - a.length).slice(0, 3);
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

export async function getEscapeFreeHistory(userId: string, today?: string): Promise<StreakRun[]> {
  const rows = await db
    .select({ date: entries.date, type: entries.type })
    .from(entries)
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.date));

  const resolvedToday = today ?? new Date().toISOString().slice(0, 10);
  return computeEscapeFreeHistory(rows, resolvedToday);
}

export async function getStreakHistory(userId: string, today?: string): Promise<StreakRun[]> {
  const rows = await db
    .select({ date: entries.date, type: entries.type })
    .from(entries)
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.date));

  const resolvedToday = today ?? new Date().toISOString().slice(0, 10);
  return computeStreakHistory(rows, resolvedToday);
}
