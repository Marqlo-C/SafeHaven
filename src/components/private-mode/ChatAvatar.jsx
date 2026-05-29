/**
 * ChatAvatar — Displays avatar with initials and online status indicator.
 *
 * Features:
 *  - Shows initials or emoji
 *  - Green dot for online status
 *  - Bot-specific styling
 */

import styles from '../../styles/private-mode/chat.module.css';

export default function Avatar({ peer }) {
  return (
    <span className={styles.avatar}>
      <span className={peer.isBot ? styles.botAvatar : ''}>{peer.emoji}</span>
      <span className={peer.status === 'online' ? styles.avatarOnline : styles.avatarAway} />
    </span>
  );
}
