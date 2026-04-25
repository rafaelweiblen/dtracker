import { auth } from "@/auth";
import { getEntriesForDate, getStreaks } from "@/db/queries/entries";
import { DailyLog } from "@/components/daily-log";
import { StreakBar } from "@/components/streak-bar";
import { DateSync } from "@/components/date-sync";
import { redirect } from "next/navigation";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${iso}T12:00:00`));
}

export default async function HomePage({
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

  const [entries, streaks] = await Promise.all([
    getEntriesForDate(session.user.id, today),
    getStreaks(session.user.id, today),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <DateSync serverDate={today} />
      <h1 className="text-xl font-semibold capitalize">{formatDate(today)}</h1>
      <StreakBar
        exerciseStreak={streaks.exerciseStreak}
        daysSinceEscape={streaks.daysSinceEscape}
      />
      <DailyLog initialEntries={entries} date={today} />
    </div>
  );
}
