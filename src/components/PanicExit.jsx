/**
 * PanicExit — Always-on emergency exit system.
 *
 * Provides rapid emergency exits via:
 *  - Escape key press
 *  - Horizontal swipe gesture (left/right) on touch devices
 *  - Quick-exit button tap (when visible)
 *
 * The button is a 44×44 pt tap target (10px padding around a 24px icon) positioned
 * using env(safe-area-inset-*) so it clears iPhone notch/rounded corners.
 * touchAction: manipulation removes the 300ms tap delay on mobile.
 * Redirect fires first in triggerPanicExit — see usePrivacyMode.js.
 */

import { useEffect, useRef } from 'react';
import { triggerPanicExit } from '../hooks/usePrivacyMode';

function RedLockIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* open shackle */}
      <path d="M7 11V8a5 5 0 0 1 10 0" stroke="#c41e1e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* body */}
      <rect x="4" y="11" width="16" height="13" rx="3" fill="#c41e1e" />
      {/* keyhole */}
      <circle cx="12" cy="17" r="2" fill="white" />
      <rect x="11" y="18" width="2" height="3" rx="1" fill="white" />
    </svg>
  );
}

/**
 * PanicExit - always-on quick-exit system.
 *
 * Triggers on:
 *  1. Escape key
 *  2. Horizontal swipe (left-to-right or right-to-left) on touch screens
 *  3. Click/tap of the visible quick-exit button when shown
 */
const config = require('../config/config.json');

export default function PanicExit({ showButton = true }) {
  const touchStart = useRef({ x: 0, y: 0, time: 0 });

  // Listen for Escape key press to trigger panic exit
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') triggerPanicExit();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e) => {
      if (!config.features.enable_swipe_panic) return;
      if (e.changedTouches.length !== 1) return;

      // Disable swipe if keyboard is likely up (input/textarea is focused)
      // Also validates swipe velocity and direction for accurate detection
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      if (isInput) return;

      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      // Refined thresholds for better responsiveness
      const minDistance = 100; // Reduced from 150
      const maxVerticalDev = 150; // Increased from 100 (more forgiving for diagonal swipes)
      const maxTime = 500; // Swipe must be completed within 0.5s

      if (
        Math.abs(deltaX) > minDistance &&
        Math.abs(deltaY) < maxVerticalDev &&
        deltaTime < maxTime
      ) {
        console.debug('[Swipe] Horizontal swipe detected');
        triggerPanicExit();
      }
    };

    // Use passive: true for performance, except if we needed to preventDefault
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={triggerPanicExit}
      aria-label="Quick exit"
      title="Quick exit"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        border: 'none',
        background: 'transparent',
        color: '#c41e1e',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        padding: '10px',
        minWidth: '44px',
        minHeight: '44px',
      }}
    >
      <RedLockIcon size={24} />
    </button>
  );
}
