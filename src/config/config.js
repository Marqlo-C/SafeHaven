/**
 * Config Singleton.
 *
 * Merges public feature flags (config.json, safe to commit) with
 * private environment variables (.env, never committed).
 *
 * Node's require() cache means every file that does
 * require('./config/config') receives the exact same object — no
 * repeated dotenv calls, no duplicate reads. That's the Singleton.
 */

require('dotenv').config();

const featureFlags = require('./config.json');

const config = {
  ...featureFlags,
  isFeatureEnabled: (name) => !!featureFlags.features[name],
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    NEWSAPI_AI_KEY: process.env.NEWSAPI_AI_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  },
};

module.exports = config;
