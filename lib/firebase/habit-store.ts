"use client";

import type { HabitDefinition } from "@/lib/habits";
import { getFirebaseFirestore } from "@/lib/firebase/firestore";
import {
  collection,
  documentId,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  where,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";

type SlotRecordsMap = Record<string, boolean>;
type RecordsDocument = {
  entries?: Record<string, unknown>;
};

type RecordsRange = {
  fromDateKey: string;
  toDateKey: string;
};

function mapRecordsSnapshot(
  snapshot: { docs: Array<{ id: string; data: () => RecordsDocument }> },
) {
  const nextRecords: Record<string, Record<string, SlotRecordsMap>> = {};

  snapshot.docs.forEach((entry) => {
    const data = entry.data() as RecordsDocument;
    const entries = data.entries ?? {};

    Object.entries(entries).forEach(([habitId, slots]) => {
      const normalizedSlots = normalizeRecordSlots(slots);

      if (!normalizedSlots) {
        return;
      }

      nextRecords[habitId] ??= {};
      nextRecords[habitId][entry.id] = normalizedSlots;
    });
  });

  return nextRecords;
}

function habitsCollection(userId: string) {
  return collection(getFirebaseFirestore(), "users", userId, "habits");
}

function recordsCollection(userId: string) {
  return collection(getFirebaseFirestore(), "users", userId, "records");
}

function buildRecordsQuery(userId: string, range?: RecordsRange) {
  if (!range) {
    return recordsCollection(userId);
  }

  return query(
    recordsCollection(userId),
    where(documentId(), ">=", range.fromDateKey),
    where(documentId(), "<=", range.toDateKey),
    orderBy(documentId()),
  );
}

function getHabitSortOrder(habit: HabitDefinition) {
  return Number.isFinite(habit.sortOrder) ? (habit.sortOrder as number) : null;
}

function compareHabits(left: HabitDefinition, right: HabitDefinition) {
  const leftSortOrder = getHabitSortOrder(left);
  const rightSortOrder = getHabitSortOrder(right);

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
}

function normalizeRecordSlots(value: unknown): SlotRecordsMap | null {
  if (typeof value === "boolean") {
    return { default: value };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const slots = Object.entries(value as Record<string, unknown>).reduce<
    SlotRecordsMap
  >((nextSlots, [slotName, slotValue]) => {
    if (typeof slotValue === "boolean") {
      nextSlots[slotName] = slotValue;
    }

    return nextSlots;
  }, {});

  return Object.keys(slots).length > 0 ? slots : null;
}

export function listenToUserHabits(
  userId: string,
  onChange: (habits: HabitDefinition[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    habitsCollection(userId),
    (snapshot) => {
      const habits = snapshot.docs
        .map((entry) => {
          const data = entry.data() as Partial<HabitDefinition>;

          return {
            ...data,
            id: data.id ?? entry.id,
          } as HabitDefinition;
        })
        .sort(compareHabits);

      onChange(habits);
    },
    onError,
  );
}

export function listenToUserRecords(
  userId: string,
  onChange: (records: Record<string, Record<string, SlotRecordsMap>>) => void,
  onError?: (error: FirestoreError) => void,
  range?: RecordsRange,
): Unsubscribe {
  return onSnapshot(
    buildRecordsQuery(userId, range),
    (snapshot) => {
      onChange(mapRecordsSnapshot(snapshot));
    },
    onError,
  );
}

export async function fetchUserRecordsRange(userId: string, range: RecordsRange) {
  const snapshot = await getDocs(buildRecordsQuery(userId, range));
  return mapRecordsSnapshot(snapshot);
}

export async function saveUserHabit(userId: string, habit: HabitDefinition) {
  await setDoc(
    doc(getFirebaseFirestore(), "users", userId, "habits", habit.id),
    {
      ...habit,
      _updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveUserHabitOrder(
  userId: string,
  orderedHabitIds: string[],
) {
  const firestore = getFirebaseFirestore();
  const batch = writeBatch(firestore);

  orderedHabitIds.forEach((habitId, index) => {
    batch.update(doc(firestore, "users", userId, "habits", habitId), {
      sortOrder: index,
      _updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function deleteUserHabit(userId: string, habitId: string) {
  const firestore = getFirebaseFirestore();
  const batch = writeBatch(firestore);
  const cleanupRef = doc(firestore, "users", userId, "habit-cleanups", habitId);
  batch.delete(doc(firestore, "users", userId, "habits", habitId));
  batch.set(
    cleanupRef,
    {
      habitId,
      requestedAt: serverTimestamp(),
      status: "pending",
      // Deferred cleanup avoids full history scans in the interactive delete flow.
      removeFieldPath: `entries.${habitId}`,
    },
    { merge: true },
  );

  await batch.commit();
}

export async function saveUserRecordSlots(
  userId: string,
  dateKey: string,
  habitId: string,
  slots: SlotRecordsMap,
  options?: {
    useLegacyBoolean?: boolean;
  },
) {
  const recordRef = doc(
    getFirebaseFirestore(),
    "users",
    userId,
    "records",
    dateKey,
  );

  const serializedSlots =
    options?.useLegacyBoolean && Object.keys(slots).length <= 1
      ? Boolean(Object.values(slots)[0])
      : slots;

  await setDoc(
    recordRef,
    {
      [`entries.${habitId}`]: serializedSlots,
      _updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
