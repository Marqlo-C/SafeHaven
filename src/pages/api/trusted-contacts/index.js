const mongoose = require('mongoose');
const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const Friend = require('../../../models/Friend');
const TrustedContact = require('../../../models/TrustedContact');

function getOtherUser(friend, userId) {
  const requesterId = friend.requesterId._id?.toString() || friend.requesterId.toString();
  return requesterId === userId ? friend.recipientId : friend.requesterId;
}

function serializeTrustedContact(trustedContact, userId) {
  const friend = trustedContact.friendId;
  const otherUser = getOtherUser(friend, userId);

  return {
    id: trustedContact._id.toString(),
    friendRelationshipId: friend._id.toString(),
    contact: {
      id: otherUser._id.toString(),
      displayName: otherUser.anonymousDisplayName,
    },
    createdAt: trustedContact.createdAt,
  };
}

async function findAcceptedFriend(friendId, userId) {
  return Friend
    .findOne({
      _id: friendId,
      status: 'accepted',
      $or: [{ requesterId: userId }, { recipientId: userId }],
    })
    .populate('requesterId', 'anonymousDisplayName')
    .populate('recipientId', 'anonymousDisplayName')
    .select('-__v');
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_trusted_contacts) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const trustedContacts = await TrustedContact
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'friendId',
        populate: [
          { path: 'requesterId', select: 'anonymousDisplayName' },
          { path: 'recipientId', select: 'anonymousDisplayName' },
        ],
      })
      .select('-__v');

    return res.status(200).json({
      trustedContacts: trustedContacts
        .filter((trustedContact) => trustedContact.friendId?.status === 'accepted')
        .map((trustedContact) => serializeTrustedContact(trustedContact, userId)),
    });
  }

  if (req.method === 'POST') {
    const { friendId } = req.body ?? {};

    if (!mongoose.isValidObjectId(friendId)) {
      return res.status(400).json({ error: 'Valid friendId is required.' });
    }

    const friend = await findAcceptedFriend(friendId, userId);
    if (!friend) {
      return res.status(404).json({ error: 'Accepted friend relationship not found.' });
    }

    const trustedContact = await TrustedContact.findOneAndUpdate(
      { userId, friendId },
      { userId, friendId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate({
        path: 'friendId',
        populate: [
          { path: 'requesterId', select: 'anonymousDisplayName' },
          { path: 'recipientId', select: 'anonymousDisplayName' },
        ],
      })
      .select('-__v');

    return res.status(200).json({
      trustedContact: serializeTrustedContact(trustedContact, userId),
      message: 'Trusted contact saved.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
