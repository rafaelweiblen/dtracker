"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Entry } from "@/db/schema";
import { deleteEntry } from "@/app/actions/entries";
import { EntrySection } from "./entry-section";
import { EditBottomSheet } from "./edit-bottom-sheet";
import { LogFAB } from "./log-fab";
import { useSyncQueue } from "@/hooks/use-sync-queue";

interface DailyLogProps {
  initialEntries: Entry[];
  date: string;
  readOnly?: boolean;
}

export function DailyLog({ initialEntries, date, readOnly = false }: DailyLogProps) {
  const [optimisticEntries, addOptimistic] = useOptimistic(
    initialEntries,
    (state, newEntry: Entry) => [newEntry, ...state]
  );
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [, startTransition] = useTransition();
  const { enqueue } = useSyncQueue();

  const escapes = optimisticEntries.filter((e) => e.type === "escape");
  const exercises = optimisticEntries.filter((e) => e.type === "exercise");
  const isEmpty = optimisticEntries.length === 0;

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEntry(id);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {isEmpty ? (
        <div className="py-12 text-center">
          <p className="text-base font-medium">Nenhum registro ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque no + para registrar uma escapada ou exercício
          </p>
        </div>
      ) : (
        <>
          <EntrySection
            type="escape"
            entries={escapes}
            onEdit={setEditingEntry}
            onDelete={handleDelete}
          />
          <EntrySection
            type="exercise"
            entries={exercises}
            onEdit={setEditingEntry}
            onDelete={handleDelete}
          />
        </>
      )}

      {!readOnly && (
        <LogFAB
          onNewEntry={(e) => addOptimistic(e)}
          enqueue={enqueue}
          initialDate={date}
        />
      )}

      <EditBottomSheet
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />
    </div>
  );
}
