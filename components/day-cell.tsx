import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DayCellProps {
  date: string; // YYYY-MM-DD
  hasEscape: boolean;
  hasExercise: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function DayCell({ date, hasEscape, hasExercise, isToday, isFuture }: DayCellProps) {
  const day = parseInt(date.slice(8), 10);

  const inner = (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg p-1",
        isToday && "bg-primary/10 font-semibold",
        isFuture && "opacity-30"
      )}
    >
      <span className={cn("text-sm leading-none", isToday && "text-primary")}>
        {day}
      </span>
      <div className="flex gap-0.5">
        {hasEscape && (
          <span className="size-1.5 rounded-full bg-red-500" aria-label="escapada" />
        )}
        {hasExercise && (
          <span className="size-1.5 rounded-full bg-green-500" aria-label="exercício" />
        )}
        {!hasEscape && !hasExercise && (
          <span className="size-1.5" aria-hidden />
        )}
      </div>
    </div>
  );

  if (isFuture) return <div>{inner}</div>;

  return (
    <Link href={`/day/${date}`} className="block rounded-lg hover:bg-muted">
      {inner}
    </Link>
  );
}
