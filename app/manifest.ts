import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habit Grid Tracker",
    short_name: "HabitGrid",
    description: "Mobile-friendly habit tracking with a spreadsheet-inspired calendar.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6fbff",
    theme_color: "#9cc9ff"
  };
}
