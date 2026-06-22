import { describe, it, expect } from "vitest";
import { addDaysIso } from "@/lib/weight-seven-day-chart";
import { normalizeWeights } from "./normalize";
import {
  isTrendPaused,
  maxConsecutiveMissing,
  shouldBreakSmaSegment,
} from "./gaps";
import { resolveAnchorDay, sma7AtDay, weeklyDeltaKg } from "./sma7";
import { rateAtProjectedDay, buildProjectionPoints } from "./projection";
import {
  isGoalIncompatible,
  buildGoalEstimate,
  computeGoalEstimate,
  extrapolateGoalCrossingBeyondHorizon,
} from "./goal-crossing";
import {
  consecutiveDaysEndingAt,
  describeInsufficientTrend,
} from "./trend-readiness";
import { computeWeightTrendBundle } from "./index";

function fillDailyWeights(start: string, count: number, baseKg: number): Record<string, number> {
  const w: Record<string, number> = {};
  for (let i = 0; i < count; i++) {
    w[addDaysIso(start, i)] = baseKg - i * 0.05;
  }
  return w;
}

describe("normalizeWeights", () => {
  it("ignora valores inválidos", () => {
    expect(normalizeWeights({ "2026-01-01": 80, "2026-01-02": "x" })).toEqual({
      "2026-01-01": 80,
    });
  });
});

describe("sma7", () => {
  it("calcula SMA quando 7 dias consecutivos têm peso", () => {
    const start = "2026-05-01";
    const weights: Record<string, number> = {};
    for (let i = 0; i < 7; i++) weights[addDaysIso(start, i)] = 70 + i;
    expect(sma7AtDay(weights, "2026-05-07")).toBeCloseTo(73, 5);
  });

  it("anchor é hoje com peso, senão ontem", () => {
    expect(resolveAnchorDay({ "2026-05-07": 80 }, "2026-05-07")).toBe("2026-05-07");
    expect(resolveAnchorDay({}, "2026-05-07")).toBe("2026-05-06");
  });

  it("delta semanal entre SMA anchor e anchor-7", () => {
    const weights: Record<string, number> = {};
    for (let i = 0; i < 15; i++) {
      weights[addDaysIso("2026-05-01", i)] = 80 - i * 0.1;
    }
    const anchor = "2026-05-15";
    const delta = weeklyDeltaKg(weights, anchor);
    expect(delta).not.toBeNull();
    expect(delta!).toBeLessThan(0);
  });
});

describe("gaps", () => {
  it("detecta pausa com ≥4 dias consecutivos sem peso", () => {
    const weights = fillDailyWeights("2026-01-01", 10, 80);
    expect(maxConsecutiveMissing(weights, "2026-01-01", "2026-01-10")).toBe(0);
    const sparse = { ...weights };
    delete sparse["2026-01-05"];
    delete sparse["2026-01-06"];
    delete sparse["2026-01-07"];
    delete sparse["2026-01-08"];
    expect(isTrendPaused(sparse, "2026-01-10")).toBe(true);
  });

  it("quebra segmento SMA através de buraco ≥4 dias", () => {
    const w: Record<string, number> = {
      "2026-01-01": 80,
      "2026-01-06": 79,
    };
    expect(shouldBreakSmaSegment(w, "2026-01-01", "2026-01-06")).toBe(true);
  });
});

describe("projection", () => {
  it("aplica decay a cada 30 dias projectados", () => {
    expect(rateAtProjectedDay(-0.7, 1)).toBeCloseTo(-0.7);
    expect(rateAtProjectedDay(-0.7, 31)).toBeCloseTo(-0.665);
  });

  it("gera pontos até horizon", () => {
    const pts = buildProjectionPoints({
      anchor: "2026-05-01",
      anchorSma: 80,
      initialRateKgPerDay: -0.1,
      horizonDays: 3,
    });
    expect(pts).toHaveLength(3);
    expect(pts[2]!.weight).toBeCloseTo(79.7, 5);
  });
});

describe("goal-crossing", () => {
  it("marca meta incompatível com tendência", () => {
    expect(isGoalIncompatible(75, 80, 0.2)).toBe(true);
    expect(isGoalIncompatible(85, 80, -0.2)).toBe(true);
    expect(isGoalIncompatible(75, 80, -0.2)).toBe(false);
  });

  it("intervalo híbrido ±W dias", () => {
    const est = buildGoalEstimate("2026-08-01", 50);
    expect(est.windowDays).toBe(5);
    expect(est.intervalStart).toBe("2026-07-27");
    expect(est.intervalEnd).toBe("2026-08-06");
  });

  it("estima cruzamento quando projeção cruza meta", () => {
    const projection = buildProjectionPoints({
      anchor: "2026-05-01",
      anchorSma: 80,
      initialRateKgPerDay: -0.1,
      horizonDays: 60,
    });
    const { estimate, incompatible } = computeGoalEstimate({
      targetKg: 75,
      anchor: "2026-05-01",
      anchorSma: 80,
      deltaWeekKg: -0.7,
      projection,
      horizonDays: 60,
    });
    expect(incompatible).toBe(false);
    expect(estimate).not.toBeNull();
  });

  it("extrapola meta além do horizonte do modelo", () => {
    const projection = buildProjectionPoints({
      anchor: "2026-05-01",
      anchorSma: 80,
      initialRateKgPerDay: -0.05,
      horizonDays: 10,
    });
    const { estimate } = computeGoalEstimate({
      targetKg: 75,
      anchor: "2026-05-01",
      anchorSma: 80,
      deltaWeekKg: -0.35,
      projection,
      horizonDays: 10,
    });
    expect(estimate).not.toBeNull();
    expect(estimate!.beyondHorizon).toBe(true);
    expect(
      extrapolateGoalCrossingBeyondHorizon({
        targetKg: 75,
        anchor: "2026-05-01",
        anchorSma: 80,
        deltaWeekKg: -0.35,
        horizonDays: 10,
        projection,
      })
    ).not.toBeNull();
  });
});

describe("trend-readiness", () => {
  it("conta dias consecutivos terminando no anchor", () => {
    const weights: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      weights[addDaysIso("2026-05-01", i)] = 80;
    }
    expect(consecutiveDaysEndingAt(weights, "2026-05-07")).toBe(7);
  });

  it("7 dias consecutivos pedem mais 7 para variação semanal", () => {
    const weights: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      weights[addDaysIso("2026-05-01", i)] = 80;
    }
    const reason = describeInsufficientTrend(weights, "2026-05-07");
    expect(reason.kind).toBe("need_weekly");
    expect(reason.message).toContain("14");
  });

  it("registos espaçados não contam como consecutivos", () => {
    const weights: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      weights[addDaysIso("2026-05-01", i * 2)] = 80;
    }
    const reason = describeInsufficientTrend(weights, "2026-05-13");
    expect(reason.kind).toBe("need_sma");
    expect(reason.consecutiveDays).toBe(1);
  });
});

describe("computeWeightTrendBundle", () => {
  it("estado paused com histórico muito curto (buraco ≥4 dias na janela 90d)", () => {
    const bundle = computeWeightTrendBundle({
      today: "2026-05-07",
      weights: { "2026-05-07": 80 },
    });
    expect(bundle.trendState).toBe("paused");
  });

  it("estado insufficient sem SMA completa no anchor", () => {
    const weights: Record<string, number> = {};
    for (let i = 0; i < 90; i++) {
      weights[addDaysIso("2026-02-07", i)] = 80;
    }
    delete weights["2026-05-07"];
    delete weights["2026-05-06"];
    const bundle = computeWeightTrendBundle({
      today: "2026-05-07",
      weights,
    });
    expect(bundle.trendState).toBe("insufficient");
  });

  it("estado ok com histórico suficiente", () => {
    const weights = fillDailyWeights("2026-04-01", 40, 82);
    const bundle = computeWeightTrendBundle({
      today: "2026-05-10",
      weights,
    });
    expect(bundle.trendState).toBe("ok");
    expect(bundle.deltaWeekKg).not.toBeNull();
  });
});
