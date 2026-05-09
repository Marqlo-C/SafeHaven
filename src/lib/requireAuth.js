const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * requireAuth — wraps a Next.js API route handler to enforce authentication.
 *
 * Usage:
 *   export default requireAuth(async (req, res) => {
 *     const { sub, displayName } = req.session;
 *     res.json({ displayName });
 *   });
 *
 * Attaches the decoded JWT payload to req.session.
 * Returns 401 if the cookie is missing or the token is invalid.
 */
function requireAuth(handler) {
  return async (req, res) => {
    const token = req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    try {
      const decoded = jwt.verify(token, config.env.JWT_SECRET);
      req.session = {
        sub: decoded.sub,
        displayName: decoded.displayName,
        duressMode: decoded.duressMode || false,
      };
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
  };
}

module.exports = { requireAuth };
