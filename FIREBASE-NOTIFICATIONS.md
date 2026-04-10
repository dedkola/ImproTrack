# Firebase Notifications Setup

This project already contains the code for web push habit reminders.

What you still need to do:

## 1. Enable Firebase Cloud Messaging

- Open your Firebase project.
- Go to `Project settings` -> `Cloud Messaging`.
- In the `Web configuration` section, create or reuse a Web Push certificate key pair.
- Copy the **public VAPID key**.

## 2. Add client env var

Add this to `.env.local` and to your deployment environment:

```bash
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_public_vapid_key
```

The app uses this key in the browser to register the current device for push notifications.

## 3. Add server env vars

You need a Firebase Admin credential for the server route that sends reminders.

Use either:

```bash
FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON={...full service account json...}
```

or these three values:

```bash
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Also add:

```bash
CRON_SECRET=some_long_random_secret
```

`CRON_SECRET` protects the reminder sender endpoint.

## 4. Deploy with cron enabled

This repo already includes `vercel.json` with a cron job:

- Path: `/api/cron/habit-reminders`
- Schedule: every 15 minutes

If you deploy on Vercel, add the env vars there and the cron will call the route automatically.

If you do **not** deploy on Vercel, schedule your own HTTP job to call:

```text
GET /api/cron/habit-reminders
Authorization: Bearer YOUR_CRON_SECRET
```

## 5. Enable reminders in the app

- Sign in.
- Open `Profile Settings`.
- Click `Enable background reminder`.
- Allow browser notifications.

When enabled, the browser stores a push token in Firestore under:

```text
users/{userId}/notificationTokens/{deviceId}
```

## 6. How sending works

- The cron route checks enabled browser tokens.
- It respects each saved browser time zone.
- Around `5:00 PM` local time, it sends a reminder only if at least one habit is still incomplete for that day.

## 7. Quick test

After deployment:

1. Enable the reminder in the app.
2. Confirm a token document appears in Firestore under `users/{userId}/notificationTokens`.
3. Call the cron route manually with the `Authorization: Bearer <CRON_SECRET>` header.
4. Check that the browser receives the push notification.

## Notes

- Web push requires a secure context. `localhost` is fine for development; deployed environments must use HTTPS.
- If the user blocks notifications in the browser, reminders will not work until permission is re-enabled.
- If an FCM token becomes invalid, the server route disables that token automatically.
