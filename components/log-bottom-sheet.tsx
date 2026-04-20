"use client";

import { useState } from "react";
import { BottomSheet } from "./bottom-sheet";
import { EntryForm } from "./entry-form";
import type { EntryType } from "@/db/schema";

interface LogBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

export function LogBottomSheet({ open, onClose }: LogBottomSheetProps) {
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
          onSuccess={handleClose}
          onBack={() => setSelectedType(null)}
        />
      )}
    </BottomSheet>
  );
}
