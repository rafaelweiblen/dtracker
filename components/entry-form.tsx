"use client";

import { useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEntry } from "@/app/actions/entries";
import type { EntryType } from "@/db/schema";
import { cn } from "@/lib/utils";

const MAX = 280;

const PLACEHOLDER: Record<EntryType, string> = {
  escape: "O que você comeu?",
  exercise: "Qual exercício você fez?",
};

interface EntryFormProps {
  type: EntryType;
  onSuccess: () => void;
  onBack?: () => void;
  initialDescription?: string;
}

export function EntryForm({
  type,
  onSuccess,
  onBack,
  initialDescription = "",
}: EntryFormProps) {
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const trimmed = description.trim();
  const count = trimmed.length;
  const isValid = count > 0 && count <= MAX;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) {
      setError("Descrição é obrigatória");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await createEntry({ type, description: trimmed });
        onSuccess();
      } catch {
        setError("Erro ao salvar. Tente novamente.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <p className="font-medium">
          {type === "escape" ? "🍕 Escapei da dieta" : "🏃 Fiz exercício"}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={PLACEHOLDER[type]}
          rows={4}
          className={cn(
            "w-full resize-none rounded-xl border bg-transparent p-3 text-sm outline-none transition-colors",
            "placeholder:text-muted-foreground",
            "focus:border-ring focus:ring-2 focus:ring-ring/30",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20"
          )}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "text-xs text-muted-foreground",
              count > MAX && "text-destructive"
            )}
          >
            {count}/{MAX}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={!isValid || isPending}>
        {isPending ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
