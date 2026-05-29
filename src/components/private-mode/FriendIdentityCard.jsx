/**
 * FriendIdentityCard — Shows user's own display name in Friends panel.
 *
 * Features:
 *  - Displays user's handle with avatar
 *  - Reroll button (placeholder for future randomization)
 */

import { Shuffle } from 'lucide-react';
import styles from '../../styles/private-mode/chat.module.css';

function initialsForName(displayName) {
  return String(displayName || 'Friend').replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'FR';
}

export default function FriendIdentityCard({ displayName }) {
  return (
    <div className={styles.friendIdentity}>
      <span className={styles.friendIdentityAvatar} aria-hidden="true">
        {initialsForName(displayName)}
      </span>
      <span className={styles.friendInfo}>
        <span>Your display name</span>
        <strong>{displayName}</strong>
      </span>
      <button type="button" className={styles.rerollButton} aria-label="Reroll handle">
        <Shuffle className={styles.smallIcon} aria-hidden="true" />
      </button>
    </div>
  );
}
