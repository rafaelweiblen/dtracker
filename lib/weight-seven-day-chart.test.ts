import { describe, it, expect } from "vitest";
import {
  addDaysIso,
  buildSevenDayDates,
  weightToSvgY,
  buildChartPoints,
  polylinePointsString,
  CHART_MAX_KG,
} from "@/lib/weight-seven-day-chart";

describe("addDaysIso", () => {
  it("retrocede 6 dias respeitando mudança de mês", () => {
    expect(addDaysIso("2026-05-07", -6)).toBe("2026-05-01");
  });

  it("avança para o mês seguinte", () => {
    expect(addDaysIso("2026-05-31", 1)).toBe("2026-06-01");
  });
});

describe("buildSevenDayDates", () => {
  it("coloca hoje na última posição", () => {
    const dates = buildSevenDayDates("2026-05-07");
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe("2026-05-01");
    expect(dates[6]).toBe("2026-05-07");
  });
});

describe("weightToSvgY", () => {
  const top = 0;
  const bottom = 112;

  it("0 kg na base (maior Y)", () => {
    expect(weightToSvgY(0, top, bottom)).toBe(112);
  });

  it("112 kg no topo (menor Y)", () => {
    expect(weightToSvgY(112, top, bottom)).toBe(0);
  });

  it("clamp valores acima de 112 ao topo", () => {
    expect(weightToSvgY(130, top, bottom)).toBe(0);
  });
});

describe("buildChartPoints & polyline", () => {
  const dates = buildSevenDayDates("2026-05-07");
  const plotLeft = 0;
  const plotW = 60;
  const plotTop = 0;
  const plotBottom = 112;

  it("ignora dias sem peso ou peso inválido", () => {
    const pts = buildChartPoints(
      dates,
      {
        "2026-05-01": 80,
        "2026-05-03": 0,
      },
      plotLeft,
      plotW,
      plotTop,
      plotBottom
    );
    expect(pts).toHaveLength(1);
    expect(pts[0].date).toBe("2026-05-01");
  });

  it("ordena por data para a polilinha", () => {
    const pts = buildChartPoints(
      dates,
      { "2026-05-07": 70, "2026-05-01": 80 },
      plotLeft,
      plotW,
      plotTop,
      plotBottom
    );
    expect(pts.map((p) => p.date)).toEqual(["2026-05-01", "2026-05-07"]);
  });

  it("gera string de polilinha só quando há pontos", () => {
    const pts = buildChartPoints(
      dates,
      { "2026-05-01": 80, "2026-05-07": 70 },
      plotLeft,
      plotW,
      plotTop,
      plotBottom
    );
    expect(polylinePointsString(pts)).toMatch(/^\d+(\.\d+)?,\d+(\.\d+)? \d+(\.\d+)?,\d+(\.\d+)?$/);
  });
});

describe("CHART_MAX_KG", () => {
  it("domínio fixo da spec", () => {
    expect(CHART_MAX_KG).toBe(112);
  });
});
