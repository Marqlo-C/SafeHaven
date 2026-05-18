import { useState } from 'react';
import styles from '../../styles/news-mode/storysection.module.css';
import { toBackgroundImage } from '../../utils/newsUtils';
import { getSourceBrand } from '../../utils/sourceBrands';

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

function SourceWordmark({ source }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const brand = getSourceBrand(source);
  return (
    <span className={styles.cardSourceRow}>
      {brand.domain && LOGO_DEV_TOKEN && !logoFailed && (
        <img
          src={`https://img.logo.dev/${brand.domain}?token=${LOGO_DEV_TOKEN}&size=64&format=png`}
          alt=""
          aria-hidden="true"
          className={styles.cardSourceIcon}
          onError={() => setLogoFailed(true)}
        />
      )}
      <span className={styles.cardSource} style={brand.color ? { color: brand.color } : undefined}>
        {source}
      </span>
    </span>
  );
}

function StoryCard({ story, onOpen }) {
  const bg = story.image ? toBackgroundImage(story.image) : story.color;
  return (
    <button className={styles.storyCard} type="button" onClick={onOpen}>
      <span className={styles.cardImage} style={{ background: bg }} aria-hidden="true" />
      <span className={styles.cardBody}>
        <span className={styles.newsPlusBar}>
          <span className={styles.newsPlus}>News+</span>
        </span>
        <span className={styles.cardMeta}>
          <SourceWordmark source={story.source} />
          {story.author && <>
            <span className={styles.cardMetaDot}>·</span>
            <span className={styles.cardAuthor}>{story.author}</span>
          </>}
        </span>
        <span className={styles.cardHeadline}>{story.headline}</span>
        <span className={styles.dots} aria-hidden="true">···</span>
      </span>
    </button>
  );
}

export default function StorySection({ section, onOpenStory }) {
  return (
    <section className={styles.storySection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <button className={styles.seeAllBtn} type="button">See All</button>
      </div>

      {section.stories.map((story) => (
        <StoryCard
          key={story.headline}
          story={story}
          onOpen={() => onOpenStory(story)}
        />
      ))}
    </section>
  );
}
