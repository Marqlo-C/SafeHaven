import styles from '../../styles/news-mode/overlays.module.css';

export default function OverlayHeader({ title, onClose }) {
  return (
    <div className={styles.overlayHeader}>
      <button className={styles.backButton} type="button" aria-label="Go back" onClick={onClose}>
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 1L1 9l8 8" />
        </svg>
      </button>
      <h2 className={styles.overlayTitle}>{title}</h2>
      <div className={styles.overlayHeaderSpacer} aria-hidden="true" />
    </div>
  );
}
