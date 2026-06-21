"use client";

import { useState, useTransition } from "react";
import { clearWeightGoal, setWeightGoal } from "@/app/actions/weight-goal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeightGoalFormProps {
  initialTargetKg: number | null;
}

export function WeightGoalForm({ initialTargetKg }: WeightGoalFormProps) {
  const [value, setValue] = useState(
    initialTargetKg != null ? String(initialTargetKg).replace(".", ",") : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const parsed = parseFloat(value.replace(",", "."));
  const isValid = !Number.isNaN(parsed) && parsed >= 40 && parsed <= 120;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Meta deve estar entre 40 e 120 kg");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await setWeightGoal(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao guardar meta");
      }
    });
  }

  function handleClear() {
    setError(null);
    startTransition(async () => {
      try {
        await clearWeightGoal();
        setValue("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao remover meta");
      }
    });
  }

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-3 rounded-2xl border border-border/90 bg-card px-3.5 py-3 shadow-sm shadow-black/[0.03]"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="weight-goal" className="text-xs font-medium text-muted-foreground">
          Meta de peso (40–120 kg)
        </label>
        <input
          id="weight-goal"
          type="text"
          inputMode="decimal"
          placeholder="75,0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm tabular-nums outline-none",
            "placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          )}
        />
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || !isValid}>
          Guardar meta
        </Button>
        {initialTargetKg != null ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleClear}
          >
            Remover
          </Button>
        ) : null}
      </div>
    </form>
  );
}
