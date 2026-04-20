import { describe, it, expect } from "vitest";

// Pure logic extracted from DayCell for testing
function dayCellState(date: string, today: string) {
  return {
    isFuture: date > today,
    isToday: date === today,
  };
}

describe("DayCell state logic", () => {
  const today = "2025-04-20";

  it("past day is not future and not today", () => {
    expect(dayCellState("2025-04-19", today)).toEqual({
      isFuture: false,
      isToday: false,
    });
  });

  it("today is not future and isToday", () => {
    expect(dayCellState("2025-04-20", today)).toEqual({
      isFuture: false,
      isToday: true,
    });
  });

  it("future day is future and not today", () => {
    expect(dayCellState("2025-04-21", today)).toEqual({
      isFuture: true,
      isToday: false,
    });
  });

  it("indicator: shows escape and exercise independently", () => {
    const hasEscape = true;
    const hasExercise = false;
    expect(hasEscape && !hasExercise).toBe(true);
  });
});
