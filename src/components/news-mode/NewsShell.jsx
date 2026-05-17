import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../styles/news-mode/newsshell.module.css';
import { TABS, HERO_STORIES, STORY_SECTIONS, LIVE_SECTION_TITLES, THUMBNAIL_FALLBACKS, FEED_FILTERS } from './newsData';
import { normalizeLiveArticles } from '../../utils/newsUtils';
import { extractAccentColor } from '../../utils/colorExtract';
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
  const [accentColor, setAccentColor] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const previousScrollTop = useRef(0);

  const isLoading = loadingTabs[activeTab] !== false;
  const hero = liveContent[activeTab]?.hero || (!isLoading ? HERO_STORIES[activeTab] : null);
  const sections = liveContent[activeTab]?.sections || (!isLoading ? STORY_SECTIONS[activeTab] : []);

  const navTitle = useMemo(() => {
    const active = TABS.find((t) => t.id === activeTab);
    return active?.navLabel || 'For You';
  }, [activeTab]);

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

  useEffect(() => {
    if (!hero?.image) return;
    extractAccentColor(hero.image).then((rgb) => setAccentColor(rgb));
  }, [hero?.image]);

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
    previousScrollTop.current = 0;
  };

  return (
    <section className={styles.page} aria-label="Daily News Reader">
      <div className={styles.appShell}>
        <div className={styles.screen}>

          {accentColor && (
            <div
              className={styles.accentGlow}
              aria-hidden="true"
              style={{ background: `linear-gradient(to bottom, rgba(${accentColor},0.65) 0%, rgba(${accentColor},0.30) 50%, transparent 100%)` }}
            />
          )}

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

            {hero && (
              <HeroStory
                hero={hero}
                scrollOffset={scrollOffset}
                onOpen={() => setSelectedArticle(hero)}
              />
            )}

            <FilterRow
              filters={FEED_FILTERS[activeTab] || ['All']}
              active={activeFilter}
              onSelect={setActiveFilter}
            />

            <div className={styles.content}>
              {sections
                .filter((s) => activeFilter === 'All' || s.title === activeFilter)
                .map((section) => (
                  <StorySection
                    key={section.title}
                    section={section}
                    onOpenStory={setSelectedArticle}
                  />
                ))}
            </div>
          </div>

          <div className={`${styles.bottomBlur} ${atBottom ? styles.bottomBlurHidden : ''}`} aria-hidden="true" />

          <TabBar
            activeTab={activeTab}
            onSearch={() => setOverlay('search')}
            onTabChange={switchTab}
          />

          {overlay === 'search'  && <SearchOverlay  onClose={() => setOverlay(null)} />}
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
