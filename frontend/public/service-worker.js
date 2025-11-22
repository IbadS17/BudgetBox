self.addEventListener("install", () => {
  console.log("SW installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("SW activated");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("budgetbox-v1").then((cache) => {
      return fetch(event.request)
        .then((response) => {
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => cache.match(event.request));
    })
  );
});
