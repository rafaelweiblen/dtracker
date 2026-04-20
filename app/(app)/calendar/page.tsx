import { auth } from "@/auth";
import { getMonthSummary } from "@/db/queries/entries";
import { CalendarView } from "@/components/calendar-view";
import { redirect } from "next/navigation";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  const { month: rawMonth } = await searchParams;
  const month =
    rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : currentMonth;

  const summary = await getMonthSummary(session.user.id, month);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Calendário</h1>
      <CalendarView initialSummary={summary} today={today} />
    </div>
  );
}
