import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../../styles/news-mode/overlays.module.css';
import { toBackgroundImage } from '../../utils/newsUtils';

export default function ArticleOverlay({ article, onClose }) {
  const heroRef = useRef(null);
  const [heroH, setHeroH] = useState(140);
  const [glassScrollable, setGlassScrollable] = useState(false);

  useEffect(() => {
    if (heroRef.current) setHeroH(heroRef.current.offsetHeight);
    setGlassScrollable(false);
  }, [article]);

  const handleOuterScroll = useCallback(() => {
    if (!heroRef.current) return;
    const { top } = heroRef.current.getBoundingClientRect();
    // safe-area-inset-top is max ~59px on any iPhone; + 62px offset = ~121px
    setGlassScrollable(top <= 130);
  }, []);

  const image = article.image || article.color;
  const articleText = article.content || article.description || 'More details are developing. Check back later for updates on this story.';
  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

  const stickyTop = `calc(env(safe-area-inset-top) + 62px)`;
  const moduleTop = `calc(env(safe-area-inset-top) + 62px + ${heroH}px)`;
  const moduleH   = `calc(100dvh - env(safe-area-inset-top) - 62px - ${heroH}px - env(safe-area-inset-bottom) - 24px)`;

  return (
    <article className={styles.articleView}>
      {image && (
        <div
          className={styles.articleHeroBg}
          style={{ backgroundImage: toBackgroundImage(image) }}
          aria-hidden="true"
        />
      )}

      <div className={styles.articleHeroFade} aria-hidden="true" />

      <button className={styles.articleBackBtn} type="button" aria-label="Go back" onClick={onClose}>
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 1L1 9l8 8" />
        </svg>
      </button>

      <div className={styles.articleScroll} onScroll={handleOuterScroll}>
        <div className={styles.articleSpacer} aria-hidden="true" />

        <div
          className={styles.articleHeroText}
          ref={heroRef}
          style={{ top: stickyTop }}
        >
          {article.source && <p className={styles.articleHeroSource}>{article.source}</p>}
          <h1 className={styles.articleHeroTitle}>{article.title || article.headline}</h1>
          {published && <p className={styles.articleHeroDate}>{published}</p>}
        </div>

        <div
          className={styles.articleGlassModule}
          style={{ top: moduleTop, height: moduleH, overflowY: glassScrollable ? 'auto' : 'hidden' }}
        >
          {article.description && article.content && (
            <p className={styles.articleGlassLead}>{article.description}</p>
          )}
          <p className={styles.articleGlassBody}>{articleText}</p>
        </div>

        <div className={styles.articleScrollPad} aria-hidden="true" />
      </div>
    </article>
  );
}
