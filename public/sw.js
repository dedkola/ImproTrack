const CACHE_VERSION = "improtrack-v2";
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const CORE_ASSETS = [
  "/",
  "/offline",
  "/privacy",
  "/terms",
  "/sitemap",
  "/dashboard",
  "/dashboard/archive",
  "/dashboard/settings",
  "/dashboard/stats",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/apple-icon.png",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/safari-pinned-tab.svg",
  "/logo.svg",
  "/brand/home-collage.png",
  "/brand/dashboard-shot.png",
  "/brand/stats-shot.png",
  "/brand/archive-shot.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "worker" ||
    request.destination === "font" ||
    request.destination === "image" ||
    url.pathname.startsWith("/_next/")
  ) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  event.respondWith(handleGenericRequest(request));
});

async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return (
      (await caches.match("/offline")) ||
      new Response("Offline", {
        status: 503,
        statusText: "Offline",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    );
  }
}

async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }

  return response;
}

async function handleGenericRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return Response.error();
  }
}
