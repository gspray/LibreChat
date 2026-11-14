/* SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Cached Workbox responses kept X-Frame-Options: SAMEORIGIN and blocked
 * the LessonCaddie Assistant iframe. This worker claims clients, drops
 * those caches, and does not intercept fetches. */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});
