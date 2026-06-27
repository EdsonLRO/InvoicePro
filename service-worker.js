// InvoicePro service worker
// Strategy: NETWORK-FIRST for the app's own pages/assets, so when you publish an
// update users get the new version immediately (the cache is only a fallback for
// when the device is offline). Requests to other origins (Supabase, CDNs) are left
// alone and always go straight to the network.

const CACHE = 'invoicepro-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // activate the new service worker right away
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
    fetch(req)
      .then(res => {
        // keep a fresh copy for offline fallback
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req)) // offline: serve the last cached copy if we have it
  );
});
