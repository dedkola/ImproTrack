import { DateRange, eachDay, parseDateKey, toDateKey } from "@/lib/date";
import { HabitRecords } from "@/lib/storage";

export function countCompleted(
  records: HabitRecords,
  habitId: string,
  range: DateRange,
  todayKey: string
) {
  const to = range.to < todayKey ? range.to : todayKey;

  if (to < range.from) {
    return 0;
  }

  return eachDay({ from: range.from, to }).filter((dateKey) => records[habitId]?.[dateKey]).length;
}

export function completionRate(
  records: HabitRecords,
  habitId: string,
  range: DateRange,
  todayKey: string
) {
  const to = range.to < todayKey ? range.to : todayKey;

  if (to < range.from) {
    return 0;
  }

  const activeDays = eachDay({ from: range.from, to });

  if (activeDays.length === 0) {
    return 0;
  }

  const completed = activeDays.filter((dateKey) => records[habitId]?.[dateKey]).length;

  return Math.round((completed / activeDays.length) * 100);
}

export function totalCompletedAllTime(records: HabitRecords, habitId: string) {
  return Object.values(records[habitId] ?? {}).filter(Boolean).length;
}

export function getCurrentStreak(records: HabitRecords, habitId: string, todayKey: string) {
  let streak = 0;
  let cursor = parseDateKey(todayKey);

  while (records[habitId]?.[toDateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getBestStreak(records: HabitRecords, habitId: string) {
  const days = Object.keys(records[habitId] ?? {}).sort();
  let best = 0;
  let active = 0;

  days.forEach((day) => {
    if (records[habitId]?.[day]) {
      active += 1;
      best = Math.max(best, active);
      return;
    }

    active = 0;
  });

  return best;
}

export function getMonthBuckets(records: HabitRecords, habitId: string) {
  const monthMap = new Map<string, number>();

  Object.entries(records[habitId] ?? {}).forEach(([day, completed]) => {
    if (!completed) {
      return;
    }

    const key = day.slice(0, 7);
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  });

  return Array.from(monthMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6);
}

export function getWeekdayPerformance(records: HabitRecords, habitId: string) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totals = labels.map((label) => ({
    label,
    completed: 0,
    total: 0
  }));

  Object.entries(records[habitId] ?? {}).forEach(([dateKey, completed]) => {
    const index = parseDateKey(dateKey).getDay();
    totals[index].total += 1;

    if (completed) {
      totals[index].completed += 1;
    }
  });

  return totals.map((entry) => ({
    ...entry,
    rate: entry.total === 0 ? 0 : Math.round((entry.completed / entry.total) * 100)
  }));
}
