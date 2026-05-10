const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const Bookmark = require('../../../models/Bookmark');

// Extract a short title from the first sentence of the AI response.
function autoTitle(text) {
  const first = text.split(/[.!?\n]/)[0].trim();
  return first.length > 80 ? first.slice(0, 77) + '…' : first;
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_bookmarks || !config.features.enable_ai_chat) {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { content } = req.body ?? {};
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'content is required.' });
  }

  await connectDB();
  const userId = req.session.sub;

  const bookmark = await Bookmark.create({
    userId,
    content: content.trim().slice(0, 10000),
    title: autoTitle(content),
    type: 'ai_suggestion',
    tags: ['chat'],
  });

  return res.status(201).json({ bookmark });
});
