import type { MetadataRoute } from "next";
import { PUBLIC_SITE_ROUTES } from "@/lib/public-routes";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return PUBLIC_SITE_ROUTES.map((route) => ({
    url: `${siteUrl}${route.href}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
