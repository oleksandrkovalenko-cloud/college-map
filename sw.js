/* ==========================================================================
   Service worker — offline-first caching for the campus scheme.

   Strategy: stale-while-revalidate.
   - Every request is answered from cache immediately if a cached copy
     exists (instant, works with zero connectivity).
   - In parallel, a fresh copy is fetched in the background and stored,
     so the NEXT visit picks up any update — without ever blocking the
     current one on the network.
   - Works for same-origin files (html/css/js) and for cross-origin ones
     (Google Fonts) alike, so once a page has loaded successfully with a
     connection, it keeps working — visually identical — with none.

   Bump CACHE_VERSION whenever index.html/style.css/script.js/data.js
   change, so the old cache is cleared and the new files are pre-loaded.
   ========================================================================== */

const CACHE_VERSION = "v5";
const CACHE_NAME = "campus-scheme-" + CACHE_VERSION;

// Required — if any of these fail to fetch, install() fails and nothing
// gets cached, so this list must only contain files guaranteed to exist.
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./data.js"
];

// Optional — cached best-effort. photos.php only exists on PHP-capable
// deployments, and photos-manifest.json only where the GitHub Actions
// workflow has run; either being missing must never break caching of
// the CORE_ASSETS above, so both are added separately with their own
// error handling instead of inside cache.addAll().
const OPTIONAL_ASSETS = [
  "./photos.php",
  "./photos-manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache =>
        cache.addAll(CORE_ASSETS).then(() =>
          // Best-effort: try each optional asset individually so one
          // missing file (e.g. no PHP on this host) can't fail the rest.
          Promise.all(OPTIONAL_ASSETS.map(url =>
            cache.add(url).catch(() => {})
          ))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // photos.php / photos-manifest.json report what's in photos/ — one
  // live-scanned on request, the other regenerated on push — but both
  // represent "current reality" and so get network-first instead of
  // stale-while-revalidate: try live data, fall back to the last-known
  // cached listing only when offline.
  if (url.pathname.endsWith("/photos.php") || url.pathname.endsWith("/photos-manifest.json")){
    event.respondWith(
      fetch(event.request.url, { cache: "no-store" })
        .then(response => {
          if (response && response.ok){
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else (the static app shell + fonts): stale-while-revalidate
  // — instant from cache, refreshed in the background for next time.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request)
          .then(response => {
            // Cache successful same-origin responses and opaque cross-origin
            // ones (e.g. Google Fonts) alike; skip caching real errors.
            if (response && (response.ok || response.type === "opaque")){
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached); // offline and not cached yet -> nothing we can do for THIS request

        return cached || networkFetch;
      })
    )
  );
});
