"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  buildSevenDayDates,
  buildChartPoints,
  polylinePointsString,
  computeChartYDomain,
  weightToSvgY,
  yAxisTickValuesKg,
  Y_AXIS_STEP_20_KG,
  Y_AXIS_STEP_30_KG,
} from "@/lib/weight-seven-day-chart";
import { EditWeightBottomSheet } from "./edit-weight-bottom-sheet";
import { isFutureDate } from "@/lib/weight-state";

const VB_W = 336;
/** Área até ao eixo horizontal com dias. */
const VB_H = 188;
const PLOT_LEFT = 40;
const PLOT_RIGHT = 318;
const PLOT_TOP = 16;
/** Base da área de plot antes dos rótulos dos dias no SVG */
const PLOT_BOTTOM = 110;
/** Y dos números do dia (eixo horizontal). */
const X_AXIS_DAY_NUM_Y = 124;
/** Y das abrev. do dia na semana. */
const X_AXIS_WEEKDAY_Y = 139;

interface WeightSevenDayChartProps {
  initialWeights: Record<string, number>;
  today: string;
}

function dayTicksX(plotLeft: number, plotWidth: number): number[] {
  const xs: number[] = [];
  for (let i = 0; i < 7; i++) {
    xs.push(plotLeft + (i / 6) * plotWidth);
  }
  return xs;
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
  const dayXs = dayTicksX(PLOT_LEFT, plotWidth);

  const { minKg: yMinKg, maxKg: yMaxKg } = useMemo(
    () => computeChartYDomain(dates, weightsByDate),
    [dates, weightsByDate]
  );

  const points = buildChartPoints(
    dates,
    weightsByDate,
    PLOT_LEFT,
    plotWidth,
    PLOT_TOP,
    PLOT_BOTTOM,
    yMinKg,
    yMaxKg
  );

  const linePts = points.length >= 2 ? polylinePointsString(points) : null;

  const hasAnyWeight = dates.some((d) => weightsByDate[d] != null && weightsByDate[d]! > 0);

  const yTicks = yAxisTickValuesKg(yMinKg, yMaxKg);

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
    const [yy, mm, dd] = date.split("-").map(Number);
    const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(
      new Date(yy, mm - 1, dd)
    );
    const weekdayTiny = weekday.replace(".", "");
    return { weekday: weekdayTiny, dayNum: dd };
  }

  function xAxisLegendSr(): string {
    return `Eixo vertical — marcas cada ${Y_AXIS_STEP_30_KG} quilos e cada ${Y_AXIS_STEP_20_KG} quilos. Linhas verticais tracejadas — dias.`;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border bg-card p-3 shadow-sm">
          <span className="sr-only">{xAxisLegendSr()}</span>
          <svg
            role="img"
            aria-label={`${ariaSummary()} ${xAxisLegendSr()}`}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="h-auto w-full max-h-[280px]"
          >
            <title>Peso nos últimos 7 dias — eixo vertical a cada {Y_AXIS_STEP_30_KG} e {Y_AXIS_STEP_20_KG} quilos.</title>

            {/* Eixo horizontal (base visual) */}
            <line
              x1={PLOT_LEFT}
              y1={PLOT_BOTTOM}
              x2={PLOT_RIGHT}
              y2={PLOT_BOTTOM}
              className="stroke-border"
              strokeWidth={1.5}
            />

            {/* Linhas tracejadas verticais por dia */}
            {dayXs.map((x, i) => (
              <line
                key={dates[i]}
                x1={x}
                y1={PLOT_TOP}
                x2={x}
                y2={PLOT_BOTTOM}
                className="stroke-muted-foreground/35"
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            ))}

            {/* Grades horizontais por valor do eixo Y */}
            {yTicks.map((kg) => {
              const y = weightToSvgY(kg, PLOT_TOP, PLOT_BOTTOM, yMinKg, yMaxKg);
              const isStep30Only =
                kg % Y_AXIS_STEP_30_KG === 0 &&
                kg % Y_AXIS_STEP_20_KG !== 0;
              const isStepBoth =
                kg % Y_AXIS_STEP_30_KG === 0 && kg % Y_AXIS_STEP_20_KG === 0;
              const isInterior = kg > yMinKg && kg < yMaxKg;
              const isDomainTop = kg === yMaxKg;
              return (
                <g key={kg}>
                  {(isInterior || isDomainTop) ? (
                    <line
                      x1={PLOT_LEFT}
                      y1={y}
                      x2={PLOT_RIGHT}
                      y2={y}
                      className={
                        isDomainTop
                          ? "stroke-muted-foreground/25"
                          : "stroke-muted-foreground/20"
                      }
                      strokeWidth={isStepBoth ? 1 : isDomainTop ? 1 : 0.75}
                      strokeDasharray={
                        isDomainTop
                          ? "6 4"
                          : isStep30Only
                            ? "8 6"
                            : isStepBoth
                              ? "2 4"
                              : "3 6"
                      }
                    />
                  ) : null}
                  <text
                    x={PLOT_LEFT - 6}
                    y={y + 3}
                    textAnchor="end"
                    className={`fill-muted-foreground tabular-nums ${
                      kg % Y_AXIS_STEP_30_KG === 0 && kg % Y_AXIS_STEP_20_KG === 0
                        ? "text-[10px] font-semibold"
                        : "text-[9px]"
                    }`}
                  >
                    {kg}
                  </text>
                </g>
              );
            })}

            <text
              x={4}
              y={PLOT_TOP + 4}
              className="fill-muted-foreground text-[9px]"
            >
              kg
            </text>

            {/* Dias no eixo horizontal (dentro do SVG) */}
            {dates.map((date, i) => {
              const { weekday, dayNum } = labelForColumn(date);
              const x = dayXs[i]!;
              const isTodayMark = date === today;
              return (
                <g key={date}>
                  <text
                    x={x}
                    y={X_AXIS_DAY_NUM_Y}
                    textAnchor="middle"
                    className={cn(
                      "fill-foreground tabular-nums font-semibold",
                      isTodayMark ? "text-[12px] text-blue-600" : "text-[11px]"
                    )}
                  >
                    {dayNum}
                  </text>
                  <text
                    x={x}
                    y={X_AXIS_WEEKDAY_Y}
                    textAnchor="middle"
                    className={cn(
                      "fill-muted-foreground text-[9px] capitalize leading-none",
                      isTodayMark && "font-semibold text-blue-600"
                    )}
                  >
                    {weekday}
                  </text>
                </g>
              );
            })}

            {!hasAnyWeight ? (
              <text
                x={VB_W / 2}
                y={(PLOT_TOP + PLOT_BOTTOM) / 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                Toque num dia abaixo para registar peso
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

            {points.map((p) => {
              const labelTooHigh = p.y < PLOT_TOP + 22;
              return (
              <g key={p.date}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  className="fill-blue-600 stroke-background"
                  strokeWidth={2}
                />
                <text
                  x={p.x}
                  y={labelTooHigh ? p.y + 16 : p.y - 10}
                  textAnchor="middle"
                  className="fill-blue-900 text-[11px] font-semibold tabular-nums"
                >
                  {p.weight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                </text>
                <title>{`${p.date}: ${p.weight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`}</title>
              </g>
            );
            })}
          </svg>

          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Toque por baixo para editar • peso aparece sobre cada ponto
          </p>
          <div className="grid grid-cols-7 gap-0.5 pt-2">
            {dates.map((date) => {
              const w = weightsByDate[date];
              const has = w != null && w > 0;
              const isTodayCol = date === today;
              const future = isFutureDate(date, today);
              const { dayNum } = labelForColumn(date);

              const cellClass = cn(
                "flex min-h-11 flex-col items-center justify-center rounded-xl px-0.5 py-2 text-center transition-colors text-[11px]",
                isTodayCol && "ring-2 ring-blue-400 ring-offset-2 ring-offset-background font-semibold text-blue-700 tabular-nums",
                !isTodayCol && "text-muted-foreground tabular-nums",
                has && "bg-blue-50/70",
                future ? "opacity-40 pointer-events-none" : "active:bg-muted/70"
              );

              const inner = has ? `${dayNum} ✓` : `${dayNum} +`;

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
