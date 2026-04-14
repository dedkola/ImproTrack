"use client";

import { useMemo, useRef, useState, useCallback } from "react";
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
import { completedSlotsInDay } from "@/lib/stats";
import type { HabitTone } from "@/lib/habits";
import { getChartColorsFromHex } from "@/lib/tone-utils";
import { DatePicker } from "@/components/date-picker";

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

type TimePreset = "7" | "30" | "custom";
type DayPoint = { dateKey: string; ratio: number };

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
  const slotCount = timeSlots.length || 1;
  return eachDay(range).map((dateKey) => {
    const done = completedSlotsInDay(records, habitId, dateKey, timeSlots);
    return { dateKey, ratio: done / slotCount };
  });
}


// ---- Line Chart (rolling 7-day completion rate) ----------------------------

function LineChartViz({
  points,
  fillClass,
  strokeClass,
  inlineColor,
}: {
  points: DayPoint[];
  fillClass: string;
  strokeClass: string;
  inlineColor?: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (points.length < 2) return <ChartEmpty />;

  const VW = 1000;
  const VH = 160;
  const P = { t: 20, r: 6, b: 32, l: 32 };
  const PW = VW - P.l - P.r;
  const PH = VH - P.t - P.b;

  // Rolling 7-day completion rate per day
  const rates = points.map((_, i) => {
    const win = points.slice(Math.max(0, i - 6), i + 1);
    return win.reduce((sum, p) => sum + p.ratio, 0) / win.length;
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * VW;
      const idx = Math.round((mouseX - P.l) / stepX);
      if (idx >= 0 && idx < n) {
        setHoverIndex(idx);
      } else {
        setHoverIndex(null);
      }
    },
    [n, stepX],
  );

  const handleMouseLeave = useCallback(() => setHoverIndex(null), []);

  const hp = hoverIndex !== null ? pathPts[hoverIndex] : null;
  const hRate = hoverIndex !== null ? rates[hoverIndex] : 0;
  const hPoint = hoverIndex !== null ? points[hoverIndex] : null;
  const hDate = hPoint ? parseDateKey(hPoint.dateKey) : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      className="cursor-crosshair"
      aria-label="7-day rolling completion rate line chart"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
        className={inlineColor ? undefined : fillClass}
        fill={inlineColor}
        fillOpacity={0.14}
        style={{ stroke: "none" }}
      />

      {/* Line */}
      <path
        d={linePath}
        className={inlineColor ? undefined : strokeClass}
        style={{ fill: "none" }}
        stroke={inlineColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hover guide */}
      {hp && hPoint && hDate && (
        <g>
          {/* Vertical line */}
          <line
            x1={hp.x}
            y1={P.t}
            x2={hp.x}
            y2={P.t + PH}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {/* Dot */}
          <circle
            cx={hp.x}
            cy={hp.y}
            r={5}
            className={inlineColor ? undefined : fillClass}
            fill={inlineColor}
            stroke="white"
            strokeWidth={2.5}
          />
          {/* Tooltip background */}
          {(() => {
            const tw = 110;
            const th = 38;
            let tx = hp.x - tw / 2;
            if (tx < 2) tx = 2;
            if (tx + tw > VW - 2) tx = VW - 2 - tw;
            const ty = hp.y - th - 10;
            const finalTy = ty < 2 ? hp.y + 12 : ty;
            return (
              <>
                <rect
                  x={tx}
                  y={finalTy}
                  width={tw}
                  height={th}
                  rx={6}
                  fill="white"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth={1}
                  filter="drop-shadow(0 1px 3px rgba(0,0,0,0.1))"
                />
                <text
                  x={tx + tw / 2}
                  y={finalTy + 15}
                  fontSize={10}
                  fontWeight="600"
                  fill="#6D28D9"
                  textAnchor="middle"
                >
                  {Math.round(hRate * 100)}% —{" "}
                  {hDate.toLocaleString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
                <text
                  x={tx + tw / 2}
                  y={finalTy + 29}
                  fontSize={9}
                  fill="#8090a5"
                  textAnchor="middle"
                >
                  {Math.round(hPoint.ratio * 100)}% day · 7d avg
                </text>
              </>
            );
          })()}
        </g>
      )}

      {/* Default end dot (when not hovering) */}
      {hoverIndex === null && (
        <circle
          cx={pathPts[n - 1].x}
          cy={pathPts[n - 1].y}
          r={4}
          className={inlineColor ? undefined : fillClass}
          fill={inlineColor}
          stroke="white"
          strokeWidth={2}
        />
      )}

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
  const hexColors = tone.hex ? getChartColorsFromHex(tone.hex) : null;

  const doneCount = points.filter((p) => p.ratio === 1).length;
  const rate = points.length
    ? Math.round((doneCount / points.length) * 100)
    : 0;

  const PRESET_OPTIONS: { value: TimePreset; label: string }[] = [
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "custom", label: "Custom" },
  ];

  const CONTROL_BTN_BASE =
    "pill-btn h-8 shrink-0 rounded-full px-3 text-[12px] font-semibold leading-none transition";

  return (
    <section className="animate-fade-in-up surface-panel rounded-[28px] p-4 sm:p-6">
      {/* Controls row */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[13px] font-semibold text-ink-950">Chart</h2>

        <div className="comparison-scroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0 sm:pb-0">
          {PRESET_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value)}
              aria-pressed={preset === value}
              className={`${CONTROL_BTN_BASE} ${
                preset === value
                  ? "bg-[#6D28D9] text-white shadow-[0_1px_3px_rgba(109,40,217,0.35)]"
                  : "bg-ink-950/[0.04] text-ink-700 hover:bg-ink-950/[0.08]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range inputs */}
      {preset === "custom" && (
        <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
          <DatePicker
            label="From"
            value={customFrom}
            max={customTo}
            onChange={(v) => setCustomFrom(v)}
            size="compact"
          />
          <span className="text-[11px] text-ink-700">–</span>
          <DatePicker
            label="To"
            value={customTo}
            min={customFrom}
            max={todayKey}
            onChange={(v) => setCustomTo(v)}
            size="compact"
          />
        </div>
      )}

      {/* Chart area */}
      <div className="mt-3.5 min-h-[100px]">
        <div className="w-full">
          <LineChartViz
            points={points}
            fillClass={svgTone.fill}
            strokeClass={svgTone.stroke}
            inlineColor={hexColors?.fill}
          />
        </div>
      </div>

      {/* Summary */}
      <p className="mt-3 text-[12px] leading-5 text-ink-700">
        {doneCount} / {points.length} days completed &middot; {rate}% completion
        rate · 7-day rolling average
      </p>
    </section>
  );
}
