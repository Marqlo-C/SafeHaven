const mongoose = require('mongoose');
const { requireAuth } = require('../../../../lib/requireAuth');
const { connectDB } = require('../../../../lib/db');
const { getBookmarkBucket } = require('../../../../lib/gridfs');
const { applySecurityHeaders } = require('../../../../middleware/securityHeaders');
const config = require('../../../../config/config');
const Bookmark = require('../../../../models/Bookmark');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_bookmarks) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const { fileId } = req.query;
  if (!mongoose.isValidObjectId(fileId)) {
    return res.status(400).json({ error: 'Invalid file ID.' });
  }

  await connectDB();
  const userId = req.session.sub;
  const fileObjectId = new mongoose.Types.ObjectId(fileId);

  // Ownership check — user must own the bookmark containing this image.
  const bookmark = await Bookmark.findOne({ userId, 'image.fileId': fileObjectId });
  if (!bookmark) return res.status(404).json({ error: 'Image not found.' });

  // ── GET — stream image to client ──────────────────────────────────────────
  if (req.method === 'GET') {
    const bucket = getBookmarkBucket();
    const files = await bucket.find({ _id: fileObjectId }).toArray();
    if (!files.length) return res.status(404).json({ error: 'Image not found in storage.' });

    res.setHeader('Content-Type', bookmark.image.mimetype);
    res.setHeader('Content-Length', bookmark.image.size);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(bookmark.image.originalName)}"`);

    const downloadStream = bucket.openDownloadStream(fileObjectId);
    downloadStream.pipe(res);
    downloadStream.on('error', () => res.status(500).end());
    return;
  }

  // ── DELETE — remove image from GridFS and clear from bookmark ─────────────
  if (req.method === 'DELETE') {
    const bucket = getBookmarkBucket();
    await Promise.allSettled([
      bucket.delete(fileObjectId),
      Bookmark.updateOne({ _id: bookmark._id }, { $set: { image: { fileId: null, originalName: null, mimetype: null, size: null } } }),
    ]);
    return res.status(200).json({ message: 'Image deleted.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
