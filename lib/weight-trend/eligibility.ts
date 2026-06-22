import { addDaysIso } from "@/lib/weight-seven-day-chart";
import { countDaysWithWeight, isTrendPaused } from "./gaps";

export const PROJECTION_MIN_DAYS_IN_WINDOW = 21;

export function isEligibleForProjection(
  weights: Record<string, number>,
  anchor: string
): boolean {
  if (isTrendPaused(weights, anchor)) return false;
  const windowStart = addDaysIso(anchor, -89);
  return (
    countDaysWithWeight(weights, windowStart, anchor) >=
    PROJECTION_MIN_DAYS_IN_WINDOW
  );
}

export function computeHorizonDays(
  weights: Record<string, number>,
  anchor: string
): number {
  const windowStart = addDaysIso(anchor, -89);
  return Math.min(countDaysWithWeight(weights, windowStart, anchor), 90);
}
