import { auth } from "@/auth";
import { getEntriesForDate } from "@/db/queries/entries";
import { getWeightWithPrevious } from "@/db/queries/weights";
import { HomeClientWrapper } from "@/components/home-client-wrapper";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export default async function DayDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!isValidDate(date)) notFound();

  const today = new Date().toISOString().slice(0, 10);
  if (date > today) redirect("/home");

  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [entries, weightData] = await Promise.all([
    getEntriesForDate(session.user.id, date),
    getWeightWithPrevious(session.user.id, date),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Link
          href="/calendar"
          aria-label="Voltar ao calendário"
          className="rounded-lg p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ChevronLeft size={20} aria-hidden />
        </Link>
        <h1 className="text-xl font-semibold capitalize">{formatDate(date)}</h1>
      </div>
      <HomeClientWrapper
        initialTodayWeight={weightData.today}
        previousWeight={weightData.previous}
        initialEntries={entries}
        date={date}
      />
    </div>
  );
}
