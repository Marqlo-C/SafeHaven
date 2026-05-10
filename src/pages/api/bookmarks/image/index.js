import { Readable } from 'stream';

const mongoose = require('mongoose');
const { requireAuth } = require('../../../../lib/requireAuth');
const { connectDB } = require('../../../../lib/db');
const { getBookmarkBucket } = require('../../../../lib/gridfs');
const { parseUpload, MAX_FILE_SIZE } = require('../../../../lib/multerHelper');
const { applySecurityHeaders } = require('../../../../middleware/securityHeaders');
const config = require('../../../../config/config');
const Bookmark = require('../../../../models/Bookmark');

// Only images allowed for bookmark attachments.
const IMAGE_MIMETYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic',
]);

export const apiConfig = { api: { bodyParser: false } };

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_bookmarks) {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { bookmarkId } = req.query;
  if (!bookmarkId || !mongoose.isValidObjectId(bookmarkId)) {
    return res.status(400).json({ error: 'Valid bookmarkId query param is required.' });
  }

  await connectDB();
  const userId = req.session.sub;

  const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId });
  if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });

  try {
    await parseUpload(req, res);
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` });
    }
    throw err;
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file received. Send as multipart field "file".' });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  if (!IMAGE_MIMETYPES.has(mimetype)) {
    return res.status(415).json({ error: 'Only image files are allowed for bookmark attachments.' });
  }

  // Delete the previous image from GridFS if one exists.
  if (bookmark.image?.fileId) {
    const bucket = getBookmarkBucket();
    await bucket.delete(bookmark.image.fileId).catch(() => {});
  }

  const bucket = getBookmarkBucket();
  const uploadStream = bucket.openUploadStream(originalname, {
    metadata: { userId, bookmarkId, mimetype },
  });

  await new Promise((resolve, reject) => {
    Readable.from(buffer).pipe(uploadStream).on('finish', resolve).on('error', reject);
  });

  bookmark.image = { fileId: uploadStream.id, originalName: originalname, mimetype, size };
  bookmark.updatedAt = new Date();
  await bookmark.save();

  return res.status(201).json({
    image: { ...bookmark.image, fileId: uploadStream.id },
  });
});
