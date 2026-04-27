"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upsertWeight } from "@/app/actions/weight";
import { cn } from "@/lib/utils";

interface WeightFormProps {
  onSuccess: (weight: number) => void;
  onBack?: () => void;
  initialWeight?: number | null;
  date?: string;
}

export function WeightForm({ onSuccess, onBack, initialWeight, date }: WeightFormProps) {
  const [value, setValue] = useState(
    initialWeight != null ? String(initialWeight).replace(".", ",") : ""
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const parsed = parseFloat(value.replace(",", "."));
  const isValid = !isNaN(parsed) && parsed > 0 && parsed < 500;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Insira um peso válido em kg");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await upsertWeight({ weight: parsed, date });
        onSuccess(parsed);
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
          <Scale size={16} className="inline-block text-blue-500 mr-1" />
          Peso do dia
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Peso em kg</label>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="75,5"
            autoFocus
            className={cn(
              "w-full rounded-xl border bg-transparent px-3 py-3 pr-10 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus:border-ring focus:ring-2 focus:ring-ring/30",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20"
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            kg
          </span>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button type="submit" disabled={!isValid || isPending}>
        {isPending ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
