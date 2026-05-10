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

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment metadata not found in entry.' });
    }

    const bucket = getAttachmentBucket();

    // Verify the file exists in GridFS before streaming.
    const files = await bucket.find({ _id: fileObjectId }).toArray();
    if (!files.length) {
      console.error(`[Journal Attachment] File ${fileId} not found in GridFS`);
      return res.status(404).json({ error: 'File not found in storage.' });
    }
    const fileMetadata = files[0];

    // Basic headers
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Accept-Ranges', 'bytes');
    
    const isInline = req.query.inline === 'true';
    if (isInline) {
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(attachment.originalName)}"`
      );
    }

    // Handle Range Requests for media seeking (Safari/Chrome requirement)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileMetadata.length - 1;
      const chunksize = (end - start) + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileMetadata.length}`);
      res.setHeader('Content-Length', chunksize);

      const downloadStream = bucket.openDownloadStream(fileObjectId, {
        start,
        end: end + 1 // GridFS end is exclusive
      });
      
      downloadStream.pipe(res);
      downloadStream.on('error', (err) => {
        console.error('[Journal Attachment] Stream error:', err);
        if (!res.headersSent) res.status(500).end();
      });
      return;
    }

    // Standard non-range request
    res.setHeader('Content-Length', fileMetadata.length);
    const downloadStream = bucket.openDownloadStream(fileObjectId);
    downloadStream.pipe(res);
    downloadStream.on('error', (err) => {
      console.error('[Journal Attachment] Stream error:', err);
      if (!res.headersSent) res.status(500).end();
    });
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
