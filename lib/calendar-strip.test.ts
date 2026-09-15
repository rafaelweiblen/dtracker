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
      exerciseDates: [],
    });
    expect(result.sma7).toBe("73,2 kg - Média 7 dias");
  });

  it("mostra Sem dados quando a SMA-7 não é calculável", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: [],
    });
    expect(result.sma7).toBe("Sem dados - Média 7 dias");
  });

  it("usa o âncora de ontem quando hoje não tem peso", () => {
    const today = "2026-09-15";
    const yesterday = addDaysIso(today, -1);
    const result = computeCalendarStrip({
      today,
      weights: sevenDaysOf(yesterday, 73.2),
      exerciseDates: [],
    });
    expect(result.sma7).toBe("73,2 kg - Média 7 dias");
  });

  it("com primeiro treino em Abril e hoje em Setembro mostra 3 treinos - 6 Meses", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: ["2026-04-02", "2026-06-10", "2026-09-01"],
    });
    expect(result.exercise).toBe("3 treinos - 6 Meses");
  });

  it("com um treino neste mês mostra 1 treino - 1 Mês", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: ["2026-09-08"],
    });
    expect(result.exercise).toBe("1 treino - 1 Mês");
  });

  it("conta dois registos no mesmo dia como dois treinos", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: ["2026-09-08", "2026-09-08"],
    });
    expect(result.exercise).toBe("2 treinos - 1 Mês");
  });

  it("nunca treinou: o lado dos treinos é exactamente Sem dados", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: [],
    });
    expect(result.exercise).toBe("Sem dados");
  });

  it("janela de 12 meses com zero treinos dentro dela mostra 0 treinos - 12 Meses", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: ["2025-03-01"],
    });
    expect(result.exercise).toBe("0 treinos - 12 Meses");
  });

  it("31 Jan até 1 Mar conta 3 Meses ignorando o dia do mês", () => {
    const result = computeCalendarStrip({
      today: "2026-03-01",
      weights: {},
      exerciseDates: ["2026-01-31"],
    });
    expect(result.exercise).toBe("1 treino - 3 Meses");
  });

  it("meses vazios no meio entram no rótulo (Abril até Setembro = 6)", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: ["2026-04-02", "2026-09-01"],
    });
    expect(result.exercise).toBe("2 treinos - 6 Meses");
  });

  it("tecto são 12 meses de calendário inclusivos (Out 2025–Set 2026)", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: ["2025-10-01", "2026-09-01"],
    });
    expect(result.exercise).toBe("2 treinos - 12 Meses");
  });

  it("corta o mesmo dia há um ano e conta só a janela Out–Set", () => {
    const result = computeCalendarStrip({
      today: "2026-09-15",
      weights: {},
      exerciseDates: ["2025-09-15", "2026-09-01"],
    });
    expect(result.exercise).toBe("1 treino - 12 Meses");
  });
});
