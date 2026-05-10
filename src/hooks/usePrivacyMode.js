import { useEffect } from 'react';
import config from '../config/config.json';

/**
 * usePrivacyMode
 *
 * Production keeps the privacy service worker enabled. Development removes it
 * so localhost never gets stuck serving stale/blank Next.js chunks.
 */
export function usePrivacyMode() {
  useEffect(() => {
    // ── Shake Detection Implementation ───────────────────────────────────────
    const SHAKE_THRESHOLD = 25; // Adjusted for "violent" shake
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = 0;

    const onMotion = (event) => {
      if (!config.features.enable_shake_panic) return;

      const motion = event.accelerationIncludingGravity;
      if (!motion) return;
      const { x = 0, y = 0, z = 0 } = motion;
      const currentTime = Date.now();
      const diffTime = currentTime - lastTime;

      if (lastTime === 0) {
        lastTime = currentTime;
        lastX = x;
        lastY = y;
        lastZ = z;
        return;
      }

      if (diffTime > 100) {
        lastTime = currentTime;
        const delta = Math.abs(x + y + z - lastX - lastY - lastZ);
        const speed = (delta / diffTime) * 10000;

        if (speed > SHAKE_THRESHOLD) {
          console.debug('[Shake] Panic threshold reached');
          triggerPanicExit();
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    if (config.features.enable_shake_panic && typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      // iOS 13+ requires permission for DeviceMotion
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // We can't request on mount, but we can listen if already granted
        window.addEventListener('devicemotion', onMotion);
      } else {
        window.addEventListener('devicemotion', onMotion);
      }
    }

    return () => {
      window.removeEventListener('devicemotion', onMotion);
    };
  }, []);

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

export function triggerPanicExit() {
  const safeUrl = process.env.NEXT_PUBLIC_SAFE_EXIT_URL || 'https://www.google.com';

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
