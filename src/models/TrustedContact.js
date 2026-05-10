const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const trustedContactSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  friendId: {
    type: ObjectId,
    ref: 'Friend',
    required: true,
    index: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

trustedContactSchema.index({ userId: 1, friendId: 1 }, { unique: true });

module.exports =
  mongoose.models.TrustedContact ||
  mongoose.model('TrustedContact', trustedContactSchema);
