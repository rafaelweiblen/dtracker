import { auth } from "@/auth";
import { getWeightsBetweenDates } from "@/db/queries/weights";
import { WeightSevenDayChart } from "@/components/weight-seven-day-chart";
import { windowStartDate } from "@/lib/weight-seven-day-chart";
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

  const rangeStart = windowStartDate(today);
  const weights = await getWeightsBetweenDates(session.user.id, rangeStart, today);

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
        <span>Últimos 7 dias · escala 0–112 kg · hoje à direita</span>
      </div>

      <WeightSevenDayChart key={today} initialWeights={weights} today={today} />
    </div>
  );
}
