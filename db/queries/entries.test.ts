import { describe, it, expect } from "vitest";
import { computeMonthSummary, computeStreaks } from "./entries";

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
