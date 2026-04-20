"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  formatMonthLabel,
  getCurrentMonthRange,
  startOfDay,
  toDateKey,
} from "@/lib/date";
import { HabitDefinition } from "@/lib/habits";
import {
  completedSlotsInDay,
  completionRate,
  countCompleted,
  getBestStreak,
  getCurrentStreak,
  getMonthBuckets,
  getSlotBreakdown,
  getWeekdayPerformance,
  totalCompletedAllTime,
} from "@/lib/stats";
import { useHabits, useHabitRecords } from "@/lib/storage";
import { HabitForm, HabitMenu, ConfirmDialog } from "@/components/habit-form";
import { ArchiveFeedback } from "@/components/archive-feedback";
import { HabitIcon } from "@/components/habit-icon";
import { HabitChart } from "@/components/habit-chart";
import {
  accentClass,
  accentStyle,
  softFillClass,
  softFillStyle,
  fillClass,
  fillStyle,
} from "@/lib/tone-utils";

const today = startOfDay(new Date());
const todayKey = toDateKey(today);

export function HabitDetail({ slug }: { slug: string }) {
  const {
    getHabitBySlug,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    habits: allHabits,
  } = useHabits();
  const { records, loadFullHistory, fullHistoryState } = useHabitRecords(allHabits);
  const habit = getHabitBySlug(slug);

  useEffect(() => {
    loadFullHistory();
  }, [loadFullHistory]);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveFeedbackOpen, setArchiveFeedbackOpen] = useState(false);

  if (!habit) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center py-5">
        <div className="animate-scale-in surface-panel max-w-lg rounded-2xl p-6 text-center">
          <p className="text-[14px] text-ink-700">Habit not found</p>
          <h1 className="mt-2 text-[20px] font-semibold text-ink-950">
            This habit does not exist.
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-ink-700">
            It may have been deleted, archived, or opened from an old link.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
            >
              Back to tracker
            </Link>
            <Link
              href="/dashboard/archive"
              className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
            >
              Open archive
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = getCurrentMonthRange(today);
  const monthRate = completionRate(
    records,
    habit.id,
    currentMonth,
    todayKey,
    habit.timeSlots,
  );
  const monthCompleted = countCompleted(
    records,
    habit.id,
    currentMonth,
    todayKey,
    habit.timeSlots,
  );
  const total = totalCompletedAllTime(records, habit.id, habit.timeSlots);
  const currentStreak = getCurrentStreak(
    records,
    habit.id,
    todayKey,
    habit.timeSlots,
  );
  const bestStreak = getBestStreak(records, habit.id, habit.timeSlots);
  const monthBuckets = getMonthBuckets(records, habit.id, habit.timeSlots);
  const weekdayPerformance = getWeekdayPerformance(
    records,
    habit.id,
    habit.timeSlots,
  );
  const slotBreakdown =
    habit.frequencyPerDay > 1
      ? getSlotBreakdown(records, habit.id, habit.timeSlots)
      : null;
  const todayCompleted = completedSlotsInDay(
    records,
    habit.id,
    todayKey,
    habit.timeSlots,
  );
  const todaySummary =
    habit.frequencyPerDay > 1
      ? `${todayCompleted}/${habit.timeSlots.length} slots today`
      : todayCompleted > 0
        ? "Completed today"
        : "Not done today";
  const monthLabel = formatMonthLabel(currentMonth);

  const handleSave = async (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => {
    await updateHabit(habit.id, data);
  };

  const handleArchiveHabit = async () => {
    await archiveHabit(habit.id);
    setArchiveFeedbackOpen(true);
  };

  const handleUndoArchive = async () => {
    await restoreHabit(habit.id);
    setArchiveFeedbackOpen(false);
  };

  return (
    <div className="page-shell min-w-0 flex flex-col gap-3 py-4 sm:gap-4 sm:py-5">
      {/* Header */}
      <header className="animate-fade-in-up surface-panel overflow-hidden rounded-[28px] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <Link
              href="/dashboard"
              className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-white/80 px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)] sm:text-[14px]"
            >
              <span className="sm:hidden">&larr; Back</span>
              <span className="hidden sm:inline">&larr; Dashboard</span>
            </Link>
            <HabitMenu
              tone={habit.tone}
              onEdit={() => setFormOpen(true)}
              onArchive={() => {
                void handleArchiveHabit();
              }}
              onDelete={() => setDeleteOpen(true)}
            />
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-ink-950/[0.05] text-ink-950 sm:h-12 sm:w-12 sm:rounded-[20px]">
              <HabitIcon
                name={habit.icon}
                size={20}
                className={`shrink-0 ${accentClass(habit.tone)}`}
                style={accentStyle(habit.tone)}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-700 shadow-[var(--shadow-card)]">
                  {monthLabel}
                </span>
              </div>
              <h1 className="mt-2 text-[20px] font-semibold tracking-tight text-ink-950 sm:mt-3 sm:text-[26px]">
                {habit.name}
              </h1>
              {habit.description ? (
                <p className="mt-1.5 max-w-xl text-[14px] leading-5 text-ink-700 sm:mt-2 sm:leading-6">
                  {habit.description}
                </p>
              ) : (
                <p className="mt-1.5 max-w-xl text-[14px] leading-5 text-ink-600 sm:mt-2 sm:leading-6">
                  This habit is being tracked without a description yet.
                </p>
              )}
            </div>
          </div>

          <div className="comparison-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <span className="shrink-0 rounded-full bg-ink-950/[0.05] px-3 py-2 text-[12px] font-semibold text-ink-950">
              {todaySummary}
            </span>
            <span className="shrink-0 rounded-full bg-white px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-[var(--shadow-card)]">
              {monthRate}% this month
            </span>
            <span
              className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-medium ${softFillClass(habit.tone)}`}
              style={softFillStyle(habit.tone)}
            >
              {currentStreak} day streak
            </span>
            {habit.frequencyPerDay > 1 && (
              <span
                className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-medium ${softFillClass(habit.tone)}`}
                style={softFillStyle(habit.tone)}
              >
                {habit.frequencyPerDay}x / day
              </span>
            )}
            <span className="shrink-0 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-ink-700 shadow-[var(--shadow-card)]">
              {habit.goalLabel}
            </span>
          </div>
        </div>
      </header>

      {fullHistoryState.status !== "ready" ? (
        <section
          className={`animate-fade-in-up rounded-[24px] border px-4 py-3 shadow-[var(--shadow-card)] sm:px-5 ${
            fullHistoryState.status === "error"
              ? "border-red-200 bg-red-50 text-red-950"
              : "border-sky-200 bg-sky-50 text-sky-950"
          }`}
          style={{ animationDelay: "40ms" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold">
                {fullHistoryState.status === "error"
                  ? "Older history could not load"
                  : "Loading older history"}
              </p>
              <p
                className={`mt-1 text-[12px] leading-5 ${
                  fullHistoryState.status === "error"
                    ? "text-red-900/85"
                    : "text-sky-900/85"
                }`}
              >
                {fullHistoryState.status === "error"
                  ? `${fullHistoryState.error} All-time totals, streaks, and weekday patterns may still be incomplete.`
                  : "All-time totals, streaks, monthly trend, and weekday patterns will fill in as older months finish syncing."}
              </p>
            </div>

            {fullHistoryState.status === "error" ? (
              <button
                type="button"
                onClick={() => void loadFullHistory()}
                className="pill-btn inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
              >
                Retry history load
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Slot breakdown (for multi-slot habits) */}
      {slotBreakdown && (
        <section
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-3.5 sm:p-6"
          style={{ animationDelay: "75ms" }}
        >
          <h2 className="text-[13px] font-semibold text-ink-950">
            Slot breakdown
          </h2>

          <div className="comparison-scroll mt-4 flex gap-3 overflow-x-auto pb-1 md:hidden">
            {slotBreakdown.map((slot) => (
              <div
                key={slot.slot}
                className="w-[12.5rem] shrink-0 rounded-xl border border-black/[0.06] bg-white p-3 shadow-[var(--shadow-card)] sm:w-[13.5rem] sm:p-3.5"
              >
                <p className="text-[12px] font-medium text-ink-700">
                  {slot.slot}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-[22px] font-semibold tabular-nums text-ink-950">
                    {slot.rate}%
                  </span>
                  <span className="mb-0.5 text-[12px] text-ink-700">
                    {slot.completed} / {slot.total} days
                  </span>
                </div>
                <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-black/[0.04]">
                  <div
                    className={`h-[6px] rounded-full ${fillClass(habit.tone)} transition-all duration-700 ease-out`}
                    style={{ width: `${slot.rate}%`, ...fillStyle(habit.tone) }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-3">
            {slotBreakdown.map((slot) => (
              <div
                key={slot.slot}
                className="rounded-xl border border-black/[0.06] bg-white p-3.5 transition-colors hover:bg-black/[0.02]"
              >
                <p className="text-[12px] font-medium text-ink-700">
                  {slot.slot}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-[22px] font-semibold tabular-nums text-ink-950">
                    {slot.rate}%
                  </span>
                  <span className="mb-0.5 text-[12px] text-ink-700">
                    {slot.completed} / {slot.total} days
                  </span>
                </div>
                <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-black/[0.04]">
                  <div
                    className={`h-[6px] rounded-full ${fillClass(habit.tone)} transition-all duration-700 ease-out`}
                    style={{ width: `${slot.rate}%`, ...fillStyle(habit.tone) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chart + stat cards side by side */}
      <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-stretch lg:gap-4">
        <div className="min-w-0 flex-1">
          <HabitChart
            records={records}
            habitId={habit.id}
            timeSlots={habit.timeSlots}
            tone={habit.tone}
          />
        </div>
        <div className="stagger-children grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:w-48 lg:shrink-0 lg:grid-cols-1 lg:flex-col">
          <StatCard
            label="This month"
            value={`${monthRate}%`}
            detail={`${monthCompleted} completed`}
          />
          <StatCard
            label="All time"
            value={String(total)}
            detail={
              fullHistoryState.status === "ready"
                ? habit.unitLabel
                : `${habit.unitLabel} · partial history`
            }
          />
          <StatCard
            label="Current streak"
            value={`${currentStreak}`}
            detail="days"
          />
          <StatCard
            label="Best streak"
            value={`${bestStreak}`}
            detail="best run"
          />
        </div>
      </div>

      {/* Monthly trend & weekday pattern */}
      <section className="grid gap-3.5 lg:grid-cols-[1.2fr_0.8fr]">
        <div
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-3.5 sm:p-6"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-ink-950">
              Monthly trend
            </h2>
            <span
              className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${softFillClass(habit.tone)}`}
              style={softFillStyle(habit.tone)}
            >
              Last 6 months
            </span>
          </div>

          <div className="comparison-scroll mt-4 flex gap-3 overflow-x-auto pb-1 md:hidden">
            {monthBuckets.map(([month, completed]) => (
              <div
                key={month}
                className="w-32 shrink-0 rounded-xl border border-black/[0.06] bg-white p-3.5 shadow-[var(--shadow-card)]"
              >
                <p className="text-[12px] text-ink-700">{month}</p>
                <p className="mt-1.5 font-display text-[22px] font-semibold tabular-nums text-ink-950">
                  {completed}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-700">completed</p>
              </div>
            ))}
          </div>

          <div className="stagger-children mt-4 hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-3">
            {monthBuckets.map(([month, completed]) => (
              <div
                key={month}
                className="rounded-xl border border-black/[0.06] bg-white p-3.5 transition-colors hover:bg-black/[0.02]"
              >
                <p className="text-[12px] text-ink-700">{month}</p>
                <p className="mt-1.5 font-display text-[22px] font-semibold tabular-nums text-ink-950">
                  {completed}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-700">completed</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="animate-fade-in-up surface-panel min-w-0 rounded-[28px] p-3.5 sm:p-6"
          style={{ animationDelay: "150ms" }}
        >
          <h2 className="text-[13px] font-semibold text-ink-950">
            Weekday pattern
          </h2>

          <div className="comparison-scroll mt-4 flex gap-3 overflow-x-auto pb-1 md:hidden">
            {weekdayPerformance.map((entry) => (
              <div
                key={entry.label}
                className="w-28 shrink-0 rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-end justify-between gap-3">
                  <span className="text-[13px] font-semibold text-ink-950">
                    {entry.label}
                  </span>
                  <span className="font-display text-[22px] font-semibold tabular-nums text-ink-950">
                    {entry.rate}%
                  </span>
                </div>
                <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-black/[0.05]">
                  <div
                    className={`h-[7px] rounded-full ${fillClass(habit.tone)} transition-all duration-700 ease-out`}
                    style={{
                      width: `${entry.rate}%`,
                      ...fillStyle(habit.tone),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden space-y-3.5 md:block">
            {weekdayPerformance.map((entry) => (
              <div key={entry.label}>
                <div className="mb-1.5 flex items-center justify-between text-[13px] text-ink-700">
                  <span>{entry.label}</span>
                  <span className="tabular-nums">{entry.rate}%</span>
                </div>
                <div className="h-[6px] overflow-hidden rounded-full bg-black/[0.04]">
                  <div
                    className={`h-[6px] rounded-full ${fillClass(habit.tone)} transition-all duration-700 ease-out`}
                    style={{
                      width: `${entry.rate}%`,
                      ...fillStyle(habit.tone),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ArchiveFeedback
        open={archiveFeedbackOpen}
        habitName={habit.name}
        onUndo={() => {
          void handleUndoArchive();
        }}
        onDismiss={() => setArchiveFeedbackOpen(false)}
      />

      {/* Modals */}
      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={habit}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete habit"
        message={`Are you sure you want to permanently delete "${habit.name}"? This action cannot be undone.`}
        onConfirm={() => {
          deleteHabit(habit.id);
          setDeleteOpen(false);
          window.location.href = "/dashboard";
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-black/[0.06] bg-white p-3 shadow-[var(--shadow-card)] transition-all duration-200 hover:bg-black/[0.02] hover:shadow-[var(--shadow-card-hover)] sm:p-3.5">
      <p className="text-[12px] text-ink-700 sm:text-[13px]">{label}</p>
      <p className="mt-1 font-display text-[18px] font-semibold tabular-nums text-ink-950 sm:text-[22px]">
        {value}
      </p>
      <p className="mt-0.5 text-[12px] leading-5 text-ink-700">{detail}</p>
    </div>
  );
}
