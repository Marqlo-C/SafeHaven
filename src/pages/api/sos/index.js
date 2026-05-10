const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { getSocketServer } = require('../../../lib/socketServer');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const ChatMessage = require('../../../models/ChatMessage');
const Friend = require('../../../models/Friend');

const LOCATION_MAX_AGE_MS = 5 * 60 * 1000;

function parseCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function serializeMessage(message) {
  const senderId = message.senderId._id?.toString() || message.senderId.toString();

  return {
    id: message._id.toString(),
    senderId,
    senderDisplayName: message.senderId.anonymousDisplayName,
    message: message.message,
    timestamp: message.createdAt.getTime(),
  };
}

function makeSosMessage({ displayName, latitude, longitude, accuracy }) {
  const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const accuracyText = Number.isFinite(Number(accuracy))
    ? ` Accuracy: about ${Math.round(Number(accuracy))} m.`
    : '';

  return [
    `SOS: ${displayName || 'This person'} might be in danger.`,
    `Current location: ${mapsUrl}.`,
    accuracyText,
  ].join(' ').trim();
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_sos) {
    return res.status(404).json({ error: 'Not found.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { latitude, longitude, accuracy, capturedAt } = req.body ?? {};
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

  await connectDB();

  const userId = req.session.sub;
  const trustedContacts = await Friend
    .find({
      status: 'accepted',
      $or: [{ requesterId: userId }, { recipientId: userId }],
    })
    .select('_id')
    .lean();

  if (trustedContacts.length === 0) {
    return res.status(409).json({ error: 'No trusted contacts are available.' });
  }

  const message = makeSosMessage({
    displayName: req.session.displayName,
    latitude: lat,
    longitude: lng,
    accuracy,
  });

  const io = getSocketServer();
  const sentMessages = [];

  for (const friend of trustedContacts) {
    const savedMessage = await ChatMessage.create({
      friendId: friend._id,
      senderId: userId,
      message,
    });

    await savedMessage.populate('senderId', 'anonymousDisplayName');
    const serialized = serializeMessage(savedMessage);
    sentMessages.push(serialized);
    io?.to(`friend:${friend._id.toString()}`).emit('receive_message', serialized);
  }

  return res.status(200).json({
    message: 'SOS sent to trusted contacts.',
    sentCount: sentMessages.length,
  });
});
