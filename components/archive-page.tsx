"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/habit-form";
import { HabitIcon } from "@/components/habit-icon";
import { useHabits } from "@/lib/storage";
import { accentClass, accentStyle } from "@/lib/tone-utils";

export function ArchivePage() {
  const { archivedHabits, restoreHabit, deleteHabit } = useHabits();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const target = archivedHabits.find((habit) => habit.id === confirmId);

  return (
    <div className="page-shell flex flex-col gap-3.5 py-4 sm:gap-4 sm:py-5">
      <header className="animate-fade-in-up surface-panel flex flex-col gap-3 rounded-[28px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink-950 sm:text-[24px]">
            Archive
          </h1>
          <p className="mt-1 text-[14px] text-ink-700">
            {archivedHabits.length === 0
              ? "No archived habits yet."
              : `${archivedHabits.length} archived habit${archivedHabits.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="pill-btn tap-target-compact inline-flex w-full items-center justify-center rounded-lg bg-white/80 px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)] sm:w-auto"
        >
          &larr; Back
        </Link>
      </header>

      {archivedHabits.length === 0 ? (
        <section className="animate-fade-in-up surface-panel flex flex-col items-center gap-4 rounded-[28px] px-6 py-12 text-center sm:px-8 sm:py-16">
          <span className="text-[34px]">🗂️</span>
          <div>
            <h2 className="text-[20px] font-semibold text-ink-950">
              Nothing is archived right now
            </h2>
            <p className="mt-2 max-w-md text-[14px] leading-6 text-ink-700">
              Archived habits land here when you want to pause something without losing its history.
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
            >
              Back to dashboard
            </Link>
            <Link
              href="/dashboard/stats"
              className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
            >
              View statistics
            </Link>
          </div>
        </section>
      ) : (
        <div className="stagger-children flex flex-col gap-2.5 sm:gap-3">
          {archivedHabits.map((habit) => (
            <div
              key={habit.id}
              className="animate-fade-in-up surface-panel flex flex-col gap-3 rounded-[28px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <HabitIcon
                  name={habit.icon}
                  size={22}
                  className={`shrink-0 ${accentClass(habit.tone)}`}
                  style={accentStyle(habit.tone)}
                />
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-ink-950">{habit.name}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-ink-700">
                    {habit.frequencyPerDay > 1 ? `${habit.frequencyPerDay}x/day` : "Single check-in"}
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => restoreHabit(habit.id)}
                  className="pill-btn tap-target-compact flex-1 rounded-lg bg-white/80 px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)] sm:flex-none"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(habit.id)}
                  className="pill-btn tap-target-compact flex-1 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700 transition-all hover:bg-red-100 sm:flex-none"
                >
                  Delete
                </button>
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
