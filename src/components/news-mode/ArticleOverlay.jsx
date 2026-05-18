import { useState } from 'react';
import styles from '../../styles/news-mode/overlays.module.css';
import { toBackgroundImage } from '../../utils/newsUtils';
import { getSourceBrand } from '../../utils/sourceBrands';

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

function SourceLogo({ source, brand, className, fallbackClassName, fallbackStyle }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (brand.domain && LOGO_DEV_TOKEN && !logoFailed) {
    return (
      <img
        src={`https://img.logo.dev/${brand.domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`}
        alt={source}
        className={className}
        onError={() => setLogoFailed(true)}
      />
    );
  }

  return (
    <span className={fallbackClassName} style={fallbackStyle}>
      {source}
    </span>
  );
}

export default function ArticleOverlay({ article, onClose }) {
  const image = article.image || article.color;
  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

  const paragraphs = (article.content || article.description || 'More details are developing. Check back later for updates on this story.')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const brand = getSourceBrand(article.source);

  return (
    <article className={styles.articleView}>
      <div className={styles.articleNavBar}>
        <button className={styles.articleNavBack} type="button" aria-label="Go back" onClick={onClose}>
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 1L1 9l8 8" />
          </svg>
        </button>

        {article.source && (
          <SourceLogo
            source={article.source}
            brand={brand}
            className={styles.articleNavLogo}
            fallbackClassName={styles.articleNavSource}
            fallbackStyle={{ color: brand.color || '#1c1c1e' }}
          />
        )}

        <div className={styles.articleNavSpacer} aria-hidden="true" />
      </div>

      <div className={styles.articleScroll}>
        {image && (
          <div
            className={styles.articleImage}
            style={{ backgroundImage: toBackgroundImage(image) }}
            aria-hidden="true"
          />
        )}

        <div className={styles.articleBody}>
          {article.source && (
            <p className={styles.articleBodySource} style={{ color: brand.color || '#FF3B30' }}>
              {article.source}
            </p>
          )}
          <h1 className={styles.articleBodyTitle}>{article.title || article.headline}</h1>
          {published && <p className={styles.articleBodyDate}>{published}</p>}
          <hr className={styles.articleDivider} />
          {paragraphs.map((para, i) => (
            <p key={i} className={styles.articleBodyText}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
