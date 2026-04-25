"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
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
import { HabitIcon } from "@/components/habit-icon";
import { useTranslation } from "@/components/i18n-provider";
import type { HabitDefinition } from "@/lib/habits";
import { useHabits, useHabitRecords } from "@/lib/storage";
import {
  accentClass,
  accentStyle,
  softFillClass,
  softFillStyle,
  fillClass,
  fillStyle,
} from "@/lib/tone-utils";
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

const today = startOfDay(new Date());
const todayKey = toDateKey(today);
const RANGE_MIN = "2025-01-01";
const RANGE_MAX = "2030-12-31";
const MOBILE_TREND_WINDOW = 7;

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
  const { t } = useTranslation();
  const { habits, activeHabits, archivedHabits } = useHabits();
  const { records, loadFullHistory, fullHistoryState } = useHabitRecords(habits);
  const [selectedPreset, setSelectedPreset] = useState<StatsPreset>("month");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(getRollingRange(30, today).from);
  const [customTo, setCustomTo] = useState(todayKey);

  useEffect(() => {
    loadFullHistory();
  }, [loadFullHistory]);

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

  const filteredHabits = activeHabits;

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
  const handlePresetChange = (value: StatsPreset) => {
    setSelectedPreset(value);
    if (value === "custom") {
      setMobileFiltersOpen(true);
    }
  };
  const recentTrend = summary.trend.slice(-MOBILE_TREND_WINDOW);
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
  const compactRangeDetail =
    selectedPreset === "month"
      ? "Current month"
      : selectedPreset === "custom"
        ? "Selected range"
        : `Last ${selectedPreset} days`;

  if (activeHabits.length === 0) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center py-8">
        <div className="surface-panel flex max-w-lg flex-col items-center gap-3 rounded-[28px] px-8 py-10 text-center">
          <span className="text-[34px]">📈</span>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink-950">
             {t("stats_empty_title")}
           </h1>
           <p className="max-w-md text-[15px] leading-7 text-ink-700">
             {t("stats_empty_desc")}
           </p>
          <Link
            href="/dashboard"
            className="pill-btn tap-target mt-2 inline-flex items-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
          >
             {t("settings_back")}
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex flex-col gap-3.5 py-4 sm:gap-4 sm:py-5">
      <StatsHeader
        archivedCount={archivedHabits.length}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onPresetChange={handlePresetChange}
        rangeLabel={rangeLabel}
        selectedPreset={selectedPreset}
        mobileFiltersOpen={mobileFiltersOpen}
        onToggleMobileFilters={() =>
          setMobileFiltersOpen((current) => !current)
        }
      />

      {fullHistoryState.status !== "ready" ? (
        <section
          className={`animate-fade-in-up rounded-[24px] border px-4 py-3 shadow-[var(--shadow-card)] sm:px-5 ${
            fullHistoryState.status === "error"
              ? "border-red-200 bg-red-50 text-red-950"
              : "border-sky-200 bg-sky-50 text-sky-950"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold">
                {fullHistoryState.status === "error"
                  ? t("stats_history_error_title")
                  : t("stats_history_loading_title")}
              </p>
              <p
                className={`mt-1 text-[12px] leading-5 ${
                  fullHistoryState.status === "error"
                    ? "text-red-900/85"
                    : "text-sky-900/85"
                }`}
              >
                {fullHistoryState.status === "error"
                  ? t("stats_history_error_desc", { error: fullHistoryState.error })
                  : t("stats_history_loading_desc")}
              </p>
            </div>

            {fullHistoryState.status === "error" ? (
              <button
                type="button"
                onClick={() => void loadFullHistory()}
                className="pill-btn inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
              >
                {t("retry_history_load")}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="stagger-children grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <StatsCard
          label={t("stats_habits_in_scope")}
          value={String(filteredHabits.length)}
          detail={t("stats_archived_habits", { count: String(archivedHabits.length) })}
        />
        <StatsCard
          label={t("stats_average_hit_rate")}
          value={`${summary.averageRate}%`}
          detail={compactRangeDetail}
        />
        <StatsCard
          label={t("stats_completed_days")}
          value={String(summary.totalCompleted)}
          detail={
            fullHistoryState.status === "ready"
              ? t("stats_habit_days_range")
              : t("stats_habit_days_visible")
          }
        />
        <StatsCard
          label={t("stats_best_live_streak")}
          value={String(summary.bestStreak)}
          detail={t("stats_longest_current_run")}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-3.5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                {periodHeading}
              </h2>
              <p className="mt-1 text-[13px] text-ink-700">
                 {t("stats_daily_completion_desc")}
              </p>
            </div>
            <span className="rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold text-ink-700">
              {t("stats_peak", { rate: String(summary.bestRate) })}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-700 sm:mt-3 sm:gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-ink-950 shadow-[var(--shadow-card)] sm:hidden">
              {rangeLabel}
            </span>
            <span className="hidden rounded-full bg-white px-3 py-1.5 font-semibold text-ink-950 shadow-[var(--shadow-card)] sm:inline-flex">
              {rangeDescription}
            </span>
            <span>{t("stats_average_daily_rate", { rate: String(summary.trendAverage) })}</span>
            {summary.highestDay && (
              <span>{t("stats_best_day", { date: formatLongDate(summary.highestDay.dateKey) })}</span>
            )}
          </div>

          <div className="mt-6 md:hidden">
            <div className="grid grid-cols-7 gap-2">
              {recentTrend.map((day) => (
                <div
                  key={day.dateKey}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative h-28 w-full overflow-hidden rounded-[16px] bg-black/[0.04]">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-[16px] bg-linear-to-t from-[#6D28D9] to-[#C026D3] transition-all duration-500"
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
            <p className="mt-3 text-[12px] leading-5 text-ink-600">
              {t("stats_recent_snapshot", { count: String(recentTrend.length) })}
            </p>
          </div>

          <div className="comparison-scroll mt-6 hidden overflow-x-auto pb-1 md:block">
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
                      className="absolute bottom-0 left-0 right-0 rounded-t-[16px] bg-linear-to-t from-[#6D28D9] to-[#C026D3] transition-all duration-500"
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
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-3.5 sm:p-6"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                {t("stats_strongest_habit")}
              </h2>
              <p className="mt-1 text-[13px] text-ink-700">
                {t("stats_strongest_desc")}
              </p>
            </div>
            {summary.topHabit && (
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${softFillClass(summary.topHabit.habit.tone)}`}
                style={softFillStyle(summary.topHabit.habit.tone)}
              >
                {summary.topHabit.rate}%
              </span>
            )}
          </div>

          {summary.topHabit ? (
            <div className="mt-4 rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)] sm:mt-6 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[28px]">
                    <HabitIcon
                      name={summary.topHabit.habit.icon}
                      size={28}
                      className={accentClass(summary.topHabit.habit.tone)}
                      style={accentStyle(summary.topHabit.habit.tone)}
                    />
                  </p>
                  <h3 className="mt-3 text-[20px] font-semibold text-ink-950">
                    {summary.topHabit.habit.name}
                  </h3>
                  {summary.topHabit.habit.description ? (
                    <p className="mt-2 text-[14px] leading-6 text-ink-700">
                      {summary.topHabit.habit.description}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`self-start rounded-full px-3 py-1 text-[12px] font-semibold ${softFillClass(summary.topHabit.habit.tone)}`}
                  style={softFillStyle(summary.topHabit.habit.tone)}
                >
                  {summary.topHabit.completed} {t("stats_completed")}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5 sm:mt-5 sm:gap-3">
                <MiniStat
                  label={t("tracker_hit_rate")}
                  value={`${summary.topHabit.rate}%`}
                />
                <MiniStat
                  label={t("stats_completed_days")}
                  value={String(summary.topHabit.completed)}
                />
                <MiniStat
                  label={t("stats_live_streak")}
                  value={`${summary.topHabit.streak}d`}
                />
              </div>

              <Link
                href={`/dashboard/habits/${summary.topHabit.habit.slug}`}
                className="pill-btn mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] sm:mt-5 sm:w-auto"
              >
                {t("stats_open_habit_details")}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <div
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-3.5 sm:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                {t("stats_leaderboard")}
              </h2>
              <p className="mt-1 text-[13px] text-ink-700">
                {t("stats_leaderboard_desc")}
              </p>
            </div>
            <span className="rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold text-ink-700">
              {t("stats_tracked", { count: String(summary.sortedHabits.length) })}
            </span>
          </div>

          <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
            {summary.sortedHabits.map((snapshot, index) => (
              <Link
                key={snapshot.habit.id}
                href={`/dashboard/habits/${snapshot.habit.slug}`}
                className="group flex items-center gap-3 rounded-[22px] border border-black/[0.06] bg-white px-3.5 py-3 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:px-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6D28D9] text-[12px] font-semibold text-white sm:h-9 sm:w-9">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <HabitIcon
                      name={snapshot.habit.icon}
                      size={18}
                      className={`shrink-0 ${accentClass(snapshot.habit.tone)}`}
                      style={accentStyle(snapshot.habit.tone)}
                    />
                    <p className="truncate text-[14px] font-semibold text-ink-950">
                      {snapshot.habit.name}
                    </p>
                  </div>
                  <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-black/[0.05]">
                    <div
                      className={`h-[6px] rounded-full ${fillClass(snapshot.habit.tone)}`}
                      style={{
                        width: `${snapshot.rate}%`,
                        ...fillStyle(snapshot.habit.tone),
                      }}
                    />
                  </div>
                </div>
                <div className="min-w-[62px] text-right">
                  <p className="text-[14px] font-semibold tabular-nums text-ink-950">
                    {snapshot.rate}%
                  </p>
                  <p className="text-[12px] text-ink-600">
                    {t("stats_streak_short", { count: String(snapshot.streak) })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="animate-fade-in-up surface-panel rounded-[28px] p-3.5 sm:p-6"
        style={{ animationDelay: "220ms" }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-ink-950">
              {t("stats_weekday_rhythm")}
            </h2>
            <p className="mt-1 text-[13px] text-ink-700">
              {t("stats_weekday_desc")}
            </p>
          </div>
          <p className="hidden text-[13px] text-ink-700 sm:block">
            {t("stats_weekday_hint")}
          </p>
        </div>

        <div className="comparison-scroll mt-6 flex gap-3 overflow-x-auto pb-1 md:hidden">
          {summary.weekdayBuckets.map((day) => (
            <div
              key={day.label}
              className="w-28 shrink-0 rounded-[22px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)]"
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
                  className="h-[7px] rounded-full bg-[#6D28D9] transition-all duration-700 ease-out"
                  style={{ width: `${day.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 hidden gap-3 sm:grid-cols-2 xl:grid-cols-7 md:grid">
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
                  className="h-[7px] rounded-full bg-[#6D28D9] transition-all duration-700 ease-out"
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
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onPresetChange,
  rangeLabel,
  selectedPreset,
  mobileFiltersOpen,
  onToggleMobileFilters,
}: {
  archivedCount: number;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onPresetChange: (value: StatsPreset) => void;
  rangeLabel: string;
  selectedPreset: StatsPreset;
  mobileFiltersOpen: boolean;
  onToggleMobileFilters: () => void;
}) {
  const { t } = useTranslation();
  const presetOptions: Array<{ value: StatsPreset; label: string }> = [
    { value: "month", label: t("stats_monthly") },
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "90", label: "90d" },
    { value: "custom", label: t("chart_custom") },
  ];

  const controlButtonBase =
    "pill-btn tap-target-compact rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition sm:px-3 sm:py-2 sm:text-[13px]";

  return (
    <header className="animate-fade-in-up surface-panel rounded-[28px] px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-700">
              {t("nav_stats")}
            </span>
            <h1 className="mt-3 font-display text-[28px] font-semibold tracking-tight text-ink-950 sm:mt-4 sm:text-[40px]">
              {t("stats_heading_title")}
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-ink-700 sm:hidden">
              {t("stats_heading_desc_mobile")}
            </p>
            <p className="mt-2 text-[12px] font-medium text-ink-600 md:hidden">
              {rangeLabel} · {t("stats_archived_habits", { count: String(archivedCount) })}
            </p>
            <p className="mt-3 hidden max-w-2xl text-[15px] leading-7 text-ink-700 sm:block">
              {t("stats_heading_desc")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="hidden rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] md:inline-flex">
              {rangeLabel}
            </span>
            <span className="hidden rounded-full bg-ink-950/[0.05] px-3 py-2 text-[13px] font-semibold text-ink-700 md:inline-flex">
              {t("stats_archived_habits", { count: String(archivedCount) })}
            </span>
            <button
              type="button"
              onClick={onToggleMobileFilters}
              className="pill-btn tap-target-compact inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] md:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
              {t("stats_filters")}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`}
                strokeWidth={1.8}
              />
            </button>
            <Link
              href="/dashboard/archive"
              className="pill-btn tap-target-compact hidden items-center rounded-lg bg-white/80 px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)] md:inline-flex"
            >
              {t("nav_archive")}
            </Link>
            <Link
              href="/dashboard"
              className="pill-btn tap-target-compact hidden items-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:shadow-[var(--shadow-card-hover)] md:inline-flex"
            >
              {t("back_to_dashboard")}
            </Link>
          </div>
        </div>

        <div
          className={`${mobileFiltersOpen ? "flex" : "hidden"} flex-col gap-4 rounded-[24px] border border-black/[0.06] bg-white px-3.5 py-3.5 shadow-[var(--shadow-card)] md:flex md:px-4 md:py-4`}
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                {t("stats_time_range")}
              </p>
              <div className="comparison-scroll -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <DatePicker
                  label={t("date_from")}
                  value={customFrom}
                  max={customTo}
                  onChange={onCustomFromChange}
                  size="compact"
                />
                <span className="text-[11px] text-ink-600">–</span>
                <DatePicker
                  label={t("date_to")}
                  value={customTo}
                  min={customFrom}
                  max={todayKey}
                  onChange={onCustomToChange}
                  size="compact"
                />
              </div>
            )}
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
    <div className="rounded-[24px] border border-black/[0.06] bg-white p-3.5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-4">
      <p className="text-[12px] text-ink-700 sm:text-[13px]">{label}</p>
      <p className="mt-1.5 font-display text-[22px] font-semibold tabular-nums text-ink-950 sm:mt-2 sm:text-[28px]">
        {value}
      </p>
      <p className="mt-1 text-[12px] leading-5 text-ink-600">{detail}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-black/[0.06] bg-paper-50 px-3 py-3 sm:px-3.5">
      <p className="text-[12px] text-ink-600">{label}</p>
      <p className="mt-1 font-display text-[20px] font-semibold text-ink-950 sm:text-[22px]">
        {value}
      </p>
    </div>
  );
}
