import { auth } from "@/auth";
import { getEscapeFreeHistory } from "@/db/queries/entries";
import type { StreakRun } from "@/db/queries/entries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UtensilsCrossed, Trophy } from "lucide-react";

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(
      new Date(`${iso}T12:00:00`)
    );
  return startDate === endDate ? fmt(startDate) : `${fmt(startDate)} – ${fmt(endDate)}`;
}

const medals = ["🥇", "🥈", "🥉"];

function RankingItem({ run, position }: { run: StreakRun; position: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className="text-2xl">{medals[position]}</span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">
          {formatDateRange(run.startDate, run.endDate)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-2xl font-bold leading-none">{run.length}</span>
        <UtensilsCrossed size={18} className="text-red-500" />
      </div>
    </div>
  );
}

export default async function EscapeRankingPage({
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

  const history = await getEscapeFreeHistory(session.user.id, today);

  return (
    <div className="flex flex-col gap-4 px-4 py-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href="/home" className="text-muted-foreground">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Ranking Sem Escapadas</h1>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy size={16} className="text-red-500" />
        <span>Top 3 maiores sequências sem escapada</span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <UtensilsCrossed size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma sequência registrada ainda</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((run, i) => (
            <RankingItem key={run.startDate} run={run} position={i} />
          ))}
        </div>
      )}
    </div>
  );
}
