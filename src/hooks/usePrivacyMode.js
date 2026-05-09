import { useEffect } from 'react';

/**
 * usePrivacyMode
 *
 * Mounts once in the app shell to enforce incognito-style behaviour:
 *
 *  1. History lock — prevents the back button from revealing a previous state.
 *     Uses pushState so the browser has nowhere to go back to.
 *
 *  2. Session wipe on hide — when the user switches tabs, backgrounds the app,
 *     or the screen locks, sessionStorage is cleared and the SW is told to
 *     purge all caches. Leaves no forensic residue between glances.
 *
 *  3. Service worker registration — registers /sw.js on first mount.
 *     The SW enforces the network-only fetch strategy and responds to PANIC.
 */
export function usePrivacyMode() {
  // ── 1. Service Worker registration ──────────────────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => console.debug('[SW] Registered', reg.scope))
        .catch((err) => console.error('[SW] Registration failed', err));

      // Listen for the SW telling us to panic-redirect.
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'PANIC_REDIRECT') {
          triggerPanicExit();
        }
      });
    }
  }, []);

  // ── 2. History lock ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Replace the current history entry so there's nothing behind it.
    window.history.replaceState(null, '', window.location.href);

    const lockHistory = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', lockHistory);
    return () => window.removeEventListener('popstate', lockHistory);
  }, []);

  // ── 3. Wipe on tab hide / background ────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.clear();
        postToSW({ type: 'PURGE_CACHE' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
}

// ─── Shared utilities (also imported by PanicExit) ────────────────────────────

export function triggerPanicExit() {
  const safeUrl = process.env.NEXT_PUBLIC_SAFE_EXIT_URL || 'https://www.google.com';

  sessionStorage.clear();
  postToSW({ type: 'PANIC' });

  // keepalive ensures the request completes even as the page navigates away.
  fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => {});

  window.location.replace(safeUrl);
}

function postToSW(message) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}
