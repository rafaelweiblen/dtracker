import { TrendingDown, TrendingUp, PauseCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeightTrendBundle } from "@/lib/weight-trend/types";
import { formatGoalDatePt } from "@/lib/weight-trend/goal-crossing";

interface WeightTrendStatusCardProps {
  bundle: Pick<
    WeightTrendBundle,
    | "trendState"
    | "deltaWeekKg"
    | "gapPaused"
    | "eligibleForProjection"
    | "goalEstimate"
    | "goalIncompatible"
    | "plateauWarning"
    | "insufficientReason"
    | "horizonDays"
  >;
  goalTargetKg?: number | null;
}

function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg/semana`;
}

export function WeightTrendStatusCard({
  bundle,
  goalTargetKg,
}: WeightTrendStatusCardProps) {
  const {
    trendState,
    deltaWeekKg,
    gapPaused,
    eligibleForProjection,
    goalEstimate,
    goalIncompatible,
    plateauWarning,
    insufficientReason,
    horizonDays,
  } = bundle;

  const showProjectionNote = goalEstimate != null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/90 bg-card px-3.5 py-3 shadow-sm shadow-black/[0.03]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Tendência (SMA-7)</p>
          {trendState === "ok" && deltaWeekKg != null ? (
            <div
              className={cn(
                "mt-1 flex items-center gap-1.5 text-sm font-semibold tabular-nums",
                deltaWeekKg > 0 ? "text-destructive" : "text-primary"
              )}
            >
              {deltaWeekKg > 0 ? (
                <TrendingUp size={16} aria-hidden />
              ) : (
                <TrendingDown size={16} aria-hidden />
              )}
              <span>{formatDelta(deltaWeekKg)}</span>
            </div>
          ) : trendState === "paused" || gapPaused ? (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <PauseCircle size={16} aria-hidden />
              <span>Tendência em pausa — registe peso nos próximos dias</span>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <AlertCircle size={16} aria-hidden />
              <span>
                {insufficientReason?.message ??
                  "Dados insuficientes para calcular a tendência."}
              </span>
            </div>
          )}
        </div>
      </div>

      {goalTargetKg != null && goalTargetKg >= 40 && goalTargetKg <= 120 ? (
        <div className="border-t border-border/60 pt-2 text-xs text-muted-foreground">
          <p>
            Meta:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {goalTargetKg.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg
            </span>
          </p>
          {goalIncompatible ? (
            <p className="mt-1">A tendência actual não aponta para esta meta.</p>
          ) : goalEstimate ? (
            <>
              <p className="mt-1">
                {goalEstimate.beyondHorizon ? (
                  <>
                    Estimativa (fora do horizonte de {horizonDays} dias): entre{" "}
                  </>
                ) : (
                  <>Estimativa: entre </>
                )}
                <span className="font-medium text-foreground">
                  {formatGoalDatePt(goalEstimate.intervalStart)}
                </span>{" "}
                e{" "}
                <span className="font-medium text-foreground">
                  {formatGoalDatePt(goalEstimate.intervalEnd)}
                </span>
                ; centro em{" "}
                <span className="font-medium text-foreground">
                  {formatGoalDatePt(goalEstimate.centralDate)}
                </span>
              </p>
              {goalEstimate.beyondHorizon ? (
                <p className="mt-1">
                  A tendência actual não atinge a meta nos {horizonDays} dias do modelo; a
                  continuação projectada sugere o intervalo acima.
                </p>
              ) : null}
            </>
          ) : !eligibleForProjection ? (
            <p className="mt-1">
              Projeção disponível após 21 dias com peso nos últimos 90 dias.
            </p>
          ) : trendState !== "ok" ? (
            <p className="mt-1">
              Projeção disponível quando a tendência semanal estiver calculada (14 dias
              consecutivos com peso).
            </p>
          ) : (
            <p className="mt-1">
              A projeção não cruza a meta com a tendência actual.
            </p>
          )}
          {showProjectionNote ? (
            <p className="mt-1">
              A projeção não aparece no gráfico de 7 dias; ver estimativa acima.
            </p>
          ) : null}
          {plateauWarning ? (
            <p className="mt-1 text-amber-600 dark:text-amber-500">
              A taxa projectada abrandou — a meta pode demorar mais do que a estimativa inicial.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
