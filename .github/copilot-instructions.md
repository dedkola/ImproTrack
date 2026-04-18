# ImproTrack Copilot Instructions

ImproTrack is a habit-tracking PWA built with Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, and Firebase 12.

## Build, test, and lint commands

```bash
pnpm dev    # start the local dev server
pnpm build  # production build; also runs the Next.js TypeScript check
pnpm start  # serve the production build
```

There is currently no `lint` script in `package.json`, and no automated test runner is configured in this repository, so there is no full-suite or single-test command to run.

For Copilot cloud-agent sessions, `.github/workflows/copilot-setup-steps.yml` installs the repo's pnpm dependencies before work begins.

## High-level architecture

- Route files in `app/` stay thin. They usually export metadata and render a single client component from `components/`. The legacy routes `/archive` and `/habits/[slug]` just redirect to their `/dashboard/...` equivalents.
- `app/layout.tsx` is the global entry point for fonts, `metadataBase`, analytics, and auth context. `getSiteUrl()` in `lib/site-url.ts` is the shared source for canonical URLs and SEO metadata.
- `app/dashboard/layout.tsx` hands all authenticated routes to `components/app-shell.tsx`. `AppShell` applies auth gating, loading/error states, sidebar/mobile navigation, and mounts `HabitStorageProvider`.
- `lib/storage.ts` is the main application state layer. It listens to Firestore, normalizes habits and records, merges month-range snapshots with full-history loads, applies optimistic record patches, and exposes all habit mutations through `useHabits()` and `useHabitRecords()`.
- `lib/firebase/habit-store.ts` is the persistence boundary for habits and completion records. Firestore data lives under `users/{userId}/habits/{habitId}` and `users/{userId}/records/{dateKey}`; UI components should not write to Firestore directly.
- Firebase auth is Google-only. `components/firebase-auth-provider.tsx` uses `onIdTokenChanged`, and dashboard routes assume a signed-in user before habit data loads.
- `lib/stats.ts` and `lib/date.ts` hold the reusable calculation logic used by the tracker, detail, archive, and stats screens. Keep calculations in those helpers instead of reimplementing them in components.
- The app has two visual shells: `components/public-page-shell.tsx` for marketing/legal/public pages and `components/app-shell.tsx` for signed-in dashboard routes.
- Public SEO is centralized. `lib/public-routes.ts` feeds `app/sitemap.ts`, `app/robots.ts`, and the human-readable `/sitemap` page.
- Local setup depends on the Firebase env vars from `README.md` (`NEXT_PUBLIC_FIREBASE_*`). `NEXT_PUBLIC_SITE_URL` or `SITE_URL` controls `metadataBase`, `robots.txt`, and `sitemap.xml`.

## Key conventions

- Use `"use client"` on any file that uses hooks, Firebase SDK APIs, or browser APIs. The real UI logic lives in `components/`; server route files are wrappers.
- Use the state hooks from `lib/storage.ts` instead of wiring data manually. In particular, `toggleHabitDay()` includes optimistic updates and rollback behavior that components must not bypass.
- Keep Firebase access behind the singleton helpers in `lib/firebase/`. Do not instantiate Auth, Firestore, or Storage inside components.
- Dates are always `YYYY-MM-DD` strings from `lib/date.ts`. Slot keys are lowercase, and `"default"` is the sentinel slot for single-check habits.
- Multi-slot habits must be normalized with `getNormalizedFrequency()` and `normalizeTimeSlots()` from `lib/habits.ts`. Any stats call should receive `habit.timeSlots`, not a hardcoded default.
- `HabitTone` is the shared color contract: `{ surface, accent, fill, softFill, badge, hex? }`. `TONE_PRESETS` in `lib/habits.ts` is canonical.
- If you add or change a preset tone, keep these in sync: `TONE_PRESETS` in `lib/habits.ts`, `getMatrixTone()` in `components/habit-tracker-app.tsx`, and `getAppleCardGradient()` in `components/habit-tracker-app.tsx`.
- Tailwind theme tokens and reusable utility classes live in `app/globals.css` under `@theme`. There is no `tailwind.config.ts` in this project.
- Dynamic Tailwind classes only work when the full class names exist literally in source. Avoid runtime-generated color class names that Tailwind cannot scan.
- Components use named exports and direct file imports via `@/`; this codebase does not use barrel files.
- Expect legacy persisted data. Tone fills may need normalization from older `bg-*-500` values, and single-slot records may require normalized-key matching or fallback-to-any-slot behavior.
