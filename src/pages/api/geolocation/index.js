const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const UserLocation = require('../../../models/UserLocation');

const LOCATION_MAX_AGE_MS = 5 * 60 * 1000;

function finiteOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function serializeLocation(location) {
  if (!location) return null;

  const [longitude, latitude] = location.coordinates.coordinates;
  return {
    latitude,
    longitude,
    accuracy: location.accuracy,
    altitude: location.altitude,
    altitudeAccuracy: location.altitudeAccuracy,
    heading: location.heading,
    speed: location.speed,
    capturedAt: location.capturedAt,
    updatedAt: location.updatedAt,
  };
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_geolocation) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const location = await UserLocation.findOne({ userId }).select('-__v');
    return res.status(200).json({ location: serializeLocation(location) });
  }

  if (req.method === 'POST') {
    const {
      latitude,
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed,
      capturedAt,
    } = req.body ?? {};

    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    const capturedAtDate = capturedAt ? new Date(capturedAt) : new Date();

    if (lat === null || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'latitude must be between -90 and 90.' });
    }
    if (lng === null || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'longitude must be between -180 and 180.' });
    }
    if (Number.isNaN(capturedAtDate.getTime())) {
      return res.status(400).json({ error: 'capturedAt must be a valid date.' });
    }
    if (Date.now() - capturedAtDate.getTime() > LOCATION_MAX_AGE_MS) {
      return res.status(400).json({ error: 'location is too old. Please refresh it.' });
    }
    if (capturedAtDate.getTime() - Date.now() > LOCATION_MAX_AGE_MS) {
      return res.status(400).json({ error: 'capturedAt cannot be in the future.' });
    }

    const location = await UserLocation.findOneAndUpdate(
      { userId },
      {
        userId,
        coordinates: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        accuracy: finiteOrNull(accuracy),
        altitude: finiteOrNull(altitude),
        altitudeAccuracy: finiteOrNull(altitudeAccuracy),
        heading: finiteOrNull(heading),
        speed: finiteOrNull(speed),
        capturedAt: capturedAtDate,
        updatedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select('-__v');

    return res.status(200).json({ location: serializeLocation(location) });
  }

  if (req.method === 'DELETE') {
    await UserLocation.deleteOne({ userId });
    return res.status(200).json({ message: 'Location cleared.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
