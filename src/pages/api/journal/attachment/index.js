import { Readable } from 'stream';

const mongoose = require('mongoose');
const { requireAuth } = require('../../../../lib/requireAuth');
const { connectDB } = require('../../../../lib/db');
const { getAttachmentBucket } = require('../../../../lib/gridfs');
const { parseUpload, MAX_FILE_SIZE, ALLOWED_MIMETYPES } = require('../../../../lib/multerHelper');
const { applySecurityHeaders } = require('../../../../middleware/securityHeaders');
const config = require('../../../../config/config');
const JournalEntry = require('../../../../models/JournalEntry');

// Disable Next.js body parser — multer handles the multipart stream.
export const config = { api: { bodyParser: false } };

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_journal) {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { entryId } = req.query;
  if (!entryId || !mongoose.isValidObjectId(entryId)) {
    return res.status(400).json({ error: 'Valid entryId query param is required.' });
  }

  await connectDB();
  const userId = req.session.sub;

  const entry = await JournalEntry.findOne({ _id: entryId, userId });
  if (!entry) return res.status(404).json({ error: 'Entry not found.' });

  // Parse the multipart upload.
  try {
    await parseUpload(req, res);
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
      });
    }
    if (err.code === 'INVALID_MIME') {
      return res.status(415).json({
        error: err.message,
        supported: [...ALLOWED_MIMETYPES],
      });
    }
    throw err;
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file received. Send as multipart field "file".' });
  }

  const { originalname, mimetype, size, buffer } = req.file;
  const bucket = getAttachmentBucket();

  // Stream buffer into GridFS.
  const uploadStream = bucket.openUploadStream(originalname, {
    metadata: { userId, entryId, mimetype },
  });

  await new Promise((resolve, reject) => {
    Readable.from(buffer).pipe(uploadStream)
      .on('finish', resolve)
      .on('error', reject);
  });

  const attachment = {
    fileId: uploadStream.id,
    originalName: originalname,
    mimetype,
    size,
  };

  entry.attachments.push(attachment);
  await entry.save();

  return res.status(201).json({ attachment: { ...attachment, fileId: uploadStream.id } });
});
