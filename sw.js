const cacheName = 'pwa-conf-v1';
const staticAssets = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', async (event) => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached || fetch(req);
}