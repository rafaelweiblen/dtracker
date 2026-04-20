"use client";

import { useState } from "react";
import { BottomSheet } from "./bottom-sheet";
import { EntryForm } from "./entry-form";
import type { Entry, EntryType } from "@/db/schema";
import type { PendingEntry } from "@/types/offline";

interface LogBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onNewEntry?: (entry: Entry) => void;
  enqueue?: (entry: Omit<PendingEntry, "retries" | "status">) => Promise<void>;
}

export function LogBottomSheet({ open, onClose, onNewEntry, enqueue }: LogBottomSheetProps) {
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
            className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted active:bg-muted"
          >
            <span className="text-2xl">🍕</span>
            <div>
              <p className="font-medium">Escapei da dieta</p>
              <p className="text-sm text-muted-foreground">
                Registre o que você comeu
              </p>
            </div>
          </button>
          <button
            onClick={() => setSelectedType("exercise")}
            className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted active:bg-muted"
          >
            <span className="text-2xl">🏃</span>
            <div>
              <p className="font-medium">Fiz exercício</p>
              <p className="text-sm text-muted-foreground">
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
        />
      )}
    </BottomSheet>
  );
}
