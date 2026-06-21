export type TrendState = "ok" | "insufficient" | "paused";

export interface GoalEstimate {
  centralDate: string;
  intervalStart: string;
  intervalEnd: string;
  windowDays: number;
}

export interface ProjectionPoint {
  date: string;
  weight: number;
}

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
}
