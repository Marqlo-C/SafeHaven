const mongoose = require('mongoose');

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

  // Base64 media storage for simplicity and reliability.
  // Stores images, audio (as data URLs).
  mediaData: {
    type: String,
    default: null,
  },

  mediaType: {
    type: String,
    default: null,
  },

  mediaName: {
    type: String,
    default: null,
  },

  isPrivate: {
    type: Boolean,
    default: false,
    index: true,
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
