const mongoose = require('mongoose');
const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const TrustedContact = require('../../../models/TrustedContact');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_trusted_contacts) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;
  const { id } = req.query;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid trusted contact id.' });
  }

  if (req.method === 'DELETE') {
    const trustedContact = await TrustedContact.findOneAndDelete({ _id: id, userId });

    if (!trustedContact) {
      return res.status(404).json({ error: 'Trusted contact not found.' });
    }

    return res.status(200).json({ message: 'Trusted contact removed.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
