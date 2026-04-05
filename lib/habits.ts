export type HabitTone = {
  surface: string;
  accent: string;
  fill: string;
  softFill: string;
  badge: string;
};

export type HabitDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unitLabel: string;
  goalLabel: string;
  frequencyPerDay: number;
  timeSlots: string[];
  archived: boolean;
  createdAt: string;
  tone: HabitTone;
};

const WHITE_SURFACE = "from-white via-white to-white";

export const TONE_PRESETS: { label: string; tone: HabitTone }[] = [
  {
    label: "Sky",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-sky-800",
      fill: "bg-sky-600",
      softFill: "bg-sky-100 text-sky-800",
      badge: "ring-sky-200",
    },
  },
  {
    label: "Emerald",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-emerald-800",
      fill: "bg-emerald-600",
      softFill: "bg-emerald-100 text-emerald-800",
      badge: "ring-emerald-200",
    },
  },
  {
    label: "Violet",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-violet-800",
      fill: "bg-violet-600",
      softFill: "bg-violet-100 text-violet-800",
      badge: "ring-violet-200",
    },
  },
  {
    label: "Amber",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-amber-800",
      fill: "bg-amber-600",
      softFill: "bg-amber-100 text-amber-800",
      badge: "ring-amber-200",
    },
  },
  {
    label: "Rose",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-rose-800",
      fill: "bg-rose-600",
      softFill: "bg-rose-100 text-rose-800",
      badge: "ring-rose-200",
    },
  },
  {
    label: "Teal",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-teal-800",
      fill: "bg-teal-600",
      softFill: "bg-teal-100 text-teal-800",
      badge: "ring-teal-200",
    },
  },
  {
    label: "Indigo",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-indigo-800",
      fill: "bg-indigo-600",
      softFill: "bg-indigo-100 text-indigo-800",
      badge: "ring-indigo-200",
    },
  },
  {
    label: "Slate",
    tone: {
      surface: WHITE_SURFACE,
      accent: "text-slate-800",
      fill: "bg-slate-600",
      softFill: "bg-slate-100 text-slate-800",
      badge: "ring-slate-200",
    },
  },
];

export const DEFAULT_HABITS: HabitDefinition[] = [
  {
    id: "steps",
    slug: "ten-thousand-steps",
    name: "10,000 steps",
    description: "Daily movement target with an easy visual pulse.",
    icon: "🚶",
    category: "Health",
    unitLabel: "days hit",
    goalLabel: "10,000 steps",
    frequencyPerDay: 1,
    timeSlots: ["default"],
    archived: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    tone: TONE_PRESETS[0].tone,
  },
  {
    id: "exercise",
    slug: "exercise",
    name: "Exercise",
    description: "A short workout, walk, or stretching session.",
    icon: "💪",
    category: "Health",
    unitLabel: "sessions",
    goalLabel: "Active body",
    frequencyPerDay: 1,
    timeSlots: ["default"],
    archived: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    tone: TONE_PRESETS[1].tone,
  },
  {
    id: "english",
    slug: "studying-english",
    name: "Studying English",
    description:
      "Focused language practice with lessons, reading, or speaking.",
    icon: "📖",
    category: "Learning",
    unitLabel: "study days",
    goalLabel: "Language practice",
    frequencyPerDay: 1,
    timeSlots: ["default"],
    archived: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    tone: TONE_PRESETS[2].tone,
  },
  {
    id: "reading",
    slug: "reading",
    name: "Reading",
    description: "Quiet reading time for focus and recovery.",
    icon: "📚",
    category: "Learning",
    unitLabel: "reading days",
    goalLabel: "Reading habit",
    frequencyPerDay: 1,
    timeSlots: ["default"],
    archived: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    tone: TONE_PRESETS[3].tone,
  },
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
