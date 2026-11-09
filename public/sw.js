// Installability needs a registered worker with a fetch handler. That is all this does.
//
// It deliberately does NOT cache HTML or any /api/v1 response. The session lives in an
// HttpOnly cookie, so a cached shell or a cached /me would serve one user's signed-in page
// to the next person on the device — and the MVP has no offline sync to justify the risk.
// Only immutable build output and the icons are cached.

const CACHE = 'bida-static-v1';
const PRECACHE = ['/icon-192.png', '/icon-512.png', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE);
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Everything that could be user-specific goes straight to the network, every time.
  const isCacheable =
    request.method === 'GET' &&
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') || PRECACHE.includes(url.pathname));

  if (!isCacheable) {
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      return (
        hit ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => {
              return cache.put(request, copy);
            });
          }

          return response;
        })
      );
    }),
  );
});
