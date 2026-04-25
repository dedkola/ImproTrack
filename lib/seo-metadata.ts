import type { Metadata } from "next";
import { SEO_PAGES_BY_SLUG, type SeoPageSlug } from "@/lib/seo-pages";
import { getSiteUrl } from "@/lib/site-url";

const siteName = "ImproTrack";

export function getSeoPageMetadata(slug: SeoPageSlug): Metadata {
  const page = SEO_PAGES_BY_SLUG[slug];
  const siteUrl = getSiteUrl();
  const absoluteUrl = `${siteUrl}${page.path}`;
  const socialImage = `${siteUrl}/brand/opengraph.png`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.path },
    keywords: page.keywords,
    openGraph: {
      type: "website",
      url: absoluteUrl,
      siteName,
      title: `${page.metaTitle} | ${siteName}`,
      description: page.metaDescription,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "ImproTrack habit tracker app preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.metaTitle} | ${siteName}`,
      description: page.metaDescription,
      images: [socialImage],
    },
  };
}
