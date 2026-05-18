const config = require('../../../config/config');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');

const TAB_TO_TAG = {
  today: 'Top Story',
  world: 'World',
  sports: 'Sports Highlight',
};

// Pinned source domains per tab — EventRegistry accepts domain URIs
const TAB_TO_SOURCES = {
  today: [
    'reuters.com', 'apnews.com', 'bbc.co.uk', 'bbc.com',
    'theguardian.com', 'cnn.com', 'axios.com', 'nytimes.com',
    'washingtonpost.com', 'theatlantic.com', 'politico.com', 'npr.org',
  ],
  world: [
    'reuters.com', 'apnews.com', 'bbc.co.uk', 'bbc.com',
    'theguardian.com', 'aljazeera.com', 'foreignpolicy.com',
    'theatlantic.com', 'axios.com', 'washingtonpost.com',
  ],
  sports: [
    'espn.com', 'theathletic.com', 'si.com', 'bleacherreport.com',
    'cbssports.com', 'nbcsports.com', 'skysports.com', 'theguardian.com',
  ],
};

function extractCategoryLabel(cat) {
  if (!cat) return null;
  if (typeof cat === 'string') return cat;
  if (cat?.label?.eng) return cat.label.eng;
  if (cat?.uri) {
    const parts = cat.uri.split('/');
    return parts[parts.length - 1].replace(/([A-Z])/g, ' $1').trim();
  }
  return null;
}

function normalizeArticle(article) {
  const headline = typeof article?.title === 'string' ? article.title.trim() : '';
  if (!headline) return null;

  const rawBody = typeof article?.body === 'string' ? article.body.trim() : '';
  const body = rawBody
    .replace(/https?:\/\/\S+/g, '')
    .replace(/latest on \w[\s\S]*/gi, '')
    .replace(/read more( stories)?[\s\S]*/gi, '')
    .replace(/also read:?[\s\S]*/gi, '')
    .replace(/see also:?[\s\S]*/gi, '')
    .replace(/[^\S\n]{2,}/g, ' ')
    .trim();
  const description = body
    ? `${body.slice(0, 220).trim()}${body.length > 220 ? '...' : ''}`
    : '';

  const categories = Array.isArray(article?.categories)
    ? article.categories.map(extractCategoryLabel).filter(Boolean)
    : [];

  const authors = Array.isArray(article?.authors)
    ? article.authors.map((a) => a?.name || a).filter(Boolean)
    : [];
  const author = authors[0] || '';

  return {
    source: article?.source?.title || article?.source?.uri || 'Daily News',
    author,
    headline,
    description,
    content: body || description,
    image: article?.image || '',
    url: article?.url || '',
    publishedAt: article?.dateTime || article?.dateTimePub || article?.date || '',
    categories,
    eventUri: article?.eventUri || '',
  };
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const tab = typeof req.query.tab === 'string' ? req.query.tab : 'today';
  const sources = TAB_TO_SOURCES[tab];

  if (!sources) {
    return res.status(400).json({ error: 'Unsupported news tab.' });
  }

  if (!config.env.NEWSAPI_AI_KEY) {
    return res.status(503).json({ error: 'Live news is not configured.' });
  }

  const url = new URL('https://eventregistry.org/api/v1/article/getArticles');
  url.searchParams.set('resultType', 'articles');
  url.searchParams.set('lang', 'eng');
  url.searchParams.set('articlesSortBy', 'date');
  url.searchParams.set('articlesCount', '10');
  url.searchParams.set('apiKey', config.env.NEWSAPI_AI_KEY);
  // Pin to known major sources — EventRegistry accepts repeated sourceUri params
  sources.forEach((s) => url.searchParams.append('sourceUri', s));

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Unable to load live news.' });
    }

    const data = await response.json();
    const articles = Array.isArray(data?.articles?.results)
      ? data.articles.results.map(normalizeArticle).filter(Boolean)
      : [];

    if (articles.length === 0) {
      return res.status(502).json({ error: 'No live news articles available.' });
    }

    return res.status(200).json({
      tab,
      tag: TAB_TO_TAG[tab],
      articles,
    });
  } catch {
    return res.status(502).json({ error: 'Unable to load live news.' });
  }
}

export default function headlines(req, res) {
  applySecurityHeaders(res);
  return handler(req, res);
}
