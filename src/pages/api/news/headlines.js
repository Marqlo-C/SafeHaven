const config = require('../../../config/config');
const { requireAuth } = require('../../../lib/requireAuth');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');

const TAB_TO_QUERY = {
  today: 'news',
  world: 'world',
  sports: 'sports',
};

const TAB_TO_TAG = {
  today: 'Top Story',
  world: 'World',
  sports: 'Sports Highlight',
};

function normalizeArticle(article) {
  const headline = typeof article?.title === 'string' ? article.title.trim() : '';
  if (!headline) return null;

  const body = typeof article?.body === 'string' ? article.body.trim() : '';
  const description = body
    ? `${body.slice(0, 220).trim()}${body.length > 220 ? '...' : ''}`
    : '';

  return {
    source: article?.source?.title || article?.source?.uri || 'Daily News',
    headline,
    description,
    content: body || description,
    image: article?.image || '',
    url: article?.url || '',
    publishedAt: article?.dateTime || article?.dateTimePub || article?.date || '',
  };
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const tab = typeof req.query.tab === 'string' ? req.query.tab : 'today';
  const keyword = TAB_TO_QUERY[tab];

  if (!keyword) {
    return res.status(400).json({ error: 'Unsupported news tab.' });
  }

  if (!config.env.NEWSAPI_AI_KEY) {
    return res.status(503).json({ error: 'Live news is not configured.' });
  }

  const url = new URL('https://eventregistry.org/api/v1/article/getArticles');
  url.searchParams.set('resultType', 'articles');
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('lang', 'eng');
  url.searchParams.set('articlesSortBy', 'date');
  url.searchParams.set('articlesCount', '5');
  url.searchParams.set('apiKey', config.env.NEWSAPI_AI_KEY);

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

const authenticatedHandler = requireAuth(handler);

export default function headlines(req, res) {
  applySecurityHeaders(res);
  return authenticatedHandler(req, res);
}
