import { normalizeSlotKey } from "@/lib/habits";
import type {
  HabitRecords,
  PendingRecordPatches,
  SlotRecords,
} from "@/lib/storage-types";

export function resolveSlotValue(
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

export function getPendingPatchKey(habitId: string, dateKey: string) {
  return `${habitId}::${dateKey}`;
}

export function parsePendingPatchKey(patchKey: string) {
  const separatorIndex = patchKey.lastIndexOf("::");

  return {
    habitId: patchKey.slice(0, separatorIndex),
    dateKey: patchKey.slice(separatorIndex + 2),
  };
}

export function areSlotRecordsEqual(
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

export function upsertDaySlots(
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

export function mergePendingRecordPatches(
  records: HabitRecords,
  patches: PendingRecordPatches,
) {
  return Object.entries(patches).reduce((nextRecords, [patchKey, slots]) => {
    const { habitId, dateKey } = parsePendingPatchKey(patchKey);
    return upsertDaySlots(nextRecords, habitId, dateKey, slots);
  }, records);
}

export function mergeRecordLayers(
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
