const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const appConfig = require('../../../config/config');
const JournalEntry = require('../../../models/JournalEntry');
const { JournalPrivacyFeature } = require('../../../features/journal_privacy_feature');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!appConfig.features.enable_journal) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const session = req.session;
  const userId = session.sub;

  // ── GET /api/journal — paginated list of the user's entries ───────────────
  if (req.method === 'GET') {
    const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const privacyFilter = appConfig.features.enable_journal_privacy
      ? JournalPrivacyFeature.getPrivacyFilter(session) 
      : {};

    const query = { userId, ...privacyFilter };

    const [entries, total] = await Promise.all([
      JournalEntry
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      JournalEntry.countDocuments(query),
    ]);

    return res.status(200).json({
      entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  // ── POST /api/journal — create a new entry ────────────────────────────────
  if (req.method === 'POST') {
    const { title, content, incidentDate, isPrivate, mediaData, mediaType, mediaName } = req.body ?? {};

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
      isPrivate: appConfig.features.enable_journal_privacy ? Boolean(isPrivate) : false,
      mediaData,
      mediaType,
      mediaName,
    });

    return res.status(201).json({ entry });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
