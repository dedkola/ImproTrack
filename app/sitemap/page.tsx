import type { Metadata } from "next";
import { SitemapPage } from "@/components/sitemap-page";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "A human-readable sitemap for the public ImproTrack pages.",
};

export default function SitemapRoutePage() {
  return <SitemapPage />;
}
