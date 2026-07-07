import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoMarketingPage } from "@/components/seo-marketing-page";
import { getSeoPageMetadata } from "@/lib/seo-metadata";
import {
  getSeoPageByPathSegment,
  SEO_PAGES,
} from "@/lib/seo-pages";

type SeoPageRouteProps = {
  params: Promise<{ seoPage: string }>;
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_PAGES.map((page) => ({
    seoPage: page.path.slice(1),
  }));
}

export async function generateMetadata({
  params,
}: SeoPageRouteProps): Promise<Metadata> {
  const { seoPage } = await params;
  const page = getSeoPageByPathSegment(seoPage);

  if (!page) {
    notFound();
  }

  return getSeoPageMetadata(page.slug);
}

export default async function SeoPageRoute({ params }: SeoPageRouteProps) {
  const { seoPage } = await params;
  const page = getSeoPageByPathSegment(seoPage);

  if (!page) {
    notFound();
  }

  return <SeoMarketingPage page={page} />;
}
