import { auth } from "@/auth";
import { getWeightsForMonth } from "@/db/queries/weights";
import { WeightCalendarView } from "@/components/weight-calendar-view";
import { DateSync } from "@/components/date-sync";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

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

  const month = today.slice(0, 7);
  const weights = await getWeightsForMonth(session.user.id, month);

  return (
    <div className="flex flex-col gap-4 px-4 py-6 pb-20">
      <DateSync serverDate={today} />
      <div className="flex items-center gap-3">
        <Link href="/home" className="text-muted-foreground">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Histórico de Peso</h1>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Scale size={16} className="text-blue-500" />
        <span>Peso registrado por dia</span>
      </div>

      {Object.keys(weights).length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Scale size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum peso registrado ainda</p>
        </div>
      ) : null}

      <WeightCalendarView initialWeights={weights} today={today} />
    </div>
  );
}
