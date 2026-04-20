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

Use the pinned Node.js runtime first, then install dependencies and start the dev server:

```bash
nvm use
pnpm install
pnpm dev
```

If you need to test the app from another device on your LAN, set
`NEXT_ALLOWED_DEV_ORIGINS` to a comma-separated list of additional hostnames or
IPs before starting Next.js.

Validation and production commands:

```bash
pnpm typecheck
pnpm check
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
- canonical and social metadata URLs
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

## PWA and offline behavior

- The app now ships with a lightweight service worker for production builds. It caches the public shell, core dashboard routes, and static assets so the app feels installable and has a basic offline fallback.
- `pnpm dev` does **not** register the service worker. To test install/offline behavior locally, use `pnpm build && pnpm start`.
- Google sign-in and fresh Firestore sync still require a live network connection. Cached screens can load offline, but auth refreshes and new data writes will wait for connectivity.
- Chromium browsers can use the in-app install prompt. On iOS Safari, install via **Share → Add to Home Screen**.

## Firebase auth setup for installed PWAs

- Add every local and deployed origin you use (for example `localhost` and your production domain) to **Firebase Console → Authentication → Settings → Authorized domains**.
- The installed PWA uses the same web origin as the browser tab, so Google sign-in will fail if that origin is missing from Firebase Auth authorized domains.
- Keep the `NEXT_PUBLIC_SITE_URL` value aligned with your production origin so metadata, install links, and social previews all point at the same host.

## CI

- GitHub Actions runs `pnpm check` on every push and pull request.

## Project Notes

- State is managed through `lib/storage.ts`.
- Firebase access should go through the helpers in `lib/firebase/`.
- Public pages use the shared white-surface shell in `components/public-page-shell.tsx`.
- Do not add a `tailwind.config.ts`; theme tokens live in `app/globals.css`.
