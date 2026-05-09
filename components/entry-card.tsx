"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Entry } from "@/db/schema";
import { cn } from "@/lib/utils";

function formatDateTime(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  const datePart = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${datePart} · ${timePart}`;
}

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
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
      onDelete(entry.id);
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border/90 shadow-sm shadow-black/[0.02]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setHoverVisible(true)}
      onMouseLeave={() => setHoverVisible(false)}
    >
      <div className="absolute inset-y-0 right-0 flex">
        <button
          type="button"
          onClick={() => {
            setActionsVisible(false);
            onEdit(entry);
          }}
          className="flex w-16 items-center justify-center bg-muted text-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Editar"
        >
          <Pencil size={18} aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex w-16 items-center justify-center bg-destructive/15 text-destructive focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Excluir"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>

      <div
        className={cn(
          "relative flex items-start gap-3 bg-card p-4 transition-transform",
          (actionsVisible || hoverVisible) && "-translate-x-32"
        )}
        onClick={() => actionsVisible && setActionsVisible(false)}
      >
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <span
            className={cn(
              "self-start rounded-full border px-2 py-0.5 text-xs font-medium",
              entry.type === "escape"
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-primary/25 bg-primary/10 text-primary"
            )}
          >
            {entry.type === "escape" ? "Escapada" : "Exercício"}
          </span>
          <p className="break-words text-sm leading-snug">{entry.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDateTime(entry.createdAt)}</span>
            {entry.edited && <span>· editado</span>}
            {entry.pendingSync && <span aria-hidden>· ⏳</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
