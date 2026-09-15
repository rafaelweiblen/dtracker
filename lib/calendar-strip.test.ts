import { describe, it, expect } from "vitest";
import { addDaysIso } from "@/lib/weight-seven-day-chart";
import { computeCalendarStrip } from "./calendar-strip";

function sevenDaysOf(today: string, kg: number): Record<string, number> {
  const weights: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    weights[addDaysIso(today, -6 + i)] = kg;
  }
  return weights;
}

describe("computeCalendarStrip", () => {
  it("mostra a SMA-7 em kg com rótulo Média 7 dias", () => {
    const today = "2026-09-15";
    const result = computeCalendarStrip({
      today,
      weights: sevenDaysOf(today, 73.2),
    });
    expect(result.sma7).toBe("73,2 kg - Média 7 dias");
  });

  it("mostra Sem dados quando a SMA-7 não é calculável", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
    });
    expect(result.sma7).toBe("Sem dados - Média 7 dias");
  });

  it("usa o âncora de ontem quando hoje não tem peso", () => {
    const today = "2026-09-15";
    const yesterday = addDaysIso(today, -1);
    const result = computeCalendarStrip({
      today,
      weights: sevenDaysOf(yesterday, 73.2),
    });
    expect(result.sma7).toBe("73,2 kg - Média 7 dias");
  });
});
