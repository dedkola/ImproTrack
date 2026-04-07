# Momentum — Workspace Instructions

Momentum is a habit-tracking PWA built with **Next.js 16 (App Router)**, **React 19**, **TypeScript strict**, **Tailwind CSS v4**, and **Firebase 12** (Auth + Firestore).

## Build & Dev Commands

```bash
npm run dev    # start local dev server
npm run build  # production build
npm run start  # run production build
```

No test runner is configured — do not attempt to run tests.

## Architecture

```
app/                   # Thin server components (route pages only; one import each)
  layout.tsx           # Root: fonts, FirebaseAuthProvider, FirebaseAnalytics
  dashboard/layout.tsx # Wraps all dashboard routes in <AppShell>
components/            # "use client" UI components (all real logic lives here)
lib/
  storage.ts           # HabitStorageContext — single source of truth for all state
  habits.ts            # Types: HabitDefinition, HabitTone; TONE_PRESETS; slug utils
  date.ts              # dateKey helpers (YYYY-MM-DD strings)
  firebase/            # Singletons: client.ts, auth.ts, firestore.ts, habit-store.ts
```

## State Management

All state flows through **`lib/storage.ts`** (React Context + Firestore `onSnapshot`). Always consume state and mutations via hooks:

- `useHabits()` — habits list + `addHabit`, `updateHabit`, `deleteHabit`, `archiveHabit`, `restoreHabit`
- `useHabitRecords()` — records map + `toggleHabitDay`
- `useFirebaseAuth()` — `user`, `isLoading` from `components/firebase-auth-provider.tsx`

**Never write to Firestore directly from components.** `toggleHabitDay` has optimistic pending patches that must be reconciled — bypassing it causes UI/persistence desync.

## Conventions

- **`"use client"` is required** on any file that uses hooks, Firebase SDK, or browser APIs. Server components are thin wrappers in `app/` only. Missing this causes build failures.
- **Path alias:** `@/` → repo root. E.g. `import { useHabits } from "@/lib/storage"`.
- **No barrel/index files.** Import directly from the file path.
- **Named exports only** in components. No default exports.
- **File naming:** kebab-case files (`habit-form.tsx`), PascalCase named exports (`HabitForm`).
- **Date keys:** always `YYYY-MM-DD` strings. Use `toDateKey()` / `parseDateKey()` from `lib/date.ts`.
- **Slot keys:** lowercase strings; `"default"` is the sentinel for single-frequency habits.
- **Habit IDs:** UUIDs. Slugs derived via `slugify()` in `lib/habits.ts`.

## Styling — Tailwind v4

**There is no `tailwind.config.ts`.** All custom tokens are in `app/globals.css` inside `@theme { }`:

- Color scale: `ink-950` → `ink-500`, `paper-50/100/200`
- Reusable surface utilities: `.surface-panel`, `.header-bar`, `.page-shell`, `.tap-target`, `.tap-target-compact`, `.landing-backdrop`, `.feature-panel`, `.mesh-accent`
- Fonts: `font-sans` (Inter), `font-display` (Space Grotesk)

Do not create `tailwind.config.ts`. Do not use arbitrary values outside the existing token set.

**Dynamic Tailwind classes** (e.g. `habit.tone.fill = "bg-sky-600"`) work only because they appear as literal strings in the codebase. Any new dynamic class must appear as a full literal string somewhere Tailwind can scan.

## Habit Tone Color System

`TONE_PRESETS` in `lib/habits.ts` is the canonical list of color tones. Three locations must stay in sync when adding a new tone:

1. `TONE_PRESETS` in `lib/habits.ts`
2. `getMatrixTone()` in `components/habit-tracker-app.tsx`
3. `getAppleCardGradient()` in `components/habit-tracker-app.tsx`

All habit card surfaces use `"from-white via-white to-white"` — the white-surface look is intentional and consistent with the sidebar.

## Firebase

**Singletons only.** Never instantiate Firebase directly in components. Use the getters:

- `getFirebaseApp()` → `lib/firebase/client.ts`
- `getFirebaseAuth()` → `lib/firebase/auth.ts`
- `getFirebaseDb()` → `lib/firebase/firestore.ts`

**Firestore data model:**

```
users/{userId}/habits/{habitId}     → HabitDefinition + _updatedAt
users/{userId}/records/{dateKey}    → { entries: { [habitId]: { [slotName]: boolean } }, _updatedAt }
```

**Auth:** Google Sign-In only. `FirebaseAuthProvider` uses `onIdTokenChanged`.

**Env vars** (required in `.env.local`): `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.

## Known Pitfalls

- **Stale tone classes from legacy data:** Firestore records with old `tone.fill` class names (e.g. `bg-*-500`) may not match current TONE_PRESETS. Normalize on read.
- **Matrix slot rendering:** Each matrix cell must be slot-specific. Aggregate day state on one row makes multi-slot habits appear broken.
- **Optimistic rollback:** `toggleHabitDay` must roll back pending patches if the Firestore write fails.
- **Single-slot fallback:** Records for single-slot habits may carry legacy slot keys. Resolve by normalized key match; allow fallback to any truthy slot for single-slot habits.
- **Marketing page duplicate keys:** Comparison rows on `/` can emit React key warnings if text combinations repeat — use stable index or composite key.
- **Matrix checkbox styles** are intentionally separate from `.surface-panel` — they need stronger contrast, shadow, and click feedback.
