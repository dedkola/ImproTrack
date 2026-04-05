"use client";

import { useEffect, useState } from "react";
import { addDays, startOfDay, subtractDays, toDateKey } from "@/lib/date";
import { habits } from "@/lib/habits";

const STORAGE_KEY = "habit-grid-tracker-state-v1";
const HISTORY_DAYS = 220;

export type HabitRecords = Record<string, Record<string, boolean>>;

function seededChance(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }

  return (hash % 1000) / 1000;
}

function createInitialRecords() {
  const today = startOfDay(new Date());
  const startDate = subtractDays(today, HISTORY_DAYS);
  const records: HabitRecords = {};

  habits.forEach((habit, habitIndex) => {
    const entries: Record<string, boolean> = {};

    for (let cursor = startDate; cursor <= today; cursor = addDays(cursor, 1)) {
      const dateKey = toDateKey(cursor);
      const weekday = cursor.getDay();
      const weekendBoost = weekday === 0 || weekday === 6 ? 0.07 : 0;
      const targetRate = 0.62 + habitIndex * 0.05 + weekendBoost;
      const chance = seededChance(`${habit.id}-${dateKey}`);

      entries[dateKey] = chance < targetRate;
    }

    records[habit.id] = entries;
  });

  return records;
}

function readRecords() {
  if (typeof window === "undefined") {
    return createInitialRecords();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const initial = createInitialRecords();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored) as HabitRecords;
  } catch {
    const fallback = createInitialRecords();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function persistRecords(records: HabitRecords) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useHabitRecords() {
  const [records, setRecords] = useState<HabitRecords>(() => readRecords());

  useEffect(() => {
    const syncState = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        setRecords(JSON.parse(event.newValue) as HabitRecords);
      }
    };

    window.addEventListener("storage", syncState);

    return () => {
      window.removeEventListener("storage", syncState);
    };
  }, []);

  const toggleHabitDay = (habitId: string, dateKey: string) => {
    setRecords((current) => {
      const next = {
        ...current,
        [habitId]: {
          ...current[habitId],
          [dateKey]: !current[habitId]?.[dateKey]
        }
      };

      persistRecords(next);
      return next;
    });
  };

  return { records, toggleHabitDay };
}
