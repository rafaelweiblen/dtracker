"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Entry } from "@/db/schema";
import { deleteEntry } from "@/app/actions/entries";
import { EntrySection } from "./entry-section";
import { EditBottomSheet } from "./edit-bottom-sheet";
import { LogFAB } from "./log-fab";

interface DailyLogProps {
  initialEntries: Entry[];
  date: string;
  readOnly?: boolean;
}

export function DailyLog({ initialEntries, date: _date, readOnly = false }: DailyLogProps) {
  const [optimisticEntries, addOptimistic] = useOptimistic(
    initialEntries,
    (state, newEntry: Entry) => [newEntry, ...state]
  );
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [, startTransition] = useTransition();

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
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum registro hoje ainda.
        </p>
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

      {!readOnly && <LogFAB onNewEntry={(e) => addOptimistic(e)} />}

      <EditBottomSheet
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />
    </div>
  );
}
