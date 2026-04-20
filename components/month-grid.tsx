import { DayCell } from "./day-cell";
import type { DaySummary } from "@/db/queries/entries";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface MonthGridProps {
  month: string; // YYYY-MM
  summary: Record<string, DaySummary>;
  today: string; // YYYY-MM-DD
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function MonthGrid({ month, summary, today }: MonthGridProps) {
  const [year, mon] = month.split("-").map(Number);
  const total = daysInMonth(year, mon);

  // weekday of the 1st (0=Sun … 6=Sat)
  const startOffset = new Date(`${month}-01T12:00:00`).getDay();

  const cells: React.ReactNode[] = [];

  // blank cells before first day
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`blank-${i}`} />);
  }

  for (let d = 1; d <= total; d++) {
    const date = `${month}-${String(d).padStart(2, "0")}`;
    const s = summary[date];
    cells.push(
      <DayCell
        key={date}
        date={date}
        hasEscape={s?.escapeCount > 0}
        hasExercise={s?.exerciseCount > 0}
        isToday={date === today}
        isFuture={date > today}
      />
    );
  }

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1 text-xs font-medium text-muted-foreground">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">{cells}</div>
    </div>
  );
}
