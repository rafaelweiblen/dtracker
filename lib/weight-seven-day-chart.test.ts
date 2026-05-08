import { describe, it, expect } from "vitest";
import {
  addDaysIso,
  buildSevenDayDates,
  weightToSvgY,
  buildChartPoints,
  polylinePointsString,
  yAxisTickValuesKg,
  computeChartYDomain,
  Y_AXIS_PADDING_KG,
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

describe("computeChartYDomain", () => {
  const dates = buildSevenDayDates("2026-05-07");

  it("sem dados usa intervalo mínimo de segurança", () => {
    expect(computeChartYDomain(dates, {})).toEqual({
      minKg: 0,
      maxKg: 20,
    });
  });

  it("aplica margem de 10kg para baixo e para cima da média da janela", () => {
    expect(computeChartYDomain(dates, { "2026-05-07": 73 })).toEqual({
      minKg: 63,
      maxKg: 83,
    });
    expect(computeChartYDomain(dates, { "2026-05-07": 80 })).toEqual({
      minKg: 70,
      maxKg: 90,
    });
    expect(
      computeChartYDomain(dates, {
        "2026-05-01": 82.4,
        "2026-05-02": 82.1,
        "2026-05-03": 81.9,
        "2026-05-04": 81.7,
        "2026-05-05": 81.8,
        "2026-05-06": 81.5,
        "2026-05-07": 81.3,
      })
    ).toEqual({
      // média ≈ 81.81 -> eixo em kg inteiros (evita decimais longos no SVG)
      minKg: 71,
      maxKg: 92,
    });
  });

  it("usa os dados disponíveis na janela (não precisa ter peso no dia atual)", () => {
    expect(
      computeChartYDomain(dates, {
        "2026-05-05": 80,
        "2026-05-06": 84,
      })
    ).toEqual({
      minKg: 72,
      maxKg: 92,
    });
  });

  it("não deixa o mínimo abaixo de 0kg", () => {
    expect(computeChartYDomain(dates, { "2026-05-07": 6 })).toEqual({
      minKg: 0,
      maxKg: 16,
    });
  });

  it("coage strings para número (evita média por concatenação tipo 85 + \"90\")", () => {
    const weights = {
      "2026-05-05": "80",
      "2026-05-06": 82,
    } as unknown as Record<string, number>;
    expect(computeChartYDomain(dates, weights)).toEqual({
      minKg: 71,
      maxKg: 91,
    });
  });
});

describe("weightToSvgY", () => {
  const top = 0;
  const bottom = 100;
  const min = 0;
  const max = 100;

  it("min na base", () => {
    expect(weightToSvgY(0, top, bottom, min, max)).toBe(100);
  });

  it("max no topo", () => {
    expect(weightToSvgY(100, top, bottom, min, max)).toBe(0);
  });

  it("valor acima do domínio — clamp ao topo", () => {
    expect(weightToSvgY(130, top, bottom, min, max)).toBe(0);
  });
});

describe("buildChartPoints & polyline", () => {
  const dates = buildSevenDayDates("2026-05-07");
  const plotLeft = 0;
  const plotW = 60;
  const plotTop = 0;
  const plotBottom = 100;
  const minKg = 0;
  const maxKg = 100;

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
      plotBottom,
      minKg,
      maxKg
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
      plotBottom,
      minKg,
      maxKg
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
      plotBottom,
      minKg,
      maxKg
    );
    expect(polylinePointsString(pts)).toMatch(
      /^\d+(\.\d+)?,\d+(\.\d+)? \d+(\.\d+)?,\d+(\.\d+)?$/
    );
  });
});

describe("yAxisTickValuesKg", () => {
  it("gera marcas de 10 em 10 e inclui limites", () => {
    const ticks = yAxisTickValuesKg(63, 91);
    expect(ticks).toContain(63);
    expect(ticks).toContain(70);
    expect(ticks).toContain(80);
    expect(ticks).toContain(90);
    expect(ticks).toContain(91);
    expect(ticks).toEqual([...ticks].sort((a, b) => a - b));
  });

  it("constante de margem é 10kg", () => {
    expect(Y_AXIS_PADDING_KG).toBe(10);
  });

  it("intervalo padrão funciona", () => {
    const ticks = yAxisTickValuesKg(0, 100);
    expect(ticks).toContain(0);
    expect(ticks).toContain(10);
    expect(ticks).toContain(50);
    expect(ticks).toContain(100);
  });
});
