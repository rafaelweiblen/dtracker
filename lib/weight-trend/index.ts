import {
  addDaysIso,
  buildSevenDayDates,
} from "@/lib/weight-seven-day-chart";
import { computeHorizonDays, isEligibleForProjection } from "./eligibility";
import { computeGoalEstimate } from "./goal-crossing";
import { isTrendPaused } from "./gaps";
import { normalizeWeights } from "./normalize";
import {
  buildProjectionPoints,
  hasPlateauWarning,
} from "./projection";
import {
  buildSma7Series,
  resolveAnchorDay,
  sma7AtDay,
  weeklyDeltaKg,
} from "./sma7";
import type { TrendState, WeightTrendBundle } from "./types";

export interface ComputeWeightTrendOptions {
  today: string;
  weights: Record<string, unknown>;
  goalTargetKg?: number | null;
}

export function computeWeightTrendBundle(
  options: ComputeWeightTrendOptions
): WeightTrendBundle {
  const weights = normalizeWeights(options.weights);
  const today = options.today;
  const anchor = resolveAnchorDay(weights, today);
  const historyStart = addDaysIso(today, -89);
  const visibleDates = buildSevenDayDates(today);

  const fullSma = buildSma7Series(weights, historyStart, today);
  const smaByDate: Record<string, number | null> = {};
  for (const d of visibleDates) {
    smaByDate[d] = fullSma[d] ?? null;
  }

  const gapPaused = isTrendPaused(weights, anchor);
  const deltaWeekKg = weeklyDeltaKg(weights, anchor);
  const anchorSma = sma7AtDay(weights, anchor);

  let trendState: TrendState;
  if (gapPaused) {
    trendState = "paused";
  } else if (deltaWeekKg == null || anchorSma == null) {
    trendState = "insufficient";
  } else {
    trendState = "ok";
  }

  const eligibleForProjection = isEligibleForProjection(weights, anchor);
  const horizonDays = computeHorizonDays(weights, anchor);

  let projectionPoints: WeightTrendBundle["projectionPoints"] = [];
  let plateauWarning = false;
  let goalEstimate: WeightTrendBundle["goalEstimate"] = null;
  let goalIncompatible = false;

  if (
    eligibleForProjection &&
    anchorSma != null &&
    deltaWeekKg != null
  ) {
    const initialRate = deltaWeekKg / 7;
    projectionPoints = buildProjectionPoints({
      anchor,
      anchorSma,
      initialRateKgPerDay: initialRate,
      horizonDays,
    });
    plateauWarning = hasPlateauWarning(initialRate);

    if (
      options.goalTargetKg != null &&
      options.goalTargetKg >= 40 &&
      options.goalTargetKg <= 120
    ) {
      const goal = computeGoalEstimate({
        targetKg: options.goalTargetKg,
        anchor,
        anchorSma,
        deltaWeekKg,
        projection: projectionPoints,
        horizonDays,
      });
      goalEstimate = goal.estimate;
      goalIncompatible = goal.incompatible;
    }
  }

  return {
    anchor,
    trendState,
    deltaWeekKg,
    smaByDate,
    gapPaused,
    eligibleForProjection,
    horizonDays,
    projectionPoints,
    goalEstimate,
    goalIncompatible,
    plateauWarning,
  };
}

export { shouldBreakSmaSegment } from "./gaps";
