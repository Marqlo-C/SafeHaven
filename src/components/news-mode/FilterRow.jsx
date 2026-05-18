import styles from '../../styles/news-mode/filterrow.module.css';

const FILTER_ICONS = {
  All: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  ),
  Tech: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="4" width="12" height="8" rx="2" />
      <path d="M5 4V3M8 4V2M11 4V3" />
      <path d="M5 12v1M8 12v2M11 12v1" />
    </svg>
  ),
  Science: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2v5L2.5 13.5a.8.8 0 0 0 .7 1.2h9.6a.8.8 0 0 0 .7-1.2L10 7V2" />
      <path d="M5.5 2h5" />
      <circle cx="6.5" cy="11" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  Economy: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12l3.5-4 3 2.5L12 5" />
      <path d="M10 5h2v2" />
    </svg>
  ),
  Politics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M1 14h14" />
      <path d="M2 14V8" />
      <path d="M14 14V8" />
      <path d="M5 14v-4h6v4" />
      <path d="M8 2L1 8h14L8 2z" />
    </svg>
  ),
  Trade: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 5h10M9 2l3 3-3 3" />
      <path d="M14 11H4M7 8l-3 3 3 3" />
    </svg>
  ),
  Security: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.5L2 4v4c0 3.5 2.5 5.8 6 6.5 3.5-.7 6-3 6-6.5V4L8 1.5z" />
      <path d="M5.5 8l1.8 1.8L10.5 6" />
    </svg>
  ),
  NBA: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12" />
      <path d="M8 2c-2 2-2 4 0 6s2 4 0 6" />
      <path d="M8 2c2 2 2 4 0 6s-2 4 0 6" />
    </svg>
  ),
  Soccer: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <polygon points="8,5 10.5,7 9.5,10 6.5,10 5.5,7" />
    </svg>
  ),
  Olympics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="4.5" cy="9" r="2.5" />
      <circle cx="8" cy="7" r="2.5" />
      <circle cx="11.5" cy="9" r="2.5" />
    </svg>
  ),
};

export default function FilterRow({ filters, active, onSelect }) {
  return (
    <div className={styles.filterRow} role="toolbar" aria-label="Filter stories">
<div className={styles.filterScroll}>
        {filters.map((f) => (
          <button
            key={f}
            className={`${styles.chip} ${active === f ? styles.chipActive : ''}`}
            type="button"
            onClick={() => onSelect(f)}
          >
            <span className={styles.chipIcon}>{FILTER_ICONS[f] || FILTER_ICONS.All}</span>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
