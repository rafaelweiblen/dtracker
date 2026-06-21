import { db } from "@/db";
import { weightGoals } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWeightGoal(
  userId: string
): Promise<{ targetKg: number } | null> {
  const [row] = await db
    .select({ targetKg: weightGoals.targetKg })
    .from(weightGoals)
    .where(eq(weightGoals.userId, userId))
    .limit(1);

  if (!row) return null;
  const kg = Number(row.targetKg);
  if (!Number.isFinite(kg)) return null;
  return { targetKg: kg };
}
