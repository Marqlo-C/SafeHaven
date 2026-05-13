import { useEffect, useMemo, useState } from 'react';
import { Heart, Quote } from 'lucide-react';
import styles from '../../styles/private-mode/home.module.css';

const FALLBACK_JOURNALS = [
  {
    id: 'shared-1',
    handle: 'QuietRiver',
    emoji: '🌿',
    text: 'Today I packed a small bag and hid it at my sister\'s. It felt like the first real breath I have taken in months.',
    when: '2 hours ago',
    hearts: 24,
    likedByMe: false,
  },
  {
    id: 'shared-2',
    handle: 'MorningLark',
    emoji: '🌅',
    text: 'I told my doctor what was happening. She believed me. I did not realize how much I needed someone to believe me.',
    when: '5 hours ago',
    hearts: 41,
    likedByMe: false,
  },
  {
    id: 'shared-3',
    handle: 'PaperKite',
    emoji: '🪁',
    text: 'One year out today. I painted my apartment the color I always wanted. It is a soft yellow.',
    when: 'Yesterday',
    hearts: 112,
    likedByMe: false,
  },
  {
    id: 'shared-4',
    handle: 'SilverPine',
    emoji: '🌲',
    text: 'I do not know if I am ready to leave. But I am writing it down so I remember why I want to.',
    when: 'Yesterday',
    hearts: 18,
    likedByMe: false,
  },
  {
    id: 'shared-5',
    handle: 'BlueHarbor',
    emoji: '⚓',
    text: 'The shelter let me bring my dog. I cried in the parking lot for an hour.',
    when: '2 days ago',
    hearts: 67,
    likedByMe: false,
  },
  {
    id: 'shared-6',
    handle: 'EmberMoth',
    emoji: '🪺',
    text: 'Court was today. My voice did not shake. I am proud of me.',
    when: '3 days ago',
    hearts: 89,
    likedByMe: false,
  },
];

const REAL_ID_RE = /^[0-9a-fA-F]{24}$/;
const LIKED_KEY = 'sh_liked_journals';

function readLikedCache() {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '{}'); } catch { return {}; }
}

function writeLikedCache(id, liked) {
  try {
    const curr = readLikedCache();
    if (liked) curr[id] = true; else delete curr[id];
    localStorage.setItem(LIKED_KEY, JSON.stringify(curr));
  } catch { /* private browsing may block */ }
}

function applyLikedCache(journals) {
  const cache = readLikedCache();
  return journals.map((j) => ({ ...j, likedByMe: cache[j.id] ?? j.likedByMe }));
}

export default function OthersJournals() {
  const [journals, setJournals] = useState(() => applyLikedCache(FALLBACK_JOURNALS));
  const [activeIndex, setActiveIndex] = useState(4);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSharedJournals() {
      try {
        const response = await fetch('/api/journal/community?limit=6');
        if (!response.ok) return;
        const data = await response.json();
        const incoming = Array.isArray(data.entries) ? data.entries : [];
        if (!mounted || incoming.length === 0) return;

        const normalized = incoming.map(normalizeJournal).filter(Boolean);
        // Server is authoritative for likedByMe on real entries; also sync cache
        const withCache = normalized.map((j) => {
          if (j.likedByMe) writeLikedCache(j.id, true);
          return { ...j, likedByMe: j.likedByMe || (readLikedCache()[j.id] ?? false) };
        });
        setJournals(withCache);
        setActiveIndex(0);
      } catch {
        // Keep the seeded examples until community entries exist.
      }
    }

    loadSharedJournals();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (paused || journals.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % journals.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [journals.length, paused]);

  const active = journals[activeIndex] || FALLBACK_JOURNALS[0];
  const positionLabel = useMemo(
    () => `${activeIndex + 1} / ${journals.length}`,
    [activeIndex, journals.length]
  );

  const handleCardClick = () => {
    setActiveIndex((i) => (i + 1) % journals.length);
  };

  const handleHeart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const entry = journals[activeIndex];
    const nowLiked = !entry.likedByMe;

    // Optimistic update + cache
    writeLikedCache(entry.id, nowLiked);
    setJournals((prev) =>
      prev.map((j) =>
        j.id === entry.id
          ? { ...j, hearts: nowLiked ? j.hearts + 1 : Math.max(0, j.hearts - 1), likedByMe: nowLiked }
          : j
      )
    );

    if (!REAL_ID_RE.test(entry.id)) return;

    try {
      const res = await fetch(`/api/journal/${entry.id}/heart`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      writeLikedCache(entry.id, data.liked);
      setJournals((prev) =>
        prev.map((j) => (j.id === entry.id ? { ...j, hearts: data.hearts, likedByMe: data.liked } : j))
      );
    } catch {
      // Revert
      writeLikedCache(entry.id, !nowLiked);
      setJournals((prev) =>
        prev.map((j) =>
          j.id === entry.id
            ? { ...j, hearts: nowLiked ? Math.max(0, j.hearts - 1) : j.hearts + 1, likedByMe: !nowLiked }
            : j
        )
      );
    }
  };

  return (
    <section
      className={styles.othersJournals}
      aria-label="Others' journals"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.othersHeader}>
        <span>Others&apos; Journals</span>
        <span>{positionLabel}</span>
      </div>

      <div
        className={styles.othersCard}
        aria-live="polite"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <Quote className={styles.othersQuoteIcon} aria-hidden="true" />
        <div key={active.id} className={styles.othersSlide}>
          <div className={styles.othersPerson}>
            <img
              src={getAvatarUrl(active.handle)}
              alt={`${active.handle} avatar`}
              width={32}
              height={32}
              className={styles.othersAvatarImage}
            />
            <div>
              <strong>{active.handle}</strong>
              <span>Anonymous - {active.when}</span>
            </div>
          </div>

          <p>&quot;{active.text}&quot;</p>

          {/* Stop-propagation wrapper keeps heart click from advancing the card */}
          <div onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`${styles.othersStrength} ${active.likedByMe ? styles.othersStrengthLiked : ''}`}
            onClick={handleHeart}
            aria-label={active.likedByMe ? 'Unlike' : 'Send strength'}
            aria-pressed={active.likedByMe}
          >
            <Heart
              className={styles.tinyIcon}
              aria-hidden="true"
              style={{ fill: active.likedByMe ? 'currentColor' : 'none' }}
            />
            <span>{active.hearts} sent strength</span>
          </button>
          </div>
        </div>

        <div className={styles.othersDots} aria-label="Shared journal pages">
          {journals.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              className={index === activeIndex ? styles.othersDotActive : ''}
              aria-label={`Show shared journal ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function getAvatarUrl(handle) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(handle)}&radius=50&backgroundType=gradientLinear`;
}

function normalizeJournal(entry) {
  const content = entry.text || entry.excerpt || entry.summary || entry.content || entry.note;
  if (!content || typeof content !== 'string') return null;

  return {
    id: String(entry.id || entry._id || Date.now()),
    handle: String(entry.handle || entry.displayName || 'Anonymous'),
    emoji: String(entry.emoji || '•'),
    text: content.length > 165 ? `${content.slice(0, 162)}...` : content,
    when: entry.when || formatWhen(entry.createdAt),
    hearts: Number(entry.hearts || entry.strength || entry.reactions || 0),
    likedByMe: Boolean(entry.likedByMe),
  };
}

function formatWhen(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
