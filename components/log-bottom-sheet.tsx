"use client";

import { useState } from "react";
import { UtensilsCrossed, Dumbbell } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { EntryForm } from "./entry-form";
import type { Entry, EntryType } from "@/db/schema";
import type { PendingEntry } from "@/types/offline";

interface LogBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onNewEntry?: (entry: Entry) => void;
  enqueue?: (entry: Omit<PendingEntry, "retries" | "status">) => Promise<void>;
  initialDate?: string;
}

export function LogBottomSheet({ open, onClose, onNewEntry, enqueue, initialDate }: LogBottomSheetProps) {
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);

  function handleClose() {
    setSelectedType(null);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {selectedType === null ? (
        <div className="flex flex-col gap-3 pb-2">
          <p className="text-center text-sm font-medium text-muted-foreground">
            O que você quer registrar?
          </p>
          <button
            onClick={() => setSelectedType("escape")}
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-left transition-colors hover:bg-red-100 active:bg-red-100"
          >
            <UtensilsCrossed size={24} className="shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-700">Escapei da dieta</p>
              <p className="text-sm text-red-500">
                Registre o que você comeu
              </p>
            </div>
          </button>
          <button
            onClick={() => setSelectedType("exercise")}
            className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-left transition-colors hover:bg-green-100 active:bg-green-100"
          >
            <Dumbbell size={24} className="shrink-0 text-green-600" />
            <div>
              <p className="font-medium text-green-700">Fiz exercício</p>
              <p className="text-sm text-green-500">
                Registre o exercício feito
              </p>
            </div>
          </button>
        </div>
      ) : (
        <EntryForm
          type={selectedType}
          onSuccess={(entry) => { onNewEntry?.(entry); handleClose(); }}
          onBack={() => setSelectedType(null)}
          enqueue={enqueue}
          initialDate={initialDate}
        />
      )}
    </BottomSheet>
  );
}
