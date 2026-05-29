/**
 * HomePanel — Private mode home dashboard.
 *
 * Displays personalized sanctuary features:
 *  - Time-based greeting
 *  - Quick action buttons (Chat, SOS, Journal, Aid, Bookmarks)
 *  - Daily moment/affirmation
 *  - Friend count and journal entries
 *  - Live location tracking toggle
 */

import { useEffect, useState } from 'react';
import {
  BookLock,
  ChevronRight,
  LifeBuoy,
  MessageCircle,
  Shield,
  Siren,
} from 'lucide-react';
import OthersJournals from './OthersJournals';
import MomentForYou from './MomentForYou';
import styles from '../../styles/private-mode/home.module.css';

export default function HomePanel({ onNavigate, active, onBackToApp, appName, isWatching, startLiveLocation, stopLiveLocation }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const [friendCount, setFriendCount] = useState(null);
  const [journalCount, setJournalCount] = useState(null);

  /**
   * handleLocationToggle - Toggles live location tracking on/off.
   * Calls parent component's startLiveLocation or stopLiveLocation callbacks.
   */
  const handleLocationToggle = () => {
    if (isWatching) {
      stopLiveLocation();
    } else {
      startLiveLocation();
    }
  };

  useEffect(() => {
    if (!active) return;
    fetch('/api/journal?limit=1')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setJournalCount(data.pagination?.total ?? 0); })
      .catch(() => {});
  }, [active]);

  useEffect(() => {
    if (!active) return;
    fetch('/api/friends')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const accepted = (data.friends || []).filter((f) => f.status === 'accepted').length;
        setFriendCount(accepted);
      })
      .catch(() => {});
  }, [active]);

  return (
    <div className={styles.homePanel}>
      <div className={styles.homeIntro}>
        <div className={styles.homeGreeting}>{greeting}</div>
        <h1>You&apos;re safe here.</h1>
        <p>Take a breath. Everything in this space is private.</p>
      </div>

      <button type="button" className={styles.homeSosCard} onClick={() => onNavigate('sos')}>
        <span className={styles.homeSosIcon} aria-hidden="true">
          <Siren />
        </span>
        <span className={styles.homeSosCopy}>
          <strong>Send an SOS</strong>
          <span>Alert your trusted contacts in one tap</span>
        </span>
        <ChevronRight className={styles.homeChevron} aria-hidden="true" />
      </button>

      <div className={styles.setupCard}>
        <div className={styles.setupHeader}>
          <Shield className={styles.smallIcon} aria-hidden="true" />
          <span>Your safety setup</span>
        </div>
        <div className={styles.miniGrid}>
          <Mini label="Contacts" value={friendCount === null ? '—' : String(friendCount)} />
          <LocationMini on={isWatching} onToggle={handleLocationToggle} />
          <Mini label="Backup" value={journalCount === null ? '—' : String(journalCount)} />
        </div>
      </div>

      <OthersJournals isActive={active} />

      <div>
        <div className={styles.actionHeading}>Quick actions</div>
        <div className={styles.actionGrid}>
          <ActionCard
            icon={<MessageCircle />}
            title="Talk to an advocate"
            subtitle="Available now"
            onClick={() => onNavigate('chat')}
          />
          <ActionCard
            icon={<BookLock />}
            title="Add to journal"
            subtitle="Save evidence"
            onClick={() => onNavigate('journal')}
          />
          <ActionCard
            icon={<LifeBuoy />}
            title="Find help nearby"
            subtitle="Shelters and aid"
            onClick={() => onNavigate('aid')}
          />
          <MomentForYou />
        </div>
      </div>

      <p className={styles.homeFooter}>You are not alone. Help is one tap away.</p>

      {onBackToApp && (
        <button type="button" className={styles.backToAppBtn} onClick={onBackToApp}>
          ← Back to {appName || 'App'}
        </button>
      )}
    </div>
  );
}

function Mini({ label, value, on }) {
  return (
    <div className={styles.miniCard}>
      <span>{label}</span>
      <strong className={on ? styles.miniValueOn : undefined}>{value}</strong>
    </div>
  );
}

function LocationMini({ on, onToggle }) {
  return (
    <button
      type="button"
      className={styles.miniCardBtn}
      onClick={onToggle}
      aria-label={on ? 'Location sharing on' : 'Enable location sharing'}
      aria-pressed={on}
    >
      <span>Location</span>
      <div className={styles.miniToggleRow}>
        <div className={`${styles.miniToggle} ${on ? styles.miniToggleOn : ''}`} aria-hidden="true">
          <span className={styles.miniToggleThumb} />
          <span className={`${styles.miniToggleText} ${on ? styles.miniToggleTextOn : ''}`}>{on ? 'On' : 'Off'}</span>
        </div>
      </div>
    </button>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button type="button" className={styles.actionCard} onClick={onClick}>
      <span className={styles.actionIcon} aria-hidden="true">{icon}</span>
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </button>
  );
}
