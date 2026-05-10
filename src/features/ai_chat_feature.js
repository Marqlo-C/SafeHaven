const config = require('../config/config');

class AiChatFeature {
  static init() {
    if (!config.env.CLAUDE_API_KEY) {
      console.warn('[AiChatFeature] CLAUDE_API_KEY not set — AI chat will return errors.');
    } else {
      console.log('[AiChatFeature] AI support chat initialized.');
    }
  }
}

module.exports = { AiChatFeature };
