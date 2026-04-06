"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import {
  deleteUserHabit,
  listenToUserHabits,
  listenToUserRecords,
  saveUserHabit,
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

export type SlotRecords = Record<string, boolean>;
export type DayRecords = Record<string, SlotRecords>;
export type HabitRecords = Record<string, DayRecords>;
type PendingRecordPatches = Record<string, SlotRecords>;

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
  const [pendingRecordPatches, setPendingRecordPatches] =
    useState<PendingRecordPatches>({});
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoadingHabits(true);
      setIsLoadingRecords(true);
      return;
    }

    if (!user) {
      setHabits([]);
      setServerRecords({});
      setPendingRecordPatches({});
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
        setHabits(normalizeHabits(nextHabits));
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
    );

    return () => {
      unsubscribeHabits();
      unsubscribeRecords();
    };
  }, [isAuthLoading, user]);

  useEffect(() => {
    setPendingRecordPatches((current) => {
      let hasChanges = false;
      const nextPatches = { ...current };

      Object.entries(current).forEach(([patchKey, slots]) => {
        const { habitId, dateKey } = parsePendingPatchKey(patchKey);
        const persistedSlots = serverRecords[habitId]?.[dateKey];

        if (areSlotRecordsEqual(persistedSlots, slots)) {
          delete nextPatches[patchKey];
          hasChanges = true;
        }
      });

      return hasChanges ? nextPatches : current;
    });
  }, [serverRecords]);

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

      try {
        await saveUserHabit(user.uid, { ...currentHabit, archived: false });
      } catch (nextError) {
        setError(toErrorMessage(nextError, "Unable to restore habit."));
      }
    },
    [habits, user],
  );

  const mergedRecords = useMemo(
    () => mergePendingRecordPatches(serverRecords, pendingRecordPatches),
    [serverRecords, pendingRecordPatches],
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
        await saveUserRecordSlots(user.uid, dateKey, habitId, nextSlots);
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
    getHabitBySlug,
  };
}

export function useHabitRecords(_habits: HabitDefinition[]) {
  const { records, toggleHabitDay, isLoading, error } =
    useHabitStorageContext();

  return { records, toggleHabitDay, isLoading, error };
}
