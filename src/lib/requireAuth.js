const jwt = require('jsonwebtoken');
const cookie = require('cookie');
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
    // Next.js normally populates req.cookies, but when bodyParser: false is set
    // or when using a custom server, it might be missing.
    let token = req.cookies?.auth_token;

    if (!token && req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      token = cookies.auth_token;
    }

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
    } catch (err) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
  };
}

module.exports = { requireAuth };
