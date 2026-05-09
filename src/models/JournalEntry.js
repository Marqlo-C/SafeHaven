const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    originalName: { type: String, required: true, maxlength: 255 },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  title: {
    type: String,
    trim: true,
    maxlength: 200,
    default: '',
  },

  // The survivor's written account.
  content: {
    type: String,
    required: true,
    maxlength: 50000,
  },

  // When the incident occurred — may differ from createdAt.
  // Null means the survivor did not specify.
  incidentDate: {
    type: Date,
    default: null,
  },

  // References to files stored in GridFS (journal_attachments bucket).
  // Images, video, audio, PDFs — evidence of abuse.
  attachments: {
    type: [attachmentSchema],
    default: [],
  },

  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
});

journalEntrySchema.pre('save', function (next) {
  if (!this.isNew) this.updatedAt = new Date();
  next();
});

// Prevent OverwriteModelError during Next.js hot reloads.
module.exports =
  mongoose.models.JournalEntry ||
  mongoose.model('JournalEntry', journalEntrySchema);
