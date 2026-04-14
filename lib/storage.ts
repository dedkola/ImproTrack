"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import {
  deleteUserHabit,
  fetchUserRecordsRange,
  listenToUserHabits,
  listenToUserRecords,
  saveUserHabit,
  saveUserHabitOrder,
  saveUserRecordSlots,
} from "@/lib/firebase/habit-store";
import {
  getNormalizedFrequency,
  HabitDefinition,
  HabitTone,
  normalizeTimeSlots,
  TONE_PRESETS,
  slugify,
} from "@/lib/habits";
import { startOfDay, subtractDays, toDateKey } from "@/lib/date";

export type SlotRecords = Record<string, boolean>;
export type DayRecords = Record<string, SlotRecords>;
export type HabitRecords = Record<string, DayRecords>;
type PendingRecordPatches = Record<string, SlotRecords>;

export const RECORDS_RECENT_WINDOW_DAYS = 120;

function normalizeSlotKey(slotName: string) {
  return slotName.trim().toLowerCase();
}

function resolveSlotValue(
  daySlots: SlotRecords | undefined,
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

function getPendingPatchKey(habitId: string, dateKey: string) {
  return `${habitId}::${dateKey}`;
}

function parsePendingPatchKey(patchKey: string) {
  const separatorIndex = patchKey.lastIndexOf("::");

  return {
    habitId: patchKey.slice(0, separatorIndex),
    dateKey: patchKey.slice(separatorIndex + 2),
  };
}

function areSlotRecordsEqual(
  left: SlotRecords | undefined,
  right: SlotRecords,
) {
  if (!left) {
    return false;
  }

  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  return Array.from(keys).every(
    (key) => Boolean(left[key]) === Boolean(right[key]),
  );
}

function mergePendingRecordPatches(
  records: HabitRecords,
  patches: PendingRecordPatches,
) {
  return Object.entries(patches).reduce((nextRecords, [patchKey, slots]) => {
    const { habitId, dateKey } = parsePendingPatchKey(patchKey);
    return upsertDaySlots(nextRecords, habitId, dateKey, slots);
  }, records);
}

function mergeRecordMaps(current: HabitRecords, incoming: HabitRecords): HabitRecords {
  const nextRecords = { ...current };

  Object.entries(incoming).forEach(([habitId, dayMap]) => {
    nextRecords[habitId] = {
      ...(nextRecords[habitId] ?? {}),
      ...dayMap,
    };
  });

  return nextRecords;
}

function upsertDaySlots(
  current: HabitRecords,
  habitId: string,
  dateKey: string,
  slots: SlotRecords,
): HabitRecords {
  const nextHabitDays = {
    ...(current[habitId] ?? {}),
    [dateKey]: slots,
  };

  return {
    ...current,
    [habitId]: nextHabitDays,
  };
}

type HabitMutationInput = Omit<
  HabitDefinition,
  "id" | "slug" | "createdAt" | "archived"
>;

type HabitStorageContextValue = {
  habits: HabitDefinition[];
  activeHabits: HabitDefinition[];
  archivedHabits: HabitDefinition[];
  categories: string[];
  records: HabitRecords;
  isLoading: boolean;
  error: string | null;
  addHabit: (habit: HabitMutationInput) => Promise<void>;
  updateHabit: (
    id: string,
    updates: Partial<Omit<HabitDefinition, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  reorderHabits: (orderedHabitIds: string[]) => Promise<void>;
  loadRecordsRange: (range: { fromDateKey: string; toDateKey: string }) => Promise<void>;
  toggleHabitDay: (
    habitId: string,
    dateKey: string,
    slotName?: string,
  ) => Promise<void>;
  getHabitBySlug: (slug: string) => HabitDefinition | undefined;
};

const HabitStorageContext = createContext<HabitStorageContextValue | undefined>(
  undefined,
);

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

  // Custom hex tones bypass preset normalization
  if (tone.hex) return tone;

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
    ...(Number.isFinite(habit.sortOrder)
      ? { sortOrder: habit.sortOrder }
      : {}),
    tone: normalizeTone(habit.tone),
  }));
}

function sortHabits(habits: HabitDefinition[]) {
  return [...habits].sort((left, right) => {
    const leftSortOrder =
      typeof left.sortOrder === "number" && Number.isFinite(left.sortOrder)
        ? left.sortOrder
        : null;
    const rightSortOrder =
      typeof right.sortOrder === "number" && Number.isFinite(right.sortOrder)
        ? right.sortOrder
        : null;

    if (leftSortOrder !== null && rightSortOrder !== null) {
      if (leftSortOrder !== rightSortOrder) {
        return leftSortOrder - rightSortOrder;
      }
    } else if (leftSortOrder !== null) {
      return -1;
    } else if (rightSortOrder !== null) {
      return 1;
    }

    if (left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }

    return left.id.localeCompare(right.id);
  });
}

function getNextSortOrder(habits: HabitDefinition[]) {
  const maxSortOrder = habits.reduce<number>(
    (maxValue, habit) =>
      typeof habit.sortOrder === "number" && Number.isFinite(habit.sortOrder)
        ? Math.max(maxValue, habit.sortOrder)
        : maxValue,
    -1,
  );

  return maxSortOrder + 1;
}

function toErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "permission-denied"
  ) {
    return "Firestore rejected the request. Publish your Firestore rules, then sign out and sign back in once to refresh the session.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function useHabitStorageContext() {
  const context = useContext(HabitStorageContext);

  if (!context) {
    throw new Error(
      "Habit storage hooks must be used within HabitStorageProvider.",
    );
  }

  return context;
}

export function HabitStorageProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading: isAuthLoading } = useFirebaseAuth();
  const [habits, setHabits] = useState<HabitDefinition[]>([]);
  const [serverRecords, setServerRecords] = useState<HabitRecords>({});
  const [historicalRecords, setHistoricalRecords] = useState<HabitRecords>({});
  const [pendingRecordPatches, setPendingRecordPatches] =
    useState<PendingRecordPatches>({});
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRangeKeysRef = useRef<Set<string>>(new Set());

  const recordsRange = useMemo(() => {
    const todayKey = toDateKey(startOfDay(new Date()));

    return {
      fromDateKey: toDateKey(
        subtractDays(startOfDay(new Date()), RECORDS_RECENT_WINDOW_DAYS - 1),
      ),
      toDateKey: todayKey,
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoadingHabits(true);
      setIsLoadingRecords(true);
      return;
    }

    if (!user) {
      setHabits([]);
      setServerRecords({});
      setHistoricalRecords({});
      setPendingRecordPatches({});
      loadedRangeKeysRef.current.clear();
      setError(null);
      setIsLoadingHabits(false);
      setIsLoadingRecords(false);
      return;
    }

    setError(null);
    setIsLoadingHabits(true);
    setIsLoadingRecords(true);

    const unsubscribeHabits = listenToUserHabits(
      user.uid,
      (nextHabits) => {
        setHabits(sortHabits(normalizeHabits(nextHabits)));
        setIsLoadingHabits(false);
      },
      (nextError) => {
        setError(toErrorMessage(nextError, "Unable to load habits."));
        setHabits([]);
        setIsLoadingHabits(false);
      },
    );

    const unsubscribeRecords = listenToUserRecords(
      user.uid,
      (nextRecords) => {
        setServerRecords(nextRecords);
        setIsLoadingRecords(false);
      },
      (nextError) => {
        setError(toErrorMessage(nextError, "Unable to load records."));
        setServerRecords({});
        setPendingRecordPatches({});
        setIsLoadingRecords(false);
      },
      recordsRange,
    );

    return () => {
      unsubscribeHabits();
      unsubscribeRecords();
    };
  }, [isAuthLoading, recordsRange, user]);

  const loadRecordsRange = useCallback(
    async (range: { fromDateKey: string; toDateKey: string }) => {
      if (!user) return;

      const fromDateKey =
        range.fromDateKey <= range.toDateKey ? range.fromDateKey : range.toDateKey;
      const toDateKey =
        range.fromDateKey <= range.toDateKey ? range.toDateKey : range.fromDateKey;
      const rangeKey = `${fromDateKey}::${toDateKey}`;

      if (loadedRangeKeysRef.current.has(rangeKey)) {
        return;
      }

      try {
        const fetchedRecords = await fetchUserRecordsRange(user.uid, {
          fromDateKey,
          toDateKey,
        });

        loadedRangeKeysRef.current.add(rangeKey);
        setHistoricalRecords((current) => mergeRecordMaps(current, fetchedRecords));
      } catch (nextError) {
        setError(
          toErrorMessage(nextError, "Unable to load historical records."),
        );
      }
    },
    [user],
  );

  const combinedRecords = useMemo(
    () => mergeRecordMaps(historicalRecords, serverRecords),
    [historicalRecords, serverRecords],
  );

  useEffect(() => {
    setPendingRecordPatches((current) => {
      let hasChanges = false;
      const nextPatches = { ...current };

      Object.entries(current).forEach(([patchKey, slots]) => {
        const { habitId, dateKey } = parsePendingPatchKey(patchKey);
        const persistedSlots = combinedRecords[habitId]?.[dateKey];

        if (areSlotRecordsEqual(persistedSlots, slots)) {
          delete nextPatches[patchKey];
          hasChanges = true;
        }
      });

      return hasChanges ? nextPatches : current;
    });
  }, [combinedRecords]);

  const addHabit = useCallback(
    async (habit: HabitMutationInput) => {
      if (!user) return;

      setError(null);

      const normalizedFrequency = getNormalizedFrequency(
        habit.frequencyPerDay,
        habit.timeSlots,
      );
      const baseSlug = slugify(habit.name);
      const id = `${baseSlug}-${Date.now().toString(36)}`;
      let finalSlug = baseSlug;
      let counter = 2;

      while (habits.some((entry) => entry.slug === finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter += 1;
      }

      const nextHabit: HabitDefinition = {
        ...habit,
        id,
        slug: finalSlug,
        frequencyPerDay: normalizedFrequency,
        timeSlots: normalizeTimeSlots(normalizedFrequency, habit.timeSlots),
        archived: false,
        createdAt: new Date().toISOString(),
        sortOrder: getNextSortOrder(habits),
        tone: normalizeTone(habit.tone),
      };

      try {
        await saveUserHabit(user.uid, nextHabit);
      } catch (nextError) {
        setError(toErrorMessage(nextError, "Unable to create habit."));
      }
    },
    [habits, user],
  );

  const updateHabit = useCallback(
    async (
      id: string,
      updates: Partial<Omit<HabitDefinition, "id" | "createdAt">>,
    ) => {
      if (!user) return;

      const currentHabit = habits.find((habit) => habit.id === id);
      if (!currentHabit) return;

      setError(null);

      const merged = { ...currentHabit, ...updates };
      const normalizedFrequency = getNormalizedFrequency(
        merged.frequencyPerDay,
        merged.timeSlots,
      );
      let nextSlug = merged.slug;

      if (updates.name && updates.name !== currentHabit.name) {
        const baseSlug = slugify(updates.name);
        nextSlug = baseSlug;
        let counter = 2;

        while (
          habits.some((habit) => habit.id !== id && habit.slug === nextSlug)
        ) {
          nextSlug = `${baseSlug}-${counter}`;
          counter += 1;
        }
      }

      const nextHabit: HabitDefinition = {
        ...merged,
        slug: nextSlug,
        frequencyPerDay: normalizedFrequency,
        timeSlots: normalizeTimeSlots(normalizedFrequency, merged.timeSlots),
        tone: normalizeTone(merged.tone),
      };

      try {
        await saveUserHabit(user.uid, nextHabit);
      } catch (nextError) {
        setError(toErrorMessage(nextError, "Unable to update habit."));
      }
    },
    [habits, user],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      if (!user) return;

      setError(null);

      try {
        await deleteUserHabit(user.uid, id);
      } catch (nextError) {
        setError(toErrorMessage(nextError, "Unable to delete habit."));
      }
    },
    [user],
  );

  const archiveHabit = useCallback(
    async (id: string) => {
      const currentHabit = habits.find((habit) => habit.id === id);
      if (!user || !currentHabit) return;

      setError(null);

      try {
        await saveUserHabit(user.uid, { ...currentHabit, archived: true });
      } catch (nextError) {
        setError(toErrorMessage(nextError, "Unable to archive habit."));
      }
    },
    [habits, user],
  );

  const restoreHabit = useCallback(
    async (id: string) => {
      const currentHabit = habits.find((habit) => habit.id === id);
      if (!user || !currentHabit) return;

      setError(null);

      const nextHabit =
        typeof currentHabit.sortOrder === "number"
          ? { ...currentHabit, archived: false }
          : {
              ...currentHabit,
              archived: false,
              sortOrder: getNextSortOrder(habits),
            };

      try {
        await saveUserHabit(user.uid, nextHabit);
      } catch (nextError) {
        setError(toErrorMessage(nextError, "Unable to restore habit."));
      }
    },
    [habits, user],
  );

  const reorderHabits = useCallback(
    async (orderedHabitIds: string[]) => {
      if (!user) return;

      const sanitizedIds = orderedHabitIds.filter((habitId, index) => {
        if (orderedHabitIds.indexOf(habitId) !== index) {
          return false;
        }

        return habits.some((habit) => habit.id === habitId);
      });

      if (sanitizedIds.length === 0) {
        return;
      }

      const previousHabits = habits;
      const nextSortOrderById = new Map(
        sanitizedIds.map((habitId, index) => [habitId, index]),
      );
      const nextHabits = sortHabits(
        habits.map((habit) =>
          nextSortOrderById.has(habit.id)
            ? {
                ...habit,
                sortOrder: nextSortOrderById.get(habit.id),
              }
            : habit,
        ),
      );

      setHabits(nextHabits);
      setError(null);

      try {
        await saveUserHabitOrder(user.uid, sanitizedIds);
      } catch (nextError) {
        setHabits(previousHabits);
        setError(toErrorMessage(nextError, "Unable to reorder habits."));
      }
    },
    [habits, user],
  );

  const mergedRecords = useMemo(
    () => mergePendingRecordPatches(combinedRecords, pendingRecordPatches),
    [combinedRecords, pendingRecordPatches],
  );

  const toggleHabitDay = useCallback(
    async (habitId: string, dateKey: string, slotName: string = "default") => {
      if (!user) return;

      const currentHabit = habits.find((habit) => habit.id === habitId);
      const allowSingleSlotFallback =
        (currentHabit?.timeSlots.length ?? 0) <= 1;
      const daySlots = mergedRecords[habitId]?.[dateKey] ?? {};
      const previousSlots = { ...daySlots };
      const nextValue = !resolveSlotValue(daySlots, slotName, {
        fallbackToAny: allowSingleSlotFallback,
      });
      const nextSlots = allowSingleSlotFallback
        ? { [slotName]: nextValue }
        : {
            ...daySlots,
            [slotName]: nextValue,
          };
      const patchKey = getPendingPatchKey(habitId, dateKey);

      setPendingRecordPatches((current) => ({
        ...current,
        [patchKey]: nextSlots,
      }));

      setError(null);

      try {
        await saveUserRecordSlots(user.uid, dateKey, habitId, nextSlots, {
          useLegacyBoolean: allowSingleSlotFallback,
        });
      } catch (nextError) {
        setPendingRecordPatches((current) => {
          const nextPatches = { ...current };

          if (Object.keys(previousSlots).length === 0) {
            delete nextPatches[patchKey];
          } else {
            nextPatches[patchKey] = previousSlots;
          }

          return nextPatches;
        });
        setError(toErrorMessage(nextError, "Unable to save record."));
      }
    },
    [habits, mergedRecords, user],
  );

  const getHabitBySlug = useCallback(
    (slug: string) => habits.find((habit) => habit.slug === slug),
    [habits],
  );

  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.archived),
    [habits],
  );
  const archivedHabits = useMemo(
    () => habits.filter((habit) => habit.archived),
    [habits],
  );
  const categories = useMemo(
    () => [...new Set(activeHabits.map((habit) => habit.category))].sort(),
    [activeHabits],
  );
  const isLoading =
    isAuthLoading || (!!user && (isLoadingHabits || isLoadingRecords));

  const value = useMemo(
    () => ({
      habits,
      activeHabits,
      archivedHabits,
      categories,
      records: mergedRecords,
      isLoading,
      error,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      restoreHabit,
      reorderHabits,
      loadRecordsRange,
      toggleHabitDay,
      getHabitBySlug,
    }),
    [
      habits,
      activeHabits,
      archivedHabits,
      categories,
      mergedRecords,
      isLoading,
      error,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      restoreHabit,
      reorderHabits,
      loadRecordsRange,
      toggleHabitDay,
      getHabitBySlug,
    ],
  );

  return createElement(HabitStorageContext.Provider, { value }, children);
}

export function useHabits() {
  const {
    habits,
    activeHabits,
    archivedHabits,
    categories,
    isLoading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    reorderHabits,
    getHabitBySlug,
  } = useHabitStorageContext();

  return {
    habits,
    activeHabits,
    archivedHabits,
    categories,
    isLoading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    reorderHabits,
    getHabitBySlug,
  };
}

export function useHabitRecords(_habits: HabitDefinition[]) {
  const { records, toggleHabitDay, loadRecordsRange, isLoading, error } =
    useHabitStorageContext();

  return { records, toggleHabitDay, loadRecordsRange, isLoading, error };
}
