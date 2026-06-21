"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { weightGoals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isMissingWeightGoalsTableError } from "@/db/queries/weight-goals-errors";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

function validateTargetKg(kg: number): void {
  if (!Number.isFinite(kg) || kg < 40 || kg > 120) {
    throw new Error("Meta deve estar entre 40 e 120 kg");
  }
}

function missingTableError(): Error {
  return new Error(
    "Meta de peso indisponível: falta migrar a base de dados (tabela weight_goals)."
  );
}

async function withWeightGoalsTable<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isMissingWeightGoalsTableError(err)) throw missingTableError();
    throw err;
  }
}

export async function setWeightGoal(targetKg: number): Promise<void> {
  const userId = await requireUserId();
  validateTargetKg(targetKg);
  const now = new Date();

  await withWeightGoalsTable(() =>
    db
      .insert(weightGoals)
      .values({ userId, targetKg, updatedAt: now })
      .onConflictDoUpdate({
        target: weightGoals.userId,
        set: { targetKg, updatedAt: now },
      })
  );

  revalidatePath("/weight");
}

export async function clearWeightGoal(): Promise<void> {
  const userId = await requireUserId();
  await withWeightGoalsTable(() =>
    db.delete(weightGoals).where(eq(weightGoals.userId, userId))
  );
  revalidatePath("/weight");
}
