"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditWeightBottomSheet } from "./edit-weight-bottom-sheet";
import { applyWeightSave, applyWeightDelete, isFutureDate } from "@/lib/weight-state";

export { applyWeightSave, applyWeightDelete, isFutureDate };

function prevMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return m === 1
    ? `${y - 1}-12`
    : `${y}-${String(m - 1).padStart(2, "0")}`;
}

function nextMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return m === 12
    ? `${y + 1}-01`
    : `${y}-${String(m + 1).padStart(2, "0")}`;
}

function formatMonthTitle(ym: string) {
  const [year, month] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  );
}

function getDaysInMonth(ym: string): string[] {
  const [year, month] = ym.split("-").map(Number);
  const days: string[] = [];
  const total = new Date(year, month, 0).getDate();
  for (let d = 1; d <= total; d++) {
    days.push(`${ym}-${String(d).padStart(2, "0")}`);
  }
  return days;
}

function getFirstDayOfWeek(ym: string): number {
  const [year, month] = ym.split("-").map(Number);
  return new Date(year, month - 1, 1).getDay();
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface WeightCalendarViewProps {
  initialWeights: Record<string, number>;
  today: string;
}

export function WeightCalendarView({ initialWeights, today }: WeightCalendarViewProps) {
  const currentMonth = today.slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [weightsByMonth, setWeightsByMonth] = useState<Record<string, Record<string, number>>>({
    [currentMonth]: initialWeights,
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/weight/${currentMonth}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setWeightsByMonth((prev) => ({ ...prev, [currentMonth]: data }));
      })
      .catch(() => {});
  }, [currentMonth]);

  async function navigate(target: string) {
    setMonth(target);
    if (!weightsByMonth[target]) {
      const res = await fetch(`/api/weight/${target}`);
      if (res.ok) {
        const data = await res.json();
        setWeightsByMonth((prev) => ({ ...prev, [target]: data }));
      }
    }
  }

  function openCell(date: string, weight: number | undefined) {
    setSelectedDate(date);
    setSelectedWeight(weight ?? null);
  }

  function closeSheet() {
    setSelectedDate(null);
    setSelectedWeight(null);
  }

  const isCurrentMonth = month === currentMonth;
  const title = formatMonthTitle(month);
  const days = getDaysInMonth(month);
  const firstDay = getFirstDayOfWeek(month);
  const weights = weightsByMonth[month] ?? {};

  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...days,
  ];

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(prevMonth(month))}
            aria-label="Mês anterior"
            className="rounded-lg p-2 hover:bg-muted"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold capitalize">{title}</h2>
          <button
            onClick={() => navigate(nextMonth(month))}
            disabled={isCurrentMonth}
            aria-label="Próximo mês"
            className="rounded-lg p-2 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEK_DAYS.map((d) => (
            <span key={d} className="text-xs font-medium text-muted-foreground py-1">
              {d}
            </span>
          ))}
          {cells.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} />;
            }
            const dayNum = parseInt(date.slice(-2), 10);
            const w = weights[date];
            const isToday = date === today;
            const isFuture = isFutureDate(date, today);

            const cellClass = cn(
              "flex flex-col items-center justify-center rounded-xl py-2 min-h-[52px] gap-0.5",
              isToday && "ring-2 ring-blue-400",
              w != null && "bg-blue-50",
              isFuture ? "opacity-30" : "active:opacity-70"
            );

            const cellContent = (
              <>
                <span className={cn("text-xs text-muted-foreground leading-none", isToday && "font-semibold text-blue-600")}>
                  {dayNum}
                </span>
                {w != null ? (
                  <span className="text-xs font-semibold leading-none text-blue-700">
                    {w.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                  </span>
                ) : (
                  <span className="text-xs leading-none text-muted-foreground opacity-40">—</span>
                )}
              </>
            );

            if (isFuture) {
              return (
                <div key={date} className={cellClass}>
                  {cellContent}
                </div>
              );
            }

            return (
              <button
                key={date}
                onClick={() => openCell(date, w)}
                className={cellClass}
              >
                {cellContent}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <EditWeightBottomSheet
          open={!!selectedDate}
          onClose={closeSheet}
          date={selectedDate}
          initialWeight={selectedWeight}
          onSuccess={(weight) => {
            setWeightsByMonth((prev) => applyWeightSave(prev, selectedDate.slice(0, 7), selectedDate, weight));
          }}
          onDelete={() => {
            setWeightsByMonth((prev) => applyWeightDelete(prev, selectedDate.slice(0, 7), selectedDate));
          }}
        />
      )}
    </>
  );
}
