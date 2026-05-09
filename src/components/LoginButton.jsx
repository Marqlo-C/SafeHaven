/**
 * LoginButton — Discrete login access button component.
 *
 * A small, subtle orange button that provides hidden access to the login page
 * from within the disguised app shell. The button is intentionally unlabeled
 * and low-contrast to avoid drawing attention on shared or monitored devices.
 *
 * Positioned at the bottom-left corner with minimal visibility.
 */

import { useRouter } from 'next/router';

export default function LoginButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/login');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Login"
      title="Login"
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '12px',
        zIndex: 9998,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(255, 140, 0, 0.35)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 140, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 140, 0, 0.35)';
      }}
    />
  );
}
