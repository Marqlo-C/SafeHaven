const mongoose = require('mongoose');
const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const JournalEntry = require('../../../models/JournalEntry');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || '6', 10)));
  const userId = req.session.sub;

  await connectDB();

  const entries = await JournalEntry.aggregate([
    {
      $match: {
        isPrivate: false,
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
        $or: [{ mediaData: null }, { mediaData: { $exists: false } }],
      },
    },
    { $sample: { size: limit } },
    { $project: { content: 1, createdAt: 1, hearts: 1, likedBy: 1, userId: 1 } },
  ]);

  await JournalEntry.populate(entries, { path: 'userId', select: 'anonymousDisplayName' });

  const normalized = entries.map((entry) => ({
    id: String(entry._id),
    handle: entry.userId?.anonymousDisplayName || 'Anonymous',
    content: entry.content.length > 165 ? `${entry.content.slice(0, 162)}...` : entry.content,
    createdAt: entry.createdAt,
    hearts: entry.hearts ?? 0,
    likedByMe: (entry.likedBy || []).some((id) => String(id) === userId),
  }));

  return res.status(200).json({ entries: normalized });
});
