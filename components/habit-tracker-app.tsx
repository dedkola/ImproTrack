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
  toDateKey
} from "@/lib/date";
import { habits } from "@/lib/habits";
import { completionRate, countCompleted } from "@/lib/stats";
import { useHabitRecords } from "@/lib/storage";

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
  if (rates.length === 0) {
    return 0;
  }

  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
}

export function HabitTrackerApp() {
  const { records, toggleHabitDay } = useHabitRecords();
  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset>("month");
  const [range, setRange] = useState<DateRange>(getCurrentMonthRange(today));
  const days = eachDay(range);

  const habitSummaries = habits.map((habit) => {
    const completed = countCompleted(records, habit.id, range, todayKey);
    const rate = completionRate(records, habit.id, range, todayKey);

    return { habit, completed, rate };
  });

  const averageRate = getOverallRate(habitSummaries.map((summary) => summary.rate));
  const totalCompleted = habitSummaries.reduce((sum, summary) => sum + summary.completed, 0);

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
      to: clampDateKey(orderedRange.to, "2025-01-01", "2030-12-31")
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="mesh-accent surface-panel relative overflow-hidden rounded-[32px] p-5 sm:p-7">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 ring-1 ring-sky-100">
                Habit grid
              </p>
              <h1 className="font-display text-4xl leading-none text-balance text-ink-950 sm:text-5xl">
                Spreadsheet clarity, built for daily habits.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700 sm:text-base">
                Track several habits side by side, tap cells to complete a day, and keep your
                progress moving even when life gets uneven.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/75 p-4 ring-1 ring-white/80">
                <p className="text-xs uppercase tracking-[0.22em] text-ink-700">Active habits</p>
                <p className="mt-2 font-display text-3xl text-ink-950">{habits.length}</p>
              </div>
              <div className="rounded-3xl bg-white/75 p-4 ring-1 ring-white/80">
                <p className="text-xs uppercase tracking-[0.22em] text-ink-700">Average hit rate</p>
                <p className="mt-2 font-display text-3xl text-ink-950">{averageRate}%</p>
              </div>
              <div className="col-span-2 rounded-3xl bg-white/75 p-4 ring-1 ring-white/80 sm:col-span-1">
                <p className="text-xs uppercase tracking-[0.22em] text-ink-700">Period total</p>
                <p className="mt-2 font-display text-3xl text-ink-950">{totalCompleted}</p>
              </div>
            </div>
          </div>

          <div className="surface-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-700">Selected window</p>
                <h2 className="mt-1 font-display text-2xl text-ink-950">
                  {formatMonthLabel(range)}
                </h2>
                <p className="mt-1 text-sm text-ink-700">
                  Default view is monthly, with quick sliding windows and custom dates.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
                <div className="flex flex-wrap gap-2">
                  {[
                    ["month", "Monthly"],
                    ["7", "7 days"],
                    ["30", "30 days"],
                    ["90", "90 days"]
                  ].map(([value, label]) => {
                    const active = selectedPreset === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handlePreset(value as Exclude<PeriodPreset, "custom">)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-ink-950 text-white"
                            : "bg-paper-50 text-ink-700 ring-1 ring-paper-200 hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex items-center gap-2 rounded-full bg-paper-50 px-4 py-2 text-sm text-ink-700 ring-1 ring-paper-200">
                    <span>From</span>
                    <input
                      type="date"
                      value={range.from}
                      onChange={(event) => updateCustomRange("from", event.target.value)}
                      className="bg-transparent outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded-full bg-paper-50 px-4 py-2 text-sm text-ink-700 ring-1 ring-paper-200">
                    <span>To</span>
                    <input
                      type="date"
                      value={range.to}
                      onChange={(event) => updateCustomRange("to", event.target.value)}
                      className="bg-transparent outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel overflow-hidden rounded-[32px]">
        <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ink-700">Calendar table</p>
            <h2 className="mt-1 font-display text-2xl text-ink-950">Monthly-style habit matrix</h2>
          </div>
          <p className="hidden text-sm text-ink-700 md:block">
            Tap a cell to mark completion. Missed days stay visible but never wipe progress.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div
            className="min-w-max px-3 pb-4 pt-2 sm:px-4"
            style={{ minWidth: `${280 + days.length * 44}px` }}
          >
            <div
              className="grid gap-px rounded-[28px] bg-paper-200 p-px"
              style={{ gridTemplateColumns: `280px repeat(${days.length}, minmax(40px, 1fr))` }}
            >
              <div className="rounded-l-[27px] bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-ink-700">
                Habit
              </div>
              {days.map((dateKey, index) => {
                const isFuture = dateKey > todayKey;
                const weekday = new Intl.DateTimeFormat("en", { weekday: "narrow" }).format(
                  parseDateKey(dateKey)
                );

                return (
                  <div
                    key={dateKey}
                    className={`bg-white px-1 py-3 text-center text-xs ${
                      index === days.length - 1 ? "rounded-r-[27px]" : ""
                    }`}
                  >
                    <p className="font-semibold text-ink-950">{dateKey.slice(-2)}</p>
                    <p className={isFuture ? "text-slate-300" : "text-ink-700"}>{weekday}</p>
                  </div>
                );
              })}

              {habitSummaries.map(({ habit, completed, rate }, habitIndex) => (
                <div key={habit.id} className="contents">
                  <div
                    className={`sticky left-0 z-10 flex flex-col justify-center gap-2 bg-linear-to-br ${habit.tone.surface} px-4 py-4 ${
                      habitIndex === habitSummaries.length - 1 ? "rounded-bl-[27px]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-ink-950">{habit.name}</p>
                        <p className="text-sm text-ink-700">{habit.goalLabel}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${habit.tone.softFill} ${habit.tone.badge}`}
                      >
                        {rate}%
                      </span>
                    </div>
                    <p className="text-sm text-ink-700">
                      {completed} {habit.unitLabel} in this period
                    </p>
                  </div>

                  {days.map((dateKey, index) => {
                    const checked = Boolean(records[habit.id]?.[dateKey]);
                    const isFuture = dateKey > todayKey;

                    return (
                      <button
                        key={`${habit.id}-${dateKey}`}
                        type="button"
                        onClick={() => {
                          if (!isFuture) {
                            toggleHabitDay(habit.id, dateKey);
                          }
                        }}
                        disabled={isFuture}
                        aria-pressed={checked}
                        aria-label={`${habit.name} on ${formatLongDate(dateKey)}`}
                        className={`flex h-11 items-center justify-center bg-white transition ${
                          habitIndex === habitSummaries.length - 1 && index === days.length - 1
                            ? "rounded-br-[27px]"
                            : ""
                        } ${
                          isFuture ? "cursor-not-allowed opacity-50" : "hover:bg-paper-50"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-2xl border transition ${
                            checked
                              ? `${habit.tone.fill} border-transparent text-white shadow-lg shadow-slate-200`
                              : "border-paper-200 bg-paper-50 text-transparent"
                          }`}
                        >
                          <svg
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 ${checked ? "opacity-100" : "opacity-0"}`}
                          >
                            <path
                              d="M3.5 8.4 6.7 11.6 12.7 4.8"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {habitSummaries.map(({ habit, completed, rate }) => (
          <Link
            key={habit.id}
            href={`/habits/${habit.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-[30px] border border-white/70 bg-linear-to-br ${habit.tone.surface} p-5 shadow-[0_20px_50px_rgba(31,47,66,0.08)] transition hover:-translate-y-1`}
          >
            <div className="absolute inset-x-6 bottom-0 h-16 rounded-full bg-white/50 blur-2xl transition group-hover:scale-110" />
            <div className="relative z-10 flex aspect-square flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-ink-700">Habit card</p>
                  <h3 className="mt-2 font-display text-2xl text-ink-950">{habit.name}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${habit.tone.softFill}`}>
                  {rate}%
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm leading-6 text-ink-700">{habit.description}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-700">Completed</p>
                    <p className="font-display text-4xl text-ink-950">{completed}</p>
                  </div>
                  <p className={`text-sm font-semibold ${habit.tone.accent}`}>Open full statistics</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
