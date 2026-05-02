import Link from "next/link";
import { TrendingUp, TrendingDown, Scale, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightCardProps {
  weight: number | null;
  previousWeight: number | null;
  onEdit?: () => void;
}

export function WeightCard({ weight, previousWeight, onEdit }: WeightCardProps) {
  const hasToday = weight != null;
  const isStale = !hasToday && previousWeight != null;
  const displayWeight = hasToday ? weight : previousWeight;
  const diff = hasToday && previousWeight != null ? weight - previousWeight : null;

  return (
    <div className="flex flex-col gap-0.5 rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <Link
          href="/weight"
          className="flex flex-1 items-center gap-1.5 active:opacity-70"
        >
          <Scale size={18} className="text-blue-500" />
          {displayWeight != null ? (
            <>
              <span className={cn("text-2xl font-bold leading-none", isStale && "text-muted-foreground")}>
                {displayWeight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
              </span>
              <span className="text-sm text-muted-foreground">kg</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          {diff != null && Math.abs(diff) >= 0.05 && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                diff > 0 ? "text-red-500" : "text-green-600"
              )}
            >
              {diff > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>
                {diff > 0 ? "+" : ""}
                {diff.toFixed(1)} kg
              </span>
            </div>
          )}
          {(hasToday || isStale) && onEdit && (
            <button
              onClick={onEdit}
              aria-label="Editar peso"
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground active:opacity-70"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>
      <Link href="/weight" className="active:opacity-70">
        <span className="text-xs text-muted-foreground">
          {hasToday
            ? "peso de hoje"
            : isStale
            ? "último peso registrado"
            : "Toque em + para registrar seu peso"}
        </span>
      </Link>
    </div>
  );
}
