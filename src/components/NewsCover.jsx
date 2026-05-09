import { useMemo, useRef, useState } from 'react';
import styles from '../styles/NewsCover.module.css';

const HERO_STORIES = {
  today: {
    tag: 'Top Story',
    title: 'Global Leaders Reach Historic Climate Deal',
    source: 'Daily News',
    image: 'linear-gradient(160deg, #3a1a00 0%, #8b2500 42%, #c0392b 78%, #e8180c 100%)',
  },
  newsplus: {
    tag: 'News+',
    title: 'The Future of Fashion Turns Toward Sustainable Design',
    source: 'Magazine Desk',
    image: 'linear-gradient(160deg, #332040 0%, #5a2c68 45%, #8e4a8e 100%)',
  },
  sports: {
    tag: 'Sports Highlight',
    title: 'Underdogs Stun Favorites in Championship Finale',
    source: 'Sports Desk',
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
  newsplus: [
    {
      title: 'Featured Stories',
      stories: [
        {
          source: 'News+',
          headline: 'Inside the Restaurants Reimagining the Tasting Menu',
          color: 'linear-gradient(135deg, #4a3a2c 0%, #2e241a 100%)',
        },
        {
          source: 'News+',
          headline: 'How Meditation Apps Changed the Wellness Business',
          color: 'linear-gradient(135deg, #2c4a3a 0%, #1a2e24 100%)',
        },
        {
          source: 'News+',
          headline: 'Travel Guide: Hidden Gems Across Southeast Asia',
          color: 'linear-gradient(135deg, #2c2c4a 0%, #1a1a2e 100%)',
        },
      ],
    },
    {
      title: 'Recommended',
      stories: [
        {
          source: 'Design Weekly',
          headline: 'The New Materials Making Sustainable Fashion Practical',
          color: 'linear-gradient(135deg, #4a2c4a 0%, #2e1a2e 100%)',
        },
        {
          source: 'Culture Review',
          headline: 'A New Generation of Filmmakers Finds Its Voice',
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
  { id: 'newsplus', label: 'News+', icon: 'circle' },
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

export default function NewsCover() {
  const [activeTab, setActiveTab] = useState('today');
  const [overlay, setOverlay] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [collapsedTabs, setCollapsedTabs] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const previousScrollTop = useRef(0);

  const hero = HERO_STORIES[activeTab];
  const sections = STORY_SECTIONS[activeTab];

  const navTitle = useMemo(() => {
    const active = TABS.find((tab) => tab.id === activeTab);
    return active?.label || 'Today';
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
            <HeroStory hero={hero} scrollOffset={scrollOffset} />

            <div className={styles.content}>
              {sections.map((section) => (
                <section className={styles.storySection} key={section.title}>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  {section.stories.map((story, index) => (
                    <StoryRow
                      index={index}
                      key={`${section.title}-${story.headline}`}
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
        </div>
      </div>
    </section>
  );
}

function HeroStory({ hero, scrollOffset }) {
  return (
    <article className={styles.hero}>
      <div
        className={styles.heroImage}
        style={{
          background: hero.image,
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
    </article>
  );
}

function StoryRow({ story, index }) {
  return (
    <button className={styles.storyRow} type="button">
      <span
        className={styles.thumbnail}
        style={{ background: story.color }}
        aria-hidden="true"
      >
        <ThumbnailPattern index={index} />
      </span>

      <span className={styles.storyCopy}>
        <span className={styles.storySource}>{story.source}</span>
        <span className={styles.storyHeadline}>{story.headline}</span>
      </span>
    </button>
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
