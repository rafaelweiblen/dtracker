import { resolveAnchorDay, sma7AtDay } from "@/lib/weight-trend/sma7";

export function computeCalendarStrip(options: {
  today: string;
  weights: Record<string, number>;
}): { sma7: string } {
  const anchor = resolveAnchorDay(options.weights, options.today);
  const sma = sma7AtDay(options.weights, anchor);
  if (sma == null) {
    return { sma7: "Sem dados - Média 7 dias" };
  }
  const kg = sma.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return { sma7: `${kg} kg - Média 7 dias` };
}
