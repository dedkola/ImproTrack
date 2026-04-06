"use client";

import { useMemo, useState } from "react";
import {
  eachDay,
  getRollingRange,
  parseDateKey,
  startOfDay,
  subtractDays,
  toDateKey,
  type DateRange,
} from "@/lib/date";
import type { HabitRecords } from "@/lib/storage";
import { isDayFullyCompleted } from "@/lib/stats";
import type { HabitTone } from "@/lib/habits";

// ---- SVG smooth curve helper -----------------------------------------------
// Catmull-Rom → cubic Bézier conversion (tension 0.4) for pretty line charts.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;
    d.push(
      `C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}

// ---- Types -----------------------------------------------------------------

type ChartView = "timeline" | "bar" | "histogram" | "line";
type TimePreset = "7" | "30" | "custom";
type DayPoint = { dateKey: string; completed: boolean };

// ---- Tone → SVG class lookup -----------------------------------------------
// Explicit strings required so Tailwind's scanner picks them up at build time.

const CHART_TONES: Record<string, { fill: string; stroke: string }> = {
  "bg-sky-600": { fill: "fill-sky-600", stroke: "stroke-sky-600" },
  "bg-sky-500": { fill: "fill-sky-500", stroke: "stroke-sky-500" },
  "bg-emerald-600": { fill: "fill-emerald-600", stroke: "stroke-emerald-600" },
  "bg-emerald-500": { fill: "fill-emerald-500", stroke: "stroke-emerald-500" },
  "bg-violet-600": { fill: "fill-violet-600", stroke: "stroke-violet-600" },
  "bg-violet-500": { fill: "fill-violet-500", stroke: "stroke-violet-500" },
  "bg-amber-600": { fill: "fill-amber-600", stroke: "stroke-amber-600" },
  "bg-amber-500": { fill: "fill-amber-500", stroke: "stroke-amber-500" },
  "bg-rose-600": { fill: "fill-rose-600", stroke: "stroke-rose-600" },
  "bg-rose-500": { fill: "fill-rose-500", stroke: "stroke-rose-500" },
  "bg-teal-600": { fill: "fill-teal-600", stroke: "stroke-teal-600" },
  "bg-teal-500": { fill: "fill-teal-500", stroke: "stroke-teal-500" },
  "bg-indigo-600": { fill: "fill-indigo-600", stroke: "stroke-indigo-600" },
  "bg-indigo-500": { fill: "fill-indigo-500", stroke: "stroke-indigo-500" },
  "bg-slate-600": { fill: "fill-slate-600", stroke: "stroke-slate-600" },
  "bg-slate-500": { fill: "fill-slate-500", stroke: "stroke-slate-500" },
};

// ---- Helpers ----------------------------------------------------------------

const today = startOfDay(new Date());
const todayKey = toDateKey(today);

function buildPoints(
  records: HabitRecords,
  habitId: string,
  timeSlots: string[],
  range: DateRange,
): DayPoint[] {
  return eachDay(range).map((dateKey) => ({
    dateKey,
    completed: isDayFullyCompleted(records, habitId, dateKey, timeSlots),
  }));
}

// ---- Timeline (contribution grid) ------------------------------------------

function TimelineChart({
  points,
  fillClass,
}: {
  points: DayPoint[];
  fillClass: string;
}) {
  const CELL = 18;
  const GAP = 4;
  const STEP = CELL + GAP;
  const LABEL_H = 24;
  const LABEL_W = 18;

  if (points.length === 0) return <ChartEmpty />;

  const first = parseDateKey(points[0].dateKey);
  const dayOffset = (first.getDay() + 6) % 7; // Mon = 0
  const cols = Math.ceil((points.length + dayOffset) / 7);
  const svgW = LABEL_W + cols * STEP;
  const svgH = LABEL_H + 7 * STEP;

  // Collect one label per distinct month
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  points.forEach((p, i) => {
    const d = parseDateKey(p.dateKey);
    const col = Math.floor((i + dayOffset) / 7);
    if (d.getMonth() !== lastMonth) {
      lastMonth = d.getMonth();
      monthLabels.push({
        col,
        label: d.toLocaleString("en", { month: "short" }),
      });
    }
  });

  const weekdayLabels = ["M", "", "W", "", "F", "", "S"];

  return (
    <div className="overflow-x-auto pb-1">
      <svg
        width={svgW}
        height={svgH}
        aria-label="Completion timeline"
        style={{ display: "block" }}
      >
        {/* Weekday labels */}
        {weekdayLabels.map((label, row) =>
          label ? (
            <text
              key={row}
              x={LABEL_W - 3}
              y={LABEL_H + row * STEP + CELL - 2}
              fontSize={9}
              fill="#8090a5"
              textAnchor="end"
            >
              {label}
            </text>
          ) : null,
        )}

        {/* Month labels */}
        {monthLabels.map(({ col, label }) => (
          <text
            key={`${col}-${label}`}
            x={LABEL_W + col * STEP}
            y={LABEL_H - 6}
            fontSize={9}
            fill="#8090a5"
          >
            {label}
          </text>
        ))}

        {/* Day cells */}
        {points.map((p, i) => {
          const col = Math.floor((i + dayOffset) / 7);
          const row = (i + dayOffset) % 7;
          return (
            <rect
              key={p.dateKey}
              x={LABEL_W + col * STEP}
              y={LABEL_H + row * STEP}
              width={CELL}
              height={CELL}
              rx={3}
              className={p.completed ? fillClass : undefined}
              fill={p.completed ? undefined : "rgba(0,0,0,0.06)"}
            >
              <title>
                {p.dateKey}: {p.completed ? "Done ✓" : "Missed"}
              </title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}

// ---- Bar Chart (one bar per day) -------------------------------------------

function BarChartViz({
  points,
  fillClass,
}: {
  points: DayPoint[];
  fillClass: string;
}) {
  if (points.length === 0) return <ChartEmpty />;

  const VW = 600;
  const VH = 200;
  const P = { t: 16, r: 12, b: 36, l: 12 };
  const PW = VW - P.l - P.r;
  const PH = VH - P.t - P.b;

  const n = points.length;
  const step = PW / n;
  const barW = Math.max(5, Math.min(24, step * 0.7));
  const labelEvery = n <= 7 ? 1 : n <= 14 ? 2 : 7;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      aria-label="Daily completion bar chart"
    >
      {/* Background track per bar */}
      {points.map((p, i) => {
        const x = P.l + i * step + step / 2 - barW / 2;
        return (
          <rect
            key={`track-${p.dateKey}`}
            x={x}
            y={P.t}
            width={barW}
            height={PH}
            rx={Math.min(4, barW / 4)}
            className={fillClass}
            fillOpacity={0.07}
          />
        );
      })}

      {/* Bars */}
      {points.map((p, i) => {
        const barH = p.completed ? PH : 4;
        const x = P.l + i * step + step / 2 - barW / 2;
        const y = P.t + PH - barH;
        return (
          <rect
            key={p.dateKey}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={Math.min(4, barW / 4)}
            className={fillClass}
            fillOpacity={p.completed ? 0.9 : 0.3}
          >
            <title>
              {p.dateKey}: {p.completed ? "Done ✓" : "Missed"}
            </title>
          </rect>
        );
      })}

      {/* X-axis labels */}
      {points
        .filter((_, i) => i % labelEvery === 0)
        .map((p) => {
          const i = points.indexOf(p);
          const x = P.l + i * step + step / 2;
          const d = parseDateKey(p.dateKey);
          return (
            <text
              key={p.dateKey}
              x={x}
              y={VH - 10}
              fontSize={9}
              fill="#8090a5"
              textAnchor="middle"
            >
              {d.toLocaleString("en", { month: "short", day: "numeric" })}
            </text>
          );
        })}
    </svg>
  );
}

// ---- Histogram (weekly buckets) --------------------------------------------

function HistogramChart({
  points,
  fillClass,
}: {
  points: DayPoint[];
  fillClass: string;
}) {
  if (points.length === 0) return <ChartEmpty />;

  // Group into Monday-based weeks
  const weekMap = new Map<string, { completed: number; total: number }>();
  points.forEach((p) => {
    const d = parseDateKey(p.dateKey);
    const offset = (d.getDay() + 6) % 7;
    const mon = new Date(d);
    mon.setDate(d.getDate() - offset);
    const key = toDateKey(mon);
    const prev = weekMap.get(key) ?? { completed: 0, total: 0 };
    weekMap.set(key, {
      completed: prev.completed + (p.completed ? 1 : 0),
      total: prev.total + 1,
    });
  });
  const weeks = Array.from(weekMap.entries()).map(([key, v]) => ({
    key,
    ...v,
  }));

  const VW = 600;
  const VH = 200;
  const P = { t: 18, r: 12, b: 36, l: 32 };
  const PW = VW - P.l - P.r;
  const PH = VH - P.t - P.b;
  const Y_MAX = 7;
  const step = PW / weeks.length;
  const barW = Math.min(60, step * 0.65);

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      aria-label="Weekly completion histogram"
    >
      {/* Gridlines at 0, 3, 7 */}
      {[0, 3, 7].map((v) => {
        const y = P.t + PH * (1 - v / Y_MAX);
        return (
          <g key={v}>
            <line
              x1={P.l}
              y1={y}
              x2={P.l + PW}
              y2={y}
              stroke="rgba(0,0,0,0.07)"
              strokeWidth={1}
              strokeDasharray={v === 0 ? "none" : "3 3"}
            />
            <text
              x={P.l - 6}
              y={y + 3}
              fontSize={8}
              fill="#8090a5"
              textAnchor="end"
            >
              {v}d
            </text>
          </g>
        );
      })}

      {/* Background track per week */}
      {weeks.map(({ key }, i) => {
        const x = P.l + i * step + step / 2 - barW / 2;
        return (
          <rect
            key={`track-${key}`}
            x={x}
            y={P.t}
            width={barW}
            height={PH}
            rx={Math.min(5, barW / 5)}
            className={fillClass}
            fillOpacity={0.06}
          />
        );
      })}

      {/* Bars */}
      {weeks.map(({ key, completed, total }, i) => {
        const barH = Math.max(4, (completed / Y_MAX) * PH);
        const x = P.l + i * step + step / 2 - barW / 2;
        const y = P.t + PH - barH;
        const d = parseDateKey(key);
        const pct = Math.round((completed / Math.max(total, 1)) * 100);
        return (
          <g key={key}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={Math.min(5, barW / 5)}
              className={fillClass}
              fillOpacity={completed === 0 ? 0.2 : 0.9}
            >
              <title>
                Week of {key}: {completed}/{total} days ({pct}%)
              </title>
            </rect>
            {/* Day count label inside tall bars */}
            {completed >= 3 && (
              <text
                x={x + barW / 2}
                y={y + 14}
                fontSize={10}
                fill="white"
                textAnchor="middle"
                fontWeight="600"
              >
                {completed}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={VH - 10}
              fontSize={9}
              fill="#8090a5"
              textAnchor="middle"
            >
              {d.toLocaleString("en", { month: "short", day: "numeric" })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- Line Chart (rolling 7-day completion rate) ----------------------------

function LineChartViz({
  points,
  fillClass,
  strokeClass,
}: {
  points: DayPoint[];
  fillClass: string;
  strokeClass: string;
}) {
  if (points.length < 2) return <ChartEmpty />;

  const VW = 600;
  const VH = 200;
  const P = { t: 20, r: 16, b: 32, l: 38 };
  const PW = VW - P.l - P.r;
  const PH = VH - P.t - P.b;

  // Rolling 7-day completion rate per day
  const rates = points.map((_, i) => {
    const win = points.slice(Math.max(0, i - 6), i + 1);
    return win.filter((p) => p.completed).length / win.length;
  });

  const n = rates.length;
  const stepX = PW / Math.max(n - 1, 1);

  const pathPts = rates.map((r, i) => ({
    x: P.l + i * stepX,
    y: P.t + PH * (1 - r),
  }));

  const linePath = smoothPath(pathPts);

  const areaPath =
    `M${pathPts[0].x.toFixed(1)},${(P.t + PH).toFixed(1)} ` +
    linePath.slice(linePath.indexOf(" ") + 1) +
    ` L${pathPts[n - 1].x.toFixed(1)},${(P.t + PH).toFixed(1)}Z`;

  const labelEvery = n <= 7 ? 1 : n <= 14 ? 2 : 7;
  const last = pathPts[n - 1];

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      aria-label="7-day rolling completion rate line chart"
    >
      {/* Y-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = P.t + PH * (1 - pct);
        const isKey = pct === 0 || pct === 0.5 || pct === 1;
        return (
          <g key={pct}>
            <line
              x1={P.l}
              y1={y}
              x2={P.l + PW}
              y2={y}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={isKey ? 1 : 0.5}
              strokeDasharray={isKey ? undefined : "3 3"}
            />
            {isKey && (
              <text
                x={P.l - 6}
                y={y + 4}
                fontSize={9}
                fill="#8090a5"
                textAnchor="end"
              >
                {`${Math.round(pct * 100)}%`}
              </text>
            )}
          </g>
        );
      })}

      {/* Area fill */}
      <path
        d={areaPath}
        className={fillClass}
        fillOpacity={0.14}
        style={{ stroke: "none" }}
      />

      {/* Line */}
      <path
        d={linePath}
        className={strokeClass}
        style={{ fill: "none" }}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      <circle
        cx={last.x}
        cy={last.y}
        r={4}
        className={fillClass}
        stroke="white"
        strokeWidth={2}
      />

      {/* X-axis labels */}
      {points
        .filter((_, i) => i % labelEvery === 0)
        .map((p) => {
          const i = points.indexOf(p);
          const x = P.l + i * stepX;
          const d = parseDateKey(p.dateKey);
          return (
            <text
              key={p.dateKey}
              x={x}
              y={VH - 8}
              fontSize={9}
              fill="#8090a5"
              textAnchor="middle"
            >
              {d.toLocaleString("en", { month: "short", day: "numeric" })}
            </text>
          );
        })}
    </svg>
  );
}

// ---- Empty state ------------------------------------------------------------

function ChartEmpty() {
  return (
    <div className="flex h-28 items-center justify-center text-[13px] text-ink-700">
      No data for this period
    </div>
  );
}

// ---- Main exported component -----------------------------------------------

export function HabitChart({
  records,
  habitId,
  timeSlots,
  tone,
}: {
  records: HabitRecords;
  habitId: string;
  timeSlots: string[];
  tone: HabitTone;
}) {
  const [view, setView] = useState<ChartView>("line");
  const [preset, setPreset] = useState<TimePreset>("30");
  const [customFrom, setCustomFrom] = useState(
    toDateKey(subtractDays(today, 29)),
  );
  const [customTo, setCustomTo] = useState(todayKey);

  const range = useMemo((): DateRange => {
    if (preset === "custom") return { from: customFrom, to: customTo };
    return getRollingRange(Number(preset), today);
  }, [preset, customFrom, customTo]);

  const points = useMemo(
    () => buildPoints(records, habitId, timeSlots, range),
    [records, habitId, timeSlots, range],
  );

  const svgTone = CHART_TONES[tone.fill] ?? {
    fill: "fill-slate-600",
    stroke: "stroke-slate-600",
  };

  const doneCount = points.filter((p) => p.completed).length;
  const rate = points.length
    ? Math.round((doneCount / points.length) * 100)
    : 0;

  const VIEW_OPTIONS: { value: ChartView; label: string }[] = [
    { value: "line", label: "Line" },
    { value: "bar", label: "Bar" },
    { value: "histogram", label: "Histogram" },
    { value: "timeline", label: "Timeline" },
  ];

  const PRESET_OPTIONS: { value: TimePreset; label: string }[] = [
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <section className="animate-fade-in-up surface-panel rounded-2xl p-5 sm:p-6">
      {/* Controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[13px] font-semibold text-ink-950">Chart</h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart type */}
          <div className="flex flex-wrap gap-1">
            {VIEW_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`pill-btn tap-target-compact rounded-lg px-3 py-2 text-[12px] font-medium transition ${
                  view === value
                    ? "bg-ink-950 text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                    : "bg-ink-950/[0.04] text-ink-700 hover:bg-ink-950/[0.08]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Time preset */}
          <div className="flex gap-1">
            {PRESET_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreset(value)}
                className={`pill-btn tap-target-compact rounded-lg px-3 py-2 text-[12px] font-medium transition ${
                  preset === value
                    ? "bg-ink-950 text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                    : "bg-ink-950/[0.04] text-ink-700 hover:bg-ink-950/[0.08]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom date range inputs */}
      {preset === "custom" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex min-h-10 items-center gap-2 rounded-lg bg-ink-950/[0.04] px-3 py-2 text-[13px] text-ink-700 transition hover:bg-ink-950/[0.06]">
            <span className="font-medium">From</span>
            <input
              type="date"
              value={customFrom}
              max={customTo}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-transparent text-ink-950 focus:outline-none"
            />
          </label>
          <span className="text-[13px] text-ink-700">–</span>
          <label className="flex min-h-10 items-center gap-2 rounded-lg bg-ink-950/[0.04] px-3 py-2 text-[13px] text-ink-700 transition hover:bg-ink-950/[0.06]">
            <span className="font-medium">To</span>
            <input
              type="date"
              value={customTo}
              min={customFrom}
              max={todayKey}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-transparent text-ink-950 focus:outline-none"
            />
          </label>
        </div>
      )}

      {/* Chart area */}
      <div className="mt-5 min-h-[100px] max-w-3xl">
        {view === "timeline" && (
          <TimelineChart points={points} fillClass={svgTone.fill} />
        )}
        {view === "bar" && (
          <BarChartViz points={points} fillClass={svgTone.fill} />
        )}
        {view === "histogram" && (
          <HistogramChart points={points} fillClass={svgTone.fill} />
        )}
        {view === "line" && (
          <LineChartViz
            points={points}
            fillClass={svgTone.fill}
            strokeClass={svgTone.stroke}
          />
        )}
      </div>

      {/* Summary */}
      <p className="mt-3 text-[12px] text-ink-700">
        {doneCount} / {points.length} days completed &middot; {rate}% completion
        rate
        {view === "line" && " \u00b7 7-day rolling average"}
        {view === "histogram" && " \u00b7 grouped by week"}
      </p>
    </section>
  );
}
