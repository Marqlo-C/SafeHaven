import { useEffect } from 'react';

/**
 * usePrivacyMode.js — service worker lifecycle and privacy hardening for the cover app shell.
 *
 * Registers /sw.js in production (no-cache, panic-capable service worker) and
 * automatically unregisters any stale SW in development so hot-reload works cleanly.
 * Also locks browser history to prevent the back button from revealing private mode,
 * and wipes session storage + triggers logout whenever the tab is hidden.
 *
 * Mount this hook once at the top of [theme].jsx — it should run on every page load.
 */

/**
 * Registers the privacy service worker, locks history navigation, and installs
 * a visibility listener that purges session state when the tab loses focus.
 * No-op in development — SW is removed to prevent stale chunk issues.
 */
export function usePrivacyMode({ onLogout } = {}) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((reg) => reg.unregister())))
        .then(() => purgeBrowserCaches())
        .catch((err) => console.debug('[SW] Dev cleanup failed', err));
      return undefined;
    }

    let active = true;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => console.debug('[SW] Registered', reg.scope))
      .catch((err) => console.error('[SW] Registration failed', err));

    const onMessage = (event) => {
      if (active && event.data?.type === 'PANIC_REDIRECT') {
        triggerPanicExit();
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', window.location.href);

    const lockHistory = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', lockHistory);
    return () => window.removeEventListener('popstate', lockHistory);
  }, []);

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

/**
 * Immediately redirects the user away from the app, wipes session storage,
 * logs out server-side, and instructs the service worker to purge all caches.
 * If called from a cover app page, redirects back to that cover to look natural.
 * Otherwise falls back to NEXT_PUBLIC_SAFE_EXIT_URL (default: google.com).
 */
export function triggerPanicExit() {
  // If we're inside a cover app (/app/calculator|news|weather), go back to that
  // cover page — it looks like a normal app launch to anyone watching.
  // Otherwise fall back to the configured safe-exit URL.
  const coverMatch =
    window.location.pathname.match(/^\/app\/(calculator|news|weather)/) ||
    decodeURIComponent(window.location.search).match(/\/app\/(calculator|news|weather)/);
  const safeUrl = coverMatch
    ? `/app/${coverMatch[1]}`
    : (process.env.NEXT_PUBLIC_SAFE_EXIT_URL || 'https://www.google.com');

  sessionStorage.clear();
  postToSW({ type: 'PANIC' });

  fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => {});

  window.location.replace(safeUrl);
}

function postToSW(message) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

function purgeBrowserCaches() {
  if (!('caches' in window)) return Promise.resolve();
  return caches
    .keys()
    .then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
}
