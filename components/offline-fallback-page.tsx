import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

const offlineNotes = [
  "Previously cached pages can still open while you are offline.",
  "Google sign-in and fresh Firestore sync resume once you reconnect.",
  "Installing the app makes repeat visits feel more app-like on supported devices.",
];

export function OfflineFallbackPage() {
  return (
    <PublicPageShell width="standard">
      <section className="page-shell mx-auto max-w-4xl py-16 sm:py-20">
        <div className="public-hero-panel rounded-[32px] px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
            Offline
          </p>
          <h1 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-ink-950 sm:text-[46px]">
            ImproTrack can still open cached pages, but live sync is paused.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-700 sm:text-[16px] sm:leading-8">
            Reconnect to continue Google sign-in, refresh your habit data, and
            save new changes to Firebase.
          </p>

          <ul className="mt-6 space-y-3 text-left">
            {offlineNotes.map((note) => (
              <li
                key={note}
                className="rounded-2xl border border-black/[0.06] bg-white/92 px-4 py-3 text-[14px] leading-6 text-ink-700 shadow-[var(--shadow-card)]"
              >
                {note}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="pill-btn inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-950 px-5 py-3 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(10,22,40,0.16)]"
            >
              Open dashboard
            </Link>
            <Link
              href="/"
              className="pill-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.06] bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
            >
              Back home
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
