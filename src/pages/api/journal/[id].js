const mongoose = require('mongoose');
const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { getAttachmentBucket } = require('../../../lib/gridfs');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const JournalEntry = require('../../../models/JournalEntry');
const { JournalPrivacyFeature } = require('../../../features/journal_privacy_feature');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_journal) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid entry ID.' });
  }

  await connectDB();
  const session = req.session;
  const userId = session.sub;

  // ── GET /api/journal/[id] ─────────────────────────────────────────────────
  if (req.method === 'GET') {
    const entry = await JournalEntry.findOne({ _id: id, userId }).select('-__v');
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });

    if (config.features.enable_journal_privacy && !JournalPrivacyFeature.isVisible(entry, session)) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    return res.status(200).json({ entry });
  }

  // ── PUT /api/journal/[id] — update text fields only ──────────────────────
  if (req.method === 'PUT') {
    const { title, content, incidentDate, isPrivate } = req.body ?? {};

    const update = {};
    if (title !== undefined)        update.title         = String(title).slice(0, 200);
    if (content !== undefined)      update.content       = String(content).slice(0, 50000);
    if (incidentDate !== undefined) update.incidentDate  = incidentDate ? new Date(incidentDate) : null;
    if (isPrivate !== undefined && config.features.enable_journal_privacy) {
      update.isPrivate = Boolean(isPrivate);
    }
    update.updatedAt = new Date();

    const entry = await JournalEntry.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!entry) return res.status(404).json({ error: 'Entry not found.' });
    return res.status(200).json({ entry });
  }

  // ── DELETE /api/journal/[id] — remove entry and all its attachments ───────
  if (req.method === 'DELETE') {
    const entry = await JournalEntry.findOne({ _id: id, userId });
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });

    // Delete every file from GridFS before removing the entry document.
    if (entry.attachments.length > 0) {
      const bucket = getAttachmentBucket();
      await Promise.allSettled(
        entry.attachments.map((a) => bucket.delete(a.fileId))
      );
    }

    await entry.deleteOne();
    return res.status(200).json({ message: 'Entry and all attachments deleted.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
