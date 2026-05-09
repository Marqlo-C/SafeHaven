/**
 * Feature Orchestrator.
 *
 * This is the ONLY place features are activated. The pattern is always:
 *   1. Import the feature class.
 *   2. Read its toggle from config.
 *   3. Call FeatureClass.init() inside the guard — nothing else runs if disabled.
 *
 * Keep this file lean. Business logic lives in src/features/, not here.
 */

const config = require('./config/config');
const { ChatFeature } = require('./features/chat_feature');
const { AuthFeature } = require('./features/auth_feature');
const { PwaFeature } = require('./features/pwa_feature');
const { JournalFeature } = require('./features/journal_feature');

/**
 * @param {import('socket.io').Server} io  - Socket.io server instance from server.js
 */
function initFeatures(io) {
  if (config.features.enable_pwa) {
    PwaFeature.init();
  }

  if (config.features.enable_auth_system) {
    AuthFeature.init();
  }

  if (config.features.enable_anonymous_chat) {
    ChatFeature.init(io);
  }

  if (config.features.enable_journal) {
    JournalFeature.init();
  }

  // Template for adding the next feature:
  //
  // const { SafetyAlertFeature } = require('./features/safety_alert_feature');
  // if (config.features.enable_safety_alert) {
  //   SafetyAlertFeature.init(io);
  // }
}

module.exports = { initFeatures };
