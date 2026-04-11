import type { MetadataRoute } from "next";
import { CRAWLER_BLOCKED_PATHS } from "@/lib/public-routes";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: CRAWLER_BLOCKED_PATHS,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
