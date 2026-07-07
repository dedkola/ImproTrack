"use client";

import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
} from "lucide-react";
import { formatLongDate, type DateRange, parseDateKey } from "@/lib/date";
import type { HabitDefinition } from "@/lib/habits";
import type { Translations } from "@/lib/i18n";
import {
  accentClass,
  accentStyle,
  badgeClass,
  badgeStyle,
  getHabitCardGradient,
  getHabitMatrixTone,
  softFillClass,
  softFillClassDark,
  softFillStyle,
  softFillStyleDark,
} from "@/lib/tone-utils";
import {
  completedSlotsInDay,
  completionRate,
  countCompleted,
  getCurrentStreak,
  isSlotCompleted,
} from "@/lib/stats";
import type { HabitRecords } from "@/lib/storage";
import { HabitForm, HabitMenu, ConfirmDialog } from "@/components/habit-form";
import { ArchiveFeedback } from "@/components/archive-feedback";
import { HabitIcon } from "@/components/habit-icon";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

type TranslateFunction = (
  key: keyof Translations,
  params?: Record<string, string>,
) => string;

type HabitActionHandlers = {
  onEditHabit: (habit: HabitDefinition) => void;
  onArchiveHabit: (habit: HabitDefinition) => void;
  onDeleteHabit: (habit: HabitDefinition) => void;
};

export type HabitTrackerGridRow = {
  habit: HabitDefinition;
  rowType: "single" | "total" | "slot";
  slotName: string;
  slotIndex: number;
  isFirstSlot: boolean;
  isLastSlot: boolean;
};

export function buildGridRows(
  orderedActiveHabits: HabitDefinition[],
): HabitTrackerGridRow[] {
  const gridRows: HabitTrackerGridRow[] = [];

  orderedActiveHabits.forEach((habit) => {
    const isMultiSlot = habit.frequencyPerDay > 1 && habit.timeSlots.length > 1;
    if (isMultiSlot) {
      gridRows.push({
        habit,
        rowType: "total",
        slotName: "total",
        slotIndex: -1,
        isFirstSlot: true,
        isLastSlot: false,
      });
      habit.timeSlots.forEach((slotName, slotIndex) => {
        gridRows.push({
          habit,
          rowType: "slot",
          slotName,
          slotIndex,
          isFirstSlot: false,
          isLastSlot: slotIndex === habit.timeSlots.length - 1,
        });
      });
      return;
    }

    habit.timeSlots.forEach((slotName, slotIndex) => {
      gridRows.push({
        habit,
        rowType: "single",
        slotName,
        slotIndex,
        isFirstSlot: slotIndex === 0,
        isLastSlot: slotIndex === habit.timeSlots.length - 1,
      });
    });
  });

  return gridRows;
}

function MobileMatrixDayCell({
  checked,
  isFuture,
  onClick,
  ariaLabel,
  matrixTone,
}: {
  checked: boolean;
  isFuture: boolean;
  onClick: () => void;
  ariaLabel: string;
  matrixTone: { cellTint: string; fill: string; glow: string };
}) {
  const checkStyle = checked
    ? {
        backgroundColor: matrixTone.fill,
        borderColor: "transparent",
        boxShadow: `0 6px 14px ${matrixTone.glow}, 0 1px 2px rgba(10, 22, 40, 0.12)`,
      }
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isFuture}
      aria-label={ariaLabel}
      style={
        {
          "--matrix-hover-bg": matrixTone.cellTint,
        } as React.CSSProperties
      }
      className={`matrix-day-btn relative flex aspect-square min-w-0 items-center justify-center rounded-[14px] border border-black/[0.05] bg-white ${isFuture ? "opacity-35" : ""}`}
    >
      <span
        style={checkStyle}
        className={`matrix-check relative z-10 flex h-[18px] w-[18px] items-center justify-center rounded-md transition-all duration-200 ${
          checked
            ? "matrix-check-pop matrix-check-checked text-white"
            : "matrix-check-idle text-transparent"
        }`}
      >
        <Check
          aria-hidden="true"
          className={`h-2.5 w-2.5 ${checked ? "opacity-100" : "opacity-0"}`}
          strokeWidth={2.2}
        />
      </span>
    </button>
  );
}

export function HabitTrackerHeader({
  t,
  activeHabitCount,
  averageRate,
  totalCompleted,
  mobileRangeLabel,
  desktopRangeLabel,
  onAddHabit,
}: {
  t: TranslateFunction;
  activeHabitCount: number;
  averageRate: number;
  totalCompleted: number;
  mobileRangeLabel: string;
  desktopRangeLabel: string;
  onAddHabit: () => void;
}) {
  return (
    <header className="header-bar w-full py-3 sm:py-3.5 lg:sticky lg:top-0 lg:z-30 lg:py-2">
      <div className="page-shell flex flex-col gap-2.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <h1 className="font-display text-[20px] font-semibold leading-none tracking-tight text-ink-950">
              {t("nav_dashboard")}
            </h1>
            <span className="hidden h-4 w-px bg-ink-950/10 sm:block" />
            <div className="hidden items-center gap-5 sm:flex">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[14px] text-ink-700">
                  {t("sidebar_habits")}
                </span>
                <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                  {activeHabitCount}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[14px] text-ink-700">
                  {t("tracker_hit_rate")}
                </span>
                <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                  {averageRate}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[14px] text-ink-700">
                  {t("tracker_total")}
                </span>
                <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                  {totalCompleted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle showLabel={false} />
              <LanguageSwitcher />
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-950 shadow-[var(--shadow-card)] md:hidden">
              {mobileRangeLabel}
            </span>
            <span className="hidden font-display text-[14px] font-medium text-ink-950 md:inline">
              {desktopRangeLabel}
            </span>
            <Link
              href="/dashboard/stats"
              className="pill-btn tap-target-compact hidden items-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)] md:inline-flex"
            >
              {t("nav_stats")}
            </Link>
            <button
              type="button"
              aria-label={t("tab_add_habit_aria")}
              onClick={onAddHabit}
              className="pill-btn tap-target-compact flex items-center gap-1.5 rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-3 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{t("tab_add_habit")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function HabitTrackerEmptyState({
  t,
  archivedHabitCount,
  onAddHabit,
}: {
  t: TranslateFunction;
  archivedHabitCount: number;
  onAddHabit: () => void;
}) {
  return (
    <div className="surface-panel flex flex-col items-center justify-center gap-3 rounded-2xl px-8 py-16 text-center">
      <span className="text-[32px]">🎯</span>
      <h2 className="text-[18px] font-semibold text-ink-950">
        {t("sidebar_no_habits_title")}
      </h2>
      <p className="max-w-xs text-[14px] text-ink-700">
        {t("tracker_empty_desc")}
      </p>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onAddHabit}
          className="pill-btn tap-target rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
        >
          {t("sidebar_create_habit")}
        </button>
        {archivedHabitCount > 0 ? (
          <Link
            href="/dashboard/archive"
            className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
          >
            {t("nav_archive")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function MobileMatrixSection({
  t,
  isDark,
  orderedActiveHabits,
  records,
  mobileRangeLabel,
  mobileWindowLabel,
  mobileDays,
  mobileStatsRange,
  mobileStatsDays,
  todayKey,
  isLatestMobileWeek,
  onResetToLatest,
  onPreviousWeek,
  onNextWeek,
  onToggleHabitDay,
  onEditHabit,
  onArchiveHabit,
  onDeleteHabit,
}: {
  t: TranslateFunction;
  isDark: boolean;
  orderedActiveHabits: HabitDefinition[];
  records: HabitRecords;
  mobileRangeLabel: string;
  mobileWindowLabel: string;
  mobileDays: string[];
  mobileStatsRange: DateRange;
  mobileStatsDays: string[];
  todayKey: string;
  isLatestMobileWeek: boolean;
  onResetToLatest: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToggleHabitDay: (habitId: string, dateKey: string, slotName?: string) => void;
} & HabitActionHandlers) {
  return (
    <section className="animate-scale-in surface-panel rounded-[28px] p-3.5 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink-950">
          {t("tracker_matrix")}
        </h2>
        {isLatestMobileWeek ? null : (
          <button
            type="button"
            onClick={onResetToLatest}
            className="pill-btn tap-target-compact inline-flex items-center rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
          >
            {t("tracker_latest")}
          </button>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 rounded-[22px] border border-black/[0.06] bg-white px-1.5 py-1.5 shadow-[var(--shadow-card)] sm:mt-3 sm:gap-2 sm:px-2 sm:py-2">
        <button
          type="button"
          onClick={onPreviousWeek}
          aria-label={t("tracker_previous_week")}
          className="tap-target-compact flex items-center justify-center rounded-xl border border-black/[0.06] bg-white text-ink-700 transition-colors hover:bg-black/[0.03] hover:text-ink-950"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600">
            {mobileWindowLabel}
          </p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink-950">
            {mobileRangeLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={onNextWeek}
          disabled={isLatestMobileWeek}
          aria-label={t("tracker_next_week")}
          className="tap-target-compact flex items-center justify-center rounded-xl border border-black/[0.06] bg-white text-ink-700 transition-colors hover:bg-black/[0.03] hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.9} />
        </button>
      </div>

      <div className="mobile-matrix-date-row mt-4 grid grid-cols-7 gap-1.5 px-0.5 py-1.5 text-center">
        {mobileDays.map((dateKey) => {
          const isToday = dateKey === todayKey;
          const weekday = new Intl.DateTimeFormat("en", {
            weekday: "narrow",
          }).format(parseDateKey(dateKey));

          return (
            <div key={dateKey} className="min-w-0">
              <p
                className={`text-[11px] font-semibold ${
                  isToday ? "text-[#6D28D9]" : "text-ink-950"
                }`}
              >
                {dateKey.slice(-2)}
              </p>
              <p
                className={`text-[10px] ${
                  isToday ? "text-[#6D28D9]/70" : "text-ink-600"
                }`}
              >
                {weekday}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-2.5">
        {orderedActiveHabits.map((habit) => {
          const matrixTone = getHabitMatrixTone(habit.tone);
          const mobileRate = completionRate(
            records,
            habit.id,
            mobileStatsRange,
            todayKey,
            habit.timeSlots,
          );
          const recentCompleted = countCompleted(
            records,
            habit.id,
            mobileStatsRange,
            todayKey,
            habit.timeSlots,
          );
          const isMultiSlot =
            habit.frequencyPerDay > 1 && habit.timeSlots.length > 1;
          const todayCompletedCount = completedSlotsInDay(
            records,
            habit.id,
            todayKey,
            habit.timeSlots,
          );
          const mobileStreak =
            habit.isRewardable !== false
              ? getCurrentStreak(records, habit.id, todayKey, habit.timeSlots)
              : 0;

          return (
            <article
              key={habit.id}
              className="animate-fade-in-up rounded-[24px] border border-black/[0.06] bg-white px-3.5 py-3.5 shadow-[var(--shadow-card)] sm:px-4 sm:py-4"
            >
              <div className="flex items-start gap-3">
                <Link
                  href={`/dashboard/habits/${habit.slug}`}
                  aria-label={t("tracker_open_stats", { name: habit.name })}
                  className="flex min-w-0 flex-1 items-start gap-3 rounded-[18px] transition-colors hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]/35"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-ink-950/[0.05] text-ink-950 sm:h-10 sm:w-10">
                    <HabitIcon
                      name={habit.icon}
                      size={18}
                      className={accentClass(habit.tone)}
                      style={accentStyle(habit.tone)}
                    />
                  </div>

                  <div className="min-w-0 flex-1 pr-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-semibold leading-5 text-ink-950 transition-colors hover:text-[#6D28D9] sm:text-[15px]">
                          {habit.name}
                        </h3>
                        <p className="mt-0.5 text-[12px] leading-5 text-ink-600">
                          {isMultiSlot
                            ? t("tracker_slots_done_today", {
                                done: String(todayCompletedCount),
                                total: String(habit.timeSlots.length),
                              })
                            : t("tracker_days_completed", {
                                done: String(recentCompleted),
                                total: String(mobileStatsDays.length),
                              })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-md px-1.5 py-1 text-[11px] font-semibold ${isDark ? softFillClassDark(habit.tone) : softFillClass(habit.tone)} ${badgeClass(habit.tone)}`}
                          style={{
                            ...(isDark
                              ? softFillStyleDark(habit.tone)
                              : softFillStyle(habit.tone)),
                            ...badgeStyle(habit.tone),
                          }}
                        >
                          {mobileRate}%
                        </span>
                        {mobileStreak > 0 && (
                          <span
                            title={t("tracker_streak_tooltip", {
                              count: String(mobileStreak),
                            })}
                            className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200"
                          >
                            🔥 {mobileStreak}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {isMultiSlot ? (
                        <span className="text-[10px] text-ink-500 sm:text-[11px]">
                          {t("tracker_slots", {
                            count: String(habit.timeSlots.length),
                          })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>

                <HabitMenu
                  tone={habit.tone}
                  onEdit={() => onEditHabit(habit)}
                  onArchive={() => onArchiveHabit(habit)}
                  onDelete={() => onDeleteHabit(habit)}
                />
              </div>

              <div className="mt-2.5 border-t border-black/[0.05] pt-2.5">
                {isMultiSlot ? (
                  <div className="space-y-2.5">
                    {habit.timeSlots.map((slotName) => {
                      const slotCompletedCount = mobileDays.filter((dateKey) =>
                        isSlotCompleted(records[habit.id]?.[dateKey], slotName),
                      ).length;

                      return (
                        <div key={slotName} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-[11px] sm:text-[12px]">
                            <span className="font-medium text-ink-700">
                              {slotName}
                            </span>
                            <span className="text-ink-600">
                              {slotCompletedCount}/{mobileDays.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-7 gap-1.5">
                            {mobileDays.map((dateKey) => {
                              const isFuture = dateKey > todayKey;
                              const checked = isSlotCompleted(
                                records[habit.id]?.[dateKey],
                                slotName,
                              );

                              return (
                                <MobileMatrixDayCell
                                  key={`${habit.id}-${slotName}-${dateKey}`}
                                  checked={checked}
                                  isFuture={isFuture}
                                  matrixTone={matrixTone}
                                  ariaLabel={t("tracker_cell_aria_slot", {
                                    name: habit.name,
                                    slot: slotName,
                                    status: checked
                                      ? t("tracker_completed")
                                      : t("tracker_not_completed"),
                                    date: formatLongDate(dateKey),
                                  })}
                                  onClick={() => {
                                    if (!isFuture) {
                                      onToggleHabitDay(habit.id, dateKey, slotName);
                                    }
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1.5">
                    {mobileDays.map((dateKey) => {
                      const isFuture = dateKey > todayKey;
                      const checked = isSlotCompleted(
                        records[habit.id]?.[dateKey],
                        habit.timeSlots[0] ?? "default",
                        { fallbackToAny: true },
                      );

                      return (
                        <MobileMatrixDayCell
                          key={`${habit.id}-${dateKey}`}
                          checked={checked}
                          isFuture={isFuture}
                          matrixTone={matrixTone}
                          ariaLabel={t("tracker_cell_aria", {
                            name: habit.name,
                            status: checked
                              ? t("tracker_completed")
                              : t("tracker_not_completed"),
                            date: formatLongDate(dateKey),
                          })}
                          onClick={() => {
                            if (!isFuture) {
                              onToggleHabitDay(
                                habit.id,
                                dateKey,
                                habit.timeSlots[0] ?? "default",
                              );
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function DesktopMatrixSection({
  t,
  isDark,
  gridRows,
  desktopDays,
  desktopRange,
  desktopRangeLabel,
  desktopWindowLabel,
  records,
  todayKey,
  isLatestDesktopMonth,
  dragHabitId,
  dragOverHabitId,
  dragOverPosition,
  onResetToLatest,
  onPreviousMonth,
  onNextMonth,
  onToggleHabitDay,
  onDragHabitStart,
  onDragHabitOver,
  onDragHabitDrop,
  onDragHabitEnd,
  onEditHabit,
  onArchiveHabit,
  onDeleteHabit,
}: {
  t: TranslateFunction;
  isDark: boolean;
  gridRows: HabitTrackerGridRow[];
  desktopDays: string[];
  desktopRange: DateRange;
  desktopRangeLabel: string;
  desktopWindowLabel: string;
  records: HabitRecords;
  todayKey: string;
  isLatestDesktopMonth: boolean;
  dragHabitId: string | null;
  dragOverHabitId: string | null;
  dragOverPosition: "above" | "below";
  onResetToLatest: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToggleHabitDay: (habitId: string, dateKey: string, slotName?: string) => void;
  onDragHabitStart: (
    event: React.DragEvent<HTMLDivElement>,
    habitId: string,
  ) => void;
  onDragHabitOver: (
    event: React.DragEvent<HTMLDivElement>,
    habitId: string,
  ) => void;
  onDragHabitDrop: (
    event: React.DragEvent<HTMLDivElement>,
    habitId: string,
  ) => void;
  onDragHabitEnd: () => void;
} & HabitActionHandlers) {
  return (
    <section className="animate-scale-in surface-panel relative hidden overflow-visible rounded-2xl md:block">
      <div className="flex items-center justify-between gap-4 border-b border-black/[0.04] px-5 py-3 sm:px-6">
        <div>
          <h2 className="text-[14px] font-semibold text-ink-950">
            {t("tracker_matrix")}
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-700">
            {t("tracker_matrix_desc")}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isLatestDesktopMonth ? null : (
            <button
              type="button"
              onClick={onResetToLatest}
              className="pill-btn inline-flex h-8 items-center rounded-md bg-white px-2.5 text-[11px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
            >
              {t("tracker_latest")}
            </button>
          )}

          <div className="flex items-center gap-1 rounded-[14px] border border-black/[0.06] bg-white px-1 py-1 shadow-[var(--shadow-card)]">
            <button
              type="button"
              onClick={onPreviousMonth}
              aria-label={t("tracker_previous_month")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.06] bg-white text-ink-700 transition-colors hover:bg-black/[0.03] hover:text-ink-950"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.9} />
            </button>

            <div className="min-w-[108px] text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-600">
                {desktopWindowLabel}
              </p>
              <p className="mt-0.5 text-[12px] font-semibold text-ink-950">
                {desktopRangeLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={onNextMonth}
              disabled={isLatestDesktopMonth}
              aria-label={t("tracker_next_month")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.06] bg-white text-ink-700 transition-colors hover:bg-black/[0.03] hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="px-3 pb-3 pt-2 sm:px-4"
          style={{ minWidth: `${210 + desktopDays.length * 28}px` }}
        >
          <div
            className="grid gap-px rounded-xl p-px"
            style={{
              gridTemplateColumns: `210px repeat(${desktopDays.length}, minmax(28px, 1fr))`,
            }}
          >
            <div className="rounded-tl-[11px] bg-white px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-ink-700">
              {t("tracker_habit")}
            </div>
            {desktopDays.map((dateKey, index) => {
              const isFuture = dateKey > todayKey;
              const isToday = dateKey === todayKey;
              const weekday = new Intl.DateTimeFormat("en", {
                weekday: "narrow",
              }).format(parseDateKey(dateKey));

              return (
                <div
                  key={dateKey}
                  className={`px-1 py-3 text-center text-[12px] ${
                    index === desktopDays.length - 1 ? "rounded-tr-[11px]" : ""
                  } ${isToday ? "rounded-[10px] bg-[#6D28D9]/[0.07]" : "bg-white"}`}
                >
                  <p
                    className={`font-semibold ${isToday ? "text-[#6D28D9]" : "text-ink-950"}`}
                  >
                    {dateKey.slice(-2)}
                  </p>
                  <p
                    className={
                      isFuture
                        ? "text-ink-700/30"
                        : isToday
                          ? "text-[#6D28D9]/70"
                          : "text-ink-700"
                    }
                  >
                    {weekday}
                  </p>
                  {isToday && (
                    <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-[#6D28D9]" />
                  )}
                </div>
              );
            })}

            {gridRows.map((row, rowIndex) => {
              const { habit, slotName, rowType, isFirstSlot, isLastSlot } = row;
              const isLastRow = rowIndex === gridRows.length - 1;
              const displaySlotName = rowType === "slot" ? slotName : null;
              const matrixTone = getHabitMatrixTone(habit.tone);
              const isDraggedItem = dragHabitId === habit.id;
              const isDragTarget = dragOverHabitId === habit.id && isFirstSlot;

              return (
                <div key={`${habit.id}-${slotName}`} className="contents">
                  <div
                    draggable={isFirstSlot}
                    onDragStart={
                      isFirstSlot
                        ? (event) => onDragHabitStart(event, habit.id)
                        : undefined
                    }
                    onDragOver={(event) => onDragHabitOver(event, habit.id)}
                    onDrop={(event) => onDragHabitDrop(event, habit.id)}
                    onDragEnd={onDragHabitEnd}
                    className={`sticky left-0 z-30 flex min-w-0 flex-col justify-center bg-white px-3 py-2 transition-opacity ${
                      isLastRow ? "rounded-bl-[11px]" : ""
                    } ${
                      isLastSlot && !isLastRow
                        ? "border-b border-black/[0.07]"
                        : ""
                    } ${
                      !isLastSlot && habit.frequencyPerDay > 1
                        ? "border-b border-dashed border-black/[0.05]"
                        : ""
                    } ${isDraggedItem ? "opacity-40" : ""} ${
                      isDragTarget && dragOverPosition === "above"
                        ? "border-t-2 border-t-[#6D28D9]"
                        : ""
                    } ${
                      isDragTarget && dragOverPosition === "below"
                        ? "border-b-2 border-b-[#6D28D9]"
                        : ""
                    }`}
                  >
                    {isFirstSlot ? (
                      (() => {
                        const desktopStreak =
                          habit.isRewardable !== false
                            ? getCurrentStreak(
                                records,
                                habit.id,
                                todayKey,
                                habit.timeSlots,
                              )
                            : 0;
                        return (
                          <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <div
                                role="img"
                                aria-label={t("tracker_drag_reorder")}
                                className="shrink-0 cursor-grab touch-none text-ink-700/25 hover:text-ink-700/60 active:cursor-grabbing"
                                title={t("tracker_drag_reorder")}
                              >
                                <GripVertical
                                  className="h-3.5 w-3.5"
                                  strokeWidth={2}
                                />
                              </div>
                              <HabitIcon
                                name={habit.icon}
                                size={14}
                                className={`shrink-0 ${accentClass(habit.tone)}`}
                                style={accentStyle(habit.tone)}
                              />
                              <div className="flex-1" />
                              {desktopStreak > 0 && (
                                <span
                                  title={t("tracker_streak_tooltip", {
                                    count: String(desktopStreak),
                                  })}
                                  className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200"
                                >
                                  🔥 {desktopStreak}
                                </span>
                              )}
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${isDark ? softFillClassDark(habit.tone) : softFillClass(habit.tone)} ${badgeClass(habit.tone)}`}
                                style={{
                                  ...(isDark
                                    ? softFillStyleDark(habit.tone)
                                    : softFillStyle(habit.tone)),
                                  ...badgeStyle(habit.tone),
                                }}
                              >
                                {completionRate(
                                  records,
                                  habit.id,
                                  desktopRange,
                                  todayKey,
                                  habit.timeSlots,
                                )}
                                %
                              </span>
                              <HabitMenu
                                tone={habit.tone}
                                onEdit={() => onEditHabit(habit)}
                                onArchive={() => onArchiveHabit(habit)}
                                onDelete={() => onDeleteHabit(habit)}
                              />
                            </div>
                            <Link
                              href={`/dashboard/habits/${habit.slug}`}
                              className="block truncate text-[13px] font-semibold leading-tight text-ink-950 transition-colors hover:text-[#6D28D9] focus-visible:outline-none focus-visible:text-[#6D28D9]"
                            >
                              {habit.name}
                            </Link>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="pl-5 text-[12px] text-ink-700">
                        {displaySlotName}
                      </p>
                    )}
                  </div>

                  {desktopDays.map((dateKey, colIndex) => {
                    const isFuture = dateKey > todayKey;

                    if (rowType === "total") {
                      const completedCount = completedSlotsInDay(
                        records,
                        habit.id,
                        dateKey,
                        habit.timeSlots,
                      );
                      const totalSlotCount = habit.timeSlots.length;
                      const fraction =
                        totalSlotCount > 0 ? completedCount / totalSlotCount : 0;
                      const isFull = fraction >= 1;

                      return (
                        <div
                          key={`${habit.id}-total-${dateKey}`}
                          className={`relative flex h-full min-h-[44px] items-center justify-center border-b border-dashed border-black/[0.05] ${
                            isLastRow && colIndex === desktopDays.length - 1
                              ? "rounded-br-[11px]"
                              : ""
                          } ${isFuture ? "opacity-40" : ""}`}
                        >
                          <span
                            className={`matrix-check relative flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-lg ${
                              isFull
                                ? "matrix-check-checked text-white"
                                : "matrix-check-idle"
                            }`}
                            style={
                              isFull
                                ? {
                                    backgroundColor: matrixTone.fill,
                                    borderColor: "transparent",
                                    boxShadow: `0 6px 14px ${matrixTone.glow}, 0 1px 2px rgba(10, 22, 40, 0.12)`,
                                  }
                                : fraction > 0
                                  ? { borderColor: matrixTone.fill }
                                  : undefined
                            }
                          >
                            {fraction > 0 && !isFull && (
                              <span
                                className="absolute inset-x-0 bottom-0"
                                style={{
                                  height: `${fraction * 100}%`,
                                  backgroundColor: matrixTone.fill,
                                  opacity: 0.65,
                                }}
                              />
                            )}
                            {isFull && (
                              <Check
                                aria-hidden="true"
                                className="relative z-10 h-3 w-3"
                                strokeWidth={2.2}
                              />
                            )}
                          </span>
                        </div>
                      );
                    }

                    const daySlots = records[habit.id]?.[dateKey];
                    const slotChecked = isSlotCompleted(daySlots, slotName, {
                      fallbackToAny: rowType === "single",
                    });
                    const checkStyle = slotChecked
                      ? {
                          backgroundColor: matrixTone.fill,
                          borderColor: "transparent",
                          boxShadow: `0 6px 14px ${matrixTone.glow}, 0 1px 2px rgba(10, 22, 40, 0.12)`,
                        }
                      : undefined;

                    return (
                      <button
                        key={`${habit.id}-${slotName}-${dateKey}`}
                        type="button"
                        onClick={() => {
                          if (!isFuture) {
                            onToggleHabitDay(habit.id, dateKey, slotName);
                          }
                        }}
                        disabled={isFuture}
                        aria-label={`${habit.name}${displaySlotName ? ` ${displaySlotName}` : ""} ${slotChecked ? "completed" : "not completed"} on ${formatLongDate(dateKey)}`}
                        style={
                          {
                            "--matrix-hover-bg": matrixTone.cellTint,
                          } as React.CSSProperties
                        }
                        className={`matrix-day-btn relative flex h-full min-h-[44px] items-center justify-center ${
                          isLastRow && colIndex === desktopDays.length - 1
                            ? "rounded-br-[11px]"
                            : ""
                        } ${
                          isLastSlot && !isLastRow
                            ? "border-b border-black/[0.07]"
                            : ""
                        }`}
                      >
                        <span
                          style={checkStyle}
                          className={`matrix-check relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-lg transition-all duration-200 ${
                            slotChecked
                              ? "matrix-check-pop matrix-check-checked text-white"
                              : "matrix-check-idle text-transparent"
                          }`}
                        >
                          <Check
                            aria-hidden="true"
                            className={`h-3 w-3 ${slotChecked ? "opacity-100" : "opacity-0"}`}
                            strokeWidth={2.2}
                          />
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
  );
}

export function HabitSummaryCards({
  t,
  isDark,
  habitSummaries,
}: {
  t: TranslateFunction;
  isDark: boolean;
  habitSummaries: Array<{
    habit: HabitDefinition;
    completed: number;
    rate: number;
  }>;
}) {
  return (
    <section className="stagger-children grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {habitSummaries.map(({ habit, completed, rate }) => {
        const cardGradient = getHabitCardGradient(habit.tone, isDark);
        return (
          <Link
            key={habit.id}
            href={`/dashboard/habits/${habit.slug}`}
            className={`group relative overflow-hidden rounded-2xl border border-white/75 p-4 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] ${cardGradient.className ?? ""}`}
            style={cardGradient.style}
          >
            <div className="absolute inset-x-6 bottom-0 h-16 rounded-full bg-white/60 blur-3xl transition-transform duration-500 group-hover:scale-125" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HabitIcon
                    name={habit.icon}
                    size={18}
                    className={`shrink-0 ${accentClass(habit.tone)}`}
                    style={accentStyle(habit.tone)}
                  />
                  <h3 className="text-[16px] font-semibold text-ink-950">
                    {habit.name}
                  </h3>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${isDark ? softFillClassDark(habit.tone) : softFillClass(habit.tone)}`}
                  style={
                    isDark ? softFillStyleDark(habit.tone) : softFillStyle(habit.tone)
                  }
                >
                  {rate}%
                </span>
              </div>
              {habit.description ? (
                <p className="text-[14px] leading-5 text-ink-700">
                  {habit.description}
                </p>
              ) : null}
              {habit.frequencyPerDay > 1 && (
                <div className="flex flex-wrap gap-1">
                  {habit.timeSlots.map((slot) => (
                    <span
                      key={slot}
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${isDark ? softFillClassDark(habit.tone) : softFillClass(habit.tone)}`}
                      style={
                        isDark
                          ? softFillStyleDark(habit.tone)
                          : softFillStyle(habit.tone)
                      }
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-end justify-between pt-1">
                <div>
                  <p className="text-[12px] text-ink-700">{t("stats_completed")}</p>
                  <p className="font-display text-[22px] font-semibold tabular-nums text-ink-950">
                    {completed}
                  </p>
                </div>
                <span
                  className={`text-[13px] font-medium ${accentClass(habit.tone)} transition-transform duration-200 group-hover:translate-x-0.5`}
                  style={accentStyle(habit.tone)}
                >
                  {t("tracker_view_stats")}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

export function HabitTrackerDialogs({
  t,
  formOpen,
  editingHabit,
  deleteTarget,
  archiveFeedback,
  onCloseForm,
  onSaveHabit,
  onUndoArchive,
  onDismissArchiveFeedback,
  onConfirmDelete,
  onCancelDelete,
}: {
  t: TranslateFunction;
  formOpen: boolean;
  editingHabit: HabitDefinition | null;
  deleteTarget: HabitDefinition | null;
  archiveFeedback: HabitDefinition | null;
  onCloseForm: () => void;
  onSaveHabit: (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => Promise<void>;
  onUndoArchive: () => void;
  onDismissArchiveFeedback: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  return (
    <>
      <ArchiveFeedback
        open={!!archiveFeedback}
        habitName={archiveFeedback?.name ?? null}
        onUndo={onUndoArchive}
        onDismiss={onDismissArchiveFeedback}
      />

      <HabitForm
        open={formOpen}
        onClose={onCloseForm}
        onSave={onSaveHabit}
        initial={editingHabit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t("archive_delete_permanently")}
        message={
          deleteTarget
            ? t("habit_delete_confirm", { name: deleteTarget.name })
            : ""
        }
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
}
