# ImproTrack

ImproTrack is a habit-tracking PWA built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Firebase.

The app is split into a public marketing surface and an authenticated dashboard area:

- `/` is the public homepage.
- `/privacy` and `/terms` are public legal pages.
- `/sitemap` is a human-readable sitemap page.
- `/dashboard`, `/dashboard/archive`, `/dashboard/stats`, and `/dashboard/settings` are app routes for signed-in users.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- Firebase Auth and Firestore

## Development

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Production commands:

```bash
pnpm build
pnpm start
```

No test runner is configured in this repo.

## Environment Variables

Create `.env.local` from `.env.example` and fill in your values.

Required Firebase variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Recommended SEO variable:

- `NEXT_PUBLIC_SITE_URL`

`NEXT_PUBLIC_SITE_URL` is used to generate:

- `metadataBase`
- `/sitemap.xml`
- `/robots.txt`

If `NEXT_PUBLIC_SITE_URL` is not set, the app falls back to `SITE_URL`, then Vercel URL variables, then `http://localhost:3000`.

## SEO

The project ships with static SEO routes:

- `/sitemap.xml` includes the public static pages only.
- `/robots.txt` points crawlers to the sitemap and disallows authenticated areas.
- `/sitemap` provides a human-readable public sitemap page.

Crawlers are blocked from these paths:

- `/dashboard`
- `/archive`
- `/habits`

Dashboard routes also emit `noindex` metadata at the layout level.

## Project Notes

- State is managed through `lib/storage.ts`.
- Firebase access should go through the helpers in `lib/firebase/`.
- Public pages use the shared white-surface shell in `components/public-page-shell.tsx`.
- Do not add a `tailwind.config.ts`; theme tokens live in `app/globals.css`.
