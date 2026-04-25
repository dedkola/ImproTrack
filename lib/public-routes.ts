import type { MetadataRoute } from "next";
import { SEO_PAGES } from "@/lib/seo-pages";

export type PublicSiteRoute = {
  href: string;
  title: string;
  description: string;
  priority: number;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  lastModified: string;
};

export const PUBLIC_SITE_ROUTES: PublicSiteRoute[] = [
  {
    href: "/",
    title: "Home",
    description:
      "The public homepage with the product overview, feature highlights, and sign-in entry point.",
    priority: 1,
    changeFrequency: "weekly",
    lastModified: "2026-04-25T00:00:00.000Z",
  },
  ...SEO_PAGES.map((page) => ({
    href: page.path,
    title: page.routeTitle,
    description: page.routeDescription,
    priority: page.priority,
    changeFrequency: page.changeFrequency,
    lastModified: page.lastModified,
  })),
  {
    href: "/privacy",
    title: "Privacy Policy",
    description:
      "The public privacy policy explaining what data ImproTrack processes and why.",
    priority: 0.5,
    changeFrequency: "yearly",
    lastModified: "2026-04-25T00:00:00.000Z",
  },
  {
    href: "/terms",
    title: "Terms of Service",
    description:
      "The public terms that govern access to the marketing site, sign-in flow, and app usage.",
    priority: 0.5,
    changeFrequency: "yearly",
    lastModified: "2026-04-25T00:00:00.000Z",
  },
  {
    href: "/sitemap",
    title: "Sitemap",
    description:
      "A human-readable index of the public pages and SEO files exposed by the site.",
    priority: 0.3,
    changeFrequency: "monthly",
    lastModified: "2026-04-25T00:00:00.000Z",
  },
];

export const CRAWLER_BLOCKED_PATHS = ["/dashboard", "/archive", "/habits"];
