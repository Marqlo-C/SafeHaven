const mongoose = require('mongoose');
const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const ChatMessage = require('../../../models/ChatMessage');
const Friend = require('../../../models/Friend');

function formatTime(date) {
  if (!date) return 'now';
  return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

async function verifyFriendship(friendId, userId) {
  return Friend.findOne({
    _id: friendId,
    status: 'accepted',
    $or: [{ requesterId: userId }, { recipientId: userId }],
  });
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  const { friendId } = req.query;
  if (!mongoose.isValidObjectId(friendId)) {
    return res.status(400).json({ error: 'Invalid friend ID.' });
  }

  const userId = req.session.sub;
  await connectDB();

  const friendship = await verifyFriendship(friendId, userId);
  if (!friendship) return res.status(404).json({ error: 'Friendship not found.' });

  // ── GET — fetch message history ──────────────────────────────────────────
  if (req.method === 'GET') {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || '100', 10)));

    const messages = await ChatMessage
      .find({ friendId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      messages: messages.map((m) => ({
        id: String(m._id),
        fromMe: String(m.senderId) === userId,
        text: m.message,
        time: formatTime(m.createdAt),
        createdAt: m.createdAt,
      })),
    });
  }

  // ── POST — send a message ────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { text } = req.body ?? {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required.' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: 'Message too long.' });
    }

    const msg = await ChatMessage.create({
      friendId,
      senderId: userId,
      message: text.trim(),
    });

    return res.status(201).json({
      message: {
        id: String(msg._id),
        fromMe: true,
        text: msg.message,
        time: formatTime(msg.createdAt),
        createdAt: msg.createdAt,
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
