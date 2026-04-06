import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard-stats";

export const metadata: Metadata = {
  title: "Statistics",
};

export default function DashboardStatsPage() {
  return <DashboardStats />;
}
