const mongoose = require('mongoose');

// WHY lazy: GridFSBucket requires an active DB connection. The connection
// is established asynchronously after server startup, so we can't create
// the bucket at module load time. Callers get the bucket on first use,
// which is always after connectDB() has resolved.
let _bucket = null;

function getAttachmentBucket() {
  if (!mongoose.connection.db) {
    throw new Error('[GridFS] No database connection. Ensure connectDB() has resolved.');
  }
  if (!_bucket) {
    _bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'journal_attachments',
    });
  }
  return _bucket;
}

module.exports = { getAttachmentBucket };
