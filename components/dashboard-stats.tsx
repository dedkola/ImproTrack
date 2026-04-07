"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  clampDateKey,
  eachDay,
  formatLongDate,
  formatMonthLabel,
  getCurrentMonthRange,
  getRollingRange,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "@/lib/date";
import { DatePicker } from "@/components/date-picker";
import type { HabitDefinition } from "@/lib/habits";
import { useHabits, useHabitRecords } from "@/lib/storage";
import {
  completedSlotsInDay,
  completionRate,
  countCompleted,
  getCurrentStreak,
} from "@/lib/stats";

type StatsPreset = "month" | "7" | "30" | "90" | "custom";

type DailyAggregate = {
  dateKey: string;
  rate: number;
  completed: number;
  total: number;
};

type HabitSnapshot = {
  habit: HabitDefinition;
  rate: number;
  completed: number;
  streak: number;
};

type CategorySnapshot = {
  category: string;
  rate: number;
  habits: number;
};

const today = startOfDay(new Date());
const todayKey = toDateKey(today);
const RANGE_MIN = "2025-01-01";
const RANGE_MAX = "2030-12-31";

function getPresetRange(preset: Exclude<StatsPreset, "custom">) {
  if (preset === "month") {
    return getCurrentMonthRange(today);
  }

  return getRollingRange(Number(preset), today);
}

function getRangeLabel(
  preset: StatsPreset,
  range: { from: string; to: string },
  habitCount: number,
) {
  if (preset === "month") {
    return `${formatMonthLabel(range)} · ${habitCount} habit${habitCount === 1 ? "" : "s"}`;
  }

  if (preset !== "custom") {
    return `Last ${preset} days · ${habitCount} habit${habitCount === 1 ? "" : "s"}`;
  }

  return `${formatLongDate(range.from)} to ${formatLongDate(range.to)} · ${habitCount} habit${habitCount === 1 ? "" : "s"}`;
}

function getAverage(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export function DashboardStats() {
  const { habits, activeHabits, archivedHabits } = useHabits();
  const { records } = useHabitRecords(habits);
  const [selectedPreset, setSelectedPreset] = useState<StatsPreset>("month");
  const [customFrom, setCustomFrom] = useState(getRollingRange(30, today).from);
  const [customTo, setCustomTo] = useState(todayKey);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(
    () => [...new Set(activeHabits.map((habit) => habit.category))].sort(),
    [activeHabits],
  );

  const activeCategory =
    selectedCategory === "all" || categories.includes(selectedCategory)
      ? selectedCategory
      : "all";

  const range = useMemo(() => {
    if (selectedPreset !== "custom") {
      return getPresetRange(selectedPreset);
    }

    const orderedRange =
      customFrom <= customTo
        ? { from: customFrom, to: customTo }
        : { from: customTo, to: customFrom };

    return {
      from: clampDateKey(orderedRange.from, RANGE_MIN, RANGE_MAX),
      to: clampDateKey(orderedRange.to, RANGE_MIN, RANGE_MAX),
    };
  }, [customFrom, customTo, selectedPreset]);

  const filteredHabits = useMemo(() => {
    if (activeCategory === "all") {
      return activeHabits;
    }

    return activeHabits.filter((habit) => habit.category === activeCategory);
  }, [activeCategory, activeHabits]);

  const summary = useMemo(() => {
    const habitSnapshots: HabitSnapshot[] = filteredHabits.map((habit) => ({
      habit,
      rate: completionRate(records, habit.id, range, todayKey, habit.timeSlots),
      completed: countCompleted(
        records,
        habit.id,
        range,
        todayKey,
        habit.timeSlots,
      ),
      streak: getCurrentStreak(records, habit.id, todayKey, habit.timeSlots),
    }));

    const sortedHabits = [...habitSnapshots].sort(
      (left, right) =>
        right.rate - left.rate ||
        right.completed - left.completed ||
        right.streak - left.streak,
    );

    const totalSlotsPerDay = filteredHabits.reduce(
      (sum, habit) => sum + habit.timeSlots.length,
      0,
    );

    const trend: DailyAggregate[] = eachDay(range).map((dateKey) => {
      const completed = filteredHabits.reduce(
        (sum, habit) =>
          sum +
          completedSlotsInDay(records, habit.id, dateKey, habit.timeSlots),
        0,
      );

      return {
        dateKey,
        completed,
        total: totalSlotsPerDay,
        rate:
          totalSlotsPerDay === 0
            ? 0
            : Math.round((completed / totalSlotsPerDay) * 100),
      };
    });

    const weekdayBuckets = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ].map((label, index) => {
      let completed = 0;
      let total = 0;

      eachDay(range).forEach((dateKey) => {
        if (parseDateKey(dateKey).getDay() !== index) return;

        filteredHabits.forEach((habit) => {
          total += habit.timeSlots.length;
          completed += completedSlotsInDay(
            records,
            habit.id,
            dateKey,
            habit.timeSlots,
          );
        });
      });

      return {
        label,
        rate: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    });

    const categoryMap = new Map<
      string,
      { totalRate: number; habits: number }
    >();

    habitSnapshots.forEach((snapshot) => {
      const entry = categoryMap.get(snapshot.habit.category) ?? {
        totalRate: 0,
        habits: 0,
      };
      categoryMap.set(snapshot.habit.category, {
        totalRate: entry.totalRate + snapshot.rate,
        habits: entry.habits + 1,
      });
    });

    const categories: CategorySnapshot[] = Array.from(categoryMap.entries())
      .map(([category, value]) => ({
        category,
        habits: value.habits,
        rate: Math.round(value.totalRate / value.habits),
      }))
      .sort((left, right) => right.rate - left.rate);

    const bestRate = trend.reduce((best, day) => Math.max(best, day.rate), 0);
    const trendAverage = getAverage(trend.map((day) => day.rate));
    const highestDay = trend.reduce<DailyAggregate | null>((best, day) => {
      if (!best || day.rate > best.rate) {
        return day;
      }

      return best;
    }, null);

    return {
      habitSnapshots,
      sortedHabits,
      trend,
      weekdayBuckets,
      categories,
      averageRate: getAverage(habitSnapshots.map((snapshot) => snapshot.rate)),
      totalCompleted: habitSnapshots.reduce(
        (sum, snapshot) => sum + snapshot.completed,
        0,
      ),
      bestStreak: habitSnapshots.reduce(
        (best, snapshot) => Math.max(best, snapshot.streak),
        0,
      ),
      topHabit: sortedHabits[0] ?? null,
      bestRate,
      trendAverage,
      highestDay,
    };
  }, [filteredHabits, range, records]);

  const rangeLabel = getRangeLabel(
    selectedPreset,
    range,
    filteredHabits.length,
  );
  const periodHeading =
    selectedPreset === "month"
      ? formatMonthLabel(range)
      : selectedPreset === "custom"
        ? "Custom range"
        : `Last ${selectedPreset} days`;
  const rangeDescription =
    selectedPreset === "custom"
      ? `${formatLongDate(range.from)} to ${formatLongDate(range.to)}`
      : `Analytics for ${formatLongDate(range.from)} through ${formatLongDate(range.to)}`;

  if (activeHabits.length === 0) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center py-8">
        <div className="surface-panel flex max-w-lg flex-col items-center gap-3 rounded-[28px] px-8 py-10 text-center">
          <span className="text-[34px]">📈</span>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink-950">
            Statistics wake up after your first habit
          </h1>
          <p className="max-w-md text-[15px] leading-7 text-ink-700">
            Add a habit on the dashboard and Momentum will start filling this
            page with completion trends, category signals, and streak summaries.
          </p>
          <Link
            href="/dashboard"
            className="pill-btn tap-target mt-2 inline-flex items-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (filteredHabits.length === 0) {
    return (
      <div className="page-shell flex flex-col gap-4 py-5">
        <StatsHeader
          archivedCount={archivedHabits.length}
          category={activeCategory}
          categories={categories}
          customFrom={customFrom}
          customTo={customTo}
          onCategoryChange={setSelectedCategory}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
          onPresetChange={setSelectedPreset}
          rangeLabel={rangeLabel}
          selectedPreset={selectedPreset}
        />

        <div className="surface-panel flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-[28px] px-6 py-10 text-center">
          <span className="text-[32px]">🧭</span>
          <h2 className="font-display text-[28px] font-semibold tracking-tight text-ink-950">
            No habits match this filter yet.
          </h2>
          <p className="max-w-xl text-[15px] leading-7 text-ink-700">
            Try a different category or widen the time range. The dashboard
            statistics update only from habits inside the selected scope.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex flex-col gap-4 py-5">
      <StatsHeader
        archivedCount={archivedHabits.length}
        category={activeCategory}
        categories={categories}
        customFrom={customFrom}
        customTo={customTo}
        onCategoryChange={setSelectedCategory}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onPresetChange={setSelectedPreset}
        rangeLabel={rangeLabel}
        selectedPreset={selectedPreset}
      />

      <section className="stagger-children grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Tracked in scope"
          value={String(filteredHabits.length)}
          detail={
            activeCategory === "all"
              ? `${archivedHabits.length} archived outside current view`
              : `${activeCategory} routines only`
          }
        />
        <StatsCard
          label="Average hit rate"
          value={`${summary.averageRate}%`}
          detail={rangeLabel}
        />
        <StatsCard
          label="Completed days"
          value={String(summary.totalCompleted)}
          detail="Completed habit-days in the selected range"
        />
        <StatsCard
          label="Best live streak"
          value={String(summary.bestStreak)}
          detail="Current best run in the filtered scope"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                {periodHeading}
              </h2>
              <p className="mt-1 text-[13px] text-ink-700">
                Daily completion across all selected habit slots.
              </p>
            </div>
            <span className="rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold text-ink-700">
              Peak {summary.bestRate}%
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ink-700">
            <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-ink-950 shadow-[var(--shadow-card)]">
              {rangeDescription}
            </span>
            <span>Average daily rate {summary.trendAverage}%</span>
            {summary.highestDay && (
              <span>Best day {formatLongDate(summary.highestDay.dateKey)}</span>
            )}
          </div>

          <div className="comparison-scroll mt-6 overflow-x-auto pb-1">
            <div
              className="grid min-w-full items-end gap-2"
              style={{
                width: `${Math.max(summary.trend.length * 44, 480)}px`,
                gridTemplateColumns: `repeat(${summary.trend.length}, minmax(0, 1fr))`,
              }}
            >
              {summary.trend.map((day) => (
                <div
                  key={day.dateKey}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-[16px] bg-black/[0.04]">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-[16px] bg-[#3274C7] transition-all duration-500"
                      style={{
                        height: `${Math.max(day.rate, day.total === 0 ? 8 : 16)}%`,
                        opacity:
                          day.rate === 100 ? 0.95 : day.rate > 0 ? 0.72 : 0.2,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold tabular-nums text-ink-950">
                      {day.rate}%
                    </p>
                    <p className="text-[10px] text-ink-600">
                      {parseDateKey(day.dateKey).toLocaleString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-5 sm:p-6"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                Strongest habit in range
              </h2>
              <p className="mt-1 text-[13px] text-ink-700">
                The best-performing routine in the selected scope.
              </p>
            </div>
            {summary.topHabit && (
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${summary.topHabit.habit.tone.softFill}`}
              >
                {summary.topHabit.rate}%
              </span>
            )}
          </div>

          {summary.topHabit ? (
            <div className="mt-6 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[28px]">{summary.topHabit.habit.icon}</p>
                  <h3 className="mt-3 text-[20px] font-semibold text-ink-950">
                    {summary.topHabit.habit.name}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-ink-700">
                    {summary.topHabit.habit.description}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold ${summary.topHabit.habit.tone.softFill}`}
                >
                  {summary.topHabit.habit.category}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniStat
                  label="Hit rate"
                  value={`${summary.topHabit.rate}%`}
                />
                <MiniStat
                  label="Completed"
                  value={String(summary.topHabit.completed)}
                />
                <MiniStat
                  label="Live streak"
                  value={`${summary.topHabit.streak}d`}
                />
              </div>

              <Link
                href={`/dashboard/habits/${summary.topHabit.habit.slug}`}
                className="pill-btn mt-5 inline-flex items-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
              >
                Open habit details
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-5 sm:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                Category spread
              </h2>
              <p className="mt-1 text-[13px] text-ink-700">
                Average hit rate grouped by category in the selected range.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {summary.categories.map((category) => (
              <div key={category.category}>
                <div className="mb-2 flex items-center justify-between gap-3 text-[13px] text-ink-700">
                  <span className="font-medium text-ink-950">
                    {category.category}
                  </span>
                  <span>
                    {category.rate}% · {category.habits} habit
                    {category.habits > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-[8px] overflow-hidden rounded-full bg-black/[0.05]">
                  <div
                    className="h-[8px] rounded-full bg-[#3274C7] transition-all duration-700 ease-out"
                    style={{ width: `${category.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-5 sm:p-6"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                Habit leaderboard
              </h2>
              <p className="mt-1 text-[13px] text-ink-700">
                Ranked by completion rate and follow-through in the selected
                range.
              </p>
            </div>
            <span className="rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold text-ink-700">
              {summary.sortedHabits.length} tracked
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {summary.sortedHabits.map((snapshot, index) => (
              <Link
                key={snapshot.habit.id}
                href={`/dashboard/habits/${snapshot.habit.slug}`}
                className="group flex items-center gap-3 rounded-[22px] border border-black/[0.06] bg-white px-4 py-3 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3274C7] text-[12px] font-semibold text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]">{snapshot.habit.icon}</span>
                    <p className="truncate text-[14px] font-semibold text-ink-950">
                      {snapshot.habit.name}
                    </p>
                  </div>
                  <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-black/[0.05]">
                    <div
                      className={`h-[6px] rounded-full ${snapshot.habit.tone.fill}`}
                      style={{ width: `${snapshot.rate}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold tabular-nums text-ink-950">
                    {snapshot.rate}%
                  </p>
                  <p className="text-[12px] text-ink-600">
                    {snapshot.streak}d streak
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="animate-fade-in-up surface-panel rounded-[28px] p-5 sm:p-6"
        style={{ animationDelay: "220ms" }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-ink-950">
              Weekday rhythm
            </h2>
            <p className="mt-1 text-[13px] text-ink-700">
              Average slot completion rate across the selected range.
            </p>
          </div>
          <p className="text-[13px] text-ink-700">
            Useful for spotting where your schedule actually supports
            consistency.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {summary.weekdayBuckets.map((day) => (
            <div
              key={day.label}
              className="rounded-[22px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-end justify-between gap-3">
                <span className="text-[13px] font-semibold text-ink-950">
                  {day.label}
                </span>
                <span className="font-display text-[24px] font-semibold tabular-nums text-ink-950">
                  {day.rate}%
                </span>
              </div>
              <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-black/[0.05]">
                <div
                  className="h-[7px] rounded-full bg-[#3274C7] transition-all duration-700 ease-out"
                  style={{ width: `${day.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatsHeader({
  archivedCount,
  category,
  categories,
  customFrom,
  customTo,
  onCategoryChange,
  onCustomFromChange,
  onCustomToChange,
  onPresetChange,
  rangeLabel,
  selectedPreset,
}: {
  archivedCount: number;
  category: string;
  categories: string[];
  customFrom: string;
  customTo: string;
  onCategoryChange: (value: string) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onPresetChange: (value: StatsPreset) => void;
  rangeLabel: string;
  selectedPreset: StatsPreset;
}) {
  const presetOptions: Array<{ value: StatsPreset; label: string }> = [
    { value: "month", label: "Monthly" },
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "90", label: "90d" },
    { value: "custom", label: "Custom" },
  ];

  const controlButtonBase =
    "pill-btn tap-target-compact rounded-lg px-3 py-2 text-[13px] font-medium transition";

  return (
    <header className="animate-fade-in-up surface-panel rounded-[28px] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-700">
              Statistics
            </span>
            <h1 className="mt-4 font-display text-[32px] font-semibold tracking-tight text-ink-950 sm:text-[40px]">
              See what is compounding and what is slipping.
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-700">
              This view rolls your active habits into one calm control room, now
              with range and category filters so you can isolate short-term
              pressure or wider trend drift.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)]">
              {rangeLabel}
            </span>
            <span className="rounded-full bg-ink-950/[0.05] px-3 py-2 text-[13px] font-semibold text-ink-700">
              {archivedCount} archived
            </span>
            <Link
              href="/dashboard/archive"
              className="pill-btn tap-target-compact inline-flex items-center rounded-lg bg-white/80 px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)]"
            >
              Archive
            </Link>
            <Link
              href="/dashboard"
              className="pill-btn tap-target-compact inline-flex items-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:shadow-[var(--shadow-card-hover)]"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-[24px] border border-black/[0.06] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                Time range
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {presetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onPresetChange(option.value)}
                    className={`${controlButtonBase} ${
                      selectedPreset === option.value
                        ? "bg-white text-ink-950 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]"
                        : "bg-transparent text-ink-700 hover:bg-black/[0.05]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedPreset === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <DatePicker
                  label="From"
                  value={customFrom}
                  max={customTo}
                  onChange={onCustomFromChange}
                  size="compact"
                />
                <span className="text-[11px] text-ink-600">to</span>
                <DatePicker
                  label="To"
                  value={customTo}
                  min={customFrom}
                  max={todayKey}
                  onChange={onCustomToChange}
                  size="compact"
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              Category filter
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onCategoryChange("all")}
                className={`${controlButtonBase} ${
                  category === "all"
                    ? "bg-white text-ink-950 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]"
                    : "bg-transparent text-ink-700 hover:bg-black/[0.05]"
                }`}
              >
                All categories
              </button>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onCategoryChange(item)}
                  className={`${controlButtonBase} ${
                    category === item
                      ? "bg-white text-ink-950 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]"
                      : "bg-transparent text-ink-700 hover:bg-black/[0.05]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatsCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <p className="text-[13px] text-ink-700">{label}</p>
      <p className="mt-2 font-display text-[28px] font-semibold tabular-nums text-ink-950">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-ink-600">{detail}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-black/[0.06] bg-paper-50 px-3.5 py-3">
      <p className="text-[12px] text-ink-600">{label}</p>
      <p className="mt-1 font-display text-[22px] font-semibold text-ink-950">
        {value}
      </p>
    </div>
  );
}
