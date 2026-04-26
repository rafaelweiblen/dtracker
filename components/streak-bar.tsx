import { Dumbbell, UtensilsCrossed, PartyPopper } from "lucide-react";
import Link from "next/link";

interface StreakBarProps {
  exerciseStreak: number;
  daysSinceEscape: number | null;
}

export function StreakBar({ exerciseStreak, daysSinceEscape }: StreakBarProps) {
  return (
    <div className="flex gap-3">
      <Link href="/streaks" className="flex flex-1 flex-col gap-0.5 rounded-xl border p-3 active:opacity-70">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold leading-none text-green-600">{exerciseStreak}</span>
          <Dumbbell size={18} className="text-green-600" />
        </div>
        <span className="text-xs text-muted-foreground">dias consecutivos de exercício</span>
      </Link>

      <div className="flex flex-1 flex-col gap-0.5 rounded-xl border p-3">
        {daysSinceEscape === null ? (
          <>
            <PartyPopper size={24} className="text-green-600" />
            <span className="text-xs text-muted-foreground">
              Nenhuma escapada registrada
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold leading-none">{daysSinceEscape}</span>
              <UtensilsCrossed size={18} className="text-red-500" />
            </div>
            <span className="text-xs text-muted-foreground">dias desde a última escapada</span>
          </>
        )}
      </div>
    </div>
  );
}
