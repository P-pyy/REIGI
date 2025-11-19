const CACHE_NAME = "kiosk-cache-v1";

const urlsToCache = [
  "/kiosk/",
  "/kiosk/index",
  "/kiosk/checklist",
  "/kiosk/queue",
  "/kiosk/css/style.css",
  "/kiosk/js/main.js",
  "/kiosk/icons/icon-192x192.png",
  "/kiosk/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Kiosk assets cached");
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  console.log("♻️ Service Worker active");
});


self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          console.warn("⚠️ Offline, serving cached page");
          return caches.match("/kiosk/");
        })
      );
    })
  );
});
