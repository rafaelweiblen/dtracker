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
  date?: string;
}): Promise<Entry> {
  const userId = await requireUserId();
  const description = validateDescription(input.description);
  const now = new Date();
  const date =
    input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
      ? input.date
      : now.toISOString().slice(0, 10);

  const [entry] = await db
    .insert(entries)
    .values({
      id: randomUUID(),
      userId,
      type: input.type,
      description,
      date,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidatePath("/home");
  revalidatePath("/calendar");
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
  revalidatePath("/calendar");
  return entry;
}

function localDateFromTs(ts: Date, offsetMinutes: number): string {
  const localMs = new Date(ts).getTime() - offsetMinutes * 60 * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

export async function fixEntryDates(offsetMinutes: number): Promise<number> {
  const userId = await requireUserId();
  const rows = await db
    .select({ id: entries.id, date: entries.date, createdAt: entries.createdAt })
    .from(entries)
    .where(eq(entries.userId, userId));

  let fixed = 0;
  for (const row of rows) {
    const correctDate = localDateFromTs(row.createdAt, offsetMinutes);
    if (row.date !== correctDate) {
      await db.update(entries).set({ date: correctDate }).where(eq(entries.id, row.id));
      fixed++;
    }
  }

  revalidatePath("/home");
  revalidatePath("/calendar");
  return fixed;
}

export async function deleteEntry(id: string): Promise<void> {
  const userId = await requireUserId();

  const deleted = await db
    .delete(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
    .returning();

  if (!deleted.length) throw new Error("Registro não encontrado");

  revalidatePath("/home");
  revalidatePath("/calendar");
}
