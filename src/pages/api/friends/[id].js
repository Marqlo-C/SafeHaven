const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const Friend = require('../../../models/Friend');
const mongoose = require('mongoose');

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

async function findOwnedFriend(friendId, userId) {
  return Friend
    .findOne({
      _id: friendId,
      $or: [{ requesterId: userId }, { recipientId: userId }],
    })
    .populate('requesterId', 'anonymousDisplayName')
    .populate('recipientId', 'anonymousDisplayName')
    .select('-__v');
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_friending) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;
  const { id } = req.query;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid friend id.' });
  }

  if (req.method === 'PATCH') {
    const { action } = req.body ?? {};
    const friend = await findOwnedFriend(id, userId);

    if (!friend) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    if (friend.recipientId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the recipient can respond to a friend request.' });
    }

    if (friend.status !== 'pending') {
      return res.status(400).json({ error: 'Friend request is no longer pending.' });
    }

    if (action === 'accept') {
      friend.status = 'accepted';
    } else if (action === 'reject') {
      friend.status = 'rejected';
    } else {
      return res.status(400).json({ error: 'action must be accept or reject.' });
    }

    friend.updatedAt = new Date();
    await friend.save();

    return res.status(200).json({ friend: serializeFriend(friend, userId) });
  }

  if (req.method === 'DELETE') {
    const friend = await Friend.findOneAndDelete({
      _id: id,
      $or: [{ requesterId: userId }, { recipientId: userId }],
    });

    if (!friend) {
      return res.status(404).json({ error: 'Friend relationship not found.' });
    }

    return res.status(200).json({ message: 'Friend relationship removed.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
