import { auth } from "@/auth";
import { getMonthSummary } from "@/db/queries/entries";
import { getWeightsBetweenDates } from "@/db/queries/weights";
import { CalendarView } from "@/components/calendar-view";
import { DateSync } from "@/components/date-sync";
import { computeCalendarStrip } from "@/lib/calendar-strip";
import { addDaysIso } from "@/lib/weight-seven-day-chart";
import { redirect } from "next/navigation";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { month: rawMonth, date: rawDate } = await searchParams;

  const today =
    rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : new Date().toISOString().slice(0, 10);

  const currentMonth = today.slice(0, 7);
  const month =
    rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : currentMonth;

  const [summary, weights] = await Promise.all([
    getMonthSummary(session.user.id, month),
    getWeightsBetweenDates(session.user.id, addDaysIso(today, -7), today),
  ]);
  const { sma7 } = computeCalendarStrip({ today, weights });

  return (
    <div className="flex flex-col gap-4 p-4">
      <DateSync serverDate={today} />
      <h1 className="text-xl font-semibold">Calendário</h1>
      <CalendarView
        initialSummary={summary}
        today={today}
        sma7Caption={sma7}
      />
    </div>
  );
}
