"use client";

import { useCallback, useEffect, useState } from "react";
import { addDays, startOfDay, subtractDays, toDateKey } from "@/lib/date";
import {
  DEFAULT_HABITS,
  getNormalizedFrequency,
  HabitDefinition,
  HabitTone,
  normalizeTimeSlots,
  TONE_PRESETS,
  slugify,
} from "@/lib/habits";

const RECORDS_KEY = "habit-grid-tracker-state-v2";
const RECORDS_KEY_V1 = "habit-grid-tracker-state-v1";
const HABITS_KEY = "habit-grid-tracker-habits-v1";
const HISTORY_DAYS = 220;

// New nested structure: { habitId: { dateKey: { slotName: boolean } } }
export type SlotRecords = Record<string, boolean>;
export type DayRecords = Record<string, SlotRecords>;
export type HabitRecords = Record<string, DayRecords>;

// ---- helpers ----------------------------------------------------------

function seededChance(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }
  return (hash % 1000) / 1000;
}

function migrateV1Records(): HabitRecords | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(RECORDS_KEY_V1);
  if (!raw) return null;

  try {
    const v1 = JSON.parse(raw) as Record<string, Record<string, boolean>>;
    const v2: HabitRecords = {};
    for (const [habitId, days] of Object.entries(v1)) {
      v2[habitId] = {};
      for (const [dateKey, completed] of Object.entries(days)) {
        v2[habitId][dateKey] = { default: completed };
      }
    }
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(v2));
    window.localStorage.removeItem(RECORDS_KEY_V1);
    return v2;
  } catch {
    return null;
  }
}

function createInitialRecords(habits: HabitDefinition[]): HabitRecords {
  const today = startOfDay(new Date());
  const startDate = subtractDays(today, HISTORY_DAYS);
  const records: HabitRecords = {};

  habits.forEach((habit, habitIndex) => {
    const entries: DayRecords = {};

    for (let cursor = startDate; cursor <= today; cursor = addDays(cursor, 1)) {
      const dateKey = toDateKey(cursor);
      const weekday = cursor.getDay();
      const weekendBoost = weekday === 0 || weekday === 6 ? 0.07 : 0;
      const targetRate = 0.62 + habitIndex * 0.05 + weekendBoost;
      const slots: SlotRecords = {};

      for (const slot of habit.timeSlots) {
        const chance = seededChance(`${habit.id}-${slot}-${dateKey}`);
        slots[slot] = chance < targetRate;
      }

      entries[dateKey] = slots;
    }

    records[habit.id] = entries;
  });

  return records;
}

function readRecords(habits: HabitDefinition[]): HabitRecords {
  if (typeof window === "undefined") return createInitialRecords(habits);

  const stored = window.localStorage.getItem(RECORDS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as HabitRecords;
    } catch {
      /* fall through */
    }
  }

  // Try migrating from v1
  const migrated = migrateV1Records();
  if (migrated) return migrated;

  const initial = createInitialRecords(habits);
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(initial));
  return initial;
}

function persistRecords(records: HabitRecords) {
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

// ---- Habits persistence -----------------------------------------------

function readHabits(): HabitDefinition[] {
  if (typeof window === "undefined") return DEFAULT_HABITS;

  const stored = window.localStorage.getItem(HABITS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as HabitDefinition[];
      const normalized = normalizeHabits(parsed);
      if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        window.localStorage.setItem(HABITS_KEY, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      /* fall through */
    }
  }

  window.localStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
  return DEFAULT_HABITS;
}

function persistHabits(habits: HabitDefinition[]) {
  window.localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

const LEGACY_FILL_TO_CURRENT: Record<string, string> = {
  "bg-sky-500": "bg-sky-600",
  "bg-emerald-500": "bg-emerald-600",
  "bg-violet-500": "bg-violet-600",
  "bg-amber-500": "bg-amber-600",
  "bg-rose-500": "bg-rose-600",
  "bg-teal-500": "bg-teal-600",
  "bg-indigo-500": "bg-indigo-600",
  "bg-slate-500": "bg-slate-600",
};

const TONE_BY_FILL = new Map<string, HabitTone>(
  TONE_PRESETS.map((preset) => [preset.tone.fill, preset.tone]),
);

function normalizeTone(tone: HabitTone | undefined): HabitTone {
  if (!tone) return TONE_PRESETS[0].tone;

  const normalizedFill = LEGACY_FILL_TO_CURRENT[tone.fill] ?? tone.fill;
  const mappedByFill = TONE_BY_FILL.get(normalizedFill);
  if (mappedByFill) return mappedByFill;

  const family = tone.accent.match(/text-([a-z]+)-\d+/)?.[1];
  if (family) {
    const mappedByFamily = TONE_PRESETS.find((preset) =>
      preset.tone.accent.startsWith(`text-${family}-`),
    )?.tone;
    if (mappedByFamily) return mappedByFamily;
  }

  return TONE_PRESETS[0].tone;
}

function normalizeHabits(habits: HabitDefinition[]): HabitDefinition[] {
  return habits.map((habit) => ({
    ...habit,
    frequencyPerDay: getNormalizedFrequency(
      habit.frequencyPerDay,
      habit.timeSlots,
    ),
    timeSlots: normalizeTimeSlots(
      getNormalizedFrequency(habit.frequencyPerDay, habit.timeSlots),
      habit.timeSlots,
    ),
    tone: normalizeTone(habit.tone),
  }));
}

// ---- Hooks ------------------------------------------------------------

export function useHabits() {
  const [habits, setHabits] = useState<HabitDefinition[]>(DEFAULT_HABITS);

  useEffect(() => {
    setHabits(readHabits());
    const syncState = (event: StorageEvent) => {
      if (event.key === HABITS_KEY && event.newValue) {
        const parsed = JSON.parse(event.newValue) as HabitDefinition[];
        setHabits(normalizeHabits(parsed));
      }
    };
    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, []);

  const addHabit = useCallback(
    (
      habit: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
    ) => {
      setHabits((current) => {
        const normalizedFrequency = getNormalizedFrequency(
          habit.frequencyPerDay,
          habit.timeSlots,
        );
        const id = slugify(habit.name) + "-" + Date.now().toString(36);
        const slug = slugify(habit.name);
        // Ensure unique slug
        let finalSlug = slug;
        let counter = 2;
        while (current.some((h) => h.slug === finalSlug)) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
        const newHabit: HabitDefinition = {
          ...habit,
          id,
          slug: finalSlug,
          frequencyPerDay: normalizedFrequency,
          timeSlots: normalizeTimeSlots(normalizedFrequency, habit.timeSlots),
          archived: false,
          createdAt: new Date().toISOString(),
        };
        const next = [...current, newHabit];
        persistHabits(next);
        return next;
      });
    },
    [],
  );

  const updateHabit = useCallback(
    (
      id: string,
      updates: Partial<Omit<HabitDefinition, "id" | "createdAt">>,
    ) => {
      setHabits((current) => {
        const next = current.map((h) => {
          if (h.id !== id) return h;
          const merged = { ...h, ...updates };
          const normalizedFrequency = getNormalizedFrequency(
            merged.frequencyPerDay,
            merged.timeSlots,
          );
          const updated = {
            ...merged,
            frequencyPerDay: normalizedFrequency,
            timeSlots: normalizeTimeSlots(
              normalizedFrequency,
              merged.timeSlots,
            ),
          };
          // If name changed, update slug
          if (updates.name && updates.name !== h.name) {
            let newSlug = slugify(updates.name);
            let counter = 2;
            while (
              current.some((other) => other.id !== id && other.slug === newSlug)
            ) {
              newSlug = `${slugify(updates.name)}-${counter}`;
              counter++;
            }
            updated.slug = newSlug;
          }
          return updated;
        });
        persistHabits(next);
        return next;
      });
    },
    [],
  );

  const deleteHabit = useCallback((id: string) => {
    setHabits((current) => {
      const next = current.filter((h) => h.id !== id);
      persistHabits(next);
      return next;
    });
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setHabits((current) => {
      const next = current.map((h) =>
        h.id === id ? { ...h, archived: true } : h,
      );
      persistHabits(next);
      return next;
    });
  }, []);

  const restoreHabit = useCallback((id: string) => {
    setHabits((current) => {
      const next = current.map((h) =>
        h.id === id ? { ...h, archived: false } : h,
      );
      persistHabits(next);
      return next;
    });
  }, []);

  const getHabitBySlug = useCallback(
    (slug: string) => habits.find((h) => h.slug === slug),
    [habits],
  );

  const activeHabits = habits.filter((h) => !h.archived);
  const archivedHabits = habits.filter((h) => h.archived);
  const categories = [...new Set(activeHabits.map((h) => h.category))].sort();

  return {
    habits,
    activeHabits,
    archivedHabits,
    categories,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    getHabitBySlug,
  };
}

export function useHabitRecords(habits: HabitDefinition[]) {
  const [records, setRecords] = useState<HabitRecords>({});

  useEffect(() => {
    setRecords(readRecords(habits));
    const syncState = (event: StorageEvent) => {
      if (event.key === RECORDS_KEY && event.newValue) {
        setRecords(JSON.parse(event.newValue) as HabitRecords);
      }
    };
    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, []);

  const toggleHabitDay = useCallback(
    (habitId: string, dateKey: string, slotName: string = "default") => {
      setRecords((current) => {
        const habitDays = current[habitId] ?? {};
        const daySlots = habitDays[dateKey] ?? {};
        const next: HabitRecords = {
          ...current,
          [habitId]: {
            ...habitDays,
            [dateKey]: {
              ...daySlots,
              [slotName]: !daySlots[slotName],
            },
          },
        };
        persistRecords(next);
        return next;
      });
    },
    [],
  );

  return { records, toggleHabitDay };
}
