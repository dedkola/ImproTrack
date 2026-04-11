import type { Metadata } from "next";
import { DashboardSettings } from "@/components/dashboard-settings";

export const metadata: Metadata = {
  title: "Settings",
};

export default function DashboardSettingsPage() {
  return <DashboardSettings />;
}
