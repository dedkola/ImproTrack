"use client";

import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";
import { CRAWLER_BLOCKED_PATHS, PUBLIC_SITE_ROUTES } from "@/lib/public-routes";
import { useTranslation } from "@/components/i18n-provider";
import type { Translations } from "@/lib/i18n";

const routeTranslationKeys: Record<
  string,
  { title: keyof Translations; description: keyof Translations }
> = {
  "/": {
    title: "sitemap_route_home_title",
    description: "sitemap_route_home_desc",
  },
  "/privacy": {
    title: "sitemap_route_privacy_title",
    description: "sitemap_route_privacy_desc",
  },
  "/terms": {
    title: "sitemap_route_terms_title",
    description: "sitemap_route_terms_desc",
  },
  "/sitemap": {
    title: "sitemap_route_sitemap_title",
    description: "sitemap_route_sitemap_desc",
  },
};

export function SitemapPage() {
  const { t } = useTranslation();
  const seoFiles = [
    {
      href: "/sitemap.xml",
      label: "sitemap.xml",
      description: t("sitemap_file_xml_desc"),
    },
    {
      href: "/robots.txt",
      label: "robots.txt",
      description: t("sitemap_file_robots_desc"),
    },
  ];

  return (
    <PublicPageShell
      navLinks={[
        { href: "/", label: t("nav_home") },
        { href: "/privacy", label: t("footer_privacy") },
        { href: "/terms", label: t("footer_terms") },
      ]}
      width="standard"
    >
      <section className="page-shell relative z-10 mx-auto max-w-5xl py-10 sm:py-14 lg:py-16">
        <div className="landing-orb left-[-5rem] top-14 h-44 w-44 bg-sky-200/70" />
        <div className="landing-orb right-[-2rem] top-36 h-56 w-56 bg-emerald-200/70" />

        <div className="surface-panel relative overflow-hidden rounded-[32px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-sky-100/75 to-transparent" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              {t("sitemap_title_label")}
            </p>
            <h1 className="mt-3 font-display text-[38px] font-semibold tracking-tight text-ink-950 sm:text-[48px]">
              {t("sitemap_heading")}
            </h1>
            <p className="mt-4 text-[16px] leading-8 text-ink-700 sm:text-[17px]">
              {t("sitemap_intro")}
            </p>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {PUBLIC_SITE_ROUTES.map((route) => {
            const display = routeTranslationKeys[route.href];

            return (
              <Link
                key={route.href}
                href={route.href}
                className="feature-panel group flex h-full flex-col rounded-[28px] px-6 py-6"
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  {route.href}
                </p>
                <h2 className="mt-3 font-display text-[28px] font-semibold tracking-tight text-ink-950">
                  {display ? t(display.title) : route.title}
                </h2>
                <p className="mt-3 flex-1 text-[15px] leading-7 text-ink-700">
                  {display ? t(display.description) : route.description}
                </p>
                <span className="mt-5 inline-flex items-center text-[14px] font-semibold text-ink-950 transition-colors group-hover:text-sky-700">
                  {t("sitemap_open_page")}
                </span>
              </Link>
            );
          })}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="feature-panel rounded-[28px] px-6 py-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              {t("sitemap_seo_files")}
            </p>
            <div className="mt-4 space-y-4">
              {seoFiles.map((file) => (
                <Link
                  key={file.href}
                  href={file.href}
                  className="flex items-start justify-between gap-4 rounded-[22px] border border-black/[0.06] bg-white/90 px-4 py-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink-950">
                      {file.label}
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-ink-700">
                      {file.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[14px] font-semibold text-ink-950">
                    {t("sitemap_view")}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="feature-panel rounded-[28px] px-6 py-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              {t("sitemap_blocked_label")}
            </p>
            <h2 className="mt-3 font-display text-[28px] font-semibold tracking-tight text-ink-950">
              {t("sitemap_blocked_heading")}
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-ink-700">
              {t("sitemap_blocked_desc")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {CRAWLER_BLOCKED_PATHS.map((path) => (
                <span
                  key={path}
                  className="rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-[13px] font-semibold text-ink-700 shadow-[var(--shadow-card)]"
                >
                  {path}
                </span>
              ))}
            </div>
          </div>
        </section>
      </section>
    </PublicPageShell>
  );
}
