import Image from "next/image";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

const quietPoints = [
  "Track daily habits in seconds.",
  "See streaks and trends without digging.",
  "Archive old routines without losing history.",
];

const sectionNotes = [
  {
    id: "workspace",
    eyebrow: "Daily flow",
    title:
      "Your habits, today's check-ins, and your streaks stay in one calm view.",
    body: "Open the dashboard and you immediately know what needs attention. No clutter, no bouncing between pages, just a clear grid that makes showing up each day easier.",
    image: "/brand/dashboard-shot.png",
    imageAlt:
      "ImproTrack dashboard screen showing active habits and weekly progress",
    imagePriority: true,
  },
  {
    id: "signal",
    eyebrow: "Progress",
    title: "Stats help you notice what is working before motivation fades.",
    body: "Completion rate, weekday rhythm, streaks, and slot-by-slot progress turn raw checkmarks into patterns you can actually use.",
    image: "/brand/stats-shot.png",
    imageAlt:
      "ImproTrack statistics screen showing trend lines and category summaries",
    imagePriority: false,
  },
  {
    id: "system",
    eyebrow: "Flexible",
    title: "Simple daily habits and multi-slot routines can live side by side.",
    body: "Build a once-a-day habit, split a routine into morning and evening, edit details as you go, and archive anything you've outgrown without wiping the record.",
    image: "/brand/archive-shot.png",
    imageAlt:
      "ImproTrack archive screen with supporting privacy and terms pages",
    imagePriority: false,
  },
];

export function MarketingHome() {
  return (
    <PublicPageShell
      navLinks={[
        { href: "#workspace", label: "Workspace" },
        { href: "#signal", label: "Signal" },
        { href: "#system", label: "System" },
      ]}
      width="wide"
    >
      <section className="page-shell mx-auto max-w-5xl pt-12 pb-14 text-center sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
          ImproTrack
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-[44px] font-semibold leading-[0.94] tracking-tight text-ink-950 sm:text-[66px] lg:text-[88px]">
          ImproTrack makes habit tracking feel clear, calm, and easy to keep
          coming back to.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-ink-700 sm:text-[19px] sm:leading-8">
          Create routines, check them off through the day, and see your
          consistency build over time in a workspace designed to stay out of
          your way.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="pill-btn inline-flex items-center justify-center rounded-xl bg-ink-950 px-5 py-3 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(10,22,40,0.16)]"
          >
            Open dashboard
          </Link>
          <Link
            href="/privacy"
            className="pill-btn inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
          >
            Review privacy
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-[13px] font-medium text-ink-700 sm:mt-12">
          {quietPoints.map((point) => (
            <span
              key={point}
              className="rounded-full border border-black/[0.06] bg-white px-4 py-2 shadow-[var(--shadow-card)]"
            >
              {point}
            </span>
          ))}
        </div>
      </section>

      {sectionNotes.map((section, index) => {
        const isEven = index % 2 === 0;

        return (
          <section
            key={section.id}
            id={section.id}
            className="page-shell mx-auto max-w-6xl py-6 sm:py-8 lg:py-10"
          >
            <div
              className={`grid items-center gap-8 lg:gap-12 ${
                isEven
                  ? "lg:grid-cols-[0.9fr_1.1fr]"
                  : "lg:grid-cols-[1.1fr_0.9fr]"
              }`}
            >
              <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 max-w-xl font-display text-[34px] font-semibold tracking-tight text-ink-950 sm:text-[46px]">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-8 text-ink-700 sm:text-[16px]">
                  {section.body}
                </p>
              </div>

              <figure
                className={`brand-shot-frame ${isEven ? "lg:order-2" : "lg:order-1"}`}
              >
                <Image
                  src={section.image}
                  alt={section.imageAlt}
                  width={1600}
                  height={1080}
                  priority={section.imagePriority}
                  className="brand-shot-image"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </figure>
            </div>
          </section>
        );
      })}

      <section className="page-shell mx-auto max-w-5xl py-8 pb-16 text-center sm:pb-20 lg:py-12">
        <div className="public-hero-panel rounded-[32px] px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
            Ready to start
          </p>
          <h2 className="mt-3 font-display text-[30px] font-semibold tracking-tight text-ink-950 sm:text-[42px]">
            Open your dashboard and begin with the habits you want to keep.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-ink-700 sm:text-[16px] sm:leading-8">
            ImproTrack keeps the homepage short, the product close, and the
            important parts of habit building right where you need them: your
            dashboard, stats, and archive.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="pill-btn inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
            >
              Go to dashboard
            </Link>
            <Link
              href="/terms"
              className="pill-btn inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
            >
              Read terms
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
