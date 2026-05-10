class BookmarkFeature {
  static init() {
    console.log('[BookmarkFeature] Bookmark system initialized.');
    console.log('[BookmarkFeature] Attachment storage: MongoDB GridFS (bookmark_attachments).');
  }
}

module.exports = { BookmarkFeature };
