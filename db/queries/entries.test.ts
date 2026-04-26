import { describe, it, expect } from "vitest";
import { computeMonthSummary, computeStreaks, computeStreakHistory, computeEscapeFreeHistory } from "./entries";

// helpers
const row = (date: string, type: "escape" | "exercise") => ({ date, type });

describe("computeMonthSummary", () => {
  it("groups counts by date and type", () => {
    const result = computeMonthSummary([
      row("2025-04-01", "escape"),
      row("2025-04-01", "escape"),
      row("2025-04-01", "exercise"),
      row("2025-04-02", "exercise"),
    ]);
    expect(result["2025-04-01"]).toEqual({ escapeCount: 2, exerciseCount: 1 });
    expect(result["2025-04-02"]).toEqual({ escapeCount: 0, exerciseCount: 1 });
  });

  it("returns empty object for no rows", () => {
    expect(computeMonthSummary([])).toEqual({});
  });
});

describe("computeStreaks", () => {
  it("streak is 0 when no exercise today or yesterday", () => {
    const today = "2025-04-20";
    const rows = [row("2025-04-18", "exercise")];
    expect(computeStreaks(rows, today).exerciseStreak).toBe(0);
  });

  it("streak is 1 when only today has exercise", () => {
    const today = "2025-04-20";
    const rows = [row("2025-04-20", "exercise")];
    expect(computeStreaks(rows, today).exerciseStreak).toBe(1);
  });

  it("streak starts from yesterday when today has no exercise", () => {
    const today = "2025-04-20";
    const rows = [
      row("2025-04-19", "exercise"),
      row("2025-04-18", "exercise"),
    ];
    expect(computeStreaks(rows, today).exerciseStreak).toBe(2);
  });

  it("counts consecutive days correctly", () => {
    const today = "2025-04-20";
    const rows = [
      row("2025-04-20", "exercise"),
      row("2025-04-19", "exercise"),
      row("2025-04-18", "exercise"),
      row("2025-04-16", "exercise"), // gap — breaks streak
    ];
    expect(computeStreaks(rows, today).exerciseStreak).toBe(3);
  });

  it("daysSinceEscape is null when no escapes", () => {
    const today = "2025-04-20";
    expect(computeStreaks([], today).daysSinceEscape).toBeNull();
  });

  it("daysSinceEscape returns correct count", () => {
    const today = "2025-04-20";
    const rows = [row("2025-04-17", "escape")];
    expect(computeStreaks(rows, today).daysSinceEscape).toBe(3);
  });

  it("daysSinceEscape is 0 when escape was today", () => {
    const today = "2025-04-20";
    const rows = [row("2025-04-20", "escape")];
    expect(computeStreaks(rows, today).daysSinceEscape).toBe(0);
  });
});

describe("computeStreakHistory", () => {
  const today = "2025-04-20";

  it("returns empty array when no exercise entries", () => {
    expect(computeStreakHistory([], today)).toEqual([]);
  });

  it("returns single run when all days are consecutive", () => {
    const rows = [
      row("2025-04-18", "exercise"),
      row("2025-04-19", "exercise"),
      row("2025-04-20", "exercise"),
    ];
    const result = computeStreakHistory(rows, today);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ startDate: "2025-04-18", endDate: "2025-04-20", length: 3 });
  });

  it("splits into separate runs on gaps", () => {
    // streaks: 3, 2, 1 — should return top 3 sorted desc
    const rows = [
      row("2025-04-01", "exercise"),
      row("2025-04-02", "exercise"),
      row("2025-04-03", "exercise"), // run of 3
      row("2025-04-10", "exercise"),
      row("2025-04-11", "exercise"), // run of 2
      row("2025-04-15", "exercise"), // run of 1
    ];
    const result = computeStreakHistory(rows, today);
    expect(result[0].length).toBe(3);
    expect(result[1].length).toBe(2);
    expect(result[2].length).toBe(1);
  });

  it("returns top 3 when more than 3 runs exist", () => {
    // AC2: streaks 10, 6, 1, 4 → top 3 = 10, 6, 4
    const makeRun = (start: string, days: number) =>
      Array.from({ length: days }, (_, i) => {
        const d = new Date(`${start}T12:00:00Z`);
        d.setUTCDate(d.getUTCDate() + i);
        return row(d.toISOString().slice(0, 10), "exercise" as const);
      });

    const rows = [
      ...makeRun("2025-01-01", 10), // 10 days
      ...makeRun("2025-02-15", 6),  // 6 days
      ...makeRun("2025-03-10", 1),  // 1 day
      ...makeRun("2025-04-05", 4),  // 4 days
    ];
    const result = computeStreakHistory(rows, today);
    expect(result).toHaveLength(3);
    expect(result[0].length).toBe(10);
    expect(result[1].length).toBe(6);
    expect(result[2].length).toBe(4);
  });

  it("ignores escape entries", () => {
    const rows = [
      row("2025-04-18", "exercise"),
      row("2025-04-19", "escape"), // gap due to escape (not exercise)
      row("2025-04-20", "exercise"),
    ];
    const result = computeStreakHistory(rows, today);
    expect(result).toHaveLength(2);
    expect(result[0].length).toBe(1);
    expect(result[1].length).toBe(1);
  });
});

describe("computeEscapeFreeHistory", () => {
  const today = "2025-04-20";

  it("returns empty array when no entries at all", () => {
    expect(computeEscapeFreeHistory([], today)).toEqual([]);
  });

  it("returns single run from first entry to today when no escapes", () => {
    const rows = [
      row("2025-04-10", "exercise"),
      row("2025-04-15", "exercise"),
    ];
    const result = computeEscapeFreeHistory(rows, today);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ startDate: "2025-04-10", endDate: "2025-04-20", length: 11 });
  });

  it("gap between two escapes forms an escape-free run", () => {
    // escape Apr 1, exercise Apr 3-5, escape Apr 8
    // escape-free: Apr 2–7 = 6 days
    const rows = [
      row("2025-04-01", "escape"),
      row("2025-04-03", "exercise"),
      row("2025-04-08", "escape"),
    ];
    const result = computeEscapeFreeHistory(rows, today);
    const gap = result.find((r) => r.startDate === "2025-04-02");
    expect(gap).toBeDefined();
    expect(gap!.length).toBe(6);
  });

  it("current period after last escape is included", () => {
    // last escape Apr 10, today Apr 20 → 10 days escape-free
    const rows = [row("2025-04-10", "escape")];
    const result = computeEscapeFreeHistory(rows, today);
    const current = result.find((r) => r.endDate === today);
    expect(current).toBeDefined();
    expect(current!.length).toBe(10);
  });

  it("period before first escape is included when first entry predates it", () => {
    // first entry (exercise) Apr 1, first escape Apr 6 → 5 pre-escape days
    const rows = [
      row("2025-04-01", "exercise"),
      row("2025-04-06", "escape"),
    ];
    const result = computeEscapeFreeHistory(rows, today);
    const pre = result.find((r) => r.startDate === "2025-04-01");
    expect(pre).toBeDefined();
    expect(pre!.length).toBe(5);
    expect(pre!.endDate).toBe("2025-04-05");
  });

  it("returns top 3 when more than 3 runs exist", () => {
    // escapes on Jan 1, Feb 1, Mar 1, Apr 1
    // gaps: Jan2–Jan31=30, Feb2–Feb28=27, Mar2–Mar31=29, Apr2–today=19
    const rows = [
      row("2025-01-01", "escape"),
      row("2025-02-01", "escape"),
      row("2025-03-01", "escape"),
      row("2025-04-01", "escape"),
    ];
    const result = computeEscapeFreeHistory(rows, today);
    expect(result).toHaveLength(3);
    expect(result[0].length).toBe(30); // Jan 2–31 (30 dias)
    expect(result[1].length).toBe(30); // Mar 2–31 (30 dias)
    expect(result[2].length).toBe(27); // Feb 2–28 (27 dias)
  });

  it("skips gap of 0 when two escapes are on consecutive days", () => {
    const rows = [
      row("2025-04-10", "escape"),
      row("2025-04-11", "escape"),
    ];
    const result = computeEscapeFreeHistory(rows, today);
    // no gap between Apr10 and Apr11; only current period Apr12–Apr20 = 9 days
    const betweenGap = result.find(
      (r) => r.startDate === "2025-04-11" || r.startDate === "2025-04-10"
    );
    expect(betweenGap).toBeUndefined();
    const current = result.find((r) => r.endDate === today);
    expect(current!.length).toBe(9);
  });
});
