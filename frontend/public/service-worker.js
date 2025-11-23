const CACHE_NAME = "budgetbox-cache-v1";

// Files to pre-cache (App Shell)
const APP_SHELL = [
  "/", // homepage
  "/manifest.json",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(self.clients.claim());
});

// Fetch handler: GET only
self.addEventListener("fetch", (event) => {
  // Ignore POST, PUT, DELETE etc
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Cache static assets only (Next.js _next/*)
          if (event.request.url.includes("/_next/")) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }

          return networkResponse;
        })
        .catch(() => cached); // Offline fallback

      // Return cached first (Cache First strategy)
      return cached || fetchPromise;
    })
  );
});
