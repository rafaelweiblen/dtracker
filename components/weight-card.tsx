import Link from "next/link";
import { TrendingUp, TrendingDown, Scale, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightCardProps {
  weight: number | null;
  previousWeight: number | null;
  onEdit?: () => void;
  isToday?: boolean;
}

export function WeightCard({
  weight,
  previousWeight,
  onEdit,
  isToday = true,
}: WeightCardProps) {
  const hasToday = weight != null;
  const isStale = !hasToday && previousWeight != null;
  const displayWeight = hasToday ? weight : previousWeight;
  const diff = hasToday && previousWeight != null ? weight - previousWeight : null;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/90 bg-card px-3.5 py-3 shadow-sm shadow-black/[0.03]">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/weight"
          className="flex min-w-0 flex-1 items-center gap-2 active:opacity-75"
        >
          <Scale size={18} className="shrink-0 text-primary" aria-hidden />
          {displayWeight != null ? (
            <>
              <span
                className={cn(
                  "text-metric tabular-nums text-foreground",
                  isStale && "text-muted-foreground"
                )}
              >
                {displayWeight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
              </span>
              <span className="text-sm text-muted-foreground">kg</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {diff != null && Math.abs(diff) >= 0.05 && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold tabular-nums",
                diff > 0 ? "text-destructive" : "text-primary"
              )}
            >
              {diff > 0 ? <TrendingUp size={15} aria-hidden /> : <TrendingDown size={15} aria-hidden />}
              <span>
                {diff > 0 ? "+" : ""}
                {diff.toFixed(1)} kg
              </span>
            </div>
          )}
          {(hasToday || isStale) && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Editar peso"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-75"
            >
              <Pencil size={16} aria-hidden />
            </button>
          )}
        </div>
      </div>
      <Link href="/weight" className="active:opacity-75">
        <span className="text-xs text-muted-foreground">
          {hasToday
            ? isToday
              ? "peso de hoje"
              : "peso deste dia"
            : isStale
              ? isToday
                ? "último peso registrado"
                : "sem peso neste dia — último registo anterior"
              : isToday
                ? "Toque em + para registrar seu peso"
                : "Toque em + para registrar o peso deste dia"}
        </span>
      </Link>
    </div>
  );
}
