// Tallyo service worker
// Strategy: NETWORK-FIRST for the app's own pages/assets, so when you publish an
// update users get the new version immediately (the cache is only a fallback for
// when the device is offline). Requests to other origins (Supabase, CDNs) are left
// alone and always go straight to the network.

const CACHE = 'tallyo-shell-2026-07-16-2';
const APP_SHELL = [
  './',
  './index.html',
  './tailwind.css',
  './config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // remove old caches from previous versions
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests (the app shell). Everything else
  // (Supabase API calls, CDN scripts, etc.) goes straight to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(req);
        if (response && response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE)
              .then((cache) => cache.put(req, copy))
              .catch(() => {})
          );
        }
        return response;
      } catch (error) {
        const cached = await caches.match(req);
        if (cached) return cached;

        if (req.mode === 'navigate') {
          const shell = await caches.match('./index.html');
          if (shell) return shell;
        }

        throw error;
      }
    })()
  );
});
