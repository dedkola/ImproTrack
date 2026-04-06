import type { Metadata } from "next";
import { ArchivePage } from "@/components/archive-page";

export const metadata: Metadata = {
  title: "Archive",
};

export default function DashboardArchivePage() {
  return <ArchivePage />;
}
