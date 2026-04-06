import type { Metadata } from "next";
import { HabitTrackerApp } from "@/components/habit-tracker-app";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <HabitTrackerApp />;
}
