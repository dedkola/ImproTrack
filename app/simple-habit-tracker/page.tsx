import type { Metadata } from "next";
import { SeoMarketingPage } from "@/components/seo-marketing-page";
import { getSeoPageMetadata } from "@/lib/seo-metadata";
import { SEO_PAGES_BY_SLUG } from "@/lib/seo-pages";

export const dynamic = "force-static";

export const metadata: Metadata = getSeoPageMetadata("simpleHabitTracker");

export default function SimpleHabitTrackerPage() {
  return <SeoMarketingPage page={SEO_PAGES_BY_SLUG.simpleHabitTracker} />;
}
