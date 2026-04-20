"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Entry } from "@/db/schema";
import { cn } from "@/lib/utils";

function formatTime(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [actionsVisible, setActionsVisible] = useState(false);
  const touchStartX = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 60) setActionsVisible(true);
    if (delta < -30) setActionsVisible(false);
  }

  function handleDelete() {
    if (window.confirm("Excluir este registro?")) {
      onDelete(entry.id);
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* action buttons revealed by swipe */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => { setActionsVisible(false); onEdit(entry); }}
          className="flex w-16 items-center justify-center bg-muted text-foreground"
          aria-label="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={handleDelete}
          className="flex w-16 items-center justify-center bg-destructive/15 text-destructive"
          aria-label="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* card content */}
      <div
        className={cn(
          "relative flex items-start gap-3 bg-background p-4 transition-transform",
          actionsVisible && "-translate-x-32"
        )}
        onClick={() => actionsVisible && setActionsVisible(false)}
      >
        <span className="mt-0.5 text-xl" aria-hidden>
          {entry.type === "escape" ? "🍕" : "🏃"}
        </span>
        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <p className="break-words text-sm">{entry.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(entry.createdAt)}</span>
            {entry.edited && <span>· editado</span>}
            {entry.pendingSync && <span>· ⏳</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
