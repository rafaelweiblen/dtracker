"use client";

import { useState, useTransition, useEffect } from "react";
import { BottomSheet } from "./bottom-sheet";
import { updateEntry } from "@/app/actions/entries";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { Entry } from "@/db/schema";
import { cn } from "@/lib/utils";

const MAX = 280;

interface EditBottomSheetProps {
  entry: Entry | null;
  onClose: () => void;
}

export function EditBottomSheet({ entry, onClose }: EditBottomSheetProps) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (entry) setDescription(entry.description);
  }, [entry]);

  function handleClose() {
    setError("");
    onClose();
  }

  const trimmed = description.trim();
  const count = trimmed.length;
  const isValid = count > 0 && count <= MAX;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) { setError("Descrição é obrigatória"); return; }
    setError("");
    startTransition(async () => {
      try {
        await updateEntry(entry!.id, trimmed);
        handleClose();
      } catch {
        setError("Erro ao salvar. Tente novamente.");
      }
    });
  }

  return (
    <BottomSheet open={entry !== null} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="font-medium">
            {entry?.type === "escape" ? "🍕 Editar escapada" : "🏃 Editar exercício"}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={cn(
              "w-full resize-none rounded-xl border bg-transparent p-3 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus:border-ring focus:ring-2 focus:ring-ring/30",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20"
            )}
          />
          <div className="flex items-center justify-between">
            {error ? <p className="text-xs text-destructive">{error}</p> : <span />}
            <span className={cn("text-xs text-muted-foreground", count > MAX && "text-destructive")}>
              {count}/{MAX}
            </span>
          </div>
        </div>

        <Button type="submit" disabled={!isValid || isPending}>
          {isPending ? "Salvando…" : "Salvar"}
        </Button>
      </form>
    </BottomSheet>
  );
}
