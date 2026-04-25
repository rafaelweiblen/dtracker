"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronLeft, WifiOff, UtensilsCrossed, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEntry } from "@/app/actions/entries";
import type { Entry, EntryType } from "@/db/schema";
import type { PendingEntry } from "@/types/offline";
import { cn } from "@/lib/utils";
import { DatePickerSheet } from "./date-picker-sheet";

const MAX = 280;

function localDateISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(date: string): string {
  const today = localDateISO();
  if (date === today) return "Hoje";
  const d = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(d);
}

const PLACEHOLDER: Record<EntryType, string> = {
  escape: "O que você comeu?",
  exercise: "Qual exercício você fez?",
};

interface EntryFormProps {
  type: EntryType;
  onSuccess: (entry: Entry) => void;
  onBack?: () => void;
  initialDescription?: string;
  initialDate?: string;
  enqueue?: (entry: Omit<PendingEntry, "retries" | "status">) => Promise<void>;
}

export function EntryForm({
  type,
  onSuccess,
  onBack,
  initialDescription = "",
  initialDate,
  enqueue,
}: EntryFormProps) {
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(initialDate ?? localDateISO());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

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

    if (!isOnline && enqueue) {
      startTransition(async () => {
        const id = crypto.randomUUID();
        const now = new Date();
        await enqueue({
          id,
          type,
          description: trimmed,
          date: selectedDate,
          createdAt: now.getTime(),
        });
        const fakeEntry: Entry = {
          id,
          userId: "",
          type,
          description: trimmed,
          date: selectedDate,
          createdAt: now,
          updatedAt: now,
          edited: false,
          pendingSync: true,
        };
        onSuccess(fakeEntry);
      });
      return;
    }

    startTransition(async () => {
      try {
        const entry = await createEntry({ type, description: trimmed, date: selectedDate });
        onSuccess(entry);
      } catch {
        setError("Erro ao salvar. Tente novamente.");
      }
    });
  }

  return (
    <>
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
            {type === "escape" ? (
              <><UtensilsCrossed size={16} className="inline-block text-red-600" /> Escapei da dieta</>
            ) : (
              <><Dumbbell size={16} className="inline-block text-green-600" /> Fiz exercício</>
            )}
          </p>
          {!isOnline && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <WifiOff size={12} aria-hidden /> offline
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDatePickerOpen(true)}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {formatDateLabel(selectedDate)}
          <ChevronDown size={14} />
        </button>

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
            <span className={cn("text-xs text-muted-foreground", count > MAX && "text-destructive")}>
              {count}/{MAX}
            </span>
          </div>
        </div>

        <Button type="submit" disabled={!isValid || isPending}>
          {isPending ? "Salvando…" : isOnline ? "Salvar" : "Salvar offline"}
        </Button>
      </form>

      <DatePickerSheet
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        selected={selectedDate}
        onSelect={setSelectedDate}
      />
    </>
  );
}
