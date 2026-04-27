"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { weights } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function upsertWeight(input: {
  weight: number;
  date?: string;
}): Promise<void> {
  const userId = await requireUserId();

  if (input.weight <= 0 || input.weight > 500) {
    throw new Error("Peso inválido");
  }

  const date =
    input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
      ? input.date
      : new Date().toISOString().slice(0, 10);

  const now = new Date();

  await db
    .insert(weights)
    .values({
      id: randomUUID(),
      userId,
      date,
      weight: input.weight,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [weights.userId, weights.date],
      set: { weight: input.weight, updatedAt: now },
    });

  revalidatePath("/home");
  revalidatePath("/weight");
}

export async function deleteWeight(date: string): Promise<void> {
  const userId = await requireUserId();

  await db
    .delete(weights)
    .where(and(eq(weights.userId, userId), eq(weights.date, date)));

  revalidatePath("/home");
  revalidatePath("/weight");
}
