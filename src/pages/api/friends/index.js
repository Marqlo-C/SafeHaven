const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const Friend = require('../../../models/Friend');
const User = require('../../../models/User');

function makePairKey(userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join(':');
}

function serializeFriend(friend, currentUserId) {
  const requesterId = friend.requesterId._id?.toString() || friend.requesterId.toString();
  const recipientId = friend.recipientId._id?.toString() || friend.recipientId.toString();
  const otherUser = requesterId === currentUserId ? friend.recipientId : friend.requesterId;

  return {
    id: friend._id.toString(),
    status: friend.status,
    direction: requesterId === currentUserId ? 'outgoing' : 'incoming',
    friend: {
      id: otherUser._id.toString(),
      displayName: otherUser.anonymousDisplayName,
    },
    createdAt: friend.createdAt,
    updatedAt: friend.updatedAt,
  };
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_friending) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const status = req.query.status;
    const filter = {
      $or: [{ requesterId: userId }, { recipientId: userId }],
      ...(status ? { status } : {}),
    };

    const friends = await Friend
      .find(filter)
      .sort({ updatedAt: -1 })
      .populate('requesterId', 'anonymousDisplayName')
      .populate('recipientId', 'anonymousDisplayName')
      .select('-__v');

    return res.status(200).json({
      friends: friends.map((friend) => serializeFriend(friend, userId)),
    });
  }

  if (req.method === 'POST') {
    const { anonymousDisplayName } = req.body ?? {};
    const displayName = typeof anonymousDisplayName === 'string'
      ? anonymousDisplayName.trim()
      : '';

    if (!displayName) {
      return res.status(400).json({ error: 'anonymousDisplayName is required.' });
    }

    const recipient = await User
      .findOne({ anonymousDisplayName: displayName })
      .select('anonymousDisplayName');

    if (!recipient) {
      return res.status(404).json({ error: 'Friend not found.' });
    }

    if (recipient._id.toString() === userId) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    const pairKey = makePairKey(userId, recipient._id);
    const existing = await Friend
      .findOne({ pairKey })
      .populate('requesterId', 'anonymousDisplayName')
      .populate('recipientId', 'anonymousDisplayName')
      .select('-__v');

    if (existing) {
      if (existing.status === 'rejected') {
        existing.requesterId = userId;
        existing.recipientId = recipient._id;
        existing.status = 'pending';
        existing.updatedAt = new Date();
        await existing.save();
        await existing.populate('requesterId', 'anonymousDisplayName');
        await existing.populate('recipientId', 'anonymousDisplayName');
      }

      return res.status(200).json({
        friend: serializeFriend(existing, userId),
        message: existing.status === 'rejected'
          ? 'Friend request sent.'
          : 'Friend relationship already exists.',
      });
    }

    const friend = await Friend.create({
      requesterId: userId,
      recipientId: recipient._id,
      pairKey,
      status: 'pending',
    });

    await friend.populate('requesterId', 'anonymousDisplayName');
    await friend.populate('recipientId', 'anonymousDisplayName');

    return res.status(201).json({
      friend: serializeFriend(friend, userId),
      message: 'Friend request sent.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
