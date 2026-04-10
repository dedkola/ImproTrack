self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {};

  try {
    payload = event.data.json();
  } catch {
    payload = {
      body: event.data.text(),
    };
  }

  const rawData =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;
  const data = rawData && typeof rawData === "object" ? rawData : {};
  const notification =
    payload && typeof payload === "object" && "notification" in payload
      ? payload.notification
      : null;
  const title =
    notification && typeof notification.title === "string"
      ? notification.title
      : data.title || "ImproTrack reminder";
  const body =
    notification && typeof notification.body === "string"
      ? notification.body
      : data.body || "Are you done with your habits today?";
  const url = typeof data.url === "string" ? data.url : "/dashboard";
  const tag = typeof data.tag === "string" ? data.tag : "habit-reminder";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: {
        url,
      },
      tag,
    }),
  );
});

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);

          if (clientUrl.pathname.startsWith("/dashboard")) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return undefined;
      }),
  );
});
