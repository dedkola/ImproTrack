# ImproTrack Copilot Instructions

ImproTrack is a habit-tracking PWA built with Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, and Firebase 12.

## Build, test, and lint commands

```bash
nvm use        # use Node 22 from .nvmrc
pnpm install   # install dependencies with the pinned pnpm version
pnpm dev       # start the local dev server
pnpm typecheck # standalone TypeScript check
pnpm check     # CI command: typecheck + production build
pnpm build     # production Next.js build
pnpm start     # serve the production build; required for PWA/offline testing
```

There is currently no `lint` script in `package.json`, and no automated test runner is configured in this repository, so there is no full-suite or single-test command to run.

`pnpm dev` does not register the service worker. Use `pnpm build && pnpm start` to validate install and offline behavior.

Set `NEXT_ALLOWED_DEV_ORIGINS` before `pnpm dev` when testing from another device on your LAN.

## High-level architecture

- Route files in `app/` stay thin. They usually export metadata and render a single component from `components/`. The legacy routes `/archive` and `/habits/[slug]` just redirect to their `/dashboard/...` equivalents.
- `app/layout.tsx` is the global entry point for fonts, `metadataBase`, Vercel analytics, Firebase auth context, and the PWA controller. `getSiteUrl()` in `lib/site-url.ts` is the shared source for canonical URLs, social metadata, sitemap host, and `robots.txt` host.
- Public pages use `components/public-page-shell.tsx`, while authenticated routes flow through `app/dashboard/layout.tsx` into `components/app-shell.tsx`. `AppShell` handles auth gating, loading/error states, sidebar/mobile navigation, sync banners, and mounts `HabitStorageProvider`.
- `lib/storage.ts` is the main application state layer. It combines live Firestore listeners with month-range loading and full-history fetches, normalizes legacy habits and records, applies optimistic record patches, and exposes all habit mutations through `useHabits()` and `useHabitRecords()`.
- `lib/firebase/habit-store.ts` is the persistence boundary for habits and completion records. Firestore data lives under `users/{userId}/habits/{habitId}` and `users/{userId}/records/{dateKey}`; UI components should not write to Firestore directly.
- Firebase auth is Google-only. `components/firebase-auth-provider.tsx` uses `onIdTokenChanged`, and the Firebase client helpers lazily require env vars so public routes can prerender without secrets while signed-in flows still require `NEXT_PUBLIC_FIREBASE_*` at runtime.
- `lib/stats.ts` and `lib/date.ts` hold the reusable calculation logic used by the tracker, detail, archive, and stats screens. Keep calculations in those helpers instead of reimplementing them in components.
- Public SEO and installability are centralized. `lib/public-routes.ts` feeds `app/sitemap.ts`, `app/robots.ts`, and the human-readable `/sitemap` page, while `app/manifest.ts`, `public/sw.js`, and `components/pwa-controller.tsx` handle install prompts and offline behavior.

## Key conventions

- Use `"use client"` on any file that uses hooks, Firebase SDK APIs, or browser APIs. The real UI logic lives in `components/`; server route files are wrappers.
- Use the state hooks from `lib/storage.ts` instead of wiring data manually. In particular, `toggleHabitDay()` includes optimistic updates and rollback behavior that components must not bypass.
- Keep Firebase access behind the singleton helpers in `lib/firebase/`. Do not instantiate Auth, Firestore, or Storage inside components.
- Dates are always `YYYY-MM-DD` strings from `lib/date.ts`. Record documents are keyed by date, slot keys are normalized lowercase, and `"default"` is the sentinel slot for single-check habits.
- Multi-slot habits must be normalized with `getNormalizedFrequency()` and `normalizeTimeSlots()` from `lib/habits.ts`. Any stats call should receive `habit.timeSlots`, not a hardcoded default.
- `HabitTone` is the shared color contract: `{ surface, accent, fill, softFill, badge, hex? }`. `TONE_PRESETS` in `lib/habits.ts` is canonical, custom hex colors should go through `lib/tone-utils.ts`, and preset changes must stay in sync with `getMatrixTone()` and `getAppleCardGradient()` in `components/habit-tracker-app.tsx`.
- Tailwind theme tokens and reusable utility classes live in `app/globals.css` under `@theme`. There is no `tailwind.config.ts` in this project.
- Dynamic Tailwind classes only work when the full class names exist literally in source. Prefer the tone/style helpers over runtime-generated color class names that Tailwind cannot scan.
- Components use named exports and direct file imports via `@/`; this codebase does not use barrel files.
- Expect legacy persisted data. Tone fills may need normalization from older `bg-*-500` values, and single-slot records may require normalized-key matching or fallback-to-any-slot behavior.
- Local setup uses `.env.example` as the template. `NEXT_PUBLIC_SITE_URL` or `SITE_URL` controls `metadataBase`, canonical/social URLs, `sitemap.xml`, and `robots.txt`.
- Add every local and deployed origin to Firebase Auth authorized domains; installed PWAs use the same origin as the browser tab during Google sign-in.
