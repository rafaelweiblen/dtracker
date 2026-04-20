import { auth } from "@/auth";
import { getEntriesForDate } from "@/db/queries/entries";
import { DailyLog } from "@/components/daily-log";
import { redirect } from "next/navigation";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${iso}T12:00:00`));
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const today = todayISO();
  const entries = await getEntriesForDate(session.user.id, today);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold capitalize">{formatDate(today)}</h1>
      <DailyLog initialEntries={entries} date={today} />
    </div>
  );
}
