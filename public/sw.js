// Ekyama service worker.
//
// Goals, matching the hackathon brief's "low bandwidth / unreliable
// internet" requirement:
//  - The app installs to a home screen (see manifest.webmanifest).
//  - A small set of information-only pages (home, help directory, guide,
//    low-data page) are cached as the visitor browses, so they still open
//    with no connection.
//  - A static, dependency-free offline.html — baked in at install time —
//    is the last-resort fallback so even a first-time offline visitor gets
//    the critical hotline numbers.
//
// Deliberately NOT cached, ever: anything under /api/ (a survivor's report,
// case data, chat messages, counsellor auth) and any POST/PUT/DELETE
// request. Caching those would mean sensitive data sitting in on-device
// storage indefinitely, which works against the app's own privacy design.

const CACHE_VERSION = "ekyama-v1";
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const PRECACHE = `${CACHE_VERSION}-precache`;

const PRECACHE_URLS = ["/offline.html", "/icon-192.png", "/icon-512.png"];

// Only these page paths are eligible for offline caching — informational,
// no-PII pages. Everything else (report, track, counsellor) always goes to
// the network, since caching a survivor's own data on-device is a risk we
// don't want to take.
const CACHEABLE_PATHS = ["/", "/help", "/guide", "/lite"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ekyama-") && key !== RUNTIME_CACHE && key !== PRECACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept writes

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // never cache survivor/case data

  const isCacheablePage = CACHEABLE_PATHS.includes(url.pathname);
  const isStaticAsset = url.pathname.startsWith("/_next/") || url.pathname.startsWith("/icon-");

  if (!isCacheablePage && !isStaticAsset) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const offline = await caches.match("/offline.html");
          if (offline) return offline;
        }
        return Response.error();
      }
    })()
  );
});
