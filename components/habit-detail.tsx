"use client";

import Link from "next/link";
import { getCurrentMonthRange, startOfDay, toDateKey } from "@/lib/date";
import { getHabitBySlug } from "@/lib/habits";
import {
  completionRate,
  countCompleted,
  getBestStreak,
  getCurrentStreak,
  getMonthBuckets,
  getWeekdayPerformance,
  totalCompletedAllTime
} from "@/lib/stats";
import { useHabitRecords } from "@/lib/storage";

const today = startOfDay(new Date());
const todayKey = toDateKey(today);

export function HabitDetail({ slug }: { slug: string }) {
  const { records } = useHabitRecords();
  const habit = getHabitBySlug(slug);

  if (!habit) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
        <div className="surface-panel rounded-[32px] p-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-ink-700">Habit not found</p>
          <h1 className="mt-3 font-display text-3xl text-ink-950">This habit does not exist.</h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to tracker
          </Link>
        </div>
      </main>
    );
  }

  const currentMonth = getCurrentMonthRange(today);
  const monthRate = completionRate(records, habit.id, currentMonth, todayKey);
  const monthCompleted = countCompleted(records, habit.id, currentMonth, todayKey);
  const total = totalCompletedAllTime(records, habit.id);
  const currentStreak = getCurrentStreak(records, habit.id, todayKey);
  const bestStreak = getBestStreak(records, habit.id);
  const monthBuckets = getMonthBuckets(records, habit.id);
  const weekdayPerformance = getWeekdayPerformance(records, habit.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <section
        className={`surface-panel overflow-hidden rounded-[34px] bg-linear-to-br ${habit.tone.surface} p-6 sm:p-8`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-ink-700">Habit detail</p>
              <h1 className="mt-2 font-display text-4xl text-ink-950 sm:text-5xl">{habit.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700 sm:text-base">
                {habit.description} This view keeps the full history for this habit in one place,
                with completion trends, streaks, and weekday patterns.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-ink-950 ring-1 ring-white/80"
            >
              Back to tracker
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="This month" value={`${monthRate}%`} detail={`${monthCompleted} completed`} />
            <StatCard label="All time total" value={String(total)} detail={habit.unitLabel} />
            <StatCard label="Current streak" value={`${currentStreak}`} detail="days in a row" />
            <StatCard label="Best streak" value={`${bestStreak}`} detail="best run" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-ink-700">Monthly trend</p>
              <h2 className="mt-1 font-display text-2xl text-ink-950">Last six months</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${habit.tone.softFill}`}>
              Total history
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {monthBuckets.map(([month, completed]) => (
              <div key={month} className="rounded-[28px] bg-paper-50 p-4 ring-1 ring-paper-200">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-700">{month}</p>
                <p className="mt-3 font-display text-4xl text-ink-950">{completed}</p>
                <p className="mt-1 text-sm text-ink-700">completed days</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-[32px] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-ink-700">Weekday pattern</p>
          <h2 className="mt-1 font-display text-2xl text-ink-950">Where the habit feels easiest</h2>

          <div className="mt-6 space-y-4">
            {weekdayPerformance.map((entry) => (
              <div key={entry.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-ink-700">
                  <span>{entry.label}</span>
                  <span>{entry.rate}%</span>
                </div>
                <div className="h-3 rounded-full bg-paper-100">
                  <div
                    className={`h-3 rounded-full ${habit.tone.fill}`}
                    style={{ width: `${entry.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] bg-white/78 p-5 ring-1 ring-white/80">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-700">{label}</p>
      <p className="mt-3 font-display text-4xl text-ink-950">{value}</p>
      <p className="mt-2 text-sm text-ink-700">{detail}</p>
    </div>
  );
}
