export type TrendState = "ok" | "insufficient" | "paused";

export interface GoalEstimate {
  centralDate: string;
  intervalStart: string;
  intervalEnd: string;
  windowDays: number;
  beyondHorizon?: boolean;
}

export interface ProjectionPoint {
  date: string;
  weight: number;
}

import type { InsufficientTrendReason } from "./trend-readiness";

export interface WeightTrendBundle {
  anchor: string;
  trendState: TrendState;
  deltaWeekKg: number | null;
  smaByDate: Record<string, number | null>;
  gapPaused: boolean;
  eligibleForProjection: boolean;
  horizonDays: number;
  projectionPoints: ProjectionPoint[];
  goalEstimate: GoalEstimate | null;
  goalIncompatible: boolean;
  plateauWarning: boolean;
  insufficientReason: InsufficientTrendReason | null;
}
