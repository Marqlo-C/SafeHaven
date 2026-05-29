/**
 * FriendRequestsSections — Renders incoming requests, pending requests, and accepted friends.
 *
 * Features:
 *  - Accept incoming friend requests
 *  - Cancel/reject pending requests
 *  - Remove accepted friends
 *  - Toggle trusted contact status
 *  - Shows summary of trusted contacts for SOS
 */

import { Check, MapPin, Shield, X } from 'lucide-react';
import styles from '../../styles/private-mode/chat.module.css';

function FriendSection({ title, children }) {
  return (
    <section className={styles.friendSection}>
      <div className={styles.peerSectionLabel}>{title}</div>
      <div className={styles.friendRows}>{children}</div>
    </section>
  );
}

function FriendRow({ friend, children }) {
  return (
    <div className={styles.friendRow}>
      <span className={styles.friendAvatar} aria-hidden="true">
        {friend.emoji}
      </span>
      <span className={styles.friendInfo}>
        <strong>{friend.displayName}</strong>
        <span>Anonymous</span>
      </span>
      <span className={styles.friendActions}>{children}</span>
    </div>
  );
}

function AcceptedFriendRow({ friend, onToggle, onRemove }) {
  const trusted = Boolean(friend.isTrusted);
  return (
    <div className={`${styles.acceptedFriendRow} ${trusted ? styles.acceptedFriendRowTrusted : ''}`}>
      <div className={styles.acceptedFriendMain}>
        <span className={styles.friendAvatar} aria-hidden="true">
          {friend.emoji}
        </span>
        <span className={styles.friendInfo}>
          <span className={styles.friendNameLine}>
            <strong>{friend.displayName}</strong>
            {trusted && (
              <span className={styles.trustedPill}>
                <Shield className={styles.trustedPillIcon} aria-hidden="true" />
                Trusted
              </span>
            )}
          </span>
          <span>{friend.mutuals ? `${friend.mutuals} mutual - ` : ''}Anonymous</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={trusted}
          aria-label={`Mark ${friend.displayName} as trusted contact`}
          className={`${styles.trustedSwitch} ${trusted ? styles.trustedSwitchOn : ''}`}
          onClick={() => onToggle(!trusted)}
        >
          <span aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.friendIconButton}
          aria-label={`Remove ${friend.displayName}`}
          onClick={onRemove}
        >
          <X className={styles.tinyIcon} aria-hidden="true" />
        </button>
      </div>
      {trusted && (
        <div className={styles.trustedFooter}>
          <MapPin className={styles.trustedFooterIcon} aria-hidden="true" />
          <span>Will see your live location during SOS</span>
        </div>
      )}
    </div>
  );
}

export default function FriendRequestsSections({
  incoming,
  outgoing,
  accepted,
  onAccept,
  onRemove,
  onToggleTrusted,
}) {
  const trustedCount = accepted.filter((f) => f.isTrusted).length;

  return (
    <>
      {incoming.length > 0 && (
        <FriendSection title={`Requests - ${incoming.length}`}>
          {incoming.map((f) => (
            <FriendRow key={f.id} friend={f}>
              <button
                type="button"
                className={styles.acceptButton}
                aria-label={`Accept ${f.displayName}`}
                onClick={() => onAccept(f.id)}
              >
                <Check className={styles.tinyIcon} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.friendIconButton}
                aria-label={`Decline ${f.displayName}`}
                onClick={() => onRemove(f.id, 'incoming')}
              >
                <X className={styles.tinyIcon} aria-hidden="true" />
              </button>
            </FriendRow>
          ))}
        </FriendSection>
      )}

      {outgoing.length > 0 && (
        <FriendSection title={`Pending - ${outgoing.length}`}>
          {outgoing.map((f) => (
            <FriendRow key={f.id} friend={f}>
              <span className={styles.friendMutedText}>Waiting...</span>
              <button
                type="button"
                className={styles.friendIconButton}
                aria-label={`Cancel request to ${f.displayName}`}
                onClick={() => onRemove(f.id, 'outgoing')}
              >
                <X className={styles.tinyIcon} aria-hidden="true" />
              </button>
            </FriendRow>
          ))}
        </FriendSection>
      )}

      {accepted.length > 0 && (
        <div className={styles.trustedSummary}>
          <Shield className={styles.trustedSummaryIcon} aria-hidden="true" />
          <div>
            <strong>
              {trustedCount} trusted contact{trustedCount === 1 ? '' : 's'}
            </strong>
            <span>Trusted friends receive your live location when you tap SOS.</span>
          </div>
        </div>
      )}

      <FriendSection title={`Friends - ${accepted.length}`}>
        {accepted.length === 0 ? (
          <div className={styles.emptyFriendState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              🙋
            </span>
            <strong>No friends yet</strong>
            <span>Add someone by their display name to start chatting.</span>
          </div>
        ) : (
          accepted.map((f) => (
            <AcceptedFriendRow
              key={f.id}
              friend={f}
              onToggle={(v) => onToggleTrusted(f.id, v)}
              onRemove={() => onRemove(f.id, 'accepted')}
            />
          ))
        )}
      </FriendSection>
    </>
  );
}
