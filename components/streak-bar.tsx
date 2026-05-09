import { Dumbbell, UtensilsCrossed, PartyPopper } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StreakBarProps {
  exerciseStreak: number;
  daysSinceEscape: number | null;
}

export function StreakBar({ exerciseStreak, daysSinceEscape }: StreakBarProps) {
  return (
    <div className="flex gap-2.5">
      <Link
        href="/streaks"
        className={cn(
          "flex min-h-[5.5rem] flex-[1.15] flex-col justify-between rounded-2xl border border-primary/25 bg-primary/[0.07] p-3.5",
          "transition-opacity active:opacity-85",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/90">
            Exercício
          </span>
          <Dumbbell size={17} className="shrink-0 text-primary" aria-hidden />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-metric text-primary tabular-nums">
            {exerciseStreak}
          </span>
          <span className="text-xs text-muted-foreground">dias seguidos</span>
        </div>
      </Link>

      <Link
        href="/escape-ranking"
        className={cn(
          "flex min-h-[5.5rem] min-w-0 flex-[0.85] flex-col justify-between rounded-xl border border-border bg-card px-3 py-3",
          "transition-opacity active:opacity-85",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        {daysSinceEscape === null ? (
          <>
            <PartyPopper size={18} className="text-primary" aria-hidden />
            <span className="text-[11px] leading-snug text-muted-foreground">
              Sem escapadas ainda
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Escapadas
              </span>
              <UtensilsCrossed size={15} className="shrink-0 text-destructive" aria-hidden />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-metric text-foreground tabular-nums">
                {daysSinceEscape}
              </span>
              <span className="text-[11px] text-muted-foreground">dias limpo</span>
            </div>
          </>
        )}
      </Link>
    </div>
  );
}
