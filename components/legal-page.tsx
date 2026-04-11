import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalHighlight = {
  label: string;
  value: string;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  lastUpdated,
  highlights,
  sections,
}: LegalPageProps) {
  return (
    <PublicPageShell
      navLinks={[
        { href: "/", label: "Home" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/dashboard", label: "Dashboard" },
      ]}
      width="standard"
    >
      <div className="page-shell mx-auto max-w-5xl py-8 sm:py-10 lg:py-12">
        <section className="public-hero-panel rounded-[32px] px-6 py-8 sm:px-8 sm:py-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
            <div className="max-w-3xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                {eyebrow}
              </p>

              <h1 className="mt-3 font-display text-[38px] font-semibold tracking-tight text-ink-950 sm:text-[48px]">
                {title}
              </h1>

              <p className="mt-4 text-[16px] leading-8 text-ink-700 sm:text-[17px]">
                {intro}
              </p>
            </div>

            <aside className="rounded-[24px] border border-black/[0.06] bg-paper-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">
                Last updated
              </p>
              <p className="mt-2 text-[14px] font-semibold text-ink-950">
                {lastUpdated}
              </p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">
                Quick links
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold text-ink-950">
                <Link
                  href="/privacy"
                  className="rounded-full border border-black/[0.06] bg-white px-3 py-1.5 transition-colors hover:bg-paper-50"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="rounded-full border border-black/[0.06] bg-white px-3 py-1.5 transition-colors hover:bg-paper-50"
                >
                  Terms
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          {highlights.map((highlight) => (
            <article
              key={highlight.label}
              className="rounded-[24px] border border-black/[0.06] bg-white px-5 py-5 shadow-[var(--shadow-card)]"
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                {highlight.label}
              </p>
              <p className="mt-3 text-[16px] font-semibold leading-7 text-ink-950">
                {highlight.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-4 space-y-3">
          {sections.map((section, index) => (
            <article
              key={section.title}
              className="rounded-[28px] border border-black/[0.06] bg-white px-6 py-6 shadow-[var(--shadow-card)] sm:px-7"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-paper-50 text-[13px] font-semibold text-ink-600">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h2 className="font-display text-[25px] font-semibold tracking-tight text-ink-950 sm:text-[28px]">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3 text-[15px] leading-7 text-ink-700">
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={`${section.title}-${paragraphIndex}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-[28px] border border-black/[0.06] bg-white px-5 py-5 shadow-[var(--shadow-card)] sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-[14px] leading-7 text-ink-700">
              Privacy or legal requests can be sent to the contact address
              listed in the app&apos;s published support details or Google OAuth
              consent screen.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[14px] font-semibold text-ink-950">
              <Link
                href="/privacy"
                className="transition-colors hover:text-ink-700"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-ink-700"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
