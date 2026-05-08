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

/** Escala vertical — passo 20 kg “para cima”; passo 30 kg em simultâneo. */
export const Y_AXIS_STEP_20_KG = 20;
export const Y_AXIS_STEP_30_KG = 30;

/** Sem dados na janela: eixo 0 … este teto (marcas 20/30). */
export const EMPTY_CHART_MAX_KG = 120;

export interface ChartYDomain {
  minKg: number;
  maxKg: number;
}

/**
 * Teto do gráfico sem limite fixo: o maior valor entre o teto por múltiplos de 20
 * e o por múltiplos de 30 acima do maior peso registado.
 */
export function computeChartYDomain(
  dates: string[],
  weights: Record<string, number>
): ChartYDomain {
  const values = dates
    .map((d) => weights[d])
    .filter((w): w is number => w != null && w > 0);
  if (values.length === 0) {
    return { minKg: 0, maxKg: EMPTY_CHART_MAX_KG };
  }
  const peak = Math.max(...values);
  const topBy20 =
    Math.ceil(peak / Y_AXIS_STEP_20_KG) * Y_AXIS_STEP_20_KG;
  const topBy30 =
    Math.ceil(peak / Y_AXIS_STEP_30_KG) * Y_AXIS_STEP_30_KG;
  const maxKg = Math.max(topBy20, topBy30, Y_AXIS_STEP_20_KG, Y_AXIS_STEP_30_KG);
  return { minKg: 0, maxKg };
}

/**
 * Converte peso (kg) para coordenada SVG Y; Y maior = mais baixo na tela.
 * `minKg` na base, `maxKg` no topo; fora do intervalo faz clamp.
 */
export function weightToSvgY(
  weightKg: number,
  plotTop: number,
  plotBottom: number,
  minKg: number,
  maxKg: number
): number {
  const span = maxKg - minKg;
  if (span <= 0) return plotBottom;
  const clamped = Math.min(maxKg, Math.max(minKg, weightKg));
  const h = plotBottom - plotTop;
  return plotBottom - ((clamped - minKg) / span) * h;
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
  plotBottom: number,
  minKg: number,
  maxKg: number
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
    const y = weightToSvgY(w, plotTop, plotBottom, minKg, maxKg);
    raw.push({ date, index: i, weight: w, x, y });
  }
  return raw.sort((a, b) => a.date.localeCompare(b.date));
}

export function polylinePointsString(points: ChartPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * Marcas do eixo Y: união dos múltiplos de 20 e de 30 dentro de [minKg, maxKg].
 */
export function yAxisTickValuesKg(minKg: number, maxKg: number): number[] {
  const set = new Set<number>();
  let k = Math.ceil(minKg / Y_AXIS_STEP_20_KG - 1e-9) * Y_AXIS_STEP_20_KG;
  for (; k <= maxKg; k += Y_AXIS_STEP_20_KG) {
    set.add(k);
  }
  k = Math.ceil(minKg / Y_AXIS_STEP_30_KG - 1e-9) * Y_AXIS_STEP_30_KG;
  for (; k <= maxKg; k += Y_AXIS_STEP_30_KG) {
    set.add(k);
  }
  set.add(minKg);
  set.add(maxKg);
  return [...set]
    .filter((v) => v >= minKg - 1e-9 && v <= maxKg + 1e-9)
    .sort((a, b) => a - b);
}
