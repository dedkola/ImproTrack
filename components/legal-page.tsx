import Link from "next/link";

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
    <div className="landing-backdrop min-h-screen text-ink-950">
      <div className="landing-orb left-[-4rem] top-16 h-52 w-52 bg-sky-200/70" />
      <div className="landing-orb right-[-2rem] top-40 h-60 w-60 bg-emerald-200/70" />

      <header className="header-bar sticky top-0 z-40">
        <div className="page-shell mx-auto flex max-w-5xl items-center justify-between gap-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="ImproTrack"
              className="h-9 w-9 drop-shadow-[0_2px_10px_rgba(109,40,217,0.45)]"
            />
            <span className="font-display text-[18px] font-semibold text-ink-950">
              ImproTrack
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-4 text-[14px] font-medium text-ink-700">
            <Link href="/" className="transition-colors hover:text-ink-950">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-ink-950"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="page-shell relative z-10 mx-auto max-w-5xl py-10 sm:py-14 lg:py-16">
        <section className="surface-panel relative overflow-hidden rounded-[32px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-sky-100/70 to-transparent" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-[38px] font-semibold tracking-tight text-ink-950 sm:text-[48px]">
              {title}
            </h1>
            <p className="mt-4 text-[16px] leading-8 text-ink-700 sm:text-[17px]">
              {intro}
            </p>

            <div className="mt-6 inline-flex rounded-full border border-black/[0.06] bg-white px-3 py-1 text-[12px] font-semibold text-ink-700 shadow-[var(--shadow-card)]">
              Last updated {lastUpdated}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <article
              key={highlight.label}
              className="feature-panel rounded-[26px] px-5 py-5"
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

        <section className="mt-6 space-y-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="feature-panel rounded-[28px] px-6 py-6 sm:px-7"
            >
              <h2 className="font-display text-[25px] font-semibold tracking-tight text-ink-950 sm:text-[28px]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-[15px] leading-7 text-ink-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 flex flex-col gap-4 rounded-[28px] border border-black/[0.06] bg-white/90 px-5 py-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[14px] leading-7 text-ink-700">
            Privacy or legal requests can be sent to the contact address listed
            in the app&apos;s published support details or Google OAuth consent
            screen.
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
        </section>
      </main>
    </div>
  );
}
