"use client";

import { useId, useState, useTransition, useEffect } from "react";
import { ChevronDown, ChevronLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upsertWeight } from "@/app/actions/weight";
import { DatePickerSheet } from "./date-picker-sheet";
import { cn } from "@/lib/utils";

function localDateISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(date: string): string {
  const today = localDateISO();
  if (date === today) return "Hoje";
  const d = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(d);
}

interface WeightFormProps {
  onSuccess: (weight: number, date: string) => void;
  onBack?: () => void;
  initialWeight?: number | null;
  date?: string;
}

export function WeightForm({ onSuccess, onBack, initialWeight, date }: WeightFormProps) {
  const weightInputId = useId();
  const weightErrorId = useId();
  const datePickerPanelId = useId();
  const [value, setValue] = useState(
    initialWeight != null ? String(initialWeight).replace(".", ",") : ""
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(date ?? localDateISO());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (date) setSelectedDate(date);
  }, [date]);

  useEffect(() => {
    setValue(initialWeight != null ? String(initialWeight).replace(".", ",") : "");
  }, [initialWeight, date]);

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
        await upsertWeight({ weight: parsed, date: selectedDate });
        onSuccess(parsed, selectedDate);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(msg || "Erro ao salvar. Tente novamente.");
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
            className="rounded-lg p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <p className="font-medium">
          <Scale size={16} className="mr-1 inline-block text-primary" aria-hidden />
          Peso do dia
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDatePickerOpen(true)}
        aria-expanded={datePickerOpen}
        aria-haspopup="dialog"
        aria-controls={datePickerPanelId}
        className="flex w-fit items-center gap-1 rounded-lg text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {formatDateLabel(selectedDate)}
        <ChevronDown size={14} aria-hidden />
      </button>

      <div className="flex flex-col gap-1">
        <label htmlFor={weightInputId} className="text-sm font-medium">
          Peso em kg
        </label>
        <div className="relative">
          <input
            id={weightInputId}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="75,5…"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? weightErrorId : undefined}
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
        {error && (
          <p id={weightErrorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" disabled={!isValid || isPending}>
        {isPending ? "Salvando…" : "Salvar"}
      </Button>

      <DatePickerSheet
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        selected={selectedDate}
        onSelect={setSelectedDate}
        panelId={datePickerPanelId}
      />
    </form>
  );
}
