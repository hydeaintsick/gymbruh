// Minimal service worker for PWA installability (Chrome / Android).
// Does not provide offline caching; only required for "Add to Home Screen" criteria.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
