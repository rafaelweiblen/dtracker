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
        "flex flex-col items-center justify-center gap-0.5 size-8 rounded-lg text-sm",
        isToday && "ring-2 ring-green-600 font-semibold",
        isFuture && "opacity-30"
      )}
    >
      <span>{day}</span>
      <div className="flex gap-0.5">
        {hasEscape && <span className="size-1.5 rounded-full bg-red-500" />}
        {hasExercise && <span className="size-1.5 rounded-full bg-green-500" />}
        {!hasEscape && !hasExercise && <span className="size-1.5" />}
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
