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
  Y_AXIS_PADDING_KG,
  parseWeightKg,
  formatYAxisKgLabel,
  addDaysIso,
} from "@/lib/weight-seven-day-chart";
import {
  computeWeightTrendBundle,
  shouldBreakSmaSegment,
} from "@/lib/weight-trend";
import { EditWeightBottomSheet } from "./edit-weight-bottom-sheet";

/** Largura lógica ampla: o SVG escala com `w-full` dentro da página (max-w-sm). */
const VB_W = 400;
/** Área até ao eixo horizontal com dias. */
const VB_H = 188;
/** Margem horizontal para rótulos de peso (textAnchor middle) não serem cortados pelo viewBox. */
const PLOT_PAD_X = 34;
const PLOT_LEFT = PLOT_PAD_X;
const PLOT_RIGHT = VB_W - PLOT_PAD_X;
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
  goalTargetKg?: number | null;
}

function buildSmaSegments(
  dates: string[],
  smaByDate: Record<string, number | null>,
  weights: Record<string, number>,
  plotLeft: number,
  plotWidth: number,
  plotTop: number,
  plotBottom: number,
  minKg: number,
  maxKg: number
): { x: number; y: number }[][] {
  const segments: { x: number; y: number }[][] = [];
  let current: { date: string; x: number; y: number }[] = [];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]!;
    const sma = smaByDate[date];
    if (sma == null) continue;
    const point = {
      date,
      x: plotLeft + (i / 6) * plotWidth,
      y: weightToSvgY(sma, plotTop, plotBottom, minKg, maxKg),
    };
    if (current.length > 0) {
      const prev = current[current.length - 1]!;
      if (shouldBreakSmaSegment(weights, prev.date, date)) {
        if (current.length >= 2) segments.push(current);
        current = [point];
        continue;
      }
    }
    current.push(point);
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

function plotLeftForIndex(index: number, plotLeft: number, plotWidth: number): number {
  return plotLeft + (index / 6) * plotWidth;
}

function dayTicksX(plotLeft: number, plotWidth: number): number[] {
  const xs: number[] = [];
  for (let i = 0; i < 7; i++) {
    xs.push(plotLeft + (i / 6) * plotWidth);
  }
  return xs;
}

export function WeightSevenDayChart({
  initialWeights,
  today,
  goalTargetKg = null,
}: WeightSevenDayChartProps) {
  const dates = useMemo(() => buildSevenDayDates(today), [today]);
  const historyStart = useMemo(() => addDaysIso(today, -89), [today]);
  const rangeEnd = dates[6]!;

  const [weightsByDate, setWeightsByDate] =
    useState<Record<string, number>>(initialWeights);

  useEffect(() => {
    const qs = new URLSearchParams({ start: historyStart, end: rangeEnd });
    fetch(`/api/weight/range?${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, unknown> | null) => {
        if (!data) return;
        const normalized: Record<string, number> = {};
        for (const [k, v] of Object.entries(data)) {
          const w = parseWeightKg(v);
          if (w != null) normalized[k] = w;
        }
        setWeightsByDate((prev) => ({ ...prev, ...normalized }));
      })
      .catch(() => {});
  }, [historyStart, rangeEnd]);

  const trend = useMemo(
    () =>
      computeWeightTrendBundle({
        today,
        weights: weightsByDate,
        goalTargetKg,
      }),
    [today, weightsByDate, goalTargetKg]
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

  const plotWidth = PLOT_RIGHT - PLOT_LEFT;
  const dayXs = dayTicksX(PLOT_LEFT, plotWidth);

  const domainWeights = useMemo(() => {
    const merged: Record<string, number> = { ...weightsByDate };
    for (const d of dates) {
      const sma = trend.smaByDate[d];
      if (sma != null) merged[`sma:${d}`] = sma;
    }
    for (const p of trend.projectionPoints) {
      if (dates.includes(p.date)) merged[`proj:${p.date}`] = p.weight;
    }
    return merged;
  }, [weightsByDate, dates, trend]);

  const { minKg: yMinKg, maxKg: yMaxKg } = useMemo(
    () => computeChartYDomain(dates, domainWeights),
    [dates, domainWeights]
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

  const smaSegments = buildSmaSegments(
    dates,
    trend.smaByDate,
    weightsByDate,
    PLOT_LEFT,
    plotWidth,
    PLOT_TOP,
    PLOT_BOTTOM,
    yMinKg,
    yMaxKg
  );

  const projectionPts = useMemo(() => {
    const visible = new Set(dates);
    const pts: { x: number; y: number }[] = [];
    const anchorSma = trend.smaByDate[trend.anchor];
    if (visible.has(trend.anchor) && anchorSma != null) {
      const i = dates.indexOf(trend.anchor);
      if (i >= 0) {
        pts.push({
          x: plotLeftForIndex(i, PLOT_LEFT, plotWidth),
          y: weightToSvgY(anchorSma, PLOT_TOP, PLOT_BOTTOM, yMinKg, yMaxKg),
        });
      }
    }
    for (const p of trend.projectionPoints) {
      if (!visible.has(p.date)) continue;
      const i = dates.indexOf(p.date);
      if (i < 0) continue;
      pts.push({
        x: plotLeftForIndex(i, PLOT_LEFT, plotWidth),
        y: weightToSvgY(p.weight, PLOT_TOP, PLOT_BOTTOM, yMinKg, yMaxKg),
      });
    }
    return pts.length >= 2 ? pts : null;
  }, [dates, trend, yMinKg, yMaxKg, plotWidth]);

  const hasAnyWeight = dates.some((d) => weightsByDate[d] != null && weightsByDate[d]! > 0);
  const showProjection =
    trend.eligibleForProjection && !trend.gapPaused && projectionPts != null;

  const yTicks = yAxisTickValuesKg(yMinKg, yMaxKg);

  function ariaSummary(): string {
    const parts = dates.map((d) => {
      const w = weightsByDate[d];
      const sma = trend.smaByDate[d];
      if (w != null && w > 0) {
        const smaPart =
          sma != null
            ? `, média móvel ${sma.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`
            : "";
        return `${d}: ${w} quilogramas${smaPart}`;
      }
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

  function handlePointKeyDown(
    e: React.KeyboardEvent<SVGGElement>,
    date: string,
    weight: number | undefined
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDay(date, weight);
    }
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
    return `Eixo vertical com margem de ${Y_AXIS_PADDING_KG} quilos para cima e para baixo da média dos últimos 7 dias. Linha contínua: peso registado. Linha tracejada: média móvel de 7 dias.`;
  }

  return (
    <>
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="w-full min-w-0 overflow-visible rounded-2xl bg-card py-3">
          <span className="sr-only">
            {xAxisLegendSr()} Valores em quilogramas.
          </span>
          <svg
            role="img"
            aria-label={`${ariaSummary()} ${xAxisLegendSr()}`}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="h-auto w-full max-h-[280px] min-w-0 overflow-visible"
          >
            <title>Peso nos últimos 7 dias com média móvel de 7 dias.</title>

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
              const isInterior = kg > yMinKg && kg < yMaxKg;
              const isDomainTop = kg === yMaxKg;
              const showYLabel = kg > yMinKg && kg < yMaxKg;
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
                      strokeWidth={isDomainTop ? 1 : 0.75}
                      strokeDasharray={isDomainTop ? "6 4" : "3 6"}
                    />
                  ) : null}
                  {showYLabel ? (
                    <text
                      x={PLOT_LEFT - 4}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-muted-foreground tabular-nums text-[9px]"
                    >
                      {formatYAxisKgLabel(kg)}
                    </text>
                  ) : null}
                </g>
              );
            })}

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
                      "tabular-nums font-semibold",
                      isTodayMark ? "fill-primary text-[12px]" : "fill-foreground text-[11px]"
                    )}
                  >
                    {dayNum}
                  </text>
                  <text
                    x={x}
                    y={X_AXIS_WEEKDAY_Y}
                    textAnchor="middle"
                    className={cn(
                      "text-[9px] capitalize leading-none",
                      isTodayMark
                        ? "fill-primary font-semibold"
                        : "fill-muted-foreground"
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
                Toque ou foque um ponto para registar peso
              </text>
            ) : null}

            {smaSegments.map((seg, idx) => (
              <polyline
                key={`sma-${idx}`}
                fill="none"
                className="stroke-muted-foreground"
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="6 4"
                points={seg.map((p) => `${p.x},${p.y}`).join(" ")}
              />
            ))}

            {showProjection ? (
              <polyline
                fill="none"
                className="stroke-foreground"
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="4 4"
                points={projectionPts!.map((p) => `${p.x},${p.y}`).join(" ")}
              />
            ) : null}

            {linePts ? (
              <polyline
                fill="none"
                className="stroke-primary"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={linePts}
              />
            ) : null}

            {points.map((p) => {
              const labelTooHigh = p.y < PLOT_TOP + 22;
              return (
              <g
                key={p.date}
                tabIndex={0}
                onClick={() => openDay(p.date, p.weight)}
                onKeyDown={(e) => handlePointKeyDown(e, p.date, p.weight)}
                className="cursor-pointer outline-none focus-visible:[&_circle]:stroke-ring focus-visible:[&_circle]:stroke-[3]"
                role="button"
                aria-label={`Editar peso de ${p.date}`}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  className="fill-primary stroke-background"
                  strokeWidth={2}
                />
                <text
                  x={p.x}
                  y={labelTooHigh ? p.y + 16 : p.y - 10}
                  textAnchor="middle"
                  className="fill-primary text-[11px] font-semibold tabular-nums"
                >
                  {p.weight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                </text>
                <title>{`${p.date}: ${p.weight.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`}</title>
              </g>
            );
            })}
          </svg>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 px-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 rounded bg-primary" aria-hidden />
              Peso registado
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-0.5 w-4 rounded border-t border-dashed border-muted-foreground"
                aria-hidden
              />
              Média 7 dias
            </span>
            {showProjection ? (
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-0.5 w-4 rounded border-t border-dashed border-foreground"
                  aria-hidden
                />
                Projeção
              </span>
            ) : null}
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
