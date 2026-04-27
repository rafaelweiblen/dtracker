import Link from "next/link";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightCardProps {
  weight: number | null;
  previousWeight: number | null;
}

export function WeightCard({ weight, previousWeight }: WeightCardProps) {
  const diff =
    weight != null && previousWeight != null ? weight - previousWeight : null;

  return (
    <Link
      href="/weight"
      className="flex flex-col gap-0.5 rounded-xl border p-3 active:opacity-70"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scale size={18} className="text-blue-500" />
          {weight != null ? (
            <>
              <span className="text-2xl font-bold leading-none">
                {weight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
              </span>
              <span className="text-sm text-muted-foreground">kg</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
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
      </div>
      <span className="text-xs text-muted-foreground">
        {weight != null ? "peso de hoje" : "Toque em + para registrar seu peso"}
      </span>
    </Link>
  );
}
