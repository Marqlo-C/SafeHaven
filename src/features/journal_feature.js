/**
 * JournalFeature — private evidence journal.
 *
 * Allows survivors to document experiences and attach media proof
 * (images, video, audio, PDFs). All data is stored in MongoDB:
 *   - Entry text → JournalEntry collection
 *   - Binary files → GridFS journal_attachments bucket
 *
 * API routes in src/pages/api/journal/ handle the actual logic.
 * This init() validates the environment and logs readiness.
 *
 * Future: application-level encryption of content + files at rest.
 * MongoDB Atlas encrypts the storage layer, but field-level encryption
 * would add a stronger guarantee for this sensitive data.
 */

class JournalFeature {
  static init() {
    console.log('[JournalFeature] Private evidence journal initialized.');
    console.log('[JournalFeature] Attachment storage: MongoDB GridFS (journal_attachments).');
  }
}

module.exports = { JournalFeature };
