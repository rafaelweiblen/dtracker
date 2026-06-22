import { addDaysIso } from "@/lib/weight-seven-day-chart";
import { rateAtProjectedDay } from "./projection";
import type { GoalEstimate, ProjectionPoint } from "./types";

export function isGoalIncompatible(
  targetKg: number,
  currentSma: number,
  deltaWeekKg: number
): boolean {
  if (targetKg < currentSma && deltaWeekKg >= 0) return true;
  if (targetKg > currentSma && deltaWeekKg <= 0) return true;
  return false;
}

function hybridWindowDays(horizonDays: number): number {
  return Math.min(14, Math.max(3, Math.round(horizonDays * 0.1)));
}

function formatDatePt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

export { formatDatePt as formatGoalDatePt };

/** Primeiro cruzamento linear entre pontos adjacentes da projeção. */
export function findGoalCrossingCentralDate(
  projection: ProjectionPoint[],
  targetKg: number,
  anchor: string,
  anchorSma: number
): string | null {
  let prevDate = anchor;
  let prevWeight = anchorSma;
  for (const point of projection) {
    const w0 = prevWeight;
    const w1 = point.weight;
    const crosses =
      (w0 - targetKg) * (w1 - targetKg) <= 0 && w0 !== w1;
    if (crosses) {
      const t = (targetKg - w0) / (w1 - w0);
      const [y0, m0, d0] = prevDate.split("-").map(Number);
      const [y1, m1, d1] = point.date.split("-").map(Number);
      const day0 = Date.UTC(y0, m0 - 1, d0);
      const day1 = Date.UTC(y1, m1 - 1, d1);
      const centralMs = day0 + t * (day1 - day0);
      const dt = new Date(centralMs);
      return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
    }
    prevDate = point.date;
    prevWeight = w1;
  }
  return null;
}

export function buildGoalEstimate(
  centralDate: string,
  horizonDays: number,
  beyondHorizon = false
): GoalEstimate {
  const w = hybridWindowDays(horizonDays);
  return {
    centralDate,
    intervalStart: addDaysIso(centralDate, -w),
    intervalEnd: addDaysIso(centralDate, w),
    windowDays: w,
    beyondHorizon: beyondHorizon || undefined,
  };
}

function interpolateCrossingDate(
  prevDate: string,
  prevWeight: number,
  nextDate: string,
  nextWeight: number,
  targetKg: number
): string {
  const t = (targetKg - prevWeight) / (nextWeight - prevWeight);
  const [y0, m0, d0] = prevDate.split("-").map(Number);
  const [y1, m1, d1] = nextDate.split("-").map(Number);
  const day0 = Date.UTC(y0, m0 - 1, d0);
  const day1 = Date.UTC(y1, m1 - 1, d1);
  const centralMs = day0 + t * (day1 - day0);
  const dt = new Date(centralMs);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

/** Continua a projeção com decay além de horizonDays até cruzar a meta. */
export function extrapolateGoalCrossingBeyondHorizon(input: {
  targetKg: number;
  anchor: string;
  anchorSma: number;
  deltaWeekKg: number;
  horizonDays: number;
  projection: ProjectionPoint[];
}): string | null {
  const { targetKg, anchor, anchorSma, deltaWeekKg, horizonDays, projection } =
    input;
  const initialRateKgPerDay = deltaWeekKg / 7;
  if (initialRateKgPerDay === 0) return null;

  let prevDate = projection.length > 0 ? projection[projection.length - 1]!.date : anchor;
  let prevWeight =
    projection.length > 0 ? projection[projection.length - 1]!.weight : anchorSma;
  let k = projection.length > 0 ? projection.length : 0;

  const maxExtraDays = 730;
  for (let extra = 1; extra <= maxExtraDays; extra++) {
    k += 1;
    const rate = rateAtProjectedDay(initialRateKgPerDay, k);
    const nextWeight = prevWeight + rate;
    const nextDate = addDaysIso(prevDate, 1);
    const crosses =
      (prevWeight - targetKg) * (nextWeight - targetKg) <= 0 && prevWeight !== nextWeight;
    if (crosses) {
      return interpolateCrossingDate(
        prevDate,
        prevWeight,
        nextDate,
        nextWeight,
        targetKg
      );
    }
    prevDate = nextDate;
    prevWeight = nextWeight;
  }

  return null;
}

export function computeGoalEstimate(input: {
  targetKg: number;
  anchor: string;
  anchorSma: number;
  deltaWeekKg: number;
  projection: ProjectionPoint[];
  horizonDays: number;
}): { estimate: GoalEstimate | null; incompatible: boolean } {
  const { targetKg, anchor, anchorSma, deltaWeekKg, projection, horizonDays } =
    input;

  if (isGoalIncompatible(targetKg, anchorSma, deltaWeekKg)) {
    return { estimate: null, incompatible: true };
  }

  const central = findGoalCrossingCentralDate(
    projection,
    targetKg,
    anchor,
    anchorSma
  );
  if (central) {
    return {
      estimate: buildGoalEstimate(central, horizonDays),
      incompatible: false,
    };
  }

  const extrapolated = extrapolateGoalCrossingBeyondHorizon({
    targetKg,
    anchor,
    anchorSma,
    deltaWeekKg,
    horizonDays,
    projection,
  });
  if (extrapolated) {
    return {
      estimate: buildGoalEstimate(extrapolated, horizonDays, true),
      incompatible: false,
    };
  }

  return { estimate: null, incompatible: false };
}
