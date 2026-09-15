import { resolveAnchorDay, sma7AtDay } from "@/lib/weight-trend/sma7";

function yearMonth(iso: string): string {
  return iso.slice(0, 7);
}

function addMonthsYm(yearMonth: string, delta: number): string {
  const year = Number(yearMonth.slice(0, 4));
  const month = Number(yearMonth.slice(5, 7));
  const index = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

function monthsInclusive(fromYm: string, toYm: string): number {
  const fromYear = Number(fromYm.slice(0, 4));
  const fromMonth = Number(fromYm.slice(5, 7));
  const toYear = Number(toYm.slice(0, 4));
  const toMonth = Number(toYm.slice(5, 7));
  return (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
}

function exerciseCopy(today: string, exerciseDates: string[]): string {
  if (exerciseDates.length === 0) return "Sem dados";

  const todayYm = yearMonth(today);
  const capStart = addMonthsYm(todayYm, -11);
  const firstMonth = exerciseDates.reduce(
    (earliest, date) => (yearMonth(date) < earliest ? yearMonth(date) : earliest),
    yearMonth(exerciseDates[0])
  );
  const windowStart = firstMonth > capStart ? firstMonth : capStart;
  const monthCount = Math.min(12, Math.max(1, monthsInclusive(windowStart, todayYm)));
  const count = exerciseDates.filter(
    (date) => yearMonth(date) >= windowStart && date <= today
  ).length;
  const workoutLabel = count === 1 ? "treino" : "treinos";
  const monthLabel = monthCount === 1 ? "Mês" : "Meses";
  return `${count} ${workoutLabel} - ${monthCount} ${monthLabel}`;
}

export function computeCalendarStrip(options: {
  today: string;
  weights: Record<string, number>;
  exerciseDates: string[];
}): { sma7: string; exercise: string } {
  const anchor = resolveAnchorDay(options.weights, options.today);
  const sma = sma7AtDay(options.weights, anchor);
  const sma7 =
    sma == null
      ? "Sem dados - Média 7 dias"
      : `${sma.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg - Média 7 dias`;
  return {
    sma7,
    exercise: exerciseCopy(options.today, options.exerciseDates),
  };
}
