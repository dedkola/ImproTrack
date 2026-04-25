import type { Metadata } from "next";
import { SitemapPage } from "@/components/sitemap-page";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "A human-readable sitemap for the public ImproTrack pages.",
  alternates: { canonical: "/sitemap" },
};

export default function SitemapRoutePage() {
  return <SitemapPage />;
}
