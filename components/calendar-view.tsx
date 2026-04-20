"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthGrid } from "./month-grid";
import type { DaySummary } from "@/db/queries/entries";

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
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(new Date(year, month - 1, 1));
}

interface CalendarViewProps {
  initialSummary: Record<string, DaySummary>;
  today: string;
}

export function CalendarView({ initialSummary, today }: CalendarViewProps) {
  const currentMonth = today.slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [summaries, setSummaries] = useState<Record<string, Record<string, DaySummary>>>({
    [currentMonth]: initialSummary,
  });

  async function navigate(target: string) {
    setMonth(target);
    if (!summaries[target]) {
      const res = await fetch(`/api/calendar/${target}`);
      if (res.ok) {
        const data = await res.json();
        setSummaries((prev) => ({ ...prev, [target]: data }));
      }
    }
  }

  const isCurrentMonth = month === currentMonth;
  const title = formatMonthTitle(month);

  return (
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

      <MonthGrid
        month={month}
        summary={summaries[month] ?? {}}
        today={today}
      />
    </div>
  );
}
