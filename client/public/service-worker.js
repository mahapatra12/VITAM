const STATIC_CACHE = 'vitam-static-v3';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch (_) {
        return new Response(JSON.stringify({
          code: 'NETWORK_ERROR',
          msg: 'The VITAM Sovereign Bridge is currently unreachable. Check your institutional connection.',
          status: 'error'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })());
    return;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch (_) {
        return (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);

    const networkFetch = fetch(request).then(async (response) => {
      if (response.ok && !response.headers.get('Cache-Control')?.includes('no-store')) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    });

    if (cached) {
      event.waitUntil(networkFetch.catch(() => {}));
      return cached;
    }

    try {
      return await networkFetch;
    } catch (_) {
      return Response.error();
    }
  })());
});
