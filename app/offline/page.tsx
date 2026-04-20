import type { Metadata } from "next";
import { OfflineFallbackPage } from "@/components/offline-fallback-page";

export const metadata: Metadata = {
  title: "Offline",
  description:
    "Offline fallback guidance for ImproTrack when cached pages are available but live sync is unavailable.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return <OfflineFallbackPage />;
}
