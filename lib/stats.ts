import { addDays, DateRange, eachDay, parseDateKey, toDateKey } from "@/lib/date";
import { normalizeSlotKey } from "@/lib/habits";
import { HabitRecords } from "@/lib/storage";

export function isSlotCompleted(
  daySlots: Record<string, boolean> | undefined,
  slotName: string,
  options?: { fallbackToAny?: boolean },
) {
  if (!daySlots) return false;

  if (typeof daySlots[slotName] === "boolean") {
    return daySlots[slotName];
  }

  const normalizedTarget = normalizeSlotKey(slotName);
  const normalizedEntry = Object.entries(daySlots).find(
    ([key]) => normalizeSlotKey(key) === normalizedTarget,
  );

  if (normalizedEntry) {
    return Boolean(normalizedEntry[1]);
  }

  if (options?.fallbackToAny) {
    return Object.values(daySlots).some(Boolean);
  }

  return false;
}

/**
 * Check if a day is fully completed (all slots checked).
 * For single-slot habits, this is equivalent to the old boolean check.
 */
export function isDayFullyCompleted(
  records: HabitRecords,
  habitId: string,
  dateKey: string,
  timeSlots: string[],
): boolean {
  const daySlots = records[habitId]?.[dateKey];
  if (!daySlots) return false;

  if (timeSlots.length <= 1) {
    return isSlotCompleted(daySlots, timeSlots[0] ?? "default", {
      fallbackToAny: true,
    });
  }

  return timeSlots.every((slot) => isSlotCompleted(daySlots, slot));
}

/**
 * Count completed slots in a day (for partial completion display).
 */
export function completedSlotsInDay(
  records: HabitRecords,
  habitId: string,
  dateKey: string,
  timeSlots: string[],
): number {
  const daySlots = records[habitId]?.[dateKey];
  if (!daySlots) return 0;

  if (timeSlots.length <= 1) {
    return isSlotCompleted(daySlots, timeSlots[0] ?? "default", {
      fallbackToAny: true,
    })
      ? 1
      : 0;
  }

  return timeSlots.filter((slot) => isSlotCompleted(daySlots, slot)).length;
}

export function countCompleted(
  records: HabitRecords,
  habitId: string,
  range: DateRange,
  todayKey: string,
  timeSlots: string[] = ["default"],
) {
  const to = range.to < todayKey ? range.to : todayKey;
  if (to < range.from) return 0;

  return eachDay({ from: range.from, to }).filter((dateKey) =>
    isDayFullyCompleted(records, habitId, dateKey, timeSlots),
  ).length;
}

export function completionRate(
  records: HabitRecords,
  habitId: string,
  range: DateRange,
  todayKey: string,
  timeSlots: string[] = ["default"],
) {
  const to = range.to < todayKey ? range.to : todayKey;
  if (to < range.from) return 0;

  const activeDays = eachDay({ from: range.from, to });
  if (activeDays.length === 0) return 0;

  const completed = activeDays.filter((dateKey) =>
    isDayFullyCompleted(records, habitId, dateKey, timeSlots),
  ).length;

  return Math.round((completed / activeDays.length) * 100);
}

export function totalCompletedAllTime(
  records: HabitRecords,
  habitId: string,
  timeSlots: string[] = ["default"],
) {
  const days = records[habitId] ?? {};
  return Object.keys(days).filter((dateKey) =>
    isDayFullyCompleted(records, habitId, dateKey, timeSlots),
  ).length;
}

export function getCurrentStreak(
  records: HabitRecords,
  habitId: string,
  todayKey: string,
  timeSlots: string[] = ["default"],
) {
  let streak = 0;
  let cursor = parseDateKey(todayKey);

  if (!isDayFullyCompleted(records, habitId, toDateKey(cursor), timeSlots)) {
    const yesterday = new Date(cursor);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!isDayFullyCompleted(records, habitId, toDateKey(yesterday), timeSlots)) {
      return 0;
    }
    cursor = yesterday;
  }

  while (isDayFullyCompleted(records, habitId, toDateKey(cursor), timeSlots)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getBestStreak(
  records: HabitRecords,
  habitId: string,
  timeSlots: string[] = ["default"],
) {
  const days = Object.keys(records[habitId] ?? {}).sort();
  let best = 0;
  let active = 0;
  let prevCompletedKey: string | null = null;

  days.forEach((day) => {
    if (!isDayFullyCompleted(records, habitId, day, timeSlots)) {
      active = 0;
      return;
    }

    if (prevCompletedKey !== null) {
      const expectedKey = toDateKey(addDays(parseDateKey(prevCompletedKey), 1));
      if (day !== expectedKey) {
        active = 0;
      }
    }

    active += 1;
    best = Math.max(best, active);
    prevCompletedKey = day;
  });

  return best;
}

export function getMonthBuckets(
  records: HabitRecords,
  habitId: string,
  timeSlots: string[] = ["default"],
) {
  const monthMap = new Map<string, number>();

  Object.keys(records[habitId] ?? {}).forEach((day) => {
    if (!isDayFullyCompleted(records, habitId, day, timeSlots)) return;
    const key = day.slice(0, 7);
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  });

  return Array.from(monthMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6);
}

export function getWeekdayPerformance(
  records: HabitRecords,
  habitId: string,
  timeSlots: string[] = ["default"],
) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totals = labels.map((label) => ({
    label,
    completed: 0,
    total: 0,
  }));

  Object.keys(records[habitId] ?? {}).forEach((dateKey) => {
    const index = parseDateKey(dateKey).getDay();
    totals[index].total += 1;
    if (isDayFullyCompleted(records, habitId, dateKey, timeSlots)) {
      totals[index].completed += 1;
    }
  });

  return totals.map((entry) => ({
    ...entry,
    rate:
      entry.total === 0 ? 0 : Math.round((entry.completed / entry.total) * 100),
  }));
}

/**
 * Per-slot completion rate for a habit (used in detail view).
 */
export function getSlotBreakdown(
  records: HabitRecords,
  habitId: string,
  timeSlots: string[],
) {
  const days = Object.keys(records[habitId] ?? {});
  if (days.length === 0)
    return timeSlots.map((slot) => ({ slot, rate: 0, completed: 0, total: 0 }));

  return timeSlots.map((slot) => {
    let completed = 0;
    days.forEach((dateKey) => {
      if (records[habitId]?.[dateKey]?.[slot]) completed++;
    });
    return {
      slot,
      completed,
      total: days.length,
      rate: Math.round((completed / days.length) * 100),
    };
  });
}
