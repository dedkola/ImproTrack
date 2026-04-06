"use client";

import Link from "next/link";
import { useState } from "react";
import { getCurrentMonthRange, startOfDay, toDateKey } from "@/lib/date";
import { HabitDefinition } from "@/lib/habits";
import {
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
import { HabitChart } from "@/components/habit-chart";

const today = startOfDay(new Date());
const todayKey = toDateKey(today);

export function HabitDetail({ slug }: { slug: string }) {
  const {
    activeHabits,
    categories,
    getHabitBySlug,
    updateHabit,
    deleteHabit,
    archiveHabit,
    habits: allHabits,
  } = useHabits();
  const { records } = useHabitRecords(allHabits);
  const habit = getHabitBySlug(slug);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!habit) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center py-5">
        <div className="animate-scale-in surface-panel rounded-2xl p-6 text-center">
          <p className="text-[14px] text-ink-700">Habit not found</p>
          <h1 className="mt-2 text-[20px] font-semibold text-ink-950">
            This habit does not exist.
          </h1>
          <Link
            href="/"
            className="pill-btn tap-target mt-4 inline-flex rounded-lg bg-ink-950 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
          >
            Back to tracker
          </Link>
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

  const handleSave = (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => {
    updateHabit(habit.id, data);
  };

  return (
    <div className="page-shell flex flex-col gap-4 py-5">
      {/* Header */}
      <header className="animate-fade-in-up surface-panel overflow-hidden rounded-2xl px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[28px]">{habit.icon}</span>
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight text-ink-950 sm:text-[26px]">
                  {habit.name}
                </h1>
                <p className="mt-2 max-w-xl text-[14px] leading-6 text-ink-700">
                  {habit.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HabitMenu
                tone={habit.tone}
                onEdit={() => setFormOpen(true)}
                onArchive={() => archiveHabit(habit.id)}
                onDelete={() => setDeleteOpen(true)}
              />
              <Link
                href="/"
                className="pill-btn tap-target-compact inline-flex items-center justify-center rounded-lg bg-white/80 px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)]"
              >
                &larr; Back
              </Link>
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${habit.tone.softFill}`}
            >
              {habit.category}
            </span>
            {habit.frequencyPerDay > 1 && (
              <span
                className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${habit.tone.softFill}`}
              >
                {habit.frequencyPerDay}x / day
              </span>
            )}
            <span className="text-[12px] text-ink-700">{habit.goalLabel}</span>
          </div>

          {/* Stats cards */}
          <div className="stagger-children grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="This month"
              value={`${monthRate}%`}
              detail={`${monthCompleted} completed`}
            />
            <StatCard
              label="All time"
              value={String(total)}
              detail={habit.unitLabel}
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
      </header>

      {/* Slot breakdown (for multi-slot habits) */}
      {slotBreakdown && (
        <section
          className="animate-fade-in-up surface-panel rounded-2xl p-5 sm:p-6"
          style={{ animationDelay: "75ms" }}
        >
          <h2 className="text-[13px] font-semibold text-ink-950">
            Slot breakdown
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                    className={`h-[6px] rounded-full ${habit.tone.fill} transition-all duration-700 ease-out`}
                    style={{ width: `${slot.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chart */}
      <HabitChart
        records={records}
        habitId={habit.id}
        timeSlots={habit.timeSlots}
        tone={habit.tone}
      />

      {/* Monthly trend & weekday pattern */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div
          className="animate-fade-in-up surface-panel rounded-2xl p-5 sm:p-6"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-ink-950">
              Monthly trend
            </h2>
            <span
              className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${habit.tone.softFill}`}
            >
              Last 6 months
            </span>
          </div>

          <div className="stagger-children mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
          className="animate-fade-in-up surface-panel rounded-2xl p-5 sm:p-6"
          style={{ animationDelay: "150ms" }}
        >
          <h2 className="text-[13px] font-semibold text-ink-950">
            Weekday pattern
          </h2>

          <div className="mt-4 space-y-3.5">
            {weekdayPerformance.map((entry) => (
              <div key={entry.label}>
                <div className="mb-1.5 flex items-center justify-between text-[13px] text-ink-700">
                  <span>{entry.label}</span>
                  <span className="tabular-nums">{entry.rate}%</span>
                </div>
                <div className="h-[6px] overflow-hidden rounded-full bg-black/[0.04]">
                  <div
                    className={`h-[6px] rounded-full ${habit.tone.fill} transition-all duration-700 ease-out`}
                    style={{ width: `${entry.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={habit}
        existingCategories={categories}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete habit"
        message={`Are you sure you want to permanently delete "${habit.name}"? This action cannot be undone.`}
        onConfirm={() => {
          deleteHabit(habit.id);
          setDeleteOpen(false);
          window.location.href = "/";
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
    <div className="rounded-xl border border-black/[0.06] bg-white p-3.5 shadow-[var(--shadow-card)] transition-all duration-200 hover:bg-black/[0.02] hover:shadow-[var(--shadow-card-hover)]">
      <p className="text-[13px] text-ink-700">{label}</p>
      <p className="mt-1 font-display text-[22px] font-semibold tabular-nums text-ink-950">
        {value}
      </p>
      <p className="mt-0.5 text-[12px] text-ink-700">{detail}</p>
    </div>
  );
}
