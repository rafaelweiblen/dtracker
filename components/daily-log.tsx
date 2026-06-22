"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Entry } from "@/db/schema";
import { deleteEntry } from "@/app/actions/entries";
import { EntrySection } from "./entry-section";
import { WaterSection } from "./water-section";
import { EditBottomSheet } from "./edit-bottom-sheet";
import { LogFAB } from "./log-fab";
import { useSyncQueue } from "@/hooks/use-sync-queue";
import { Plus } from "lucide-react";

interface DailyLogProps {
  initialEntries: Entry[];
  date: string;
  readOnly?: boolean;
  currentWeight?: number | null;
  onWeightSaved?: (weight: number) => void;
}

export function DailyLog({ initialEntries, date, readOnly = false, currentWeight, onWeightSaved }: DailyLogProps) {
  const [optimisticEntries, addOptimistic] = useOptimistic(
    initialEntries,
    (state, newEntry: Entry) => [newEntry, ...state]
  );
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [, startTransition] = useTransition();
  const { enqueue } = useSyncQueue();

  const escapes = optimisticEntries.filter((e) => e.type === "escape");
  const exercises = optimisticEntries.filter((e) => e.type === "exercise");
  const water = optimisticEntries.filter((e) => e.type === "water");
  const isEmpty = optimisticEntries.length === 0;

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEntry(id);
    });
  }

  return (
    <div className="relative flex flex-col gap-8 pb-24">
      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.06] px-5 py-10">
          <p className="font-display text-lg font-medium tracking-tight text-foreground">
            Comece pelo primeiro registro
          </p>
          <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-muted-foreground">
            Use o botão <Plus className="mx-0.5 inline size-3.5 align-text-bottom text-primary" aria-hidden /> no canto inferior direito para registrar uma escapada ou um exercício. Os registros aparecem aqui por dia.
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
          <WaterSection
            entries={water}
            onDelete={readOnly ? undefined : handleDelete}
          />
        </>
      )}

      {!readOnly && (
        <LogFAB
          onNewEntry={(e) => addOptimistic(e)}
          onWeightSaved={onWeightSaved}
          enqueue={enqueue}
          initialDate={date}
          currentWeight={currentWeight}
        />
      )}

      <EditBottomSheet
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />
    </div>
  );
}
