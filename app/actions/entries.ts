"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { entries } from "@/db/schema";
import type { EntryType, Entry } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

const MAX_DESCRIPTION = 280;

function validateDescription(raw: unknown): string {
  if (typeof raw !== "string") throw new Error("Descrição inválida");
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Descrição é obrigatória");
  if (trimmed.length > MAX_DESCRIPTION)
    throw new Error(`Descrição deve ter no máximo ${MAX_DESCRIPTION} caracteres`);
  return trimmed;
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function createEntry(input: {
  type: EntryType;
  description: string;
}): Promise<Entry> {
  const userId = await requireUserId();
  const description = validateDescription(input.description);
  const now = new Date();

  const [entry] = await db
    .insert(entries)
    .values({
      id: randomUUID(),
      userId,
      type: input.type,
      description,
      date: now.toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidatePath("/home");
  return entry;
}

export async function updateEntry(
  id: string,
  description: string
): Promise<Entry> {
  const userId = await requireUserId();
  const trimmed = validateDescription(description);

  const [entry] = await db
    .update(entries)
    .set({ description: trimmed, edited: true, updatedAt: new Date() })
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
    .returning();

  if (!entry) throw new Error("Registro não encontrado");

  revalidatePath("/home");
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const userId = await requireUserId();

  const deleted = await db
    .delete(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
    .returning();

  if (!deleted.length) throw new Error("Registro não encontrado");

  revalidatePath("/home");
}
