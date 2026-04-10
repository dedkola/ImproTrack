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
import { HabitIcon } from "@/components/habit-icon";
import { HabitChart } from "@/components/habit-chart";
import {
  softFillClass,
  softFillStyle,
  fillClass,
  fillStyle,
} from "@/lib/tone-utils";

const today = startOfDay(new Date());
const todayKey = toDateKey(today);

export function HabitDetail({ slug }: { slug: string }) {
  const {
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
            href="/dashboard"
            className="pill-btn tap-target mt-4 inline-flex rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
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
  const habitDescription =
    habit.description.trim().length > 0
      ? habit.description
      : "Use this page to watch the pattern, protect the streak, and tune the routine if it starts slipping.";

  const handleSave = (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => {
    updateHabit(habit.id, data);
  };

  return (
    <div className="page-shell flex flex-col gap-4 py-5">
      {/* Header */}
      <header className="animate-fade-in-up surface-panel overflow-hidden rounded-[28px] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${softFillClass(habit.tone)}`}
                style={softFillStyle(habit.tone)}
              >
                <HabitIcon
                  name={habit.icon}
                  size={24}
                  className="shrink-0 text-ink-700"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold ${softFillClass(habit.tone)}`}
                    style={softFillStyle(habit.tone)}
                  >
                    {monthRate}% this month
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-ink-950 shadow-[var(--shadow-card)]">
                    {currentStreak} day streak
                  </span>
                </div>
                <h1 className="mt-3 text-[24px] font-semibold tracking-tight text-ink-950 sm:text-[28px]">
                  {habit.name}
                </h1>
                <p className="mt-2 max-w-2xl text-[14px] leading-6 text-ink-700 sm:text-[15px]">
                  {habitDescription}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:items-center">
              <Link
                href="/dashboard"
                className="pill-btn tap-target-compact inline-flex w-full items-center justify-center rounded-lg bg-white/80 px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)] sm:w-auto"
              >
                &larr; Back
              </Link>
              <div className="flex justify-end sm:block">
                <HabitMenu
                  tone={habit.tone}
                  onEdit={() => setFormOpen(true)}
                  onArchive={() => archiveHabit(habit.id)}
                  onDelete={() => setDeleteOpen(true)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${softFillClass(habit.tone)}`}
              style={softFillStyle(habit.tone)}
            >
              {habit.category}
            </span>
            <span className="rounded-md bg-white px-2.5 py-1 text-[12px] font-medium text-ink-700 shadow-[var(--shadow-card)]">
              {habit.frequencyPerDay > 1
                ? `${habit.frequencyPerDay} slots per day`
                : "Once per day"}
            </span>
            <span className="rounded-md bg-ink-950/[0.05] px-2.5 py-1 text-[12px] font-medium text-ink-700">
              Goal: {habit.goalLabel}
            </span>
          </div>
        </div>
      </header>

      <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
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
      </section>

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
                    className={`h-[6px] rounded-full ${fillClass(habit.tone)} transition-all duration-700 ease-out`}
                    style={{ width: `${slot.rate}%`, ...fillStyle(habit.tone) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[13px] font-semibold text-ink-950">
              Weekday pattern
            </h2>
            <p className="text-[12px] text-ink-700">
              Where this routine fits your real week.
            </p>
          </div>

          <div className="mt-4 space-y-3.5">
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
    <div className="rounded-[22px] border border-black/[0.06] bg-white p-3.5 shadow-[var(--shadow-card)] transition-all duration-200 hover:bg-black/[0.02] hover:shadow-[var(--shadow-card-hover)]">
      <p className="text-[13px] text-ink-700">{label}</p>
      <p className="mt-1 font-display text-[22px] font-semibold tabular-nums text-ink-950 sm:text-[24px]">
        {value}
      </p>
      <p className="mt-0.5 text-[12px] text-ink-700">{detail}</p>
    </div>
  );
}
