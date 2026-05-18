export function toBackgroundImage(image) {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return `url("${image.replace(/"/g, '\\"')}")`;
  return image;
}

export function normalizeLiveArticles(tab, data, { heroStories, storySections, liveSectionTitles, thumbnailFallbacks }) {
  if (!Array.isArray(data?.articles) || data.articles.length === 0) return null;

  const [lead, ...rest] = data.articles;
  if (!lead?.headline) return null;

  const fallbackHero = heroStories[tab];
  const fallbackStories = storySections[tab]?.[0]?.stories || [];
  const stories = rest
    .filter((a) => a?.headline)
    .map((a, i) => ({
      ...a,
      color: fallbackStories[i % fallbackStories.length]?.color
        || thumbnailFallbacks[i % thumbnailFallbacks.length],
    }));

  if (stories.length === 0) return null;

  // Group stories into sections by their top category so filter chips are backed by real content.
  // Stories with no category go into the default section for this tab.
  const defaultTitle = liveSectionTitles[tab] || 'Top Stories';
  const sectionMap = {};
  stories.forEach((story) => {
    const title = story.categories?.[0] || defaultTitle;
    if (!sectionMap[title]) sectionMap[title] = [];
    sectionMap[title].push(story);
  });

  // Always put the default section first
  const orderedTitles = [
    defaultTitle,
    ...Object.keys(sectionMap).filter((t) => t !== defaultTitle),
  ].filter((t) => sectionMap[t]);

  const sections = orderedTitles.map((title) => ({ title, stories: sectionMap[title] }));
  const filters = sections.length > 1 ? ['All', ...orderedTitles] : null;

  return {
    hero: {
      ...lead,
      tag: data.tag || fallbackHero.tag,
      title: lead.headline,
      source: lead.source || fallbackHero.source,
      image: lead.image || fallbackHero.image,
    },
    sections,
    filters,
  };
}
