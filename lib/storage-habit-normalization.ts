import {
  getNormalizedFrequency,
  type HabitDefinition,
  type HabitTone,
  normalizeTimeSlots,
  TONE_PRESETS,
} from "@/lib/habits";

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

export function normalizeTone(tone: HabitTone | undefined): HabitTone {
  if (!tone) return TONE_PRESETS[0].tone;

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

export function normalizeHabits(habits: HabitDefinition[]): HabitDefinition[] {
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

export function sortHabits(habits: HabitDefinition[]) {
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

export function getNextSortOrder(habits: HabitDefinition[]) {
  const maxSortOrder = habits.reduce<number>(
    (maxValue, habit) =>
      typeof habit.sortOrder === "number" && Number.isFinite(habit.sortOrder)
        ? Math.max(maxValue, habit.sortOrder)
        : maxValue,
    -1,
  );

  return maxSortOrder + 1;
}
