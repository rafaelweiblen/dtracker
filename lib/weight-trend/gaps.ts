import { addDaysIso } from "@/lib/weight-seven-day-chart";

export function eachDayInclusive(start: string, end: string): string[] {
  const days: string[] = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDaysIso(d, 1);
  }
  return days;
}

export function maxConsecutiveMissing(
  weights: Record<string, number>,
  start: string,
  end: string
): number {
  let max = 0;
  let streak = 0;
  for (const day of eachDayInclusive(start, end)) {
    if (weights[day] == null) {
      streak += 1;
      max = Math.max(max, streak);
    } else {
      streak = 0;
    }
  }
  return max;
}

/** RN-GAP: ≥4 dias consecutivos sem peso na janela. */
export function hasGapPauseInWindow(
  weights: Record<string, number>,
  start: string,
  end: string
): boolean {
  return maxConsecutiveMissing(weights, start, end) >= 4;
}

/** Buraco ≥4 dias cujo último dia sem peso cai em [rangeStart, rangeEnd]. */
export function hasGapEndingInRange(
  weights: Record<string, number>,
  scanStart: string,
  scanEnd: string,
  rangeStart: string,
  rangeEnd: string,
  minGap: number
): boolean {
  let streak = 0;
  for (const day of eachDayInclusive(scanStart, scanEnd)) {
    if (weights[day] == null) {
      streak += 1;
    } else {
      if (streak >= minGap) {
        const gapEnd = addDaysIso(day, -1);
        if (gapEnd >= rangeStart && gapEnd <= rangeEnd) return true;
      }
      streak = 0;
    }
  }
  if (streak >= minGap && scanEnd >= rangeStart && scanEnd <= rangeEnd) {
    return true;
  }
  return false;
}

export function countDaysWithWeight(
  weights: Record<string, number>,
  start: string,
  end: string
): number {
  return eachDayInclusive(start, end).filter((d) => weights[d] != null).length;
}

/** RN-RESUME / RN-GAP combinados relativamente ao anchor. */
export function isTrendPaused(
  weights: Record<string, number>,
  anchor: string
): boolean {
  const windowStart = addDaysIso(anchor, -89);
  if (!hasGapPauseInWindow(weights, windowStart, anchor)) return false;

  const daysWithWeight = countDaysWithWeight(weights, windowStart, anchor);
  if (daysWithWeight < 21) return true;

  const recentStart = addDaysIso(anchor, -3);
  if (
    hasGapEndingInRange(
      weights,
      windowStart,
      anchor,
      recentStart,
      anchor,
      4
    )
  ) {
    return true;
  }

  return false;
}

/** Quebra polilinha SMA se ≥4 dias consecutivos sem peso entre duas datas SMA. */
export function shouldBreakSmaSegment(
  weights: Record<string, number>,
  dateA: string,
  dateB: string
): boolean {
  let streak = 0;
  let d = addDaysIso(dateA, 1);
  while (d <= dateB) {
    if (weights[d] == null) {
      streak += 1;
      if (streak >= 4) return true;
    } else {
      streak = 0;
    }
    d = addDaysIso(d, 1);
  }
  return false;
}
