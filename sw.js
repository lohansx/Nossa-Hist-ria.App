/**
 * NOSSA HISTÓRIA ❤️
 * Service Worker para funcionamento Offline PWA
 */

const CACHE_NAME = "nossa-historia-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./styles/components.css",
  "./scripts/data.js",
  "./scripts/db.js",
  "./scripts/calendar.js",
  "./scripts/gallery.js",
  "./scripts/roulette.js",
  "./scripts/timeline.js",
  "./scripts/app.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Estratégia Cache First com Fallback para Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Se estiver offline e requisitar navegação, retornar index.html
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
