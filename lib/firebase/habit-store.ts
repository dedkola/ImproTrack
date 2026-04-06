"use client";

import type { HabitDefinition } from "@/lib/habits";
import { getFirebaseFirestore } from "@/lib/firebase/firestore";
import {
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";

type SlotRecordsMap = Record<string, boolean>;
type HabitRecordsMap = Record<string, SlotRecordsMap>;
type RecordsDocument = {
  entries?: HabitRecordsMap;
};

function habitsCollection(userId: string) {
  return collection(getFirebaseFirestore(), "users", userId, "habits");
}

function recordsCollection(userId: string) {
  return collection(getFirebaseFirestore(), "users", userId, "records");
}

export function listenToUserHabits(
  userId: string,
  onChange: (habits: HabitDefinition[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    query(habitsCollection(userId), orderBy("createdAt", "asc")),
    (snapshot) => {
      const habits = snapshot.docs.map((entry) => {
        const data = entry.data() as Partial<HabitDefinition>;

        return {
          ...data,
          id: data.id ?? entry.id,
        } as HabitDefinition;
      });

      onChange(habits);
    },
    onError,
  );
}

export function listenToUserRecords(
  userId: string,
  onChange: (records: Record<string, Record<string, SlotRecordsMap>>) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    recordsCollection(userId),
    (snapshot) => {
      const nextRecords: Record<string, Record<string, SlotRecordsMap>> = {};

      snapshot.docs.forEach((entry) => {
        const data = entry.data() as RecordsDocument;
        const entries = data.entries ?? {};

        Object.entries(entries).forEach(([habitId, slots]) => {
          nextRecords[habitId] ??= {};
          nextRecords[habitId][entry.id] = slots;
        });
      });

      onChange(nextRecords);
    },
    onError,
  );
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

export async function deleteUserHabit(userId: string, habitId: string) {
  const firestore = getFirebaseFirestore();
  const batch = writeBatch(firestore);
  const recordDocs = await getDocs(recordsCollection(userId));

  batch.delete(doc(firestore, "users", userId, "habits", habitId));

  recordDocs.docs.forEach((recordDoc) => {
    batch.update(recordDoc.ref, {
      [`entries.${habitId}`]: deleteField(),
      _updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function saveUserRecordSlots(
  userId: string,
  dateKey: string,
  habitId: string,
  slots: SlotRecordsMap,
) {
  const recordRef = doc(
    getFirebaseFirestore(),
    "users",
    userId,
    "records",
    dateKey,
  );

  await setDoc(
    recordRef,
    {
      _updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await updateDoc(recordRef, {
    [`entries.${habitId}`]: slots,
    _updatedAt: serverTimestamp(),
  });
}
