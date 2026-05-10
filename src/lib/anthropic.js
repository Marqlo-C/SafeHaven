const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/config');

let _client = null;

function getAnthropicClient() {
  if (!_client) {
    if (!config.env.CLAUDE_API_KEY) {
      throw new Error('[Anthropic] CLAUDE_API_KEY is missing from environment variables.');
    }
    _client = new Anthropic({ apiKey: config.env.CLAUDE_API_KEY });
  }
  return _client;
}

module.exports = { getAnthropicClient };
