import { auth } from "@/auth";
import { getWeightsBetweenDates } from "@/db/queries/weights";
import { getWeightGoal } from "@/db/queries/weight-goals";
import { WeightSevenDayChart } from "@/components/weight-seven-day-chart";
import { WeightTrendStatusCard } from "@/components/weight-trend-status-card";
import { WeightGoalForm } from "@/components/weight-goal-form";
import { WeightTrendDisclaimer } from "@/components/weight-trend-disclaimer";
import { addDaysIso } from "@/lib/weight-seven-day-chart";
import { computeWeightTrendBundle } from "@/lib/weight-trend";
import { DateSync } from "@/components/date-sync";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function WeightPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const params = await searchParams;
  const dateParam = params.date;
  const today =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : new Date().toISOString().slice(0, 10);

  const historyStart = addDaysIso(today, -89);
  const [weights, goal] = await Promise.all([
    getWeightsBetweenDates(session.user.id, historyStart, today),
    getWeightGoal(session.user.id),
  ]);

  const goalTargetKg = goal?.targetKg ?? null;
  const trendBundle = computeWeightTrendBundle({
    today,
    weights,
    goalTargetKg,
  });

  const showDisclaimer =
    goalTargetKg != null ||
    trendBundle.eligibleForProjection ||
    trendBundle.goalEstimate != null;

  return (
    <div className="flex flex-col gap-4 px-4 py-6 pb-20">
      <DateSync serverDate={today} />
      <div className="flex items-center gap-3">
        <Link
          href="/home"
          aria-label="Voltar ao início"
          className="rounded-lg p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft size={20} aria-hidden />
        </Link>
        <h1 className="text-2xl font-bold">Histórico de Peso</h1>
      </div>

      <WeightTrendStatusCard bundle={trendBundle} goalTargetKg={goalTargetKg} />

      <div className="w-full min-w-0">
        <WeightSevenDayChart
          key={today}
          initialWeights={weights}
          today={today}
          goalTargetKg={goalTargetKg}
        />
      </div>

      <WeightGoalForm initialTargetKg={goalTargetKg} />

      {showDisclaimer ? <WeightTrendDisclaimer /> : null}
    </div>
  );
}
