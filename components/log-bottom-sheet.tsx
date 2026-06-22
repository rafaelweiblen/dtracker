"use client";

import { useState } from "react";
import { UtensilsCrossed, Dumbbell, Scale } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { EntryForm } from "./entry-form";
import { WeightForm } from "./weight-form";
import type { Entry, EntryType } from "@/db/schema";
import type { PendingEntry } from "@/types/offline";

type SelectedMode = EntryType | "weight" | null;

interface LogBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onNewEntry?: (entry: Entry) => void;
  onWeightSaved?: (weight: number) => void;
  enqueue?: (entry: Omit<PendingEntry, "retries" | "status">) => Promise<void>;
  initialDate?: string;
  currentWeight?: number | null;
}

export function LogBottomSheet({
  open,
  onClose,
  onNewEntry,
  onWeightSaved,
  enqueue,
  initialDate,
  currentWeight,
}: LogBottomSheetProps) {
  const [selectedMode, setSelectedMode] = useState<SelectedMode>(null);

  function handleClose() {
    setSelectedMode(null);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {selectedMode === null ? (
        <div className="flex flex-col gap-3 pb-2">
          <p className="font-display text-center text-base font-medium text-foreground">
            O que você quer registrar?
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Escolha uma opção abaixo
          </p>
          <button
            type="button"
            onClick={() => setSelectedMode("escape")}
            className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.08] p-4 text-left transition-colors hover:bg-destructive/[0.12] active:bg-destructive/[0.14]"
          >
            <UtensilsCrossed size={24} className="shrink-0 text-destructive" aria-hidden />
            <div>
              <p className="font-semibold text-destructive">Escapei da dieta</p>
              <p className="text-sm text-muted-foreground">Registre o que você comeu</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode("exercise")}
            className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.08] p-4 text-left transition-colors hover:bg-primary/[0.12] active:bg-primary/[0.14]"
          >
            <Dumbbell size={24} className="shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold text-primary">Fiz exercício</p>
              <p className="text-sm text-muted-foreground">Registre o exercício feito</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode("weight")}
            className="flex items-center gap-3 rounded-xl border border-primary/20 bg-muted/80 p-4 text-left transition-colors hover:bg-muted active:bg-muted"
          >
            <Scale size={24} className="shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">Peso do dia</p>
              <p className="text-sm text-muted-foreground">Anote seu peso</p>
            </div>
          </button>
        </div>
      ) : selectedMode === "weight" ? (
        <WeightForm
          onSuccess={(weight, savedDate) => {
            if (!initialDate || savedDate === initialDate) {
              onWeightSaved?.(weight);
            }
            handleClose();
          }}
          onBack={() => setSelectedMode(null)}
          date={initialDate}
          initialWeight={currentWeight}
        />
      ) : (
        <EntryForm
          type={selectedMode}
          onSuccess={(entry) => {
            onNewEntry?.(entry);
            handleClose();
          }}
          onBack={() => setSelectedMode(null)}
          enqueue={enqueue}
          initialDate={initialDate}
        />
      )}
    </BottomSheet>
  );
}
