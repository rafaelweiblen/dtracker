/** Garante número em kg; ignora strings/NaN (evita concatenação em `sum + w`). */
export function parseWeightKg(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

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

/** Margem acima/abaixo do menor/maior peso na janela de 7 dias. */
export const Y_AXIS_PADDING_KG = 10;
/** Marcação principal do eixo Y. */
export const Y_AXIS_TICK_STEP_KG = 10;

export interface ChartYDomain {
  minKg: number;
  maxKg: number;
}

export function computeChartYDomain(
  dates: string[],
  weights: Record<string, number>
): ChartYDomain {
  const values = dates
    .map((d) => parseWeightKg(weights[d]))
    .filter((w): w is number => w != null);

  if (values.length === 0) {
    return { minKg: 0, maxKg: Y_AXIS_TICK_STEP_KG * 2 };
  }
  const averageWeight =
    values.reduce((sum, w) => sum + w, 0) / values.length;
  const rawMin = Math.max(0, averageWeight - Y_AXIS_PADDING_KG);
  const rawMax = averageWeight + Y_AXIS_PADDING_KG;
  /** Inteiros evitam marcas tipo 71,81428571428572 no SVG (artefatos visuais ".428572"). */
  const minKg = Math.floor(rawMin);
  const maxKg = Math.max(
    Math.ceil(rawMax),
    minKg + Y_AXIS_TICK_STEP_KG
  );

  return { minKg, maxKg };
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
    const w = parseWeightKg(weights[date]);
    if (w == null) continue;
    const x = plotLeft + (i / 6) * plotWidth;
    const y = weightToSvgY(w, plotTop, plotBottom, minKg, maxKg);
    raw.push({ date, index: i, weight: w, x, y });
  }
  return raw.sort((a, b) => a.date.localeCompare(b.date));
}

export function polylinePointsString(points: ChartPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export function yAxisTickValuesKg(minKg: number, maxKg: number): number[] {
  const ticks: number[] = [];
  const minI = Math.round(minKg);
  const maxI = Math.round(maxKg);
  const start =
    Math.ceil(minI / Y_AXIS_TICK_STEP_KG) * Y_AXIS_TICK_STEP_KG;
  for (let k = start; k <= maxI; k += Y_AXIS_TICK_STEP_KG) {
    ticks.push(k);
  }
  if (!ticks.includes(minI)) ticks.unshift(minI);
  if (!ticks.includes(maxI)) ticks.push(maxI);
  return [...new Set(ticks)].sort((a, b) => a - b);
}

/** Rótulo do eixo Y: só inteiros ou uma casa decimal. */
export function formatYAxisKgLabel(kg: number): string {
  if (Number.isInteger(kg)) return String(kg);
  return kg.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}
