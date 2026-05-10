const mongoose = require('mongoose');
const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { getBookmarkBucket } = require('../../../lib/gridfs');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const Bookmark = require('../../../models/Bookmark');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_bookmarks) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid bookmark ID.' });
  }

  await connectDB();
  const userId = req.session.sub;

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const bookmark = await Bookmark.findOne({ _id: id, userId }).select('-__v');
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });
    return res.status(200).json({ bookmark });
  }

  // ── PUT — update title, content, tags ────────────────────────────────────
  if (req.method === 'PUT') {
    const { title, content, tags } = req.body ?? {};
    const update = { updatedAt: new Date() };

    if (title   !== undefined) update.title   = String(title).slice(0, 200);
    if (content !== undefined) update.content = String(content).slice(0, 10000);
    if (Array.isArray(tags))   update.tags    = tags.slice(0, 10).map((t) => String(t).slice(0, 50));

    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });
    return res.status(200).json({ bookmark });
  }

  // ── DELETE — remove bookmark and its image from GridFS if present ─────────
  if (req.method === 'DELETE') {
    const bookmark = await Bookmark.findOne({ _id: id, userId });
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });

    if (bookmark.image?.fileId) {
      const bucket = getBookmarkBucket();
      await bucket.delete(bookmark.image.fileId).catch(() => {});
    }

    await bookmark.deleteOne();
    return res.status(200).json({ message: 'Bookmark deleted.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
