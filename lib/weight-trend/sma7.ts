import { addDaysIso } from "@/lib/weight-seven-day-chart";

export function resolveAnchorDay(
  weights: Record<string, number>,
  today: string
): string {
  return weights[today] != null ? today : addDaysIso(today, -1);
}

/** SMA-7 em D: média de D-6…D se os 7 dias têm peso. */
export function sma7AtDay(
  weights: Record<string, number>,
  day: string
): number | null {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDaysIso(day, -6 + i);
    const w = weights[d];
    if (w == null) return null;
    sum += w;
  }
  return sum / 7;
}

export function buildSma7Series(
  weights: Record<string, number>,
  start: string,
  end: string
): Record<string, number | null> {
  const series: Record<string, number | null> = {};
  let d = start;
  while (d <= end) {
    series[d] = sma7AtDay(weights, d);
    d = addDaysIso(d, 1);
  }
  return series;
}

export function weeklyDeltaKg(
  weights: Record<string, number>,
  anchor: string
): number | null {
  const current = sma7AtDay(weights, anchor);
  const previous = sma7AtDay(weights, addDaysIso(anchor, -7));
  if (current == null || previous == null) return null;
  return current - previous;
}
