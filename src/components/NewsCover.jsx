import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/NewsCover.module.css';

const HERO_STORIES = {
  today: {
    tag: 'Top Story',
    title: 'Global Leaders Reach Historic Climate Deal',
    source: 'Daily News',
    description: 'World leaders announced a climate agreement focused on emissions targets, clean energy investment, and shared infrastructure goals.',
    image: 'linear-gradient(160deg, #3a1a00 0%, #8b2500 42%, #c0392b 78%, #e8180c 100%)',
  },
  world: {
    tag: 'World',
    title: 'Diplomats Open New Round of Global Security Talks',
    source: 'World Desk',
    description: 'Delegates are meeting this week to discuss regional security, trade policy, and new diplomatic channels.',
    image: 'linear-gradient(160deg, #1f2f46 0%, #27526f 45%, #3f8ca8 100%)',
  },
  sports: {
    tag: 'Sports Highlight',
    title: 'Underdogs Stun Favorites in Championship Finale',
    source: 'Sports Desk',
    description: 'A late surge changed the final minutes of the championship and gave fans one of the season’s biggest upsets.',
    image: 'linear-gradient(160deg, #10235f 0%, #1d55aa 44%, #4a8dff 100%)',
  },
};

const STORY_SECTIONS = {
  today: [
    {
      title: 'Top Stories',
      stories: [
        {
          source: 'The New York Times',
          headline: 'Tech Giants Face New Antitrust Rules Across EU and US Markets',
          color: 'linear-gradient(135deg, #2c4a7c 0%, #1a2f4f 100%)',
        },
        {
          source: 'Reuters',
          headline: 'Markets Hit Record Highs as Fed Signals Extended Rate Pause',
          color: 'linear-gradient(135deg, #1a4a1a 0%, #0d2e0d 100%)',
        },
        {
          source: 'BBC News',
          headline: 'Space Tourism Takes Off After First Civilian Orbit Mission',
          color: 'linear-gradient(135deg, #4a1a4a 0%, #2e0d2e 100%)',
        },
        {
          source: 'The Guardian',
          headline: 'Breakthrough in Cancer Research Offers New Treatment Hope',
          color: 'linear-gradient(135deg, #7c2c2c 0%, #4f1a1a 100%)',
        },
      ],
    },
    {
      title: 'For You',
      stories: [
        {
          source: 'Wired',
          headline: 'The New AI Models Reshaping How Teams Work and Create',
          color: 'linear-gradient(135deg, #4a3a00 0%, #2e2400 100%)',
        },
        {
          source: 'The Verge',
          headline: 'Display Technology Points to a Brighter Device Future',
          color: 'linear-gradient(135deg, #4a1a00 0%, #2e0d00 100%)',
        },
        {
          source: 'TechCrunch',
          headline: 'Energy Storage Startup Raises New Round for Grid Batteries',
          color: 'linear-gradient(135deg, #1a4a4a 0%, #0d2e2e 100%)',
        },
      ],
    },
    {
      title: 'Following',
      stories: [
        {
          source: 'National Geographic',
          headline: 'Researchers Map New Deep Ocean Ecosystems',
          color: 'linear-gradient(135deg, #1a3a4a 0%, #0d2430 100%)',
        },
        {
          source: 'The Atlantic',
          headline: 'Remote Work Continues to Reshape Downtown Design',
          color: 'linear-gradient(135deg, #3a2a4a 0%, #24182e 100%)',
        },
      ],
    },
  ],
  world: [
    {
      title: 'World Headlines',
      stories: [
        {
          source: 'Associated Press',
          headline: 'Global Leaders Meet for Emergency Economic Summit',
          color: 'linear-gradient(135deg, #2c4a7c 0%, #1a2f4f 100%)',
        },
        {
          source: 'Reuters',
          headline: 'New Trade Agreement Signals Shift in Pacific Region',
          color: 'linear-gradient(135deg, #1a4a4a 0%, #0d2e2e 100%)',
        },
        {
          source: 'BBC News',
          headline: 'European Capitals Prepare for Major Climate Vote',
          color: 'linear-gradient(135deg, #3a2a4a 0%, #24182e 100%)',
        },
      ],
    },
    {
      title: 'Analysis',
      stories: [
        {
          source: 'Foreign Policy',
          headline: 'What the New Energy Corridor Means for Global Markets',
          color: 'linear-gradient(135deg, #4a2c4a 0%, #2e1a2e 100%)',
        },
        {
          source: 'The Economist',
          headline: 'How Demographic Change Is Reshaping Diplomacy',
          color: 'linear-gradient(135deg, #4a2c2c 0%, #2e1a1a 100%)',
        },
      ],
    },
  ],
  sports: [
    {
      title: 'Top Sports News',
      stories: [
        {
          source: 'ESPN',
          headline: 'Championship Finals Deliver a Game Seven Classic',
          color: 'linear-gradient(135deg, #7c2c1a 0%, #4f1a0d 100%)',
        },
        {
          source: 'The Athletic',
          headline: 'Star Athlete Signs Record-Breaking Extension',
          color: 'linear-gradient(135deg, #1a2c7c 0%, #0d1a4f 100%)',
        },
        {
          source: 'Sports Illustrated',
          headline: 'Olympic Hopeful Breaks Record at National Meet',
          color: 'linear-gradient(135deg, #2c7c1a 0%, #1a4f0d 100%)',
        },
        {
          source: 'Yahoo Sports',
          headline: 'Controversial Call Sparks Instant Replay Debate',
          color: 'linear-gradient(135deg, #7c4a1a 0%, #4f2e0d 100%)',
        },
      ],
    },
  ],
};

const TABS = [
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'world', label: 'World', icon: 'circle' },
  { id: 'sports', label: 'Sports', icon: 'diamond' },
];

const TRENDING_SEARCHES = [
  'Climate deal',
  'Tech antitrust',
  'Space tourism',
  'AI models',
  'Electric vehicles',
  'Cancer research',
];

const LIVE_SECTION_TITLES = {
  today: 'Top Stories',
  world: 'World Headlines',
  sports: 'Top Sports News',
};

const THUMBNAIL_FALLBACKS = [
  'linear-gradient(135deg, #2c4a7c 0%, #1a2f4f 100%)',
  'linear-gradient(135deg, #1a4a1a 0%, #0d2e0d 100%)',
  'linear-gradient(135deg, #4a1a4a 0%, #2e0d2e 100%)',
  'linear-gradient(135deg, #7c2c2c 0%, #4f1a1a 100%)',
  'linear-gradient(135deg, #1a4a4a 0%, #0d2e2e 100%)',
];

function toBackgroundImage(image) {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) {
    return `url("${image.replace(/"/g, '\\"')}")`;
  }
  return image;
}

function normalizeLiveArticles(tab, data) {
  if (!Array.isArray(data?.articles) || data.articles.length === 0) return null;

  const [lead, ...rest] = data.articles;
  if (!lead?.headline) return null;

  const fallbackHero = HERO_STORIES[tab];
  const fallbackStories = STORY_SECTIONS[tab]?.[0]?.stories || [];
  const stories = rest
    .filter((article) => article?.headline)
    .map((article, index) => ({
      ...article,
      color: fallbackStories[index % fallbackStories.length]?.color
        || THUMBNAIL_FALLBACKS[index % THUMBNAIL_FALLBACKS.length],
    }));

  if (stories.length === 0) return null;

  return {
    hero: {
      ...lead,
      tag: data.tag || fallbackHero.tag,
      title: lead.headline,
      source: lead.source || fallbackHero.source,
      image: lead.image || fallbackHero.image,
    },
    sections: [
      {
        title: LIVE_SECTION_TITLES[tab] || 'Top Stories',
        stories,
      },
    ],
  };
}

export default function NewsCover() {
  const [activeTab, setActiveTab] = useState('today');
  const [liveContent, setLiveContent] = useState({});
  const [overlay, setOverlay] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [collapsedTabs, setCollapsedTabs] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const previousScrollTop = useRef(0);

  const hero = liveContent[activeTab]?.hero || HERO_STORIES[activeTab];
  const sections = liveContent[activeTab]?.sections || STORY_SECTIONS[activeTab];

  const navTitle = useMemo(() => {
    const active = TABS.find((tab) => tab.id === activeTab);
    return active?.label || 'Today';
  }, [activeTab]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLiveHeadlines() {
      try {
        const response = await fetch(`/api/news/headlines?tab=${activeTab}`, {
          credentials: 'same-origin',
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = await response.json();
        const nextContent = normalizeLiveArticles(activeTab, data);
        if (!nextContent) return;

        setLiveContent((current) => ({
          ...current,
          [activeTab]: nextContent,
        }));
      } catch {
        // Keep the static cover content as the silent fallback.
      }
    }

    loadLiveHeadlines();

    return () => controller.abort();
  }, [activeTab]);

  const handleScroll = (event) => {
    const nextScrollTop = event.currentTarget.scrollTop;
    const isScrollingDown = nextScrollTop > previousScrollTop.current;

    setScrollOffset(nextScrollTop);
    setScrolled(nextScrollTop > 48);
    setCollapsedTabs(nextScrollTop > 40 && isScrollingDown);

    if (!isScrollingDown && nextScrollTop < previousScrollTop.current - 8) {
      setCollapsedTabs(false);
    }

    previousScrollTop.current = nextScrollTop;
  };

  const switchTab = (nextTab) => {
    setActiveTab(nextTab);
    setCollapsedTabs(false);
    previousScrollTop.current = 0;
  };

  return (
    <section className={styles.page} aria-label="Daily News Reader">
      <div className={styles.appShell}>
        <div className={styles.screen}>
          <header className={`${styles.navBar} ${scrolled ? styles.navBarScrolled : ''}`}>
            <button
              className={styles.navButton}
              type="button"
              aria-label="Open menu"
              onClick={() => setOverlay('menu')}
            >
              <span className={styles.menuIcon} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>

            <div className={styles.navTitle}>{navTitle}</div>

            <button
              className={styles.navButton}
              type="button"
              aria-label="Open profile"
              onClick={() => setOverlay('profile')}
            >
              <span className={styles.profileIcon} aria-hidden="true" />
            </button>
          </header>

          <div className={styles.feed} onScroll={handleScroll}>
            <HeroStory
              hero={hero}
              scrollOffset={scrollOffset}
              onOpen={() => setSelectedArticle(hero)}
            />

            <div className={styles.content}>
              {sections.map((section) => (
                <section className={styles.storySection} key={section.title}>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  {section.stories.map((story, index) => (
                    <StoryRow
                      index={index}
                      key={`${section.title}-${story.headline}`}
                      onOpen={() => setSelectedArticle(story)}
                      story={story}
                    />
                  ))}
                </section>
              ))}
            </div>
          </div>

          <TabBar
            activeTab={activeTab}
            collapsed={collapsedTabs}
            onSearch={() => setOverlay('search')}
            onTabChange={switchTab}
          />

          {overlay === 'search' && (
            <SearchOverlay onClose={() => setOverlay(null)} />
          )}
          {overlay === 'menu' && (
            <MenuOverlay onClose={() => setOverlay(null)} />
          )}
          {overlay === 'profile' && (
            <ProfileOverlay onClose={() => setOverlay(null)} />
          )}
          {selectedArticle && (
            <ArticleOverlay
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function HeroStory({ hero, onOpen, scrollOffset }) {
  return (
    <button className={styles.hero} type="button" onClick={onOpen}>
      <div
        className={styles.heroImage}
        style={{
          backgroundImage: toBackgroundImage(hero.image),
          transform: `translateY(${scrollOffset * 0.18}px) scale(1.03)`,
        }}
      >
        <div className={styles.heroTexture} />
      </div>

      <div className={styles.heroOverlay}>
        <div className={styles.heroTag}>{hero.tag}</div>
        <h1 className={styles.heroTitle}>{hero.title}</h1>
        <div className={styles.heroSource}>{hero.source}</div>
      </div>
    </button>
  );
}

function StoryRow({ story, index, onOpen }) {
  const thumbnailBackground = story.image
    ? `url("${story.image.replace(/"/g, '\\"')}")`
    : story.color;

  return (
    <button className={styles.storyRow} type="button" onClick={onOpen}>
      <span
        className={`${styles.thumbnail} ${story.image ? styles.thumbnailImage : ''}`}
        style={{ background: thumbnailBackground }}
        aria-hidden="true"
      >
        {!story.image && <ThumbnailPattern index={index} />}
      </span>

      <span className={styles.storyCopy}>
        <span className={styles.storySource}>{story.source}</span>
        <span className={styles.storyHeadline}>{story.headline}</span>
      </span>
    </button>
  );
}

function ArticleOverlay({ article, onClose }) {
  const image = article.image || article.color;
  const articleText = article.content || article.description || 'More details are developing. Check back later for updates on this story.';
  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    : '';

  return (
    <article className={`${styles.overlay} ${styles.articleOverlay}`}>
      <OverlayHeader title="Story" onClose={onClose} />

      <div className={styles.articleBody}>
        {image && (
          <div
            className={styles.articleImage}
            style={{ backgroundImage: toBackgroundImage(image) }}
            aria-hidden="true"
          />
        )}

        <div className={styles.articleMeta}>
          <span>{article.source || 'Daily News'}</span>
          {published && <span>{published}</span>}
        </div>

        <h1 className={styles.articleTitle}>
          {article.title || article.headline}
        </h1>

        {article.description && (
          <p className={styles.articleDescription}>{article.description}</p>
        )}

        <p className={styles.articleText}>{articleText}</p>
      </div>
    </article>
  );
}

function ThumbnailPattern({ index }) {
  const pattern = index % 4;

  return (
    <svg className={styles.thumbnailSvg} viewBox="0 0 56 56" focusable="false">
      {pattern === 0 && (
        <>
          <circle cx="28" cy="20" r="8" />
          <circle cx="20" cy="35" r="5" />
          <circle cx="36" cy="35" r="5" />
        </>
      )}
      {pattern === 1 && (
        <>
          <rect x="12" y="16" width="32" height="4" rx="2" />
          <rect x="12" y="25" width="24" height="3" rx="1.5" />
          <rect x="12" y="33" width="28" height="3" rx="1.5" />
        </>
      )}
      {pattern === 2 && (
        <>
          <circle cx="28" cy="18" r="7" />
          <rect x="16" y="31" width="24" height="2" rx="1" />
          <rect x="16" y="37" width="18" height="2" rx="1" />
        </>
      )}
      {pattern === 3 && (
        <>
          <rect x="10" y="12" width="36" height="20" rx="3" />
          <rect x="14" y="37" width="28" height="2" rx="1" />
          <rect x="14" y="43" width="20" height="2" rx="1" />
        </>
      )}
    </svg>
  );
}

function TabBar({ activeTab, collapsed, onSearch, onTabChange }) {
  return (
    <nav
      className={`${styles.tabBar} ${collapsed ? styles.tabBarCollapsed : ''}`}
      aria-label="News sections"
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            className={`${styles.tabButton} ${active ? styles.tabButtonActive : ''}`}
            key={tab.id}
            type="button"
            aria-pressed={active}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={`${styles.tabIcon} ${styles[`${tab.icon}Icon`]}`} aria-hidden="true" />
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.activeDot} aria-hidden="true" />
          </button>
        );
      })}

      <button
        className={styles.searchButton}
        type="button"
        aria-label="Search news"
        onClick={onSearch}
      >
        <span className={styles.searchIcon} aria-hidden="true" />
      </button>
    </nav>
  );
}

function SearchOverlay({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.searchHeader}>
        <label className={styles.searchField}>
          <span className={styles.searchIcon} aria-hidden="true" />
          <input autoFocus placeholder="Search News" type="text" />
        </label>
        <button className={styles.cancelButton} type="button" onClick={onClose}>
          Cancel
        </button>
      </div>

      <div className={styles.overlayBody}>
        <h2 className={styles.overlaySectionTitle}>Trending Searches</h2>
        <div className={styles.searchList}>
          {TRENDING_SEARCHES.map((term) => (
            <button className={styles.searchTerm} type="button" key={term}>
              <span>{term}</span>
              <span className={styles.searchIcon} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuOverlay({ onClose }) {
  const items = [
    ['Notifications', '3'],
    ['Saved Stories', null],
    ['Downloaded Issues', null],
    ['Shared with You', '1'],
    ['Settings and Privacy', null],
  ];

  return (
    <div className={`${styles.overlay} ${styles.menuOverlay}`}>
      <OverlayHeader title="Menu" onClose={onClose} />

      <div className={styles.overlayBody}>
        {items.map(([label, badge]) => (
          <button className={styles.menuItem} type="button" key={label}>
            <span className={styles.menuItemIcon} aria-hidden="true" />
            <span>{label}</span>
            {badge && <span className={styles.badge}>{badge}</span>}
          </button>
        ))}
      </div>

      <div className={styles.overlayFooter}>Daily News Reader</div>
    </div>
  );
}

function ProfileOverlay({ onClose }) {
  return (
    <div className={styles.overlay}>
      <OverlayHeader title="Profile" onClose={onClose} />

      <div className={styles.profileBlock}>
        <div className={styles.profileAvatar} aria-hidden="true" />
        <div className={styles.profileName}>John Appleseed</div>
        <div className={styles.profileEmail}>john.appleseed@example.com</div>
      </div>

      <div className={styles.statsGrid}>
        <Stat value="1,247" label="Stories Read" />
        <Stat value="89" label="Saved" />
        <Stat value="24" label="Following" />
      </div>

      <div className={styles.overlayBody}>
        <h2 className={styles.overlaySectionTitle}>Quick Actions</h2>
        {['Reading History', 'Favorites', 'Downloads'].map((label) => (
          <button className={styles.menuItem} type="button" key={label}>
            <span className={styles.menuItemIcon} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OverlayHeader({ title, onClose }) {
  return (
    <div className={styles.overlayHeader}>
      <h2>{title}</h2>
      <button className={styles.closeButton} type="button" aria-label={`Close ${title}`} onClick={onClose}>
        <span aria-hidden="true">x</span>
      </button>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className={styles.stat}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
