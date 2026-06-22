import { addDaysIso } from "@/lib/weight-seven-day-chart";
import { sma7AtDay } from "./sma7";

export const SMA_WINDOW_DAYS = 7;
export const WEEKLY_TREND_DAYS = 14;

export type InsufficientTrendKind = "need_sma" | "need_weekly" | "gap_in_baseline";

export interface InsufficientTrendReason {
  kind: InsufficientTrendKind;
  message: string;
  consecutiveDays: number;
}

/** Dias de calendário consecutivos com peso terminando em `day` (inclusive). */
export function consecutiveDaysEndingAt(
  weights: Record<string, number>,
  day: string
): number {
  let count = 0;
  let d = day;
  while (weights[d] != null) {
    count += 1;
    d = addDaysIso(d, -1);
  }
  return count;
}

export function describeInsufficientTrend(
  weights: Record<string, number>,
  anchor: string
): InsufficientTrendReason {
  const consecutive = consecutiveDaysEndingAt(weights, anchor);

  if (consecutive < SMA_WINDOW_DAYS) {
    const remaining = SMA_WINDOW_DAYS - consecutive;
    return {
      kind: "need_sma",
      message: `Faltam ${remaining} dias consecutivos com peso para a média de 7 dias (${consecutive}/7).`,
      consecutiveDays: consecutive,
    };
  }

  if (consecutive < WEEKLY_TREND_DAYS) {
    const remaining = WEEKLY_TREND_DAYS - consecutive;
    return {
      kind: "need_weekly",
      message: `Média de 7 dias quase pronta — faltam ${remaining} dias consecutivos para calcular a variação semanal (${consecutive}/14).`,
      consecutiveDays: consecutive,
    };
  }

  if (sma7AtDay(weights, addDaysIso(anchor, -7)) == null) {
    return {
      kind: "gap_in_baseline",
      message:
        "Falta peso registado na semana anterior ao período actual para calcular a variação semanal.",
      consecutiveDays: consecutive,
    };
  }

  return {
    kind: "need_sma",
    message: "Dados insuficientes para calcular a tendência.",
    consecutiveDays: consecutive,
  };
}
