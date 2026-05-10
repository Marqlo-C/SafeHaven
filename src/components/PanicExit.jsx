import { useEffect, useRef } from 'react';
import { triggerPanicExit } from '../hooks/usePrivacyMode';

/**
 * PanicExit - always-on quick-exit system.
 *
 * Triggers on:
 *  1. Escape key
 *  2. Rapid triple-tap anywhere on a touch screen
 *  3. Click/tap of the visible quick-exit button when shown
 */
export default function PanicExit({ showButton = true }) {
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') triggerPanicExit();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onTouchEnd = () => {
      tapCount.current += 1;

      if (tapCount.current >= 3) {
        clearTimeout(tapTimer.current);
        tapCount.current = 0;
        triggerPanicExit();
        return;
      }

      clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 600);
    };

    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchend', onTouchEnd);
      clearTimeout(tapTimer.current);
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
