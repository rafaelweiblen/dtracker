import { auth } from "@/auth";
import { getEntriesForDate } from "@/db/queries/entries";
import { DailyLog } from "@/components/daily-log";
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

  const entries = await getEntriesForDate(session.user.id, date);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Link
          href="/calendar"
          aria-label="Voltar ao calendário"
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold capitalize">{formatDate(date)}</h1>
      </div>
      <DailyLog initialEntries={entries} date={date} />
    </div>
  );
}
