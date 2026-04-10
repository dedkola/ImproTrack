"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/habit-form";
import { HabitIcon } from "@/components/habit-icon";
import { useHabits } from "@/lib/storage";
import { softFillClass, softFillStyle } from "@/lib/tone-utils";

export function ArchivePage() {
  const { archivedHabits, restoreHabit, deleteHabit } = useHabits();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const target = archivedHabits.find((habit) => habit.id === confirmId);

  return (
    <div className="page-shell flex flex-col gap-4 py-5">
      <header className="animate-fade-in-up surface-panel rounded-[28px] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-700">
              Archive
            </span>
            <h1 className="mt-4 text-[28px] font-semibold tracking-tight text-ink-950 sm:text-[32px]">
              Archived habits stay close, not buried.
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-6 text-ink-700 sm:text-[15px]">
              Restore routines when they are ready to return, or remove them
              permanently if they no longer belong in the system.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)]">
              {archivedHabits.length} archived
            </span>
            <Link
              href="/dashboard"
              className="pill-btn tap-target-compact inline-flex items-center justify-center rounded-lg bg-white/80 px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)]"
            >
              &larr; Back
            </Link>
          </div>
        </div>
      </header>

      {archivedHabits.length === 0 ? (
        <div className="surface-panel flex min-h-[42vh] flex-col items-center justify-center gap-3 rounded-[28px] px-6 py-10 text-center">
          <span className="text-[34px]">🗂️</span>
          <h2 className="font-display text-[28px] font-semibold tracking-tight text-ink-950">
            Nothing is archived right now.
          </h2>
          <p className="max-w-lg text-[15px] leading-7 text-ink-700">
            Habits you archive from the dashboard will appear here so you can
            restore them without rebuilding the setup.
          </p>
          <Link
            href="/dashboard"
            className="pill-btn tap-target mt-2 inline-flex items-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
          >
            Go to dashboard
          </Link>
        </div>
      ) : (
        <div className="stagger-children flex flex-col gap-3">
          {archivedHabits.map((habit) => (
            <div
              key={habit.id}
              className="animate-fade-in-up surface-panel rounded-[24px] px-5 py-4 sm:px-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${softFillClass(habit.tone)}`}
                    style={softFillStyle(habit.tone)}
                  >
                    <HabitIcon
                      name={habit.icon}
                      size={22}
                      className="shrink-0 text-ink-700"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-semibold text-ink-950">
                      {habit.name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${softFillClass(habit.tone)}`}
                        style={softFillStyle(habit.tone)}
                      >
                        {habit.category}
                      </span>
                      <span className="rounded-md bg-white px-2.5 py-1 text-[12px] font-medium text-ink-700 shadow-[var(--shadow-card)]">
                        {habit.frequencyPerDay > 1
                          ? `${habit.frequencyPerDay}x/day`
                          : "Daily"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <button
                    type="button"
                    onClick={() => restoreHabit(habit.id)}
                    className="pill-btn tap-target-compact rounded-lg bg-white/80 px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)]"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(habit.id)}
                    className="pill-btn tap-target-compact rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700 transition-all hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Delete permanently"
        message={`Are you sure you want to permanently delete "${target?.name ?? ""}"? This cannot be undone.`}
        onConfirm={() => {
          if (confirmId) deleteHabit(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
