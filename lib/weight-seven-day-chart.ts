/** Domínio fixo do eixo Y do gráfico de peso (kg). */
export const CHART_MAX_KG = 112;

export function addDaysIso(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Da esquerda para a direita: hoje−6 … hoje (7 datas). */
export function buildSevenDayDates(today: string): string[] {
  const dates: string[] = [];
  for (let i = -6; i <= 0; i++) {
    dates.push(addDaysIso(today, i));
  }
  return dates;
}

export function windowStartDate(today: string): string {
  return addDaysIso(today, -6);
}

/**
 * Converte peso (kg) para coordenada SVG Y; Y maior = mais baixo na tela.
 * 0 kg na base do plot, CHART_MAX_KG no topo. Valores > max são clamp ao topo.
 */
export function weightToSvgY(
  weightKg: number,
  plotTop: number,
  plotBottom: number,
  maxKg = CHART_MAX_KG
): number {
  const clamped = Math.min(maxKg, Math.max(0, weightKg));
  const h = plotBottom - plotTop;
  return plotBottom - (clamped / maxKg) * h;
}

export interface ChartPoint {
  date: string;
  index: number;
  weight: number;
  x: number;
  y: number;
}

/** Pontos plotáveis (peso > 0), ordenados por data crescente. */
export function buildChartPoints(
  dates: string[],
  weights: Record<string, number>,
  plotLeft: number,
  plotWidth: number,
  plotTop: number,
  plotBottom: number
): ChartPoint[] {
  if (dates.length !== 7) {
    throw new Error("buildChartPoints: esperadas exatamente 7 datas");
  }
  const raw: ChartPoint[] = [];
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const w = weights[date];
    if (w == null || !(w > 0)) continue;
    const x = plotLeft + (i / 6) * plotWidth;
    const y = weightToSvgY(w, plotTop, plotBottom);
    raw.push({ date, index: i, weight: w, x, y });
  }
  return raw.sort((a, b) => a.date.localeCompare(b.date));
}

export function polylinePointsString(points: ChartPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}
