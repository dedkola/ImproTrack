import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ProductCollage } from "@/components/product-collage";
import { PublicPageShell } from "@/components/public-page-shell";
import {
  SEO_PAGES_BY_SLUG,
  type SeoPage,
  type SeoPageSlug,
} from "@/lib/seo-pages";
import { getSiteUrl } from "@/lib/site-url";

const primaryCtaClass =
  "bg-[#0A1628] text-white shadow-[0_10px_24px_rgba(10,22,40,0.16)]";

const publicNavLinks = [
  { href: "/features", label: "Features" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/habit-tracker", label: "Habit tracker" },
];

function RelatedPageCard({ slug }: { slug: SeoPageSlug }) {
  const page = SEO_PAGES_BY_SLUG[slug];

  return (
    <Link
      href={page.path}
      className="feature-panel group flex h-full flex-col rounded-[24px] px-5 py-5"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
        {page.navLabel}
      </p>
      <h3 className="mt-3 font-display text-[24px] font-semibold tracking-tight text-ink-950">
        {page.routeTitle}
      </h3>
      <p className="mt-3 flex-1 text-[14px] leading-7 text-ink-700">
        {page.routeDescription}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-950 transition-colors group-hover:text-[#6D28D9]">
        Open page
        <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
      </span>
    </Link>
  );
}

export function SeoMarketingPage({ page }: { page: SeoPage }) {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.metaTitle,
    description: page.metaDescription,
    url: `${siteUrl}${page.path}`,
    isPartOf: {
      "@type": "WebSite",
      name: "ImproTrack",
      url: siteUrl,
    },
    about: page.keywords,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicPageShell navLinks={publicNavLinks} width="wide">
        <section className="seo-hero-section">
          <div className="page-shell seo-hero-inner mx-auto max-w-6xl">
            <div className="seo-hero-copy">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                {page.eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-[42px] font-semibold leading-[0.98] tracking-tight text-ink-950 sm:text-[60px] lg:text-[74px]">
                {page.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-8 text-ink-700 sm:text-[18px]">
                {page.heroDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={page.primaryCta.href}
                  className={`pill-btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold ${primaryCtaClass}`}
                >
                  {page.primaryCta.label}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </Link>
                <Link
                  href={page.secondaryCta.href}
                  className="pill-btn inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
                >
                  {page.secondaryCta.label}
                </Link>
              </div>
            </div>

            <ProductCollage
              alt={`ImproTrack product collage for ${page.routeTitle}`}
              className="seo-hero-collage"
              priority
            />
          </div>
        </section>

        <section className="page-shell mx-auto grid max-w-6xl gap-3 py-4 md:grid-cols-3">
          {page.proofPoints.map((point) => (
            <article
              key={point.title}
              className="rounded-[24px] border border-black/[0.06] bg-white px-5 py-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#6D28D9]"
                  strokeWidth={1.8}
                />
                <div>
                  <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink-950">
                    {point.title}
                  </h2>
                  <p className="mt-2 text-[14px] leading-7 text-ink-700">
                    {point.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="page-shell mx-auto max-w-6xl py-6 sm:py-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {page.sections.map((section) => (
              <article
                key={section.title}
                className="public-band rounded-[28px] px-6 py-6"
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-[30px] font-semibold tracking-tight text-ink-950">
                  {section.title}
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-ink-700">
                  {section.body}
                </p>
                {section.bullets ? (
                  <ul className="mt-5 space-y-3 text-[14px] leading-6 text-ink-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6D28D9]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="page-shell mx-auto max-w-6xl py-6 sm:py-8">
          <div className="mb-5 max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              Product Details
            </p>
            <h2 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-ink-950 sm:text-[44px]">
              Built for the everyday loop of tracking, reviewing, and adjusting.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.featureGrid.map((feature) => (
              <article
                key={feature.title}
                className="feature-panel rounded-[24px] px-5 py-5"
              >
                <h3 className="font-display text-[23px] font-semibold tracking-tight text-ink-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-ink-700">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {page.comparison ? (
          <section className="page-shell mx-auto max-w-6xl py-6 sm:py-8">
            <div className="public-band rounded-[28px] px-4 py-4 sm:px-6 sm:py-6">
              <div className="comparison-scroll">
                <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
                  <caption className="sr-only">
                    ImproTrack category comparison with other habit tracker
                    styles
                  </caption>
                  <thead>
                    <tr>
                      <th className="border-b border-black/[0.06] px-4 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-600">
                        Criteria
                      </th>
                      {page.comparison.columns.map((column) => (
                        <th
                          key={column}
                          className="border-b border-black/[0.06] px-4 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-600"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {page.comparison.rows.map((row) => (
                      <tr key={row.label}>
                        <th className="border-b border-black/[0.06] px-4 py-4 align-top font-display text-[20px] font-semibold tracking-tight text-ink-950">
                          {row.label}
                        </th>
                        {row.cells.map((cell, index) => (
                          <td
                            key={`${row.label}-${page.comparison?.columns[index]}`}
                            className="border-b border-black/[0.06] px-4 py-4 align-top text-[14px] leading-7 text-ink-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[13px] leading-6 text-ink-600">
                {page.comparison.note}
              </p>
            </div>
          </section>
        ) : null}

        <section className="page-shell mx-auto max-w-6xl py-6 sm:py-8">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                Questions
              </p>
              <h2 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-ink-950 sm:text-[44px]">
                Quick answers for habit tracker searches.
              </h2>
            </div>
            <div className="space-y-3">
              {page.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-[24px] border border-black/[0.06] bg-white px-5 py-4 shadow-[var(--shadow-card)]"
                >
                  <summary className="cursor-pointer font-display text-[21px] font-semibold tracking-tight text-ink-950">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-[14px] leading-7 text-ink-700">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="page-shell mx-auto max-w-6xl py-6 pb-16 sm:py-8 sm:pb-20">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                Keep Exploring
              </p>
              <h2 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-ink-950 sm:text-[44px]">
                Related ImproTrack pages
              </h2>
            </div>
            <Link
              href="/sitemap"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink-950 transition-colors hover:text-[#6D28D9]"
            >
              View sitemap
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {page.relatedSlugs.map((slug) => (
              <RelatedPageCard key={slug} slug={slug} />
            ))}
          </div>
        </section>
      </PublicPageShell>
    </>
  );
}
