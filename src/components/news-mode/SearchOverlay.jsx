import { useState } from 'react';
import styles from '../../styles/news-mode/overlays.module.css';
import { TRENDING_SEARCHES } from './newsData';
import { getSourceBrand } from '../../utils/sourceBrands';

export default function SearchOverlay({ onClose, articles = [], onOpenArticle }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const results = q
    ? articles.filter((a) => {
        const text = [
          a.headline || a.title || '',
          a.source || '',
          a.description || '',
        ].join(' ').toLowerCase();
        return text.includes(q);
      })
    : [];

  function handleSelect(article) {
    onOpenArticle(article);
    onClose();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.searchHeader}>
        <label className={styles.searchField}>
          <span className={styles.searchIcon} aria-hidden="true" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            placeholder="Search News"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button className={styles.cancelButton} type="button" onClick={onClose}>
          Cancel
        </button>
      </div>

      <div className={styles.overlayBody}>
        {q ? (
          results.length > 0 ? (
            <>
              <h2 className={styles.overlaySectionTitle}>
                {results.length} Result{results.length !== 1 ? 's' : ''}
              </h2>
              <div className={styles.searchList}>
                {results.map((article, i) => {
                  const brand = getSourceBrand(article.source);
                  const title = article.headline || article.title || '';
                  return (
                    <button
                      key={i}
                      className={styles.searchResult}
                      type="button"
                      onClick={() => handleSelect(article)}
                    >
                      <span
                        className={styles.searchResultSource}
                        style={brand.color ? { color: brand.color } : undefined}
                      >
                        {article.source}
                      </span>
                      <span className={styles.searchResultTitle}>{title}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className={styles.searchEmpty}>No results for &ldquo;{query}&rdquo;</p>
          )
        ) : (
          <>
            <h2 className={styles.overlaySectionTitle}>Trending Searches</h2>
            <div className={styles.searchList}>
              {TRENDING_SEARCHES.map((term) => (
                <button
                  className={styles.searchTerm}
                  type="button"
                  key={term}
                  onClick={() => setQuery(term)}
                >
                  <span>{term}</span>
                  <span className={styles.searchIcon} aria-hidden="true" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
