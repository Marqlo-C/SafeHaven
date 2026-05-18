import styles from '../../styles/news-mode/overlays.module.css';
import OverlayHeader from './OverlayHeader';

export default function ProfileOverlay({ onClose }) {
  return (
    <div className={styles.overlay}>
      <OverlayHeader title="Account" onClose={onClose} />

      <div className={styles.profileBlock}>
        <div className={styles.profileAvatar} aria-hidden="true" />
        <div className={styles.profileName}>Guest User</div>
      </div>
    </div>
  );
}
