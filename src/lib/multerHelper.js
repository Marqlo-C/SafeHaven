const multer = require('multer');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// MIME types accepted as evidence attachments.
const ALLOWED_MIMETYPES = new Set([
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
  // Video
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska',
  // Audio (voice memos, recordings)
  'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'audio/ogg',
  // Documents (medical records, restraining orders, police reports)
  'application/pdf',
]);

const _upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error(`File type "${file.mimetype}" is not supported.`);
      err.code = 'INVALID_MIME';
      cb(err);
    }
  },
});

// Wraps Express-style middleware so it runs inside a Next.js API route.
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

// Call this at the top of any upload API route.
// After it resolves, req.file holds the uploaded buffer + metadata.
async function parseUpload(req, res) {
  await runMiddleware(req, res, _upload.single('file'));
}

module.exports = { parseUpload, MAX_FILE_SIZE, ALLOWED_MIMETYPES };
