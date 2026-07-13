/* PokloniMi service worker.
 *
 * Strategy:
 *  - API requests are NEVER intercepted: gift availability must always be
 *    live, reservations require the network, and private host data must not
 *    be cached on shared devices.
 *  - Navigations: network-first with the offline page as fallback.
 *  - Static assets (/_next/static, icons, manifest): cache-first; these
 *    URLs are content-hashed or effectively immutable.
 *
 * Bump CACHE_VERSION on breaking changes; old caches are cleaned on
 * activate, and the new worker takes over immediately so users are not
 * stuck on a stale shell.
 */
const CACHE_VERSION = 'poklonimi-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  // Same-origin /api/* or the separate API host.
  return url.pathname.startsWith('/api/') || url.hostname.includes('giftmebe');
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest'
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isApiRequest(url)) return; // always live

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (isStaticAsset(url) && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
