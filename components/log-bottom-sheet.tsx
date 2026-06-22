"use client";

import { useState, useTransition } from "react";
import { UtensilsCrossed, Dumbbell, Scale, Droplets } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { EntryForm } from "./entry-form";
import { WeightForm } from "./weight-form";
import { createEntry } from "@/app/actions/entries";
import { WATER_DESCRIPTION, type Entry } from "@/db/schema";
import type { PendingEntry } from "@/types/offline";

type HabitEntryType = "escape" | "exercise";
type SelectedMode = HabitEntryType | "weight" | null;

function localDateISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  const [waterError, setWaterError] = useState("");
  const [waterPending, startWaterTransition] = useTransition();

  function handleClose() {
    setSelectedMode(null);
    setWaterError("");
    onClose();
  }

  function handleLogWater() {
    setWaterError("");
    const date = initialDate ?? localDateISO();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    startWaterTransition(async () => {
      if (!isOnline && enqueue) {
        const id = crypto.randomUUID();
        const now = new Date();
        await enqueue({
          id,
          type: "water",
          description: WATER_DESCRIPTION,
          date,
          createdAt: now.getTime(),
        });
        onNewEntry?.({
          id,
          userId: "",
          type: "water",
          description: WATER_DESCRIPTION,
          date,
          createdAt: now,
          updatedAt: now,
          edited: false,
          pendingSync: true,
        });
        handleClose();
        return;
      }

      try {
        const entry = await createEntry({ type: "water", date });
        onNewEntry?.(entry);
        handleClose();
      } catch {
        setWaterError("Erro ao salvar. Tente novamente.");
      }
    });
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
            onClick={handleLogWater}
            disabled={waterPending}
            className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/[0.08] p-4 text-left transition-colors hover:bg-sky-500/[0.12] active:bg-sky-500/[0.14] disabled:opacity-60"
          >
            <Droplets size={24} className="shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
            <div>
              <p className="font-semibold text-sky-600 dark:text-sky-400">
                {waterPending ? "Salvando…" : "Bebi água"}
              </p>
              <p className="text-sm text-muted-foreground">Registro rápido, sem detalhes</p>
            </div>
          </button>
          {waterError && (
            <p role="alert" className="text-center text-xs text-destructive">
              {waterError}
            </p>
          )}
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
