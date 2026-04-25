"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function localDateISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface DatePickerSheetProps {
  open: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (date: string) => void;
}

export function DatePickerSheet({ open, onClose, selected, onSelect }: DatePickerSheetProps) {
  const today = localDateISO();

  const [viewYear, setViewYear] = useState(() => parseInt(selected.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => parseInt(selected.slice(5, 7)));

  useEffect(() => {
    if (open) {
      setViewYear(parseInt(selected.slice(0, 4)));
      setViewMonth(parseInt(selected.slice(5, 7)));
    }
  }, [open, selected]);

  const monthStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}`;
  const total = daysInMonth(viewYear, viewMonth);
  const startOffset = new Date(`${monthStr}-01T12:00:00`).getDay();

  const todayYear = parseInt(today.slice(0, 4));
  const todayMonth = parseInt(today.slice(5, 7));
  const canGoToNextMonth =
    viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth);

  function prevMonth() {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (!canGoToNextMonth) return;
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`blank-${i}`} />);
  }

  for (let d = 1; d <= total; d++) {
    const date = `${monthStr}-${String(d).padStart(2, "0")}`;
    const isFuture = date > today;
    const isSelected = date === selected;
    const isToday = date === today;

    cells.push(
      <button
        key={date}
        type="button"
        disabled={isFuture}
        onClick={() => {
          onSelect(date);
          onClose();
        }}
        className={cn(
          "flex items-center justify-center size-9 rounded-lg text-sm transition-colors",
          isFuture && "opacity-30 cursor-not-allowed",
          isSelected && "bg-green-600 text-white font-semibold",
          !isSelected && isToday && "ring-2 ring-green-600 font-semibold",
          !isSelected && !isFuture && "hover:bg-muted active:bg-muted"
        )}
      >
        {d}
      </button>
    );
  }

  const sheet = (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold">
            {MONTHS_PT[viewMonth - 1]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            disabled={!canGoToNextMonth}
            aria-label="Próximo mês"
            className={cn(
              "rounded-lg p-1 text-muted-foreground hover:text-foreground",
              !canGoToNextMonth && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div>
          <div className="mb-1 grid grid-cols-7 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1 text-xs font-medium text-muted-foreground">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 place-items-center gap-y-1">{cells}</div>
        </div>
      </div>
    </BottomSheet>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
