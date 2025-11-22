self.addEventListener("install", () => {
  console.log("SW installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("SW activated");
});

self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return caches.open("v1").then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
