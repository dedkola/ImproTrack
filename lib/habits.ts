export type HabitDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  unitLabel: string;
  goalLabel: string;
  tone: {
    surface: string;
    accent: string;
    fill: string;
    softFill: string;
    badge: string;
  };
};

export const habits: HabitDefinition[] = [
  {
    id: "steps",
    slug: "ten-thousand-steps",
    name: "10,000 steps",
    description: "Daily movement target with an easy visual pulse.",
    unitLabel: "days hit",
    goalLabel: "10,000 steps",
    tone: {
      surface: "from-sky-200/65 via-cyan-100/70 to-white",
      accent: "text-sky-700",
      fill: "bg-sky-500",
      softFill: "bg-sky-100 text-sky-700",
      badge: "ring-sky-200"
    }
  },
  {
    id: "exercise",
    slug: "exercise",
    name: "Exercise",
    description: "A short workout, walk, or stretching session.",
    unitLabel: "sessions",
    goalLabel: "Active body",
    tone: {
      surface: "from-emerald-200/70 via-lime-100/80 to-white",
      accent: "text-emerald-700",
      fill: "bg-emerald-500",
      softFill: "bg-emerald-100 text-emerald-700",
      badge: "ring-emerald-200"
    }
  },
  {
    id: "english",
    slug: "studying-english",
    name: "Studying English",
    description: "Focused language practice with lessons, reading, or speaking.",
    unitLabel: "study days",
    goalLabel: "Language practice",
    tone: {
      surface: "from-violet-200/70 via-fuchsia-100/70 to-white",
      accent: "text-violet-700",
      fill: "bg-violet-500",
      softFill: "bg-violet-100 text-violet-700",
      badge: "ring-violet-200"
    }
  },
  {
    id: "reading",
    slug: "reading",
    name: "Reading",
    description: "Quiet reading time for focus and recovery.",
    unitLabel: "reading days",
    goalLabel: "Reading habit",
    tone: {
      surface: "from-amber-200/75 via-orange-100/70 to-white",
      accent: "text-amber-700",
      fill: "bg-amber-500",
      softFill: "bg-amber-100 text-amber-700",
      badge: "ring-amber-200"
    }
  }
];

export function getHabitBySlug(slug: string) {
  return habits.find((habit) => habit.slug === slug);
}
