"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/habit-form";
import { HabitIcon } from "@/components/habit-icon";
import { useHabits } from "@/lib/storage";

export function ArchivePage() {
  const { archivedHabits, restoreHabit, deleteHabit } = useHabits();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const target = archivedHabits.find((habit) => habit.id === confirmId);

  return (
    <div className="page-shell flex flex-col gap-4 py-5">
      <header className="animate-fade-in-up surface-panel flex items-center justify-between rounded-2xl px-5 py-4 sm:px-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink-950">
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
          className="pill-btn tap-target-compact inline-flex items-center justify-center rounded-lg bg-white/80 px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-[var(--shadow-card-hover)]"
        >
          &larr; Back
        </Link>
      </header>

      {archivedHabits.length > 0 && (
        <div className="stagger-children flex flex-col gap-3">
          {archivedHabits.map((habit) => (
            <div
              key={habit.id}
              className="animate-fade-in-up surface-panel flex items-center justify-between rounded-2xl px-5 py-4 sm:px-6"
            >
              <div className="flex items-center gap-3">
                <HabitIcon
                  name={habit.icon}
                  size={22}
                  className="text-ink-700 shrink-0"
                />
                <div>
                  <p className="text-[16px] font-semibold text-ink-950">
                    {habit.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-700">
                    {habit.category}
                    {habit.frequencyPerDay > 1
                      ? ` · ${habit.frequencyPerDay}x/day`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
