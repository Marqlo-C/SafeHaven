const mongoose = require('mongoose');
const { requireAuth } = require('../../../../lib/requireAuth');
const { connectDB } = require('../../../../lib/db');
const { getAttachmentBucket } = require('../../../../lib/gridfs');
const { applySecurityHeaders } = require('../../../../middleware/securityHeaders');
const config = require('../../../../config/config');
const JournalEntry = require('../../../../models/JournalEntry');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_journal) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const { fileId } = req.query;
  if (!mongoose.isValidObjectId(fileId)) {
    return res.status(400).json({ error: 'Invalid file ID.' });
  }

  await connectDB();
  const userId = req.session.sub;
  const fileObjectId = new mongoose.Types.ObjectId(fileId);

  // Verify the requesting user owns an entry that contains this file.
  // This prevents any authenticated user from accessing another user's evidence.
  const ownerEntry = await JournalEntry.findOne({
    userId,
    'attachments.fileId': fileObjectId,
  });
  if (!ownerEntry) {
    return res.status(404).json({ error: 'File not found.' });
  }

  // ── GET — stream the file to the client ───────────────────────────────────
  if (req.method === 'GET') {
    const attachment = ownerEntry.attachments.find(
      (a) => a.fileId.toString() === fileId
    );

    const bucket = getAttachmentBucket();

    // Verify the file exists in GridFS before streaming.
    const files = await bucket.find({ _id: fileObjectId }).toArray();
    if (!files.length) {
      return res.status(404).json({ error: 'File not found in storage.' });
    }

    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Length', attachment.size);
    // Force download rather than inline rendering — reduces browser history traces.
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(attachment.originalName)}"`
    );

    const downloadStream = bucket.openDownloadStream(fileObjectId);
    downloadStream.pipe(res);
    downloadStream.on('error', () => res.status(500).end());
    return;
  }

  // ── DELETE — remove file from GridFS and from the entry's attachment list ──
  if (req.method === 'DELETE') {
    const bucket = getAttachmentBucket();

    await Promise.allSettled([
      bucket.delete(fileObjectId),
      JournalEntry.updateOne(
        { userId, 'attachments.fileId': fileObjectId },
        { $pull: { attachments: { fileId: fileObjectId } } }
      ),
    ]);

    return res.status(200).json({ message: 'Attachment deleted.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
