"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { openDB, type IDBPDatabase } from "idb";
import type { PendingEntry } from "@/types/offline";
import { createEntry } from "@/app/actions/entries";

const DB_NAME = "diet-tracker";
const STORE = "sync-queue";
const MAX_RETRIES = 3;

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export function useSyncQueue() {
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const isFlushing = useRef(false);

  async function loadPending() {
    const db = await getDB();
    const all = await db.getAll(STORE);
    setPendingEntries(all as PendingEntry[]);
  }

  const flush = useCallback(async () => {
    if (isFlushing.current || !navigator.onLine) return;
    isFlushing.current = true;

    try {
      const db = await getDB();
      const all = (await db.getAll(STORE)) as PendingEntry[];

      for (const entry of all) {
        if (entry.status === "failed") continue;
        try {
          await createEntry({ type: entry.type, description: entry.description });
          await db.delete(STORE, entry.id);
        } catch {
          const retries = entry.retries + 1;
          await db.put(STORE, {
            ...entry,
            retries,
            status: retries >= MAX_RETRIES ? "failed" : "pending",
          });
        }
      }
      await loadPending();
    } finally {
      isFlushing.current = false;
    }
  }, []);

  const enqueue = useCallback(async (entry: Omit<PendingEntry, "retries" | "status">) => {
    const db = await getDB();
    const record: PendingEntry = { ...entry, retries: 0, status: "pending" };
    await db.put(STORE, record);
    await loadPending();
  }, []);

  useEffect(() => {
    loadPending();
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [flush]);

  return { pendingEntries, enqueue, flush };
}
