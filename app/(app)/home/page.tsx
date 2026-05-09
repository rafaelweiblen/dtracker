import { auth } from "@/auth";
import { getEntriesForDate, getStreaks } from "@/db/queries/entries";
import { getWeightWithPrevious } from "@/db/queries/weights";
import { StreakBar } from "@/components/streak-bar";
import { DateSync } from "@/components/date-sync";
import { HomeClientWrapper } from "@/components/home-client-wrapper";
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

  const [entries, streaks, weightData] = await Promise.all([
    getEntriesForDate(session.user.id, today),
    getStreaks(session.user.id, today),
    getWeightWithPrevious(session.user.id, today),
  ]);

  return (
    <div className="flex flex-col px-4 pb-6 pt-3">
      <DateSync serverDate={today} />
      <header className="home-section-reveal space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Hoje
        </p>
        <h1 className="text-display-home capitalize text-foreground">
          {formatDate(today)}
        </h1>
      </header>

      <div className="home-section-reveal home-section-reveal-delay-1 mt-7">
        <StreakBar
          exerciseStreak={streaks.exerciseStreak}
          daysSinceEscape={streaks.daysSinceEscape}
        />
      </div>

      <div className="home-section-reveal home-section-reveal-delay-2 mt-10 flex flex-col gap-5">
        <HomeClientWrapper
          initialTodayWeight={weightData.today}
          previousWeight={weightData.previous}
          initialEntries={entries}
          date={today}
        />
      </div>
    </div>
  );
}
