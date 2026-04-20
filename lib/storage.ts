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
  fetchAllRecords,
  fetchRecordsInRange,
  listenToUserHabits,
  listenToUserRecordsInRange,
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
import {
  endOfMonth,
  startOfMonth,
  toDateKey,
  toYearMonth,
  yearMonthFromDateKey,
} from "@/lib/date";

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

function mergeRecordLayers(
  base: HabitRecords,
  ...layers: HabitRecords[]
): HabitRecords {
  const merged = { ...base };

  for (const layer of layers) {
    for (const [habitId, dayRecords] of Object.entries(layer)) {
      merged[habitId] = { ...(merged[habitId] ?? {}), ...dayRecords };
    }
  }

  return merged;
}

type HabitMutationInput = Omit<
  HabitDefinition,
  "id" | "slug" | "createdAt" | "archived"
>;

type BootstrapErrorSource = "habits" | "records";

export type HabitStorageBootstrapError = {
  source: BootstrapErrorSource;
  message: string;
};

export type HabitStorageMutationKind =
  | "add-habit"
  | "update-habit"
  | "delete-habit"
  | "archive-habit"
  | "restore-habit"
  | "reorder-habits"
  | "toggle-record";

export type HabitStorageMutationError = {
  kind: "mutation";
  mutation: HabitStorageMutationKind;
  message: string;
};

export type HabitStorageSyncIssue =
  | HabitStorageMutationError
  | {
      kind: "listener";
      source: BootstrapErrorSource;
      message: string;
    };

export type HabitStorageSyncState = {
  isSyncing: boolean;
  pendingMutationCount: number;
  pendingRecordCount: number;
  latestIssue: HabitStorageSyncIssue | null;
  latestMutationError: HabitStorageMutationError | null;
  isRecordPending: (habitId: string, dateKey: string) => boolean;
};

export type HabitStorageFullHistoryState =
  | {
      status: "idle";
      hasFullHistory: false;
      error: null;
    }
  | {
      status: "loading";
      hasFullHistory: false;
      error: null;
    }
  | {
      status: "ready";
      hasFullHistory: true;
      error: null;
    }
  | {
      status: "error";
      hasFullHistory: false;
      error: string;
    };

type HabitStorageContextValue = {
  habits: HabitDefinition[];
  activeHabits: HabitDefinition[];
  archivedHabits: HabitDefinition[];
  records: HabitRecords;
  isLoading: boolean;
  bootstrapError: HabitStorageBootstrapError | null;
  syncState: HabitStorageSyncState;
  fullHistoryState: HabitStorageFullHistoryState;
  addHabit: (habit: HabitMutationInput) => Promise<void>;
  updateHabit: (
    id: string,
    updates: Partial<Omit<HabitDefinition, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  reorderHabits: (orderedHabitIds: string[]) => Promise<void>;
  toggleHabitDay: (
    habitId: string,
    dateKey: string,
    slotName?: string,
  ) => Promise<void>;
  getHabitBySlug: (slug: string) => HabitDefinition | undefined;
  loadMonth: (yearMonth: string) => Promise<void>;
  loadFullHistory: () => Promise<void>;
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
    ...(Number.isFinite(habit.sortOrder) ? { sortOrder: habit.sortOrder } : {}),
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

function createBootstrapError(
  source: BootstrapErrorSource,
  error: unknown,
  fallback: string,
): HabitStorageBootstrapError {
  return {
    source,
    message: toErrorMessage(error, fallback),
  };
}

function createListenerIssue(
  source: BootstrapErrorSource,
  error: unknown,
  fallback: string,
): HabitStorageSyncIssue {
  return {
    kind: "listener",
    source,
    message: toErrorMessage(error, fallback),
  };
}

function createMutationIssue(
  mutation: HabitStorageMutationKind,
  error: unknown,
  fallback: string,
): HabitStorageMutationError {
  return {
    kind: "mutation",
    mutation,
    message: toErrorMessage(error, fallback),
  };
}

function getIdleFullHistoryState(): HabitStorageFullHistoryState {
  return {
    status: "idle",
    hasFullHistory: false,
    error: null,
  };
}

function getLoadingFullHistoryState(): HabitStorageFullHistoryState {
  return {
    status: "loading",
    hasFullHistory: false,
    error: null,
  };
}

function getReadyFullHistoryState(): HabitStorageFullHistoryState {
  return {
    status: "ready",
    hasFullHistory: true,
    error: null,
  };
}

function getErroredFullHistoryState(
  error: unknown,
  fallback: string,
): HabitStorageFullHistoryState {
  return {
    status: "error",
    hasFullHistory: false,
    error: toErrorMessage(error, fallback),
  };
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
  const [cachedRecords, setCachedRecords] = useState<HabitRecords>({});
  const [pendingRecordPatches, setPendingRecordPatches] =
    useState<PendingRecordPatches>({});
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [bootstrapError, setBootstrapError] =
    useState<HabitStorageBootstrapError | null>(null);
  const [latestSyncIssue, setLatestSyncIssue] =
    useState<HabitStorageSyncIssue | null>(null);
  const [pendingMutationCount, setPendingMutationCount] = useState(0);
  const loadedMonthsRef = useRef<Set<string>>(new Set());
  const [fullHistoryState, setFullHistoryState] =
    useState<HabitStorageFullHistoryState>(getIdleFullHistoryState);
  const hasBootstrappedHabitsRef = useRef(false);
  const hasBootstrappedRecordsRef = useRef(false);
  const fullHistoryLoadedRef = useRef(false);
  const isLoadingFullHistoryRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoadingHabits(true);
      setIsLoadingRecords(true);
      return;
    }

    if (!user) {
      setHabits([]);
      setServerRecords({});
      setCachedRecords({});
      setPendingRecordPatches({});
      setBootstrapError(null);
      setLatestSyncIssue(null);
      setPendingMutationCount(0);
      setIsLoadingHabits(false);
      setIsLoadingRecords(false);
      loadedMonthsRef.current = new Set();
      setFullHistoryState(getIdleFullHistoryState());
      hasBootstrappedHabitsRef.current = false;
      hasBootstrappedRecordsRef.current = false;
      fullHistoryLoadedRef.current = false;
      isLoadingFullHistoryRef.current = false;
      return;
    }

    setBootstrapError(null);
    setLatestSyncIssue(null);
    setPendingMutationCount(0);
    setFullHistoryState(getIdleFullHistoryState());
    setIsLoadingHabits(true);
    setIsLoadingRecords(true);
    hasBootstrappedHabitsRef.current = false;
    hasBootstrappedRecordsRef.current = false;
    fullHistoryLoadedRef.current = false;
    isLoadingFullHistoryRef.current = false;

    const now = new Date();
    const fromKey = toDateKey(startOfMonth(now));
    const toKey = toDateKey(endOfMonth(now));
    const currentYearMonth = toYearMonth(now);
    loadedMonthsRef.current = new Set([currentYearMonth]);

    const unsubscribeHabits = listenToUserHabits(
      user.uid,
      (nextHabits) => {
        hasBootstrappedHabitsRef.current = true;
        setHabits(sortHabits(normalizeHabits(nextHabits)));
        setIsLoadingHabits(false);
      },
      (nextError) => {
        if (!hasBootstrappedHabitsRef.current) {
          setBootstrapError(
            createBootstrapError("habits", nextError, "Unable to load habits."),
          );
          setHabits([]);
          setIsLoadingHabits(false);
          return;
        }

        setLatestSyncIssue(
          createListenerIssue("habits", nextError, "Unable to sync habits."),
        );
      },
    );

    const unsubscribeRecords = listenToUserRecordsInRange(
      user.uid,
      fromKey,
      toKey,
      (nextRecords) => {
        hasBootstrappedRecordsRef.current = true;
        setServerRecords(nextRecords);
        setIsLoadingRecords(false);
      },
      (nextError) => {
        if (!hasBootstrappedRecordsRef.current) {
          setBootstrapError(
            createBootstrapError("records", nextError, "Unable to load records."),
          );
          setServerRecords({});
          setPendingRecordPatches({});
          setIsLoadingRecords(false);
          return;
        }

        setLatestSyncIssue(
          createListenerIssue("records", nextError, "Unable to sync records."),
        );
      },
    );

    return () => {
      unsubscribeHabits();
      unsubscribeRecords();
    };
  }, [isAuthLoading, user]);

  const persistedRecords = useMemo(
    () => mergeRecordLayers(cachedRecords, serverRecords),
    [cachedRecords, serverRecords],
  );

  useEffect(() => {
    setPendingRecordPatches((current) => {
      let hasChanges = false;
      const nextPatches = { ...current };

      Object.entries(current).forEach(([patchKey, slots]) => {
        const { habitId, dateKey } = parsePendingPatchKey(patchKey);
        const persistedSlots = persistedRecords[habitId]?.[dateKey];

        if (areSlotRecordsEqual(persistedSlots, slots)) {
          delete nextPatches[patchKey];
          hasChanges = true;
        }
      });

      return hasChanges ? nextPatches : current;
    });
  }, [persistedRecords]);

  const mergedRecords = useMemo(
    () => mergePendingRecordPatches(persistedRecords, pendingRecordPatches),
    [pendingRecordPatches, persistedRecords],
  );

  const loadMonth = useCallback(
    async (yearMonth: string) => {
      if (
        !user ||
        loadedMonthsRef.current.has(yearMonth) ||
        fullHistoryLoadedRef.current
      )
        return;

      loadedMonthsRef.current = new Set([
        ...loadedMonthsRef.current,
        yearMonth,
      ]);

      const [yearStr, monthStr] = yearMonth.split("-").map(Number);
      const monthDate = new Date(yearStr, monthStr - 1, 1);
      const fromKey = toDateKey(startOfMonth(monthDate));
      const toKey = toDateKey(endOfMonth(monthDate));

      try {
        const fetched = await fetchRecordsInRange(user.uid, fromKey, toKey);
        setCachedRecords((current) => mergeRecordLayers(current, fetched));
      } catch {
        loadedMonthsRef.current = new Set(
          [...loadedMonthsRef.current].filter((m) => m !== yearMonth),
        );
      }
    },
    [user],
  );

  const loadFullHistory = useCallback(async () => {
    if (
      !user ||
      fullHistoryLoadedRef.current ||
      isLoadingFullHistoryRef.current
    ) {
      return;
    }

    isLoadingFullHistoryRef.current = true;
    setFullHistoryState(getLoadingFullHistoryState());

    try {
      const fetched = await fetchAllRecords(user.uid);
      setCachedRecords((current) => mergeRecordLayers(current, fetched));
      fullHistoryLoadedRef.current = true;
      setFullHistoryState(getReadyFullHistoryState());
    } catch (nextError) {
      fullHistoryLoadedRef.current = false;
      setFullHistoryState(
        getErroredFullHistoryState(
          nextError,
          "Unable to load your full history right now.",
        ),
      );
    } finally {
      isLoadingFullHistoryRef.current = false;
    }
  }, [user]);

  const beginMutation = useCallback(() => {
    setPendingMutationCount((current) => current + 1);
    setLatestSyncIssue((current) =>
      current?.kind === "mutation" ? null : current,
    );
  }, []);

  const finishMutation = useCallback((issue?: HabitStorageSyncIssue) => {
    setPendingMutationCount((current) => Math.max(0, current - 1));
    setLatestSyncIssue((current) => {
      if (issue) {
        return issue;
      }

      return current?.kind === "mutation" ? null : current;
    });
  }, []);

  const isRecordPending = useCallback(
    (habitId: string, dateKey: string) =>
      Boolean(pendingRecordPatches[getPendingPatchKey(habitId, dateKey)]),
    [pendingRecordPatches],
  );

  const latestMutationError =
    latestSyncIssue?.kind === "mutation" ? latestSyncIssue : null;
  const pendingRecordCount = Object.keys(pendingRecordPatches).length;
  const isSyncing = pendingMutationCount > 0 || pendingRecordCount > 0;

  const syncState = useMemo(
    () => ({
      isSyncing,
      pendingMutationCount,
      pendingRecordCount,
      latestIssue: latestSyncIssue,
      latestMutationError,
      isRecordPending,
    }),
    [
      isRecordPending,
      isSyncing,
      latestMutationError,
      latestSyncIssue,
      pendingMutationCount,
      pendingRecordCount,
    ],
  );

  const addHabit = useCallback(
    async (habit: HabitMutationInput) => {
      if (!user) return;

      beginMutation();

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
        finishMutation();
      } catch (nextError) {
        finishMutation(
          createMutationIssue(
            "add-habit",
            nextError,
            "Unable to create habit.",
          ),
        );
      }
    },
    [beginMutation, finishMutation, habits, user],
  );

  const updateHabit = useCallback(
    async (
      id: string,
      updates: Partial<Omit<HabitDefinition, "id" | "createdAt">>,
    ) => {
      if (!user) return;

      const currentHabit = habits.find((habit) => habit.id === id);
      if (!currentHabit) return;

      beginMutation();

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
        finishMutation();
      } catch (nextError) {
        finishMutation(
          createMutationIssue(
            "update-habit",
            nextError,
            "Unable to update habit.",
          ),
        );
      }
    },
    [beginMutation, finishMutation, habits, user],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      if (!user) return;

      beginMutation();

      const knownDateKeys = Object.keys(mergedRecords[id] ?? {});

      try {
        await deleteUserHabit(
          user.uid,
          id,
          knownDateKeys.length > 0 ? knownDateKeys : undefined,
        );
        finishMutation();
      } catch (nextError) {
        finishMutation(
          createMutationIssue(
            "delete-habit",
            nextError,
            "Unable to delete habit.",
          ),
        );
      }
    },
    [beginMutation, finishMutation, mergedRecords, user],
  );

  const archiveHabit = useCallback(
    async (id: string) => {
      const currentHabit = habits.find((habit) => habit.id === id);
      if (!user || !currentHabit) return;

      beginMutation();

      try {
        await saveUserHabit(user.uid, { ...currentHabit, archived: true });
        finishMutation();
      } catch (nextError) {
        finishMutation(
          createMutationIssue(
            "archive-habit",
            nextError,
            "Unable to archive habit.",
          ),
        );
      }
    },
    [beginMutation, finishMutation, habits, user],
  );

  const restoreHabit = useCallback(
    async (id: string) => {
      const currentHabit = habits.find((habit) => habit.id === id);
      if (!user || !currentHabit) return;

      beginMutation();

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
        finishMutation();
      } catch (nextError) {
        finishMutation(
          createMutationIssue(
            "restore-habit",
            nextError,
            "Unable to restore habit.",
          ),
        );
      }
    },
    [beginMutation, finishMutation, habits, user],
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
      beginMutation();

      try {
        await saveUserHabitOrder(user.uid, sanitizedIds);
        finishMutation();
      } catch (nextError) {
        setHabits(previousHabits);
        finishMutation(
          createMutationIssue(
            "reorder-habits",
            nextError,
            "Unable to reorder habits.",
          ),
        );
      }
    },
    [beginMutation, finishMutation, habits, user],
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
      beginMutation();

      try {
        await saveUserRecordSlots(user.uid, dateKey, habitId, nextSlots, {
          useLegacyBoolean: allowSingleSlotFallback,
        });
        setCachedRecords((current) =>
          upsertDaySlots(current, habitId, dateKey, nextSlots),
        );
        finishMutation();
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
        finishMutation(
          createMutationIssue(
            "toggle-record",
            nextError,
            "Unable to save record.",
          ),
        );
      }
    },
    [beginMutation, finishMutation, habits, mergedRecords, user],
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
  const isLoading =
    isAuthLoading || (!!user && (isLoadingHabits || isLoadingRecords));

  const value = useMemo(
    () => ({
      habits,
      activeHabits,
      archivedHabits,
      records: mergedRecords,
      isLoading,
      bootstrapError,
      syncState,
      fullHistoryState,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      restoreHabit,
      reorderHabits,
      toggleHabitDay,
      getHabitBySlug,
      loadMonth,
      loadFullHistory,
    }),
    [
      habits,
      activeHabits,
      archivedHabits,
      mergedRecords,
      isLoading,
      bootstrapError,
      syncState,
      fullHistoryState,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      restoreHabit,
      reorderHabits,
      toggleHabitDay,
      getHabitBySlug,
      loadMonth,
      loadFullHistory,
    ],
  );

  return createElement(HabitStorageContext.Provider, { value }, children);
}

export function useHabits() {
  const {
    habits,
    activeHabits,
    archivedHabits,
    isLoading,
    bootstrapError,
    syncState,
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
    isLoading,
    bootstrapError,
    syncState,
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
  const {
    records,
    toggleHabitDay,
    isLoading,
    bootstrapError,
    syncState,
    loadMonth,
    loadFullHistory,
    fullHistoryState,
  } = useHabitStorageContext();

  return {
    records,
    toggleHabitDay,
    isLoading,
    bootstrapError,
    syncState,
    loadMonth,
    loadFullHistory,
    fullHistoryState,
  };
}
