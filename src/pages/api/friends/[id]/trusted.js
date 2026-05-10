const mongoose = require('mongoose');
const { requireAuth } = require('../../../../lib/requireAuth');
const { connectDB } = require('../../../../lib/db');
const { applySecurityHeaders } = require('../../../../middleware/securityHeaders');
const config = require('../../../../config/config');
const Friend = require('../../../../models/Friend');
const TrustedContact = require('../../../../models/TrustedContact');

async function findAcceptedFriend(friendId, userId) {
  return Friend
    .findOne({
      _id: friendId,
      status: 'accepted',
      $or: [{ requesterId: userId }, { recipientId: userId }],
    })
    .select('_id');
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_friending || !config.features.enable_trusted_contacts) {
    return res.status(404).json({ error: 'Not found.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  await connectDB();

  const userId = req.session.sub;
  const { id } = req.query;
  const trusted = Boolean(req.body?.trusted);

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid friend id.' });
  }

  const friend = await findAcceptedFriend(id, userId);
  if (!friend) {
    return res.status(404).json({ error: 'Accepted friend relationship not found.' });
  }

  if (!trusted) {
    await TrustedContact.findOneAndDelete({ userId, friendId: id });
    return res.status(200).json({ trusted: false, message: 'Trusted contact removed.' });
  }

  const trustedContact = await TrustedContact.findOneAndUpdate(
    { userId, friendId: id },
    { userId, friendId: id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).select('-__v');

  return res.status(200).json({
    trusted: true,
    trustedContact: {
      id: trustedContact._id.toString(),
      friendRelationshipId: trustedContact.friendId.toString(),
      createdAt: trustedContact.createdAt,
    },
    message: 'Trusted contact saved.',
  });
});
