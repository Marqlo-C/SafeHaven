const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const Bookmark = require('../../../models/Bookmark');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_bookmarks) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;

  // ── GET /api/bookmarks — paginated list ───────────────────────────────────
  if (req.method === 'GET') {
    const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;
    const type  = req.query.type; // optional filter

    const filter = { userId, ...(type ? { type } : {}) };

    const [bookmarks, total] = await Promise.all([
      Bookmark.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v'),
      Bookmark.countDocuments(filter),
    ]);

    return res.status(200).json({
      bookmarks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  // ── POST /api/bookmarks — create ──────────────────────────────────────────
  if (req.method === 'POST') {
    const { content, title, type, tags } = req.body ?? {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'content is required.' });
    }

    const bookmark = await Bookmark.create({
      userId,
      content: content.trim().slice(0, 10000),
      title: (title || '').slice(0, 200),
      type: ['ai_suggestion', 'resource', 'note'].includes(type) ? type : 'note',
      tags: Array.isArray(tags) ? tags.slice(0, 10).map((t) => String(t).slice(0, 50)) : [],
    });

    return res.status(201).json({ bookmark });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
