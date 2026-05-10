const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const bookmarkSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true, index: true },

  // The saved text — an AI suggestion, a resource name, or a user note.
  content: { type: String, required: true, maxlength: 10000 },

  // Optional short label shown in lists.
  title: { type: String, trim: true, maxlength: 200, default: '' },

  // 'ai_suggestion' | 'resource' | 'note'
  type: {
    type: String,
    enum: ['ai_suggestion', 'resource', 'note'],
    default: 'note',
  },

  // Optional image attachment stored in GridFS bookmark_attachments bucket.
  image: {
    fileId:       { type: ObjectId, default: null },
    originalName: { type: String,   default: null },
    mimetype:     { type: String,   default: null },
    size:         { type: Number,   default: null },
  },

  tags: [{ type: String, maxlength: 50 }],

  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
});

bookmarkSchema.pre('save', function (next) {
  if (!this.isNew) this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
