"use client";

import {
  Activity,
  Apple,
  Bed,
  Bike,
  BookMarked,
  BookOpen,
  Brain,
  Coffee,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Leaf,
  LeafyGreen,
  Moon,
  Music,
  Palette,
  Pencil,
  Pill,
  Salad,
  Smile,
  Sun,
  Target,
  Timer,
  Waves,
  Wind,
  type LucideProps,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Activity,
  Apple,
  Bed,
  Bike,
  BookMarked,
  BookOpen,
  Brain,
  Coffee,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Leaf,
  LeafyGreen,
  Moon,
  Music,
  Palette,
  Pencil,
  Pill,
  Salad,
  Smile,
  Sun,
  Target,
  Timer,
  Waves,
  Wind,
};

/** Fallback for unmapped names (legacy emoji strings render as text) */
function FallbackIcon({ name, size }: { name: string; size: number }) {
  return (
    <span style={{ fontSize: size }} className="leading-none">
      {name}
    </span>
  );
}

type HabitIconProps = {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function HabitIcon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className,
}: HabitIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <FallbackIcon name={name} size={size} />;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
