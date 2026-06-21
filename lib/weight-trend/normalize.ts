import { parseWeightKg } from "@/lib/weight-seven-day-chart";

/** Colapsa entradas para um valor por dia (último valor vence). */
export function normalizeWeights(
  weights: Record<string, unknown>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [date, value] of Object.entries(weights)) {
    const kg = parseWeightKg(value);
    if (kg != null) out[date] = kg;
  }
  return out;
}
