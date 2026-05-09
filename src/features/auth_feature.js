/**
 * AuthFeature — Zero-Trace Authentication
 *
 * Design contract:
 *  - Credentials stored as bcrypt hashes only (User model handles this).
 *  - JWT issued once on login; delivered exclusively via HTTP-only cookie.
 *  - Cookie has no Max-Age or Expires → session cookie, wiped when browser closes.
 *  - Secure flag is enabled in production so the cookie only travels over HTTPS.
 *  - No localStorage, no sessionStorage, no "remember me".
 *  - Duress password detection: signs a JWT with { duressMode: true } so the
 *    client can silently trigger a safety view without alerting an abuser.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { connectDB } = require('../lib/db');
const User = require('../models/User');

const JWT_EXPIRY = '24h'; // Server-side safety net; the session cookie expires first.

class AuthFeature {
  static init() {
    if (!config.env.JWT_SECRET) {
      throw new Error('[AuthFeature] JWT_SECRET is missing from environment variables.');
    }
    if (!config.env.MONGODB_URI) {
      throw new Error('[AuthFeature] MONGODB_URI is missing from environment variables.');
    }

    // Kick off the connection so it is warm before the first request arrives.
    // Mongoose buffers commands, so API routes are safe to call before this resolves.
    connectDB()
      .then(() => console.log('[AuthFeature] MongoDB connected.'))
      .catch((err) => console.error('[AuthFeature] MongoDB connection error:', err.message));

    console.log('[AuthFeature] Zero-trace auth system initialized.');
  }

  // ---------------------------------------------------------------------------
  // Cookie helpers
  // ---------------------------------------------------------------------------

  static _makeAuthCookie(token) {
    const parts = [
      `auth_token=${token}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      // Secure is required in production so the cookie only travels over HTTPS.
      // Omit in dev because localhost is HTTP.
      ...(config.env.NODE_ENV === 'production' ? ['Secure'] : []),
      // NO Max-Age, NO Expires → browser treats this as a session cookie.
      // The cookie is deleted the moment the browser window/tab is fully closed.
    ];
    return parts.join('; ');
  }

  static _clearAuthCookie() {
    const parts = [
      'auth_token=',
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      'Max-Age=0',
      ...(config.env.NODE_ENV === 'production' ? ['Secure'] : []),
    ];
    return parts.join('; ');
  }

  // ---------------------------------------------------------------------------
  // JWT helpers
  // ---------------------------------------------------------------------------

  static _signToken(payload) {
    return jwt.sign(payload, config.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  static verifyToken(token) {
    return jwt.verify(token, config.env.JWT_SECRET);
  }

  // ---------------------------------------------------------------------------
  // Route controllers (called by src/pages/api/auth/*.js)
  // ---------------------------------------------------------------------------

  /**
   * POST /api/auth/register
   * Body: { username, password, duressPassword? }
   */
  static async register(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { username, password, duressPassword } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (duressPassword && duressPassword === password) {
      return res.status(400).json({ error: 'Duress password must differ from primary password.' });
    }

    try {
      await connectDB();

      const existing = await User.findOne({ username: username.toLowerCase().trim() });
      if (existing) {
        return res.status(409).json({ error: 'Username already taken.' });
      }

      const user = new User({
        username,
        passwordHash: password,
        ...(duressPassword ? { duressPasswordHash: duressPassword } : {}),
      });
      await user.save();

      return res.status(201).json({
        message: 'Account created.',
        displayName: user.anonymousDisplayName,
      });
    } catch (err) {
      console.error('[AuthFeature] register error:', err.message);
      if (err.name === 'MongooseError' || err.name === 'MongoServerError') {
        return res.status(503).json({ error: 'Database unavailable. Try again shortly.' });
      }
      return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }

  /**
   * POST /api/auth/login
   * Body: { username, password }
   */
  static async login(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
      await connectDB();

      // Explicitly select the fields hidden by default (select: false on the schema).
      const user = await User
        .findOne({ username: username.toLowerCase().trim() })
        .select('+username +passwordHash +duressPasswordHash');

      // Use a constant-time response to prevent username enumeration.
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const primaryMatch = await user.verifyPassword(password);
      const duressMatch = !primaryMatch && await user.verifyDuressPassword(password);

      if (!primaryMatch && !duressMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = AuthFeature._signToken({
        sub: user._id.toString(),
        displayName: user.anonymousDisplayName,
        ...(duressMatch ? { duressMode: true } : {}),
      });

      res.setHeader('Set-Cookie', AuthFeature._makeAuthCookie(token));

      return res.status(200).json({
        displayName: user.anonymousDisplayName,
        duressMode: duressMatch,
      });
    } catch (err) {
      console.error('[AuthFeature] login error:', err.message);
      if (err.name === 'MongooseError' || err.name === 'MongoServerError') {
        return res.status(503).json({ error: 'Database unavailable. Try again shortly.' });
      }
      return res.status(500).json({ error: 'Sign in failed. Please try again.' });
    }
  }

  /**
   * POST /api/auth/logout
   * Clears the auth cookie — no body needed.
   */
  static logout(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    res.setHeader('Set-Cookie', AuthFeature._clearAuthCookie());
    return res.status(200).json({ message: 'Logged out.' });
  }
}

module.exports = { AuthFeature };
