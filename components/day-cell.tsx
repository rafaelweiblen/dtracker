import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DayCellProps {
  date: string; // YYYY-MM-DD
  hasEscape: boolean;
  hasExercise: boolean;
  hasWater: boolean;
  isToday: boolean;
  isFuture: boolean;
}

function linkAriaLabel(
  date: string,
  hasEscape: boolean,
  hasExercise: boolean,
  hasWater: boolean
): string {
  const long = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
  const bits: string[] = [];
  if (hasEscape) bits.push("escapada registada");
  if (hasExercise) bits.push("exercício registado");
  if (hasWater) bits.push("água registada");
  const detail = bits.length ? `. ${bits.join("; ")}` : "";
  return `Ver registros de ${long}${detail}`;
}

export function DayCell({
  date,
  hasEscape,
  hasExercise,
  hasWater,
  isToday,
  isFuture,
}: DayCellProps) {
  const day = parseInt(date.slice(8), 10);

  const inner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 size-8 rounded-lg text-sm",
        isToday && "font-semibold ring-2 ring-primary",
        isFuture && "opacity-30"
      )}
    >
      <span>{day}</span>
      <div className="flex gap-0.5">
        {hasEscape && (
          <span className="size-1.5 rounded-full bg-destructive" aria-hidden />
        )}
        {hasExercise && (
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        )}
        {hasWater && (
          <span className="size-1.5 rounded-full bg-sky-500" aria-hidden />
        )}
        {!hasEscape && !hasExercise && !hasWater && <span className="size-1.5" />}
      </div>
    </div>
  );

  if (isFuture) return <div>{inner}</div>;

  return (
    <Link
      href={`/day/${date}`}
      aria-label={linkAriaLabel(date, hasEscape, hasExercise, hasWater)}
      className="block rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {inner}
    </Link>
  );
}
