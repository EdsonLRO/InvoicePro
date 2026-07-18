const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const workerSource = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const origin = 'https://edsonlro.github.io';
const scope = `${origin}/InvoicePro/`;

function cacheKey(request) {
  const value = typeof request === 'string' ? request : request.url;
  return new URL(value, scope).href;
}

function fakeResponse(body, ok = true) {
  return {
    body,
    ok,
    clone() {
      return fakeResponse(body, ok);
    }
  };
}

function createHarness(fetchImpl = async () => fakeResponse('network')) {
  const listeners = {};
  const stores = new Map();
  let skipWaitingCalls = 0;
  let claimCalls = 0;

  const cacheApi = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(entries) {
          for (const entry of entries) store.set(cacheKey(entry), fakeResponse(`precache:${entry}`));
        },
        async put(request, response) {
          store.set(cacheKey(request), response);
        }
      };
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
    async match(request) {
      const key = cacheKey(request);
      for (const store of stores.values()) {
        if (store.has(key)) return store.get(key);
      }
      return undefined;
    }
  };

  const context = {
    URL,
    caches: cacheApi,
    fetch: fetchImpl,
    self: {
      location: { origin },
      clients: { claim: async () => { claimCalls += 1; } },
      skipWaiting: async () => { skipWaitingCalls += 1; },
      addEventListener(type, handler) {
        listeners[type] = handler;
      }
    }
  };

  vm.runInNewContext(workerSource, context, { filename: 'service-worker.js' });
  return { listeners, stores, cacheApi, get skipWaitingCalls() { return skipWaitingCalls; }, get claimCalls() { return claimCalls; } };
}

function lifecycleEvent() {
  const waits = [];
  return {
    waits,
    waitUntil(promise) {
      waits.push(Promise.resolve(promise));
    }
  };
}

function fetchEvent(request) {
  const waits = [];
  let responsePromise;
  return {
    request,
    waits,
    waitUntil(promise) {
      waits.push(Promise.resolve(promise));
    },
    respondWith(promise) {
      responsePromise = Promise.resolve(promise);
    },
    get responsePromise() {
      return responsePromise;
    }
  };
}

(async () => {
  const harness = createHarness();
  const install = lifecycleEvent();
  harness.listeners.install(install);
  assert.equal(install.waits.length, 1, 'install must keep the worker alive while the shell is cached');
  await Promise.all(install.waits);
  assert.equal(harness.skipWaitingCalls, 1, 'new worker must activate without waiting for old tabs to close');

  const cacheNames = await harness.cacheApi.keys();
  assert.deepEqual(cacheNames, ['tallyo-shell-2026-07-18-7']);
  const shellStore = harness.stores.get(cacheNames[0]);
  for (const asset of ['./', './index.html', './tailwind.css', './config.js', './manifest.json', './icon-192.png', './icon-512.png']) {
    assert(shellStore.has(cacheKey(asset)), `missing app-shell asset: ${asset}`);
  }

  harness.stores.set('tallyo-old-cache', new Map());
  const activate = lifecycleEvent();
  harness.listeners.activate(activate);
  await Promise.all(activate.waits);
  assert.equal(harness.stores.has('tallyo-old-cache'), false, 'old cache must be removed');
  assert.equal(harness.claimCalls, 1, 'active worker must claim open clients');

  const request = { method: 'GET', url: `${scope}tailwind.css`, mode: 'same-origin' };
  const networkEvent = fetchEvent(request);
  harness.listeners.fetch(networkEvent);
  const networkResponse = await networkEvent.responsePromise;
  await Promise.all(networkEvent.waits);
  assert.equal(networkResponse.body, 'network', 'same-origin GET must prefer the network');
  assert.equal((await harness.cacheApi.match(request)).body, 'network', 'successful network response must refresh the cache');

  for (const ignored of [
    { method: 'POST', url: `${scope}index.html`, mode: 'same-origin' },
    { method: 'GET', url: 'https://cdn.example.test/library.js', mode: 'cors' }
  ]) {
    const event = fetchEvent(ignored);
    harness.listeners.fetch(event);
    assert.equal(event.responsePromise, undefined, 'non-GET and cross-origin traffic must remain outside the worker');
  }

  const offline = createHarness(async () => { throw new Error('offline'); });
  const offlineInstall = lifecycleEvent();
  offline.listeners.install(offlineInstall);
  await Promise.all(offlineInstall.waits);

  const exactEvent = fetchEvent({ method: 'GET', url: `${scope}manifest.json`, mode: 'same-origin' });
  offline.listeners.fetch(exactEvent);
  assert.equal((await exactEvent.responsePromise).body, 'precache:./manifest.json', 'offline exact request must use its cached response');

  const navigationEvent = fetchEvent({ method: 'GET', url: `${scope}customers`, mode: 'navigate' });
  offline.listeners.fetch(navigationEvent);
  assert.equal((await navigationEvent.responsePromise).body, 'precache:./index.html', 'offline navigation must fall back to the cached app shell');

  const missingEvent = fetchEvent({ method: 'GET', url: `${scope}missing.txt`, mode: 'same-origin' });
  offline.listeners.fetch(missingEvent);
  await assert.rejects(missingEvent.responsePromise, /offline/, 'uncached non-navigation failure must not fabricate a response');

  assert.match(indexSource, /const APP_BUILD = '2026\.07\.18\.7';/, 'frontend build marker must match the worker release');
  assert.equal((indexSource.match(/Tallyo build \{\{ appBuild \}\}/g) || []).length, 2, 'build marker must appear on signed-out and Account views');
  assert.match(indexSource, /serviceWorker\.register\('\.\/service-worker\.js', \{ updateViaCache: 'none' \}\)/, 'worker script must bypass the HTTP cache during update checks');

  console.log('PWA update harness passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
