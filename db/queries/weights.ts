import { db } from "@/db";
import { weights } from "@/db/schema";
import { and, eq, like, desc, lt } from "drizzle-orm";

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
    today: todayRow?.weight ?? null,
    previous: previousRow?.weight ?? null,
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

  return Object.fromEntries(rows.map((r) => [r.date, r.weight]));
}
