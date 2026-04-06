import Link from "next/link";
import { AuthControls } from "@/components/auth-controls";

const heroBlocks = [
  {
    title: "Dashboard",

    body: "Run your day from one clean workspace with active habits, quick actions, and instant progress feedback.",
  },
  {
    title: "Archive",

    body: "Pause or retire routines without deleting history, then restore them whenever your priorities change.",
  },
  {
    title: "Statistics",

    body: "See hit rate, streak pressure, and weekly rhythm so your next adjustment is based on real signal.",
  },
];

const featureCards = [
  {
    title: "Dashboard built for habit pressure",
    body: "See active routines, monthly range controls, and quick stats without digging through menus.",
    icon: "◢",
  },
  {
    title: "Archive without losing context",
    body: "Retire routines cleanly, restore them later, and keep the main dashboard focused on what matters now.",
    icon: "□",
  },
  {
    title: "Statistics that stay readable",
    body: "Spot completion rates, streak pressure, weekday rhythm, and category drift in a single surface.",
    icon: "△",
  },
  {
    title: "Ready for per-user dashboards",
    body: "The route split keeps the homepage public while the dashboard area is ready for future user isolation.",
    icon: "◎",
  },
];

const presentationBlocks = [
  {
    title: "Fast setup",
    body: "Create a habit in one modal, choose a tone, and start tracking immediately.",
  },
  {
    title: "Visual calm",
    body: "White surfaces, soft blur, and clear typography reduce noise instead of adding more of it.",
  },
  {
    title: "Real drill-down",
    body: "Jump from the dashboard to habit-level detail and then back to overall statistics without losing context.",
  },
  {
    title: "Built to evolve",
    body: "Homepage, dashboard, archive, and statistics are separate areas, which makes future auth simpler.",
  },
];

const comparisonRows = [
  ["Clear daily matrix", "Yes", "Manual", "Manual", "Usually hidden"],
  ["Archive for inactive habits", "Built in", "No", "No", "Sometimes"],
  [
    "Dedicated statistics page",
    "Built in",
    "No",
    "Manual formulas",
    "Usually extra",
  ],
  [
    "Calm white-surface design",
    "Purpose built",
    "Not designed",
    "Utility only",
    "Template driven",
  ],
  [
    "Ready for user dashboards",
    "Planned structure",
    "No",
    "No",
    "Depends on vendor",
  ],
];

export function MarketingHome() {
  return (
    <div className="landing-backdrop relative min-h-screen overflow-hidden text-ink-950">
      <div className="landing-orb left-[-4rem] top-16 h-52 w-52 bg-sky-200/70" />
      <div className="landing-orb right-[-2rem] top-40 h-60 w-60 bg-emerald-200/70" />
      <div className="landing-orb bottom-10 left-1/3 h-56 w-56 bg-amber-100/80" />

      <header className="header-bar sticky top-0 z-40">
        <div className="page-shell mx-auto flex max-w-7xl items-center justify-between gap-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-950 text-[13px] font-semibold text-white">
              M
            </span>
            <span className="font-display text-[18px] font-semibold text-ink-950">
              Momentum
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-[14px] font-medium text-ink-700 md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-ink-950"
            >
              Features
            </a>
            <a href="#project" className="transition-colors hover:text-ink-950">
              Product
            </a>
            <a
              href="#comparison"
              className="transition-colors hover:text-ink-950"
            >
              Comparison
            </a>
          </nav>

          <AuthControls variant="landing" />
        </div>
      </header>

      <main>
        <section className="page-shell mx-auto max-w-7xl py-14 sm:py-18 lg:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            <div className="relative z-10">
              <span className="inline-flex rounded-full border border-black/[0.06] bg-white/90 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-700 shadow-[var(--shadow-card)]">
                Homepage for guests, dashboard for work
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-[42px] font-semibold leading-[0.96] tracking-tight text-ink-950 sm:text-[56px] lg:text-[72px]">
                Habit tracking that feels clear the moment you land.
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 text-ink-700 sm:text-[18px]">
                Momentum gives you a focused homepage, a dashboard for active
                routines, an archive for habits you have retired, and a
                statistics area that makes progress impossible to ignore.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="pill-btn inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(10,22,40,0.16)]"
                >
                  Open dashboard
                </Link>
                <a
                  href="#comparison"
                  className="pill-btn inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white/88 px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
                >
                  Why it is better
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {heroBlocks.map((block) => (
                  <div
                    key={block.title}
                    className="feature-panel rounded-[24px] px-4 py-4"
                  >
                    <p className="text-[12px] uppercase tracking-[0.18em] text-ink-600">
                      {block.title}
                    </p>
                    <p className="mt-2 font-display text-[22px] font-semibold text-ink-950 sm:text-[24px]">
                      {block.route}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-ink-700">
                      {block.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-6">
              <div className="landing-grid absolute inset-x-12 inset-y-8 rounded-[40px] border border-white/50 opacity-60" />
              <div className="relative grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="mockup-frame animate-fade-in-up relative overflow-hidden rounded-[32px] p-5">
                  <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-sky-100/90 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] uppercase tracking-[0.18em] text-ink-600">
                          Main dashboard
                        </p>
                        <h2 className="mt-2 font-display text-[24px] font-semibold text-ink-950">
                          Active habits
                        </h2>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-[12px] font-semibold text-sky-800">
                        82% hit rate
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-7 gap-2">
                      {Array.from({ length: 21 }, (_, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-[10px] ${
                            index % 5 === 0
                              ? "bg-white border border-black/[0.08]"
                              : index % 4 === 0
                                ? "bg-amber-200/80"
                                : "bg-ink-950"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-black/[0.06] bg-white px-4 py-3">
                        <p className="text-[12px] text-ink-600">
                          Morning reset
                        </p>
                        <p className="mt-1 text-[15px] font-semibold text-ink-950">
                          12 completions
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-black/[0.06] bg-white px-4 py-3">
                        <p className="text-[12px] text-ink-600">Reading</p>
                        <p className="mt-1 text-[15px] font-semibold text-ink-950">
                          7 day streak
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div
                    className="mockup-frame animate-fade-in-up rounded-[28px] p-5"
                    style={{ animationDelay: "80ms" }}
                  >
                    <p className="text-[12px] uppercase tracking-[0.18em] text-ink-600">
                      Statistics
                    </p>
                    <div className="mt-4 space-y-3">
                      {[74, 81, 67, 89, 92].map((value, index) => (
                        <div key={value}>
                          <div className="mb-1 flex items-center justify-between text-[12px] text-ink-700">
                            <span>Week {index + 1}</span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-[7px] overflow-hidden rounded-full bg-black/[0.05]">
                            <div
                              className="h-[7px] rounded-full bg-ink-950"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mockup-frame animate-fade-in-up rounded-[28px] p-5"
                    style={{ animationDelay: "140ms" }}
                  >
                    <p className="text-[12px] uppercase tracking-[0.18em] text-ink-600">
                      Archive
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        ["Evening walk", "Restorable"],
                        ["French drills", "Paused"],
                        ["Stretching", "Archived"],
                      ].map(([title, tag]) => (
                        <div
                          key={title}
                          className="flex items-center justify-between rounded-[18px] border border-black/[0.06] bg-white px-3 py-3"
                        >
                          <span className="text-[13px] font-medium text-ink-950">
                            {title}
                          </span>
                          <span className="rounded-full bg-paper-100 px-2 py-1 text-[11px] font-semibold text-ink-700">
                            {tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="page-shell mx-auto max-w-7xl py-6 sm:py-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                Features
              </p>
              <h2 className="mt-2 font-display text-[32px] font-semibold tracking-tight text-ink-950 sm:text-[40px]">
                Built around real tracking flow, not filler screens.
              </h2>
            </div>
            <p className="max-w-xl text-[15px] leading-7 text-ink-700">
              The homepage tells the story quickly. The dashboard keeps daily
              work visible. Archive and statistics stay inside the same focused
              product space.
            </p>
          </div>

          <div className="stagger-children mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="feature-panel rounded-[28px] p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-[15px] font-semibold text-white">
                  {feature.icon}
                </span>
                <h3 className="mt-5 text-[18px] font-semibold text-ink-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-ink-700">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="project"
          className="page-shell mx-auto max-w-7xl py-10 sm:py-14"
        >
          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="surface-panel rounded-[32px] px-6 py-7 sm:px-8 sm:py-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                About the project
              </p>
              <h2 className="mt-3 font-display text-[32px] font-semibold tracking-tight text-ink-950 sm:text-[40px]">
                One product, four clear areas.
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-8 text-ink-700">
                <p>
                  Momentum is structured so guests land on a homepage, logged-in
                  users work inside a dedicated dashboard, inactive habits move
                  into archive, and overall analytics live in a statistics page.
                </p>
                <p>
                  That split matters because it keeps marketing content out of
                  the working area, and it leaves the dashboard namespace ready
                  for future user-specific data and authentication.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Homepage", "Public product story and entry point"],
                  ["Dashboard", "Daily matrix, habits, and actions"],
                  ["Archive", "Paused or retired routines"],
                  ["Statistics", "Overall momentum, patterns, and trends"],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-[22px] border border-black/[0.06] bg-white px-4 py-4 shadow-[var(--shadow-card)]"
                  >
                    <h3 className="text-[15px] font-semibold text-ink-950">
                      {title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-ink-700">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="feature-panel rounded-[30px] p-5 sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-ink-600">
                      Product preview
                    </p>
                    <h3 className="mt-2 text-[22px] font-semibold text-ink-950">
                      Dashboard surfaces with enough signal, not noise.
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-800">
                    White surface system
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)]">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ["Habits", "12"],
                        ["Hit rate", "81%"],
                        ["Archive", "3"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-[18px] bg-paper-50 px-3 py-3"
                        >
                          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-600">
                            {label}
                          </p>
                          <p className="mt-1 font-display text-[22px] font-semibold text-ink-950">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[20px] bg-paper-50 px-4 py-4">
                      <div className="mb-3 flex items-center justify-between text-[12px] text-ink-600">
                        <span>Category performance</span>
                        <span>Current month</span>
                      </div>
                      {[88, 74, 67].map((value, index) => (
                        <div key={value} className="mb-3 last:mb-0">
                          <div className="mb-1 flex items-center justify-between text-[12px] text-ink-700">
                            <span>
                              {["Health", "Learning", "Focus"][index]}
                            </span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-[6px] overflow-hidden rounded-full bg-black/[0.05]">
                            <div
                              className="h-[6px] rounded-full bg-ink-950"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)]">
                    <p className="text-[12px] uppercase tracking-[0.18em] text-ink-600">
                      User path
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        ["1", "Homepage", "Public product entry"],
                        ["2", "Dashboard", "Main habit workspace"],
                        ["3", "Statistics", "Overall analytics"],
                        ["4", "Archive", "Retired routines"],
                      ].map(([step, title, body]) => (
                        <div
                          key={step}
                          className="flex items-start gap-3 rounded-[18px] bg-paper-50 px-3 py-3"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-[12px] font-semibold text-white">
                            {step}
                          </span>
                          <div>
                            <p className="text-[13px] font-semibold text-ink-950">
                              {title}
                            </p>
                            <p className="mt-1 text-[12px] leading-6 text-ink-700">
                              {body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {presentationBlocks.map((block) => (
                <div
                  key={block.title}
                  className="feature-panel rounded-[28px] p-5"
                >
                  <h3 className="text-[18px] font-semibold text-ink-950">
                    {block.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-7 text-ink-700">
                    {block.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="comparison"
          className="page-shell mx-auto max-w-7xl py-10 sm:py-14"
        >
          <div className="surface-panel rounded-[32px] px-5 py-6 sm:px-6 sm:py-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  Comparison
                </p>
                <h2 className="mt-2 font-display text-[32px] font-semibold tracking-tight text-ink-950 sm:text-[40px]">
                  Why Momentum is stronger than the usual alternatives.
                </h2>
              </div>
              <p className="max-w-xl text-[15px] leading-7 text-ink-700">
                Most alternatives either stop at a checklist or bury analytics
                behind complexity. Momentum keeps the flow readable from
                homepage to dashboard to archive to statistics.
              </p>
            </div>

            <div className="comparison-scroll mt-7">
              <table className="min-w-[760px] w-full border-separate border-spacing-0 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-[var(--shadow-card)]">
                <thead>
                  <tr className="bg-paper-50 text-left text-[12px] uppercase tracking-[0.14em] text-ink-600">
                    <th className="px-4 py-4 font-semibold">Capability</th>
                    <th className="px-4 py-4 font-semibold text-ink-950">
                      Momentum
                    </th>
                    <th className="px-4 py-4 font-semibold">Notes</th>
                    <th className="px-4 py-4 font-semibold">Spreadsheet</th>
                    <th className="px-4 py-4 font-semibold">Generic tracker</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row[0]}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-paper-50/60"
                      }
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${row[0]}-${cell}`}
                          className={`border-t border-black/[0.06] px-4 py-4 text-[14px] ${
                            cellIndex === 0
                              ? "font-semibold text-ink-950"
                              : cellIndex === 1
                                ? "font-semibold text-ink-950"
                                : "text-ink-700"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="page-shell mx-auto max-w-7xl py-6 pb-16 sm:pb-20">
          <div className="surface-panel relative overflow-hidden rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-sky-100/70 to-transparent" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  Start with the real workspace
                </p>
                <h2 className="mt-2 font-display text-[32px] font-semibold tracking-tight text-ink-950 sm:text-[40px]">
                  Open the dashboard and let the homepage stay public.
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-700">
                  This structure keeps the product legible today and makes it
                  easier to add real user routing tomorrow, where authenticated
                  people move directly into their own dashboard area.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="pill-btn inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(10,22,40,0.16)]"
                >
                  Go to dashboard
                </Link>
                <a
                  href="#features"
                  className="pill-btn inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
                >
                  Revisit features
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06] bg-white/80 backdrop-blur-2xl">
        <div className="page-shell mx-auto flex max-w-7xl flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-950 text-[12px] font-semibold text-white">
                M
              </span>
              <span className="font-display text-[17px] font-semibold text-ink-950">
                Momentum
              </span>
            </div>
            <p className="mt-2 text-[13px] text-ink-700">
              Homepage for guests. Dashboard, archive, and statistics for the
              real tracking workflow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-700">
            <a
              href="#features"
              className="transition-colors hover:text-ink-950"
            >
              Features
            </a>
            <a href="#project" className="transition-colors hover:text-ink-950">
              Product
            </a>
            <a
              href="#comparison"
              className="transition-colors hover:text-ink-950"
            >
              Comparison
            </a>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-ink-950"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
