import styles from '../../styles/news-mode/feedheader.module.css';

function KiwiIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className={styles.kiwiIcon}>
      <circle cx="12" cy="12" r="11.5" fill="#8B6332" />
      <circle cx="12" cy="12" r="9.5" fill="#5C9B35" />
      <line x1="12" y1="12" x2="21.5" y2="12"    stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="12" y1="12" x2="18.72" y2="18.72" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="12" y1="12" x2="12"    y2="21.5"  stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="12" y1="12" x2="5.28"  y2="18.72" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="12" y1="12" x2="2.5"   y2="12"    stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="12" y1="12" x2="5.28"  y2="5.28"  stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="12" y1="12" x2="12"    y2="2.5"   stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="12" y1="12" x2="18.72" y2="5.28"  stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <ellipse cx="18.65" cy="14.76" rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(22.5,18.65,14.76)" />
      <ellipse cx="14.76" cy="18.65" rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(67.5,14.76,18.65)" />
      <ellipse cx="9.24"  cy="18.65" rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(112.5,9.24,18.65)" />
      <ellipse cx="5.35"  cy="14.76" rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(157.5,5.35,14.76)" />
      <ellipse cx="5.35"  cy="9.24"  rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(202.5,5.35,9.24)" />
      <ellipse cx="9.24"  cy="5.35"  rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(247.5,9.24,5.35)" />
      <ellipse cx="14.76" cy="5.35"  rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(292.5,14.76,5.35)" />
      <ellipse cx="18.65" cy="9.24"  rx="1.05" ry="0.55" fill="#1E1005" transform="rotate(337.5,18.65,9.24)" />
      <circle cx="12" cy="12" r="2.3" fill="#F2E8CC" />
    </svg>
  );
}

function SubscriberBadge() {
  return (
    <div className={styles.badgeWrap}>
      <svg width="54" height="54" viewBox="0 0 70 70" fill="none" className={styles.badgeSvg} aria-hidden="true">
        <defs>
          <path id="fh-top" d="M 7,35 A 28,28 0 0,1 63,35" />
          <path id="fh-bot" d="M 7,35 A 28,28 0 0,0 63,35" />
        </defs>
        <text fontSize="7.5" fontWeight="900" style={{fontWeight: 900}} stroke="#1c1c1e" strokeWidth="0.4" paintOrder="stroke fill" fill="#1c1c1e" letterSpacing="1.8" fontFamily="-apple-system,sans-serif">
          <textPath href="#fh-top" startOffset="50%" textAnchor="middle">SUBSCRIBER</textPath>
        </text>
        <text fontSize="7.5" fontWeight="900" style={{fontWeight: 900}} stroke="#1c1c1e" strokeWidth="0.4" paintOrder="stroke fill" fill="#1c1c1e" letterSpacing="4" fontFamily="-apple-system,sans-serif">
          <textPath href="#fh-bot" startOffset="53%" textAnchor="middle">EDITION</textPath>
        </text>
        <text fontSize="7" fontWeight="900" style={{fontWeight: 900}} stroke="#1c1c1e" strokeWidth="0.4" paintOrder="stroke fill" fill="#1c1c1e" textAnchor="middle" x="7" y="37.5" fontFamily="-apple-system,sans-serif">★</text>
        <text fontSize="7" fontWeight="900" style={{fontWeight: 900}} stroke="#1c1c1e" strokeWidth="0.4" paintOrder="stroke fill" fill="#1c1c1e" textAnchor="middle" x="63" y="37.5" fontFamily="-apple-system,sans-serif">★</text>
      </svg>
      <img
        src="/resources/images/logos/news_icon_selected.png"
        alt=""
        className={styles.badgeIcon}
      />
    </div>
  );
}

export default function FeedHeader({ title }) {
  const isToday = title === 'For You';

  if (isToday) {
    return (
      <div className={styles.feedHeader}>
        <div className={styles.feedHeaderRow}>
          <div>
            <p className={styles.feedHeaderEyebrow}>
              <KiwiIcon />{' '}News+
            </p>
            <h1 className={styles.feedHeaderTitle}>Discover</h1>
          </div>
          <SubscriberBadge />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedHeader}>
      <div className={styles.feedHeaderRow}>
        <div>
          <p className={styles.feedHeaderEyebrow}>
            <KiwiIcon />{' '}News+
          </p>
          <h1 className={styles.feedHeaderTitle}>{title}</h1>
        </div>
        <SubscriberBadge />
      </div>
    </div>
  );
}
