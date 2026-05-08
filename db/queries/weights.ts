import { db } from "@/db";
import { weights } from "@/db/schema";
import { and, eq, like, desc, lt, gte, lte } from "drizzle-orm";

function rowWeightKg(w: unknown): number | null {
  if (w == null) return null;
  const n = Number(w);
  return Number.isFinite(n) ? n : null;
}

export async function getWeightWithPrevious(
  userId: string,
  date: string
): Promise<{ today: number | null; previous: number | null }> {
  const [todayRow] = await db
    .select({ weight: weights.weight })
    .from(weights)
    .where(and(eq(weights.userId, userId), eq(weights.date, date)));

  const [previousRow] = await db
    .select({ weight: weights.weight })
    .from(weights)
    .where(and(eq(weights.userId, userId), lt(weights.date, date)))
    .orderBy(desc(weights.date))
    .limit(1);

  return {
    today: rowWeightKg(todayRow?.weight),
    previous: rowWeightKg(previousRow?.weight),
  };
}

export async function getWeightsForMonth(
  userId: string,
  month: string
): Promise<Record<string, number>> {
  const rows = await db
    .select({ date: weights.date, weight: weights.weight })
    .from(weights)
    .where(and(eq(weights.userId, userId), like(weights.date, `${month}%`)));

  return Object.fromEntries(
    rows
      .map((r) => {
        const w = rowWeightKg(r.weight);
        return w != null ? ([r.date, w] as const) : null;
      })
      .filter((e): e is readonly [string, number] => e != null)
  );
}

/** Intervalo inclusivo; datas no formato YYYY-MM-DD (ordem lexicográfica = cronológica). */
export async function getWeightsBetweenDates(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const rows = await db
    .select({ date: weights.date, weight: weights.weight })
    .from(weights)
    .where(
      and(
        eq(weights.userId, userId),
        gte(weights.date, startDate),
        lte(weights.date, endDate)
      )
    );

  return Object.fromEntries(
    rows
      .map((r) => {
        const w = rowWeightKg(r.weight);
        return w != null ? ([r.date, w] as const) : null;
      })
      .filter((e): e is readonly [string, number] => e != null)
  );
}
