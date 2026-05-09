const mongoose = require('mongoose');

const userLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },

  // GeoJSON Point: [longitude, latitude].
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            value.every(Number.isFinite) &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90
          );
        },
        message: 'coordinates must be [longitude, latitude].',
      },
    },
  },

  accuracy: {
    type: Number,
    min: 0,
    default: null,
  },

  altitude: {
    type: Number,
    default: null,
  },

  altitudeAccuracy: {
    type: Number,
    min: 0,
    default: null,
  },

  heading: {
    type: Number,
    min: 0,
    max: 360,
    default: null,
  },

  speed: {
    type: Number,
    min: 0,
    default: null,
  },

  capturedAt: {
    type: Date,
    required: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userLocationSchema.index({ coordinates: '2dsphere' });

userLocationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports =
  mongoose.models.UserLocation ||
  mongoose.model('UserLocation', userLocationSchema);
