"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Entry } from "@/db/schema";
import { cn } from "@/lib/utils";

function formatTime(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

interface WaterCardProps {
  entry: Entry;
  onDelete?: (id: string) => void;
}

export function WaterCard({ entry, onDelete }: WaterCardProps) {
  const [actionsVisible, setActionsVisible] = useState(false);
  const [hoverVisible, setHoverVisible] = useState(false);
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
      onDelete?.(entry.id);
    }
  }

  const canDelete = Boolean(onDelete);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border/90 shadow-sm shadow-black/[0.02]"
      onTouchStart={canDelete ? handleTouchStart : undefined}
      onTouchEnd={canDelete ? handleTouchEnd : undefined}
      onMouseEnter={canDelete ? () => setHoverVisible(true) : undefined}
      onMouseLeave={canDelete ? () => setHoverVisible(false) : undefined}
    >
      {canDelete && (
        <div className="absolute inset-y-0 right-0 flex">
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-16 items-center justify-center bg-destructive/15 text-destructive focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Excluir"
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      )}

      <div
        className={cn(
          "relative flex items-center gap-3 bg-card p-4 transition-transform",
          canDelete && (actionsVisible || hoverVisible) && "-translate-x-16"
        )}
        onClick={() => actionsVisible && setActionsVisible(false)}
      >
        <div className="flex flex-1 items-center justify-between gap-3 overflow-hidden">
          <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
            Água
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(entry.createdAt)}</span>
            {entry.pendingSync && <span aria-hidden>⏳</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
