"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
} from "lucide-react";
import {
  addDays,
  eachDay,
  formatLongDate,
  formatMonthLabel,
  getCurrentMonthRange,
  getRollingRange,
  parseDateKey,
  startOfDay,
  toDateKey,
  toYearMonth,
  yearMonthFromDateKey,
} from "@/lib/date";
import { HabitDefinition } from "@/lib/habits";
import {
  getMatrixToneFromHex,
  getCardGradientStyleFromHex,
  softFillClass,
  softFillStyle,
  accentClass,
  accentStyle,
  badgeClass,
  badgeStyle,
} from "@/lib/tone-utils";
import {
  completedSlotsInDay,
  completionRate,
  countCompleted,
  isSlotCompleted,
} from "@/lib/stats";
import { useHabits, useHabitRecords } from "@/lib/storage";
import { HabitForm, HabitMenu, ConfirmDialog } from "@/components/habit-form";
import { ArchiveFeedback } from "@/components/archive-feedback";
import { HabitIcon } from "@/components/habit-icon";
import { ThemeToggle } from "@/components/theme-toggle";

const today = startOfDay(new Date());
const todayKey = toDateKey(today);
const MOBILE_DAY_WINDOW = 7;

function getOverallRate(rates: number[]) {
  if (rates.length === 0) return 0;
  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
}

function getAppleCardGradient(fillClass: string) {
  const gradients: Record<string, string> = {
    "bg-sky-500": "from-sky-200/85 via-cyan-100/85 to-white",
    "bg-sky-600": "from-sky-200/85 via-cyan-100/85 to-white",
    "bg-emerald-500": "from-emerald-200/85 via-lime-100/85 to-white",
    "bg-emerald-600": "from-emerald-200/85 via-lime-100/85 to-white",
    "bg-violet-500": "from-violet-200/85 via-fuchsia-100/85 to-white",
    "bg-violet-600": "from-violet-200/85 via-fuchsia-100/85 to-white",
    "bg-amber-500": "from-amber-200/90 via-orange-100/85 to-white",
    "bg-amber-600": "from-amber-200/90 via-orange-100/85 to-white",
    "bg-rose-500": "from-rose-200/85 via-pink-100/85 to-white",
    "bg-rose-600": "from-rose-200/85 via-pink-100/85 to-white",
    "bg-teal-500": "from-teal-200/85 via-emerald-100/85 to-white",
    "bg-teal-600": "from-teal-200/85 via-emerald-100/85 to-white",
    "bg-indigo-500": "from-indigo-200/85 via-blue-100/85 to-white",
    "bg-indigo-600": "from-indigo-200/85 via-blue-100/85 to-white",
    "bg-slate-500": "from-slate-200/85 via-gray-100/85 to-white",
    "bg-slate-600": "from-slate-200/85 via-gray-100/85 to-white",
  };

  return gradients[fillClass] ?? "from-sky-200/80 via-cyan-100/80 to-white";
}

function getAppleCardGradientStyle(tone: { fill: string; hex?: string }): {
  className?: string;
  style?: React.CSSProperties;
} {
  if (tone.hex) {
    return { style: getCardGradientStyleFromHex(tone.hex) };
  }
  return { className: `bg-linear-to-br ${getAppleCardGradient(tone.fill)}` };
}

function getMatrixTone(fillClass: string) {
  const tones: Record<
    string,
    { cellTint: string; fill: string; glow: string; partial: string }
  > = {
    "bg-sky-500": {
      cellTint: "rgba(14, 165, 233, 0.12)",
      fill: "#0284c7",
      glow: "rgba(2, 132, 199, 0.28)",
      partial: "rgba(2, 132, 199, 0.16)",
    },
    "bg-sky-600": {
      cellTint: "rgba(14, 165, 233, 0.12)",
      fill: "#0284c7",
      glow: "rgba(2, 132, 199, 0.28)",
      partial: "rgba(2, 132, 199, 0.16)",
    },
    "bg-emerald-500": {
      cellTint: "rgba(16, 185, 129, 0.12)",
      fill: "#059669",
      glow: "rgba(5, 150, 105, 0.28)",
      partial: "rgba(5, 150, 105, 0.16)",
    },
    "bg-emerald-600": {
      cellTint: "rgba(16, 185, 129, 0.12)",
      fill: "#059669",
      glow: "rgba(5, 150, 105, 0.28)",
      partial: "rgba(5, 150, 105, 0.16)",
    },
    "bg-violet-500": {
      cellTint: "rgba(139, 92, 246, 0.12)",
      fill: "#7c3aed",
      glow: "rgba(124, 58, 237, 0.28)",
      partial: "rgba(124, 58, 237, 0.16)",
    },
    "bg-violet-600": {
      cellTint: "rgba(139, 92, 246, 0.12)",
      fill: "#7c3aed",
      glow: "rgba(124, 58, 237, 0.28)",
      partial: "rgba(124, 58, 237, 0.16)",
    },
    "bg-amber-500": {
      cellTint: "rgba(245, 158, 11, 0.14)",
      fill: "#d97706",
      glow: "rgba(217, 119, 6, 0.28)",
      partial: "rgba(217, 119, 6, 0.16)",
    },
    "bg-amber-600": {
      cellTint: "rgba(245, 158, 11, 0.14)",
      fill: "#d97706",
      glow: "rgba(217, 119, 6, 0.28)",
      partial: "rgba(217, 119, 6, 0.16)",
    },
    "bg-rose-500": {
      cellTint: "rgba(244, 63, 94, 0.12)",
      fill: "#e11d48",
      glow: "rgba(225, 29, 72, 0.28)",
      partial: "rgba(225, 29, 72, 0.16)",
    },
    "bg-rose-600": {
      cellTint: "rgba(244, 63, 94, 0.12)",
      fill: "#e11d48",
      glow: "rgba(225, 29, 72, 0.28)",
      partial: "rgba(225, 29, 72, 0.16)",
    },
    "bg-teal-500": {
      cellTint: "rgba(13, 148, 136, 0.12)",
      fill: "#0f766e",
      glow: "rgba(15, 118, 110, 0.28)",
      partial: "rgba(15, 118, 110, 0.16)",
    },
    "bg-teal-600": {
      cellTint: "rgba(13, 148, 136, 0.12)",
      fill: "#0f766e",
      glow: "rgba(15, 118, 110, 0.28)",
      partial: "rgba(15, 118, 110, 0.16)",
    },
    "bg-indigo-500": {
      cellTint: "rgba(99, 102, 241, 0.12)",
      fill: "#4f46e5",
      glow: "rgba(79, 70, 229, 0.28)",
      partial: "rgba(79, 70, 229, 0.16)",
    },
    "bg-indigo-600": {
      cellTint: "rgba(99, 102, 241, 0.12)",
      fill: "#4f46e5",
      glow: "rgba(79, 70, 229, 0.28)",
      partial: "rgba(79, 70, 229, 0.16)",
    },
    "bg-slate-500": {
      cellTint: "rgba(71, 85, 105, 0.12)",
      fill: "#475569",
      glow: "rgba(71, 85, 105, 0.28)",
      partial: "rgba(71, 85, 105, 0.16)",
    },
    "bg-slate-600": {
      cellTint: "rgba(71, 85, 105, 0.12)",
      fill: "#475569",
      glow: "rgba(71, 85, 105, 0.28)",
      partial: "rgba(71, 85, 105, 0.16)",
    },
  };

  return tones[fillClass] ?? tones["bg-sky-600"];
}

function resolveMatrixTone(tone: { fill: string; hex?: string }) {
  if (tone.hex) return getMatrixToneFromHex(tone.hex);
  return getMatrixTone(tone.fill);
}

function getMobileRangeLabel(range: { from: string; to: string }) {
  const from = parseDateKey(range.from);
  const to = parseDateKey(range.to);
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();

  if (sameMonth) {
    return `${from.toLocaleString("en", { month: "short" })} ${from.getDate()}-${to.getDate()}`;
  }

  const fromLabel = from.toLocaleString("en", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const toLabel = to.toLocaleString("en", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  return `${fromLabel} - ${toLabel}`;
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

export function HabitTrackerApp() {
  const {
    activeHabits,
    archivedHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    reorderHabits: persistHabitOrder,
  } = useHabits();
  const { records, toggleHabitDay, loadMonth } = useHabitRecords(activeHabits);
  const [mobileWeekOffset, setMobileWeekOffset] = useState(0);
  const [desktopMonthOffset, setDesktopMonthOffset] = useState(0);

  const desktopRange = useMemo(
    () =>
      getCurrentMonthRange(
        new Date(today.getFullYear(), today.getMonth() - desktopMonthOffset, 1),
      ),
    [desktopMonthOffset],
  );
  const desktopDays = useMemo(() => eachDay(desktopRange), [desktopRange]);
  const mobileRange = getRollingRange(
    MOBILE_DAY_WINDOW,
    addDays(today, -(mobileWeekOffset * MOBILE_DAY_WINDOW)),
  );
  const mobileDays = eachDay(mobileRange);

  // Load records for the desktop month when navigating backward
  useEffect(() => {
    if (desktopMonthOffset === 0) return;
    const targetDate = new Date(
      today.getFullYear(),
      today.getMonth() - desktopMonthOffset,
      1,
    );
    loadMonth(toYearMonth(targetDate));
  }, [desktopMonthOffset, loadMonth]);

  // Load records for the mobile week's containing month(s)
  useEffect(() => {
    if (mobileWeekOffset === 0) return;
    const fromMonth = yearMonthFromDateKey(mobileRange.from);
    const toMonth = yearMonthFromDateKey(mobileRange.to);
    loadMonth(fromMonth);
    if (toMonth !== fromMonth) loadMonth(toMonth);
  }, [mobileWeekOffset, mobileRange.from, mobileRange.to, loadMonth]);
  const mobileRangeLabel = getMobileRangeLabel(mobileRange);
  const desktopRangeLabel = formatMonthLabel(desktopRange);
  const mobileWindowLabel =
    mobileWeekOffset === 0
      ? "Current window"
      : `${mobileWeekOffset} week${mobileWeekOffset === 1 ? "" : "s"} back`;
  const desktopWindowLabel =
    desktopMonthOffset === 0
      ? "Current month"
      : `${desktopMonthOffset} month${desktopMonthOffset === 1 ? "" : "s"} back`;
  const isLatestMobileWeek = mobileWeekOffset === 0;
  const isLatestDesktopMonth = desktopMonthOffset === 0;

  // CRUD modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitDefinition | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<HabitDefinition | null>(
    null,
  );
  const [archiveFeedback, setArchiveFeedback] = useState<HabitDefinition | null>(
    null,
  );

  // Drag-and-drop state
  const [dragHabitId, setDragHabitId] = useState<string | null>(null);
  const [dragOverHabitId, setDragOverHabitId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"above" | "below">(
    "below",
  );
  const [legacyHabitOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored =
        localStorage.getItem("improtrack-habit-order") ??
        localStorage.getItem("momentum-habit-order");
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [didMigrateLegacyOrder, setDidMigrateLegacyOrder] = useState(false);

  const orderedActiveHabits = activeHabits;

  useEffect(() => {
    if (didMigrateLegacyOrder) {
      return;
    }

    if (orderedActiveHabits.length === 0) {
      return;
    }

    const hasPersistedOrder = orderedActiveHabits.some(
      (habit) => typeof habit.sortOrder === "number",
    );

    if (hasPersistedOrder || legacyHabitOrder.length === 0) {
      setDidMigrateLegacyOrder(true);
      return;
    }

    const knownIds = new Set(orderedActiveHabits.map((habit) => habit.id));
    const migratedIds = legacyHabitOrder.filter(
      (habitId, index) =>
        legacyHabitOrder.indexOf(habitId) === index && knownIds.has(habitId),
    );

    if (migratedIds.length === 0) {
      setDidMigrateLegacyOrder(true);
      return;
    }

    const remainingIds = orderedActiveHabits
      .map((habit) => habit.id)
      .filter((habitId) => !migratedIds.includes(habitId));

    void persistHabitOrder([...migratedIds, ...remainingIds]).finally(() => {
      setDidMigrateLegacyOrder(true);
    });
  }, [
    didMigrateLegacyOrder,
    legacyHabitOrder,
    orderedActiveHabits,
    persistHabitOrder,
  ]);

  const handleReorderHabits = (
    fromId: string,
    toId: string,
    position: "above" | "below",
  ) => {
    const ids = orderedActiveHabits.map((h) => h.id);
    const fromIndex = ids.indexOf(fromId);
    if (fromIndex === -1) return;
    const newIds = [...ids];
    newIds.splice(fromIndex, 1);
    const newToIndex = newIds.indexOf(toId);
    if (newToIndex === -1) return;
    const insertAt = position === "above" ? newToIndex : newToIndex + 1;
    newIds.splice(insertAt, 0, fromId);
    void persistHabitOrder(newIds);
  };

  // Build row data: single-slot habits → 1 row; multi-slot → 1 total summary row + N slot rows
  type GridRow = {
    habit: HabitDefinition;
    rowType: "single" | "total" | "slot";
    slotName: string;
    slotIndex: number;
    isFirstSlot: boolean;
    isLastSlot: boolean;
  };

  const gridRows: GridRow[] = [];
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
    } else {
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
    }
  });

  const habitSummaries = useMemo(
    () =>
      orderedActiveHabits.map((habit) => {
        const completed = countCompleted(
          records,
          habit.id,
          desktopRange,
          todayKey,
          habit.timeSlots,
        );
        const rate = completionRate(
          records,
          habit.id,
          desktopRange,
          todayKey,
          habit.timeSlots,
        );
        return { habit, completed, rate };
      }),
    [desktopRange, orderedActiveHabits, records],
  );

  const averageRate = getOverallRate(habitSummaries.map((s) => s.rate));
  const totalCompleted = habitSummaries.reduce(
    (sum, s) => sum + s.completed,
    0,
  );

  const handleSave = async (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
      return;
    }

    await addHabit(data);
  };

  const handleArchiveHabit = async (habit: HabitDefinition) => {
    await archiveHabit(habit.id);
    setArchiveFeedback(habit);
  };

  const handleUndoArchive = async () => {
    if (!archiveFeedback) return;
    await restoreHabit(archiveFeedback.id);
    setArchiveFeedback(null);
  };

  return (
    <div className="flex min-h-full w-full flex-col">
      {/* Header */}
      <header className="header-bar w-full py-3 sm:py-3.5 lg:sticky lg:top-0 lg:z-30 lg:py-2">
        <div className="page-shell flex flex-col gap-2.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <h1 className="font-display text-[20px] font-semibold leading-none tracking-tight text-ink-950">
                Dashboard
              </h1>
              <span className="hidden h-4 w-px bg-ink-950/10 sm:block" />
              <div className="hidden items-center gap-5 sm:flex">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700">Habits</span>
                  <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                    {activeHabits.length}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700">Hit rate</span>
                  <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                    {averageRate}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700">Total</span>
                  <span className="font-display text-[14px] font-semibold tabular-nums text-ink-950">
                    {totalCompleted}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle className="ml-auto" showLabel={false} />
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
                Statistics
              </Link>
              <button
                type="button"
                aria-label="Add habit"
                onClick={() => {
                  setEditingHabit(null);
                  setFormOpen(true);
                }}
                className="pill-btn tap-target-compact flex items-center gap-1.5 rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-3 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">Add habit</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="page-shell flex flex-col gap-3.5 py-4 sm:gap-4 sm:py-5">
        {activeHabits.length === 0 ? (
          <div className="surface-panel flex flex-col items-center justify-center gap-3 rounded-2xl px-8 py-16 text-center">
            <span className="text-[32px]">🎯</span>
            <h2 className="text-[18px] font-semibold text-ink-950">
              No habits yet
            </h2>
            <p className="max-w-xs text-[14px] text-ink-700">
              Create your first habit to start tracking your progress.
            </p>
            <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setEditingHabit(null);
                  setFormOpen(true);
                }}
                className="pill-btn tap-target rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
              >
                Create first habit
              </button>
              {archivedHabits.length > 0 ? (
                <Link
                  href="/dashboard/archive"
                  className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
                >
                  Open archive
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Mobile matrix */}
            <section className="animate-scale-in surface-panel rounded-[28px] p-3.5 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-ink-950">
                  Habit matrix
                </h2>
                {isLatestMobileWeek ? null : (
                  <button
                    type="button"
                    onClick={() => setMobileWeekOffset(0)}
                    className="pill-btn tap-target-compact inline-flex items-center rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
                  >
                    Latest
                  </button>
                )}
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 rounded-[22px] border border-black/[0.06] bg-white px-1.5 py-1.5 shadow-[var(--shadow-card)] sm:mt-3 sm:gap-2 sm:px-2 sm:py-2">
                <button
                  type="button"
                  onClick={() => setMobileWeekOffset((current) => current + 1)}
                  aria-label="Show previous 7-day window"
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
                  onClick={() =>
                    setMobileWeekOffset((current) => Math.max(0, current - 1))
                  }
                  disabled={isLatestMobileWeek}
                  aria-label="Show next 7-day window"
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
                {orderedActiveHabits.map((habit, habitIndex) => {
                  const matrixTone = resolveMatrixTone(habit.tone);
                  const mobileRate = completionRate(
                    records,
                    habit.id,
                    mobileRange,
                    todayKey,
                    habit.timeSlots,
                  );
                  const recentCompleted = countCompleted(
                    records,
                    habit.id,
                    mobileRange,
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

                  return (
                    <article
                      key={habit.id}
                      className="animate-fade-in-up rounded-[24px] border border-black/[0.06] bg-white px-3.5 py-3.5 shadow-[var(--shadow-card)] sm:px-4 sm:py-4"
                    >
                      <div className="flex items-start gap-3">
                        <Link
                          href={`/dashboard/habits/${habit.slug}`}
                          aria-label={`Open ${habit.name} statistics`}
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
                                    ? `${todayCompletedCount}/${habit.timeSlots.length} slots done today`
                                    : `${recentCompleted}/${mobileDays.length} days completed`}
                                </p>
                              </div>

                              <span
                                className={`rounded-md px-1.5 py-1 text-[11px] font-semibold ${softFillClass(habit.tone)} ${badgeClass(habit.tone)}`}
                                style={{
                                  ...softFillStyle(habit.tone),
                                  ...badgeStyle(habit.tone),
                                }}
                              >
                                {mobileRate}%
                              </span>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {isMultiSlot ? (
                                <span className="text-[10px] text-ink-500 sm:text-[11px]">
                                  {habit.timeSlots.length} slots
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Link>

                        <HabitMenu
                          tone={habit.tone}
                          onEdit={() => {
                            setEditingHabit(habit);
                            setFormOpen(true);
                          }}
                          onArchive={() => {
                            void handleArchiveHabit(habit);
                          }}
                          onDelete={() => setDeleteTarget(habit)}
                        />
                      </div>

                      <div className="mt-2.5 border-t border-black/[0.05] pt-2.5">
                        {isMultiSlot ? (
                          <div className="space-y-2.5">
                            {habit.timeSlots.map((slotName) => {
                              const slotCompletedCount = mobileDays.filter(
                                (dateKey) =>
                                  isSlotCompleted(
                                    records[habit.id]?.[dateKey],
                                    slotName,
                                  ),
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
                                          ariaLabel={`${habit.name} ${slotName} ${checked ? "completed" : "not completed"} on ${formatLongDate(dateKey)}`}
                                          onClick={() => {
                                            if (!isFuture) {
                                              toggleHabitDay(
                                                habit.id,
                                                dateKey,
                                                slotName,
                                              );
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
                                  ariaLabel={`${habit.name} ${checked ? "completed" : "not completed"} on ${formatLongDate(dateKey)}`}
                                  onClick={() => {
                                    if (!isFuture) {
                                      toggleHabitDay(
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

            {/* Matrix */}
            <section className="animate-scale-in surface-panel relative hidden overflow-visible rounded-2xl md:block">
              <div className="flex items-center justify-between gap-4 border-b border-black/[0.04] px-5 py-3 sm:px-6">
                <div>
                  <h2 className="text-[14px] font-semibold text-ink-950">
                    Habit matrix
                  </h2>
                  <p className="mt-0.5 text-[13px] text-ink-700">
                    Tap a cell to toggle completion
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {isLatestDesktopMonth ? null : (
                    <button
                      type="button"
                      onClick={() => setDesktopMonthOffset(0)}
                      className="pill-btn inline-flex h-8 items-center rounded-md bg-white px-2.5 text-[11px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
                    >
                      Latest
                    </button>
                  )}

                  <div className="flex items-center gap-1 rounded-[14px] border border-black/[0.06] bg-white px-1 py-1 shadow-[var(--shadow-card)]">
                    <button
                      type="button"
                      onClick={() =>
                        setDesktopMonthOffset((current) => current + 1)
                      }
                      aria-label="Show previous month"
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
                      onClick={() =>
                        setDesktopMonthOffset((current) =>
                          Math.max(0, current - 1),
                        )
                      }
                      disabled={isLatestDesktopMonth}
                      aria-label="Show next month"
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
                    {/* Column headers */}
                    <div className="rounded-tl-[11px] bg-white px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-ink-700">
                      Habit
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
                            index === desktopDays.length - 1
                              ? "rounded-tr-[11px]"
                              : ""
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

                    {/* Rows */}
                    {gridRows.map((row, rowIndex) => {
                      const {
                        habit,
                        slotName,
                        rowType,
                        isFirstSlot,
                        isLastSlot,
                      } = row;
                      const isLastRow = rowIndex === gridRows.length - 1;
                      const displaySlotName =
                        rowType === "slot" ? slotName : null;
                      const matrixTone = resolveMatrixTone(habit.tone);
                      const isDraggedItem = dragHabitId === habit.id;
                      const isDragTarget =
                        dragOverHabitId === habit.id && isFirstSlot;

                      return (
                        <div
                          key={`${habit.id}-${slotName}`}
                          className="contents"
                        >
                          {/* Row label */}
                          <div
                            draggable={isFirstSlot}
                            onDragStart={
                              isFirstSlot
                                ? (e) => {
                                    setDragHabitId(habit.id);
                                    e.dataTransfer.effectAllowed = "move";
                                  }
                                : undefined
                            }
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (!dragHabitId || dragHabitId === habit.id)
                                return;
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setDragOverHabitId(habit.id);
                              setDragOverPosition(
                                e.clientY < rect.top + rect.height / 2
                                  ? "above"
                                  : "below",
                              );
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragHabitId && dragHabitId !== habit.id) {
                                handleReorderHabits(
                                  dragHabitId,
                                  habit.id,
                                  dragOverPosition,
                                );
                              }
                              setDragHabitId(null);
                              setDragOverHabitId(null);
                            }}
                            onDragEnd={() => {
                              setDragHabitId(null);
                              setDragOverHabitId(null);
                            }}
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
                              <div className="flex min-w-0 flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <div
                                    role="img"
                                    aria-label="Drag to reorder"
                                    className="shrink-0 cursor-grab touch-none text-ink-700/25 hover:text-ink-700/60 active:cursor-grabbing"
                                    title="Drag to reorder"
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
                                  <span
                                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${softFillClass(habit.tone)} ${badgeClass(habit.tone)}`}
                                    style={{
                                      ...softFillStyle(habit.tone),
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
                                    onEdit={() => {
                                      setEditingHabit(habit);
                                      setFormOpen(true);
                                    }}
                                    onArchive={() => {
                                      void handleArchiveHabit(habit);
                                    }}
                                    onDelete={() => setDeleteTarget(habit)}
                                  />
                                </div>
                                <Link
                                  href={`/dashboard/habits/${habit.slug}`}
                                  className="block truncate text-[13px] font-semibold leading-tight text-ink-950 transition-colors hover:text-[#6D28D9] focus-visible:outline-none focus-visible:text-[#6D28D9]"
                                >
                                  {habit.name}
                                </Link>
                              </div>
                            ) : (
                              <p className="pl-5 text-[12px] text-ink-700">
                                {displaySlotName}
                              </p>
                            )}
                          </div>

                          {/* Day cells */}
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
                                totalSlotCount > 0
                                  ? completedCount / totalSlotCount
                                  : 0;
                              const isFull = fraction >= 1;

                              return (
                                <div
                                  key={`${habit.id}-total-${dateKey}`}
                                  className={`relative flex h-full min-h-[44px] items-center justify-center border-b border-dashed border-black/[0.05] ${
                                    isLastRow &&
                                    colIndex === desktopDays.length - 1
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
                            const slotChecked = isSlotCompleted(
                              daySlots,
                              slotName,
                              { fallbackToAny: rowType === "single" },
                            );
                            const checked = slotChecked;
                            const checkStyle = checked
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
                                    toggleHabitDay(habit.id, dateKey, slotName);
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
                                  isLastRow &&
                                  colIndex === desktopDays.length - 1
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
                                    checked
                                      ? "matrix-check-pop matrix-check-checked text-white"
                                      : "matrix-check-idle text-transparent"
                                  }`}
                                >
                                  {checked ? (
                                    <Check
                                      aria-hidden="true"
                                      className="h-3 w-3 opacity-100"
                                      strokeWidth={2.2}
                                    />
                                  ) : (
                                    <Check
                                      aria-hidden="true"
                                      className="h-3 w-3 opacity-0"
                                      strokeWidth={2.2}
                                    />
                                  )}
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

            {/* Habit cards */}
            <section className="stagger-children grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {habitSummaries.map(({ habit, completed, rate }) => {
                const cardGradient = getAppleCardGradientStyle(habit.tone);
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
                          className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${softFillClass(habit.tone)}`}
                          style={softFillStyle(habit.tone)}
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
                              className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${softFillClass(habit.tone)}`}
                              style={softFillStyle(habit.tone)}
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-end justify-between pt-1">
                        <div>
                          <p className="text-[12px] text-ink-700">Completed</p>
                          <p className="font-display text-[22px] font-semibold tabular-nums text-ink-950">
                            {completed}
                          </p>
                        </div>
                        <span
                          className={`text-[13px] font-medium ${accentClass(habit.tone)} transition-transform duration-200 group-hover:translate-x-0.5`}
                          style={accentStyle(habit.tone)}
                        >
                          View stats &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </div>
        )}
      </div>

      <ArchiveFeedback
        open={!!archiveFeedback}
        habitName={archiveFeedback?.name ?? null}
        onUndo={() => {
          void handleUndoArchive();
        }}
        onDismiss={() => setArchiveFeedback(null)}
      />

      {/* Modals */}
      <HabitForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        initial={editingHabit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete habit"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) deleteHabit(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
