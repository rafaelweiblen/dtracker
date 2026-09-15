import { auth } from "@/auth";
import { getMonthSummary } from "@/db/queries/entries";
import { CalendarView } from "@/components/calendar-view";
import { CalendarStatsStripPrototype } from "@/components/calendar-stats-strip-prototype";
import { DateSync } from "@/components/date-sync";
import { redirect } from "next/navigation";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    date?: string;
    variant?: string;
    strip?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const {
    month: rawMonth,
    date: rawDate,
    variant: rawVariant,
    strip: rawStrip,
  } = await searchParams;

  const today =
    rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : new Date().toISOString().slice(0, 10);

  const currentMonth = today.slice(0, 7);
  const month =
    rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : currentMonth;

  const summary = await getMonthSummary(session.user.id, month);
  const variant =
    rawVariant === "B" || rawVariant === "C" ? rawVariant : "A";
  const strip =
    rawStrip === "empty" || rawStrip === "zero" ? rawStrip : "ok";
  const showPrototype = process.env.NODE_ENV !== "production";

  return (
    <div className="flex flex-col gap-4 p-4">
      <DateSync serverDate={today} />
      <h1 className="text-xl font-semibold">Calendário</h1>
      <CalendarView initialSummary={summary} today={today}>
        {showPrototype ? (
          <CalendarStatsStripPrototype variant={variant} strip={strip} />
        ) : null}
      </CalendarView>
    </div>
  );
}
