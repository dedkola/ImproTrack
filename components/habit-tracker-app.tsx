"use client";

import Link from "next/link";
import { useState } from "react";
import {
  clampDateKey,
  DateRange,
  eachDay,
  formatLongDate,
  formatMonthLabel,
  getCurrentMonthRange,
  getRollingRange,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "@/lib/date";
import { HabitDefinition } from "@/lib/habits";
import { completionRate, countCompleted, isSlotCompleted } from "@/lib/stats";
import { useHabits, useHabitRecords } from "@/lib/storage";
import { HabitForm, HabitMenu, ConfirmDialog } from "@/components/habit-form";
import { DatePicker } from "@/components/date-picker";

type PeriodPreset = "month" | "7" | "30" | "90" | "custom";

const today = startOfDay(new Date());
const todayKey = toDateKey(today);

function getPresetRange(preset: Exclude<PeriodPreset, "custom">) {
  if (preset === "month") {
    return getCurrentMonthRange(today);
  }
  return getRollingRange(Number(preset), today);
}

function getOverallRate(rates: number[]) {
  if (rates.length === 0) return 0;
  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
}

function getAppleCardGradient(fillClass: string) {
  const gradients: Record<string, string> = {
    "bg-sky-500": "from-sky-200/85 via-cyan-100/85 to-white",
    "bg-sky-600": "from-sky-200/85 via-cyan-100/85 to-white",
    "bg-emerald-500": "from-emerald-200/85 via-lime-100/85 to-white",
    "bg-emerald-600": "from-emerald-200/85 via-lime-100/85 to-white",
    "bg-violet-500": "from-violet-200/85 via-fuchsia-100/85 to-white",
    "bg-violet-600": "from-violet-200/85 via-fuchsia-100/85 to-white",
    "bg-amber-500": "from-amber-200/90 via-orange-100/85 to-white",
    "bg-amber-600": "from-amber-200/90 via-orange-100/85 to-white",
    "bg-rose-500": "from-rose-200/85 via-pink-100/85 to-white",
    "bg-rose-600": "from-rose-200/85 via-pink-100/85 to-white",
    "bg-teal-500": "from-teal-200/85 via-emerald-100/85 to-white",
    "bg-teal-600": "from-teal-200/85 via-emerald-100/85 to-white",
    "bg-indigo-500": "from-indigo-200/85 via-blue-100/85 to-white",
    "bg-indigo-600": "from-indigo-200/85 via-blue-100/85 to-white",
    "bg-slate-500": "from-slate-200/85 via-gray-100/85 to-white",
    "bg-slate-600": "from-slate-200/85 via-gray-100/85 to-white",
  };

  return gradients[fillClass] ?? "from-sky-200/80 via-cyan-100/80 to-white";
}

function getMatrixTone(fillClass: string) {
  const tones: Record<
    string,
    { cellTint: string; fill: string; glow: string; partial: string }
  > = {
    "bg-sky-500": {
      cellTint: "rgba(14, 165, 233, 0.12)",
      fill: "#0284c7",
      glow: "rgba(2, 132, 199, 0.28)",
      partial: "rgba(2, 132, 199, 0.16)",
    },
    "bg-sky-600": {
      cellTint: "rgba(14, 165, 233, 0.12)",
      fill: "#0284c7",
      glow: "rgba(2, 132, 199, 0.28)",
      partial: "rgba(2, 132, 199, 0.16)",
    },
    "bg-emerald-500": {
      cellTint: "rgba(16, 185, 129, 0.12)",
      fill: "#059669",
      glow: "rgba(5, 150, 105, 0.28)",
      partial: "rgba(5, 150, 105, 0.16)",
    },
    "bg-emerald-600": {
      cellTint: "rgba(16, 185, 129, 0.12)",
      fill: "#059669",
      glow: "rgba(5, 150, 105, 0.28)",
      partial: "rgba(5, 150, 105, 0.16)",
    },
    "bg-violet-500": {
      cellTint: "rgba(139, 92, 246, 0.12)",
      fill: "#7c3aed",
      glow: "rgba(124, 58, 237, 0.28)",
      partial: "rgba(124, 58, 237, 0.16)",
    },
    "bg-violet-600": {
      cellTint: "rgba(139, 92, 246, 0.12)",
      fill: "#7c3aed",
      glow: "rgba(124, 58, 237, 0.28)",
      partial: "rgba(124, 58, 237, 0.16)",
    },
    "bg-amber-500": {
      cellTint: "rgba(245, 158, 11, 0.14)",
      fill: "#d97706",
      glow: "rgba(217, 119, 6, 0.28)",
      partial: "rgba(217, 119, 6, 0.16)",
    },
    "bg-amber-600": {
      cellTint: "rgba(245, 158, 11, 0.14)",
      fill: "#d97706",
      glow: "rgba(217, 119, 6, 0.28)",
      partial: "rgba(217, 119, 6, 0.16)",
    },
    "bg-rose-500": {
      cellTint: "rgba(244, 63, 94, 0.12)",
      fill: "#e11d48",
      glow: "rgba(225, 29, 72, 0.28)",
      partial: "rgba(225, 29, 72, 0.16)",
    },
    "bg-rose-600": {
      cellTint: "rgba(244, 63, 94, 0.12)",
      fill: "#e11d48",
      glow: "rgba(225, 29, 72, 0.28)",
      partial: "rgba(225, 29, 72, 0.16)",
    },
    "bg-teal-500": {
      cellTint: "rgba(13, 148, 136, 0.12)",
      fill: "#0f766e",
      glow: "rgba(15, 118, 110, 0.28)",
      partial: "rgba(15, 118, 110, 0.16)",
    },
    "bg-teal-600": {
      cellTint: "rgba(13, 148, 136, 0.12)",
      fill: "#0f766e",
      glow: "rgba(15, 118, 110, 0.28)",
      partial: "rgba(15, 118, 110, 0.16)",
    },
    "bg-indigo-500": {
      cellTint: "rgba(99, 102, 241, 0.12)",
      fill: "#4f46e5",
      glow: "rgba(79, 70, 229, 0.28)",
      partial: "rgba(79, 70, 229, 0.16)",
    },
    "bg-indigo-600": {
      cellTint: "rgba(99, 102, 241, 0.12)",
      fill: "#4f46e5",
      glow: "rgba(79, 70, 229, 0.28)",
      partial: "rgba(79, 70, 229, 0.16)",
    },
    "bg-slate-500": {
      cellTint: "rgba(71, 85, 105, 0.12)",
      fill: "#475569",
      glow: "rgba(71, 85, 105, 0.28)",
      partial: "rgba(71, 85, 105, 0.16)",
    },
    "bg-slate-600": {
      cellTint: "rgba(71, 85, 105, 0.12)",
      fill: "#475569",
      glow: "rgba(71, 85, 105, 0.28)",
      partial: "rgba(71, 85, 105, 0.16)",
    },
  };

  return tones[fillClass] ?? tones["bg-sky-600"];
}

export function HabitTrackerApp() {
  const {
    activeHabits,
    categories,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
  } = useHabits();
  const { records, toggleHabitDay } = useHabitRecords(activeHabits);

  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset>("month");
  const [range, setRange] = useState<DateRange>(getCurrentMonthRange(today));
  const days = eachDay(range);

  // CRUD modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitDefinition | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<HabitDefinition | null>(
    null,
  );

  // Build row data: each habit produces 1 row (if freq=1) or N rows (one per slot)
  type GridRow = {
    habit: HabitDefinition;
    slotName: string;
    slotIndex: number;
    isFirstSlot: boolean;
    isLastSlot: boolean;
  };

  const gridRows: GridRow[] = [];
  activeHabits.forEach((habit) => {
    habit.timeSlots.forEach((slotName, slotIndex) => {
      gridRows.push({
        habit,
        slotName,
        slotIndex,
        isFirstSlot: slotIndex === 0,
        isLastSlot: slotIndex === habit.timeSlots.length - 1,
      });
    });
  });

  const habitSummaries = activeHabits.map((habit) => {
    const completed = countCompleted(
      records,
      habit.id,
      range,
      todayKey,
      habit.timeSlots,
    );
    const rate = completionRate(
      records,
      habit.id,
      range,
      todayKey,
      habit.timeSlots,
    );
    return { habit, completed, rate };
  });

  const averageRate = getOverallRate(habitSummaries.map((s) => s.rate));
  const totalCompleted = habitSummaries.reduce(
    (sum, s) => sum + s.completed,
    0,
  );

  const handlePreset = (preset: Exclude<PeriodPreset, "custom">) => {
    setSelectedPreset(preset);
    setRange(getPresetRange(preset));
  };

  const updateCustomRange = (field: keyof DateRange, value: string) => {
    const nextRange = { ...range, [field]: value };
    const orderedRange =
      nextRange.from <= nextRange.to
        ? nextRange
        : { from: nextRange.to, to: nextRange.from };
    setSelectedPreset("custom");
    setRange({
      from: clampDateKey(orderedRange.from, "2025-01-01", "2030-12-31"),
      to: clampDateKey(orderedRange.to, "2025-01-01", "2030-12-31"),
    });
  };

  const handleSave = (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
    } else {
      addHabit(data);
    }
  };

  return (
    <div className="flex min-h-full w-full flex-col">
      {/* Header */}
      <header className="header-bar sticky top-0 z-30 w-full py-3 sm:py-3.5 lg:top-0">
        <div className="page-shell flex flex-col gap-2.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <h1 className="font-display text-[20px] font-semibold leading-none tracking-tight text-ink-950">
                Dashboard
              </h1>
              <span className="hidden h-4 w-px bg-ink-950/10 sm:block" />
              <div className="hidden items-center gap-5 sm:flex">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700">Habits</span>
                  <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                    {activeHabits.length}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700">Hit rate</span>
                  <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                    {averageRate}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700">Total</span>
                  <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                    {totalCompleted}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display text-[14px] font-medium text-ink-950">
                {selectedPreset === "7"
                  ? "Last 7 days"
                  : selectedPreset === "30"
                    ? "Last 30 days"
                    : selectedPreset === "90"
                      ? "Last 90 days"
                      : formatMonthLabel(range)}
              </span>
              <Link
                href="/dashboard/stats"
                className="pill-btn tap-target-compact inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)]"
              >
                Statistics
              </Link>
              <button
                type="button"
                aria-label="Add habit"
                onClick={() => {
                  setEditingHabit(null);
                  setFormOpen(true);
                }}
                className="pill-btn tap-target-compact flex items-center gap-1.5 rounded-lg bg-ink-950 px-3 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M8 3v10M3 8h10" />
                </svg>
                Add habit
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {[
                ["month", "Monthly"],
                ["7", "7 d"],
                ["30", "30 d"],
                ["90", "90 d"],
              ].map(([value, label]) => {
                const active = selectedPreset === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      handlePreset(value as Exclude<PeriodPreset, "custom">)
                    }
                    className={`pill-btn tap-target-compact rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                      active
                        ? "bg-ink-950 text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                        : "bg-ink-950/[0.04] text-ink-700 hover:bg-ink-950/[0.08]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <DatePicker
                label="From"
                value={range.from}
                max={range.to}
                onChange={(v) => updateCustomRange("from", v)}
              />
              <DatePicker
                label="To"
                value={range.to}
                min={range.from}
                onChange={(v) => updateCustomRange("to", v)}
                align="right"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="page-shell flex flex-col gap-4 py-5">
        {activeHabits.length === 0 ? (
          <div className="surface-panel flex flex-col items-center justify-center gap-3 rounded-2xl px-8 py-16 text-center">
            <span className="text-[32px]">🎯</span>
            <h2 className="text-[18px] font-semibold text-ink-950">
              No habits yet
            </h2>
            <p className="max-w-xs text-[14px] text-ink-700">
              Create your first habit to start tracking your progress.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingHabit(null);
                setFormOpen(true);
              }}
              className="pill-btn tap-target mt-2 rounded-lg bg-ink-950 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
            >
              Create first habit
            </button>
          </div>
        ) : (
          <>
        {/* Matrix */}
        <section className="animate-scale-in surface-panel relative overflow-visible rounded-2xl">
          <div className="flex items-center justify-between border-b border-black/[0.04] px-5 py-3 sm:px-6">
            <h2 className="text-[14px] font-semibold text-ink-950">
              Habit matrix
            </h2>
            <p className="hidden text-[13px] text-ink-700 md:block">
              Tap a cell to toggle completion
            </p>
          </div>

          <div className="overflow-x-auto">
            <div
              className="min-w-max px-3 pb-3 pt-2 sm:px-4"
              style={{ minWidth: `${280 + days.length * 44}px` }}
            >
              <div
                className="grid gap-px rounded-xl bg-black/[0.02] p-px"
                style={{
                  gridTemplateColumns: `280px repeat(${days.length}, 44px)`,
                }}
              >
                {/* Column headers */}
                <div className="rounded-tl-[11px] bg-white px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-ink-700">
                  Habit
                </div>
                {days.map((dateKey, index) => {
                  const isFuture = dateKey > todayKey;
                  const weekday = new Intl.DateTimeFormat("en", {
                    weekday: "narrow",
                  }).format(parseDateKey(dateKey));

                  return (
                    <div
                      key={dateKey}
                      className={`bg-white px-1 py-3 text-center text-[12px] ${
                        index === days.length - 1 ? "rounded-tr-[11px]" : ""
                      }`}
                    >
                      <p className="font-semibold text-ink-950">
                        {dateKey.slice(-2)}
                      </p>
                      <p
                        className={
                          isFuture ? "text-ink-700/30" : "text-ink-700"
                        }
                      >
                        {weekday}
                      </p>
                    </div>
                  );
                })}

                {/* Rows */}
                {gridRows.map((row, rowIndex) => {
                  const { habit, slotName, isFirstSlot, isLastSlot } = row;
                  const isLastRow = rowIndex === gridRows.length - 1;
                  const displaySlotName =
                    habit.frequencyPerDay === 1 ? null : slotName;
                  const matrixTone = getMatrixTone(habit.tone.fill);

                  return (
                    <div key={`${habit.id}-${slotName}`} className="contents">
                      {/* Row label */}
                      <div
                        className={`sticky left-0 z-30 flex items-center gap-3 bg-white px-4 py-2.5 ${
                          isLastRow ? "rounded-bl-[11px]" : ""
                        } ${
                          !isLastSlot && habit.frequencyPerDay > 1
                            ? "border-b border-dashed border-black/[0.06]"
                            : ""
                        }`}
                      >
                        {isFirstSlot ? (
                          <div className="flex flex-1 items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[18px] leading-none">
                                {habit.icon}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-semibold text-ink-950">
                                  {habit.name}
                                  {displaySlotName && (
                                    <span className="ml-1.5 text-[12px] font-normal text-ink-700">
                                      — {displaySlotName}
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-[12px] text-ink-700">
                                  {habit.goalLabel}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${habit.tone.softFill} ${habit.tone.badge}`}
                              >
                                {completionRate(
                                  records,
                                  habit.id,
                                  range,
                                  todayKey,
                                  habit.timeSlots,
                                )}
                                %
                              </span>
                              <HabitMenu
                                tone={habit.tone}
                                onEdit={() => {
                                  setEditingHabit(habit);
                                  setFormOpen(true);
                                }}
                                onArchive={() => archiveHabit(habit.id)}
                                onDelete={() => setDeleteTarget(habit)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center pl-8">
                            <p className="text-[13px] text-ink-700">
                              {displaySlotName}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Day cells */}
                      {days.map((dateKey, colIndex) => {
                        const daySlots = records[habit.id]?.[dateKey];
                        const slotChecked = isSlotCompleted(
                          daySlots,
                          slotName,
                          {
                            fallbackToAny: habit.timeSlots.length <= 1,
                          },
                        );
                        const isFuture = dateKey > todayKey;
                        const checked = slotChecked;
                        const partial = false;
                        const buttonStyle = checked
                          ? {
                              backgroundColor: matrixTone.cellTint,
                              boxShadow: `inset 0 0 0 1.5px ${matrixTone.fill}`,
                            }
                          : undefined;
                        const checkStyle = checked
                          ? {
                              backgroundColor: matrixTone.fill,
                              borderColor: matrixTone.fill,
                              boxShadow: `0 6px 14px ${matrixTone.glow}, 0 1px 2px rgba(10, 22, 40, 0.12)`,
                            }
                          : partial
                            ? {
                                backgroundColor: matrixTone.partial,
                                borderColor: matrixTone.fill,
                              }
                            : undefined;

                        return (
                          <button
                            key={`${habit.id}-${slotName}-${dateKey}`}
                            type="button"
                            onClick={() => {
                              if (!isFuture) {
                                toggleHabitDay(habit.id, dateKey, slotName);
                              }
                            }}
                            disabled={isFuture}
                            aria-pressed={slotChecked}
                            aria-label={`${habit.name}${displaySlotName ? ` ${displaySlotName}` : ""} on ${formatLongDate(dateKey)}`}
                            className={`matrix-day-btn relative flex h-10 items-center justify-center ${
                              isLastRow && colIndex === days.length - 1
                                ? "rounded-br-[11px]"
                                : ""
                            }`}
                            style={buttonStyle}
                          >
                            {checked ? (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-[6px] rounded-[10px] opacity-100 transition-all duration-200"
                                style={{
                                  background: `linear-gradient(180deg, ${matrixTone.cellTint} 0%, rgba(255,255,255,0.88) 100%)`,
                                }}
                              />
                            ) : null}
                            <span
                              style={checkStyle}
                              className={`matrix-check relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-lg text-white transition-all duration-200 ${
                                checked
                                  ? `matrix-check-pop matrix-check-checked`
                                  : partial
                                    ? `matrix-check-partial ${habit.tone.badge} text-transparent`
                                    : "matrix-check-idle text-transparent"
                              }`}
                            >
                              {checked ? (
                                <svg
                                  viewBox="0 0 16 16"
                                  aria-hidden="true"
                                  className="h-3 w-3 opacity-100"
                                >
                                  <path
                                    d="M3.5 8.4 6.7 11.6 12.7 4.8"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                  />
                                </svg>
                              ) : partial ? (
                                <span
                                  className={`h-2 w-2 rounded-full ${habit.tone.fill} opacity-40`}
                                />
                              ) : (
                                <svg
                                  viewBox="0 0 16 16"
                                  aria-hidden="true"
                                  className="h-3 w-3 opacity-0"
                                >
                                  <path
                                    d="M3.5 8.4 6.7 11.6 12.7 4.8"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Habit cards */}
        <section className="stagger-children grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {habitSummaries.map(({ habit, completed, rate }) => (
            <Link
              key={habit.id}
              href={`/dashboard/habits/${habit.slug}`}
              className={`group relative overflow-hidden rounded-2xl border border-white/75 bg-linear-to-br ${getAppleCardGradient(habit.tone.fill)} p-4 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]`}
            >
              <div className="absolute inset-x-6 bottom-0 h-16 rounded-full bg-white/60 blur-3xl transition-transform duration-500 group-hover:scale-125" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]">{habit.icon}</span>
                    <h3 className="text-[16px] font-semibold text-ink-950">
                      {habit.name}
                    </h3>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${habit.tone.softFill}`}
                  >
                    {rate}%
                  </span>
                </div>
                <p className="text-[14px] leading-5 text-ink-700">
                  {habit.description}
                </p>
                {habit.frequencyPerDay > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {habit.timeSlots.map((slot) => (
                      <span
                        key={slot}
                        className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${habit.tone.softFill}`}
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-end justify-between pt-1">
                  <div>
                    <p className="text-[12px] text-ink-700">Completed</p>
                    <p className="font-display text-[22px] font-semibold tabular-nums text-ink-950">
                      {completed}
                    </p>
                  </div>
                  <span
                    className={`text-[13px] font-medium ${habit.tone.accent} transition-transform duration-200 group-hover:translate-x-0.5`}
                  >
                    View stats &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
          </>
        )}
      </div>

      {/* Modals */}
      <HabitForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        initial={editingHabit}
        existingCategories={categories}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete habit"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) deleteHabit(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
