import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../styles/news-mode/newsshell.module.css';
import { TABS, HERO_STORIES, STORY_SECTIONS, LIVE_SECTION_TITLES, THUMBNAIL_FALLBACKS, FEED_FILTERS, FILTER_KEYWORDS } from './newsData';
import { normalizeLiveArticles } from '../../utils/newsUtils';
import FeedHeader from './FeedHeader';
import HeroStory from './HeroStory';
import StorySection from './StorySection';
import TabBar from './TabBar';
import ArticleOverlay from './ArticleOverlay';
import SearchOverlay from './SearchOverlay';
import MenuOverlay from './MenuOverlay';
import ProfileOverlay from './ProfileOverlay';
import FilterRow from './FilterRow';

export default function NewsShell() {
  const [activeTab, setActiveTab] = useState('today');
  const [liveContent, setLiveContent] = useState({});
  const [loadingTabs, setLoadingTabs] = useState({ today: true, world: true, sports: true });
  const [overlay, setOverlay] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [atBottom, setAtBottom] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const previousScrollTop = useRef(0);

  const isLoading = loadingTabs[activeTab] !== false;
  const hero = liveContent[activeTab]?.hero || (!isLoading ? HERO_STORIES[activeTab] : null);
  const sections = liveContent[activeTab]?.sections || (!isLoading ? STORY_SECTIONS[activeTab] : []);
  const filters = FEED_FILTERS[activeTab] || ['All'];

  const navTitle = useMemo(() => {
    const active = TABS.find((t) => t.id === activeTab);
    return active?.navLabel || 'For You';
  }, [activeTab]);

  const allArticles = useMemo(() => {
    return TABS.flatMap((t) => {
      const tabHero = liveContent[t.id]?.hero || HERO_STORIES[t.id];
      const tabSections = liveContent[t.id]?.sections || STORY_SECTIONS[t.id] || [];
      const stories = tabSections.flatMap((s) => s.stories || []);
      return [tabHero, ...stories].filter(Boolean);
    });
  }, [liveContent]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTab(tab) {
      try {
        const res = await fetch(`/api/news/headlines?tab=${tab}`, {
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (!res.ok) {
          setLoadingTabs((t) => ({ ...t, [tab]: false }));
          return;
        }
        const data = await res.json();
        const next = normalizeLiveArticles(tab, data, {
          heroStories: HERO_STORIES,
          storySections: STORY_SECTIONS,
          liveSectionTitles: LIVE_SECTION_TITLES,
          thumbnailFallbacks: THUMBNAIL_FALLBACKS,
        });
        setLiveContent((c) => ({ ...c, [tab]: next || c[tab] }));
        setLoadingTabs((t) => ({ ...t, [tab]: false }));
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setLoadingTabs((t) => ({ ...t, [tab]: false }));
        }
      }
    }

    TABS.forEach((t) => fetchTab(t.id));
    return () => controller.abort();
  }, []);


  const handleScroll = (e) => {
    const el = e.currentTarget;
    const next = el.scrollTop;
    setScrollOffset(next);
    setScrolled(next > 48);
    setAtBottom(next + el.clientHeight >= el.scrollHeight - 24);
    previousScrollTop.current = next;
  };

  const switchTab = (id) => {
    setActiveTab(id);
    setActiveFilter('All');
    setSelectedArticle(null);
    setOverlay(null);
    previousScrollTop.current = 0;
  };

  return (
    <section className={styles.page} aria-label="Daily News Reader">
      <div className={styles.appShell}>
        <div className={styles.screen}>

<header className={styles.navBar}>
            <button className={styles.navButton} type="button" aria-label="Open menu" onClick={() => setOverlay('menu')}>
              <span className={styles.menuIcon} aria-hidden="true">
                <span /><span /><span />
              </span>
            </button>

<button className={styles.navButton} type="button" aria-label="Open profile" onClick={() => setOverlay('profile')}>
              <span className={styles.profileIcon} aria-hidden="true" />
            </button>
          </header>

          <div className={styles.feed} onScroll={handleScroll}>
            <FeedHeader title={navTitle} />

            <FilterRow
              filters={filters}
              active={activeFilter}
              onSelect={setActiveFilter}
            />

            {activeTab === 'today' && (
              <div className={styles.forYouHeader}>
                <p className={styles.forYouTitle}>For You</p>
              </div>
            )}

            {hero && (
              <HeroStory
                hero={hero}
                scrollOffset={scrollOffset}
                onOpen={() => setSelectedArticle(hero)}
              />
            )}

            <div className={styles.content}>
              {(() => {
                if (activeFilter === 'All') {
                  return sections.map((section) => (
                    <StorySection key={section.title} section={section} onOpenStory={setSelectedArticle} />
                  ));
                }
                const keywords = FILTER_KEYWORDS[activeTab]?.[activeFilter] || [];
                const matched = sections
                  .flatMap((s) => s.stories)
                  .filter((story) => {
                    const text = ((story.headline || story.title || '') + ' ' + (story.description || '')).toLowerCase();
                    return keywords.some((kw) => text.includes(kw));
                  });
                if (matched.length === 0) {
                  return (
                    <div className={styles.emptyFilter}>
                      <p>No {activeFilter} stories right now.</p>
                      <p>Check back soon or try another topic.</p>
                    </div>
                  );
                }
                return (
                  <StorySection
                    key={activeFilter}
                    section={{ title: activeFilter, stories: matched }}
                    onOpenStory={setSelectedArticle}
                  />
                );
              })()}
            </div>
          </div>

          <div className={`${styles.bottomBlur} ${atBottom ? styles.bottomBlurHidden : ''}`} aria-hidden="true" />

          <TabBar
            activeTab={activeTab}
            onSearch={() => setOverlay('search')}
            onTabChange={switchTab}
          />

          {overlay === 'search'  && <SearchOverlay  onClose={() => setOverlay(null)} articles={allArticles} onOpenArticle={(a) => { setSelectedArticle(a); setOverlay(null); }} />}
          {overlay === 'menu'    && <MenuOverlay    onClose={() => setOverlay(null)} />}
          {overlay === 'profile' && <ProfileOverlay onClose={() => setOverlay(null)} />}
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
