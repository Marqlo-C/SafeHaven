/**
 * PrivateModeButton — discreet in-app switch from a cover screen to private safety tools.
 *
 * Stays small, unlabeled, and low-contrast so the cover identity remains the primary
 * visible experience. Positioned using env(safe-area-inset-*) so it clears the
 * rounded corners and home indicator on modern iPhones.
 */

export default function Button({ onClick }) {
  return (
    <button
      type="button"
      aria-label="Open private safety tools"
      title="Open private safety tools"
      onClick={onClick}
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
