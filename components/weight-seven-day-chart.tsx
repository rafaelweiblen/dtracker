"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  buildSevenDayDates,
  buildChartPoints,
  polylinePointsString,
  CHART_MAX_KG,
} from "@/lib/weight-seven-day-chart";
import { EditWeightBottomSheet } from "./edit-weight-bottom-sheet";
import { isFutureDate } from "@/lib/weight-state";

const VB_W = 320;
const VB_H = 168;
const PLOT_LEFT = 44;
const PLOT_RIGHT = 308;
const PLOT_TOP = 14;
const PLOT_BOTTOM = 124;

interface WeightSevenDayChartProps {
  initialWeights: Record<string, number>;
  today: string;
}

export function WeightSevenDayChart({ initialWeights, today }: WeightSevenDayChartProps) {
  const dates = useMemo(() => buildSevenDayDates(today), [today]);
  const rangeStart = dates[0];
  const rangeEnd = dates[6];

  const [weightsByDate, setWeightsByDate] =
    useState<Record<string, number>>(initialWeights);

  useEffect(() => {
    const qs = new URLSearchParams({ start: rangeStart, end: rangeEnd });
    fetch(`/api/weight/range?${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, number> | null) => {
        if (data) setWeightsByDate((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, [rangeStart, rangeEnd]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

  const plotWidth = PLOT_RIGHT - PLOT_LEFT;
  const plotHeight = PLOT_BOTTOM - PLOT_TOP;

  const points = buildChartPoints(
    dates,
    weightsByDate,
    PLOT_LEFT,
    plotWidth,
    PLOT_TOP,
    PLOT_BOTTOM
  );

  const linePts =
    points.length >= 2 ? polylinePointsString(points) : null;

  const hasAnyWeight = dates.some((d) => weightsByDate[d] != null && weightsByDate[d]! > 0);

  const yTicks = [0, 56, 112];

  function ariaSummary(): string {
    const parts = dates.map((d) => {
      const w = weightsByDate[d];
      if (w != null && w > 0) return `${d}: ${w} quilogramas`;
      return `${d}: sem registo`;
    });
    return `Gráfico de peso dos últimos sete dias. ${parts.join(". ")}.`;
  }

  function openDay(date: string, weight: number | undefined) {
    setSelectedDate(date);
    setSelectedWeight(weight ?? null);
  }

  function closeSheet() {
    setSelectedDate(null);
    setSelectedWeight(null);
  }

  function labelForColumn(date: string) {
    const [y, m, day] = date.split("-").map(Number);
    const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(
      new Date(y, m - 1, day)
    );
    return { weekday, dayNum: day };
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border bg-card p-3 shadow-sm">
          <svg
            role="img"
            aria-label={ariaSummary()}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="h-auto w-full max-h-[220px]"
          >
            <title>Peso nos últimos 7 dias</title>

            {yTicks.map((kg) => {
              const y = PLOT_BOTTOM - (kg / CHART_MAX_KG) * plotHeight;
              return (
                <g key={kg}>
                  <line
                    x1={PLOT_LEFT}
                    y1={y}
                    x2={PLOT_RIGHT}
                    y2={y}
                    className="stroke-border"
                    strokeWidth={1}
                    strokeDasharray={kg === 0 ? undefined : "4 4"}
                  />
                  <text
                    x={PLOT_LEFT - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {kg}
                  </text>
                </g>
              );
            })}

            <text
              x={4}
              y={PLOT_TOP + 6}
              className="fill-muted-foreground text-[9px]"
            >
              kg
            </text>

            {!hasAnyWeight ? (
              <text
                x={VB_W / 2}
                y={(PLOT_TOP + PLOT_BOTTOM) / 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                Nenhum peso nesta semana — toque num dia abaixo
              </text>
            ) : null}

            {linePts ? (
              <polyline
                fill="none"
                className="stroke-blue-500"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={linePts}
              />
            ) : null}

            {points.map((p) => (
              <g key={p.date}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  className="fill-blue-600 stroke-background"
                  strokeWidth={2}
                />
                <title>{`${p.date}: ${p.weight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`}</title>
              </g>
            ))}
          </svg>

          <div className="grid grid-cols-7 gap-0.5 border-t pt-2">
            {dates.map((date) => {
              const w = weightsByDate[date];
              const has = w != null && w > 0;
              const isTodayCol = date === today;
              const future = isFutureDate(date, today);
              const { weekday, dayNum } = labelForColumn(date);

              const cellClass = cn(
                "flex min-h-[64px] flex-col items-center justify-start rounded-xl px-0.5 py-2 text-center transition-colors",
                isTodayCol && "ring-2 ring-blue-400 ring-offset-2 ring-offset-background",
                has && "bg-blue-50",
                future ? "opacity-40" : "active:bg-muted/60"
              );

              const inner = (
                <>
                  <span
                    className={cn(
                      "text-[10px] capitalize leading-none text-muted-foreground",
                      isTodayCol && "font-semibold text-blue-600"
                    )}
                  >
                    {weekday}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 text-xs font-medium tabular-nums leading-none",
                      isTodayCol && "text-blue-700"
                    )}
                  >
                    {dayNum}
                  </span>
                  <span className="mt-1 text-[11px] font-semibold tabular-nums leading-none text-blue-700">
                    {has
                      ? w!.toLocaleString("pt-BR", { maximumFractionDigits: 1 })
                      : "—"}
                  </span>
                </>
              );

              if (future) {
                return (
                  <div key={date} className={cellClass}>
                    {inner}
                  </div>
                );
              }

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => openDay(date, w)}
                  className={cellClass}
                  aria-label={`Registar ou editar peso em ${date}`}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <EditWeightBottomSheet
          open={!!selectedDate}
          onClose={closeSheet}
          date={selectedDate}
          initialWeight={selectedWeight}
          onSuccess={(weight) => {
            setWeightsByDate((prev) => ({ ...prev, [selectedDate]: weight }));
          }}
          onDelete={() => {
            setWeightsByDate((prev) => {
              const { [selectedDate]: _, ...rest } = prev;
              return rest;
            });
          }}
        />
      )}
    </>
  );
}
