const mongoose = require('mongoose');

// WHY lazy: GridFSBucket requires an active DB connection. The connection
// is established asynchronously after server startup, so we can't create
// the bucket at module load time. Callers get the bucket on first use,
// which is always after connectDB() has resolved.
let _journalBucket = null;
let _bookmarkBucket = null;

function getAttachmentBucket() {
  if (!mongoose.connection.db) throw new Error('[GridFS] No database connection.');
  if (!_journalBucket) {
    _journalBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'journal_attachments',
    });
  }
  return _journalBucket;
}

function getBookmarkBucket() {
  if (!mongoose.connection.db) throw new Error('[GridFS] No database connection.');
  if (!_bookmarkBucket) {
    _bookmarkBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'bookmark_attachments',
    });
  }
  return _bookmarkBucket;
}

module.exports = { getAttachmentBucket, getBookmarkBucket };
