interface StreakBarProps {
  exerciseStreak: number;
  daysSinceEscape: number | null;
}

export function StreakBar({ exerciseStreak, daysSinceEscape }: StreakBarProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-1 flex-col gap-0.5 rounded-xl border p-3">
        <span className="text-2xl font-bold leading-none">{exerciseStreak}</span>
        <span className="text-xs text-muted-foreground">
          dias consecutivos de exercício 🔥
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 rounded-xl border p-3">
        {daysSinceEscape === null ? (
          <>
            <span className="text-lg font-bold leading-none">🎉</span>
            <span className="text-xs text-muted-foreground">
              Nenhuma escapada registrada
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold leading-none">{daysSinceEscape}</span>
            <span className="text-xs text-muted-foreground">
              dias desde a última escapada 🎯
            </span>
          </>
        )}
      </div>
    </div>
  );
}
