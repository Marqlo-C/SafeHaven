/**
 * Privacy-First Service Worker
 *
 * Core contract:
 *  - NEVER cache any request or response.
 *  - Actively DELETE all caches on install, activate, and on demand.
 *  - Pass all fetch requests to the network (network-only strategy).
 *  - On panic: purge everything and cooperate with the page's redirect.
 *
 * This is intentionally the opposite of a typical "offline-first" SW.
 * Caching would leave forensic traces on a shared or abuser-controlled device.
 */

// ─── Lifecycle ───────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  // Skip waiting so this SW activates immediately without waiting for old tabs.
  event.waitUntil(purgeAllCaches().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(purgeAllCaches().then(() => self.clients.claim()));
});

// ─── Fetch (network-only, no caching) ────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a blank response rather than a browser error page.
      // A browser error page could reveal the app's nature.
      return new Response(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
        '<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
        '<p>No internet connection. Please reconnect and try again.</p></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    })
  );
});

// ─── Message handler ──────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  switch (event.data?.type) {
    case 'PURGE_CACHE':
      // Called by the app on tab-hide and on panic exit.
      event.waitUntil(purgeAllCaches());
      break;

    case 'PANIC':
      // Called by PanicExit — purge then tell every open tab to redirect.
      event.waitUntil(
        purgeAllCaches().then(() =>
          self.clients.matchAll({ type: 'window' }).then((clients) => {
            clients.forEach((client) =>
              client.postMessage({ type: 'PANIC_REDIRECT' })
            );
          })
        )
      );
      break;
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function purgeAllCaches() {
  return caches
    .keys()
    .then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
}
