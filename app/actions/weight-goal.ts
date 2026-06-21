"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { weightGoals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function setWeightGoal(targetKg: number): Promise<void> {
  const userId = await requireUserId();
  validateTargetKg(targetKg);
  const now = new Date();

  await db
    .insert(weightGoals)
    .values({ userId, targetKg, updatedAt: now })
    .onConflictDoUpdate({
      target: weightGoals.userId,
      set: { targetKg, updatedAt: now },
    });

  revalidatePath("/weight");
}

export async function clearWeightGoal(): Promise<void> {
  const userId = await requireUserId();
  await db.delete(weightGoals).where(eq(weightGoals.userId, userId));
  revalidatePath("/weight");
}
