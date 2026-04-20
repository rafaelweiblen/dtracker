"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { LogBottomSheet } from "./log-bottom-sheet";
import type { Entry } from "@/db/schema";
import type { PendingEntry } from "@/types/offline";

interface LogFABProps {
  onNewEntry?: (entry: Entry) => void;
  enqueue?: (entry: Omit<PendingEntry, "retries" | "status">) => Promise<void>;
}

export function LogFAB({ onNewEntry, enqueue }: LogFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Registrar entrada"
        className="fixed bottom-20 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <Plus size={24} aria-hidden />
      </button>
      <LogBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        onNewEntry={onNewEntry}
        enqueue={enqueue}
      />
    </>
  );
}
