import {
  BookLock,
  ChevronRight,
  Heart,
  LifeBuoy,
  MessageCircle,
  Shield,
  Siren,
} from 'lucide-react';
import OthersJournals from './OthersJournals';
import styles from '../../styles/PrivateModeShell.module.css';

export default function HomePanel({ onNavigate }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

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
          <Mini label="Contacts" value="2" />
          <Mini label="Location" value="Off" />
          <Mini label="Backup" value="0" />
        </div>
      </div>

      <OthersJournals />

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
          <ActionCard
            icon={<Heart />}
            title="A moment for you"
            subtitle="Quotes and breathing"
          />
        </div>
      </div>

      <p className={styles.homeFooter}>You are not alone. Help is one tap away.</p>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className={styles.miniCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
