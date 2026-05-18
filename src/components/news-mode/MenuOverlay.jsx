import styles from '../../styles/news-mode/overlays.module.css';
import OverlayHeader from './OverlayHeader';

export default function MenuOverlay({ onClose }) {
  return (
    <div className={`${styles.overlay} ${styles.menuOverlay}`}>
      <OverlayHeader title="Menu" onClose={onClose} />
      <div className={styles.menuVersionBlock}>
        <p className={styles.menuVersionApp}>Kiwi News</p>
        <p className={styles.menuVersionNum}>Version 1.0.0 (Build 42)</p>
      </div>
    </div>
  );
}
