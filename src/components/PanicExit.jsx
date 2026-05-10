import { useEffect, useRef } from 'react';
import { triggerPanicExit } from '../hooks/usePrivacyMode';

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
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') triggerPanicExit();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e) => {
      if (!config.features.enable_swipe_panic) return;

      // Disable swipe if keyboard is likely up (input/textarea is focused)
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      if (isInput) return;

      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

      // Horizontal swipe threshold: > 100px horizontal, < 50px vertical deviation
      const minDistance = 150;
      const maxVerticalDev = 100;

      if (Math.abs(deltaX) > minDistance && Math.abs(deltaY) < maxVerticalDev) {
        console.debug('[Swipe] Horizontal swipe detected');
        triggerPanicExit();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

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
        bottom: '12px',
        right: '12px',
        zIndex: 9999,
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(180, 180, 180, 0.25)',
        color: 'rgba(120, 120, 120, 0.6)',
        fontSize: '14px',
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      x
    </button>
  );
}
