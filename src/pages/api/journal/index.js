const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const JournalEntry = require('../../../models/JournalEntry');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_journal) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;

  // ── GET /api/journal — paginated list of the user's entries ───────────────
  if (req.method === 'GET') {
    const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      JournalEntry
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      JournalEntry.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  // ── POST /api/journal — create a new entry ────────────────────────────────
  if (req.method === 'POST') {
    const { title, content, incidentDate } = req.body ?? {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'content is required.' });
    }
    if (content.length > 50000) {
      return res.status(400).json({ error: 'content exceeds 50,000 character limit.' });
    }

    const entry = await JournalEntry.create({
      userId,
      title: (title || '').slice(0, 200),
      content: content.trim(),
      incidentDate: incidentDate ? new Date(incidentDate) : null,
    });

    return res.status(201).json({ entry });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
