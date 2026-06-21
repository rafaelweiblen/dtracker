import { addDaysIso } from "@/lib/weight-seven-day-chart";
import type { ProjectionPoint } from "./types";

export function rateAtProjectedDay(
  initialRateKgPerDay: number,
  projectedDay: number
): number {
  const blocks = Math.floor((projectedDay - 1) / 30);
  return initialRateKgPerDay * Math.pow(0.95, blocks);
}

export function buildProjectionPoints(input: {
  anchor: string;
  anchorSma: number;
  initialRateKgPerDay: number;
  horizonDays: number;
}): ProjectionPoint[] {
  const { anchor, anchorSma, initialRateKgPerDay, horizonDays } = input;
  if (horizonDays <= 0 || initialRateKgPerDay === 0) return [];

  const points: ProjectionPoint[] = [];
  let weight = anchorSma;
  for (let k = 1; k <= horizonDays; k++) {
    const rate = rateAtProjectedDay(initialRateKgPerDay, k);
    weight += rate;
    points.push({
      date: addDaysIso(anchor, k),
      weight,
    });
  }
  return points;
}

export function hasPlateauWarning(initialRateKgPerDay: number): boolean {
  const rateAt30 = rateAtProjectedDay(initialRateKgPerDay, 30);
  return Math.abs(rateAt30) < 0.8 * Math.abs(initialRateKgPerDay);
}
