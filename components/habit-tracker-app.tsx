"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  eachDay,
  formatMonthLabel,
  getCurrentMonthRange,
  getRollingRange,
  parseDateKey,
  startOfDay,
  toDateKey,
  toYearMonth,
  yearMonthFromDateKey,
} from "@/lib/date";
import type { HabitDefinition } from "@/lib/habits";
import { useTheme } from "@/components/theme-provider";
import { completionRate, countCompleted } from "@/lib/stats";
import { useHabits, useHabitRecords } from "@/lib/storage";
import {
  buildGridRows,
  DesktopMatrixSection,
  HabitSummaryCards,
  HabitTrackerDialogs,
  HabitTrackerEmptyState,
  HabitTrackerHeader,
  MobileMatrixSection,
} from "@/components/habit-tracker-sections";
import { useTranslation } from "@/components/i18n-provider";

const today = startOfDay(new Date());
const todayKey = toDateKey(today);
const MOBILE_DAY_WINDOW = 7;

function getOverallRate(rates: number[]) {
  if (rates.length === 0) return 0;
  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
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

export function HabitTrackerApp() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
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
  const { records, toggleHabitDay, loadMonth, loadFullHistory } =
    useHabitRecords(activeHabits);
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
  const mobileStatsRange = useMemo(
    () =>
      getCurrentMonthRange(
        addDays(today, -(mobileWeekOffset * MOBILE_DAY_WINDOW)),
      ),
    [mobileWeekOffset],
  );
  const mobileStatsDays = useMemo(
    () => eachDay(mobileStatsRange),
    [mobileStatsRange],
  );

  useEffect(() => {
    if (desktopMonthOffset === 0) return;
    const targetDate = new Date(
      today.getFullYear(),
      today.getMonth() - desktopMonthOffset,
      1,
    );
    loadMonth(toYearMonth(targetDate));
  }, [desktopMonthOffset, loadMonth]);

  useEffect(() => {
    if (mobileWeekOffset === 0) return;
    loadMonth(yearMonthFromDateKey(mobileStatsRange.from));
  }, [mobileWeekOffset, mobileStatsRange.from, loadMonth]);

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
    if (!orderedActiveHabits.some((habit) => habit.isRewardable !== false)) {
      return;
    }

    void loadFullHistory();
  }, [loadFullHistory, orderedActiveHabits]);

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
    const ids = orderedActiveHabits.map((habit) => habit.id);
    const fromIndex = ids.indexOf(fromId);
    if (fromIndex === -1) return;
    const nextIds = [...ids];
    nextIds.splice(fromIndex, 1);
    const newToIndex = nextIds.indexOf(toId);
    if (newToIndex === -1) return;
    const insertAt = position === "above" ? newToIndex : newToIndex + 1;
    nextIds.splice(insertAt, 0, fromId);
    void persistHabitOrder(nextIds);
  };

  const gridRows = useMemo(
    () => buildGridRows(orderedActiveHabits),
    [orderedActiveHabits],
  );

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

  const averageRate = getOverallRate(habitSummaries.map((summary) => summary.rate));
  const totalCompleted = habitSummaries.reduce(
    (sum, summary) => sum + summary.completed,
    0,
  );

  const openNewHabitForm = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const handleEditHabit = (habit: HabitDefinition) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleDeleteHabit = (habit: HabitDefinition) => {
    setDeleteTarget(habit);
  };

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

  const handleDragHabitStart = (
    event: React.DragEvent<HTMLDivElement>,
    habitId: string,
  ) => {
    setDragHabitId(habitId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragHabitOver = (
    event: React.DragEvent<HTMLDivElement>,
    habitId: string,
  ) => {
    event.preventDefault();
    if (!dragHabitId || dragHabitId === habitId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOverHabitId(habitId);
    setDragOverPosition(
      event.clientY < rect.top + rect.height / 2 ? "above" : "below",
    );
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragHabitDrop = (
    event: React.DragEvent<HTMLDivElement>,
    habitId: string,
  ) => {
    event.preventDefault();
    if (dragHabitId && dragHabitId !== habitId) {
      handleReorderHabits(dragHabitId, habitId, dragOverPosition);
    }
    setDragHabitId(null);
    setDragOverHabitId(null);
  };

  const handleDragHabitEnd = () => {
    setDragHabitId(null);
    setDragOverHabitId(null);
  };

  return (
    <div className="flex min-h-full w-full flex-col">
      <HabitTrackerHeader
        t={t}
        activeHabitCount={activeHabits.length}
        averageRate={averageRate}
        totalCompleted={totalCompleted}
        mobileRangeLabel={mobileRangeLabel}
        desktopRangeLabel={desktopRangeLabel}
        onAddHabit={openNewHabitForm}
      />

      <div className="page-shell flex flex-col gap-3.5 py-4 sm:gap-4 sm:py-5">
        {activeHabits.length === 0 ? (
          <HabitTrackerEmptyState
            t={t}
            archivedHabitCount={archivedHabits.length}
            onAddHabit={openNewHabitForm}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <MobileMatrixSection
              t={t}
              isDark={isDark}
              orderedActiveHabits={orderedActiveHabits}
              records={records}
              mobileRangeLabel={mobileRangeLabel}
              mobileWindowLabel={mobileWindowLabel}
              mobileDays={mobileDays}
              mobileStatsRange={mobileStatsRange}
              mobileStatsDays={mobileStatsDays}
              todayKey={todayKey}
              isLatestMobileWeek={isLatestMobileWeek}
              onResetToLatest={() => setMobileWeekOffset(0)}
              onPreviousWeek={() =>
                setMobileWeekOffset((current) => current + 1)
              }
              onNextWeek={() =>
                setMobileWeekOffset((current) => Math.max(0, current - 1))
              }
              onToggleHabitDay={(habitId, dateKey, slotName) => {
                void toggleHabitDay(habitId, dateKey, slotName);
              }}
              onEditHabit={handleEditHabit}
              onArchiveHabit={(habit) => {
                void handleArchiveHabit(habit);
              }}
              onDeleteHabit={handleDeleteHabit}
            />

            <DesktopMatrixSection
              t={t}
              isDark={isDark}
              gridRows={gridRows}
              desktopDays={desktopDays}
              desktopRange={desktopRange}
              desktopRangeLabel={desktopRangeLabel}
              desktopWindowLabel={desktopWindowLabel}
              records={records}
              todayKey={todayKey}
              isLatestDesktopMonth={isLatestDesktopMonth}
              dragHabitId={dragHabitId}
              dragOverHabitId={dragOverHabitId}
              dragOverPosition={dragOverPosition}
              onResetToLatest={() => setDesktopMonthOffset(0)}
              onPreviousMonth={() =>
                setDesktopMonthOffset((current) => current + 1)
              }
              onNextMonth={() =>
                setDesktopMonthOffset((current) => Math.max(0, current - 1))
              }
              onToggleHabitDay={(habitId, dateKey, slotName) => {
                void toggleHabitDay(habitId, dateKey, slotName);
              }}
              onDragHabitStart={handleDragHabitStart}
              onDragHabitOver={handleDragHabitOver}
              onDragHabitDrop={handleDragHabitDrop}
              onDragHabitEnd={handleDragHabitEnd}
              onEditHabit={handleEditHabit}
              onArchiveHabit={(habit) => {
                void handleArchiveHabit(habit);
              }}
              onDeleteHabit={handleDeleteHabit}
            />

            <HabitSummaryCards
              t={t}
              isDark={isDark}
              habitSummaries={habitSummaries}
            />
          </div>
        )}
      </div>

      <HabitTrackerDialogs
        t={t}
        formOpen={formOpen}
        editingHabit={editingHabit}
        deleteTarget={deleteTarget}
        archiveFeedback={archiveFeedback}
        onCloseForm={() => {
          setFormOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSave}
        onUndoArchive={() => {
          void handleUndoArchive();
        }}
        onDismissArchiveFeedback={() => setArchiveFeedback(null)}
        onConfirmDelete={() => {
          if (deleteTarget) {
            void deleteHabit(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
        onCancelDelete={() => setDeleteTarget(null)}
      />
    </div>
  );
}
