const { requireAuth } = require('../../../lib/requireAuth');
const { getAnthropicClient } = require('../../../lib/anthropic');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');

const SYSTEM_PROMPT = `You are a compassionate, trauma-informed support assistant for survivors of domestic violence. Your role is to:

1. Provide a safe, non-judgmental space where survivors feel heard and believed.
2. Help users identify local resources — domestic violence shelters, legal aid lawyers, therapists specializing in trauma, hotlines, and support groups. When a user mentions their city or state, tailor your suggestions to that location.
3. Offer practical safety planning guidance (e.g., preparing a go-bag, having a code word with a trusted person, safe ways to document abuse).
4. Provide gentle therapeutic conversation — validating feelings, helping users process experiences, and building self-compassion.
5. Explain legal options in plain language (restraining orders, documentation, reporting) without giving specific legal advice.

Critical guidelines:
- If the user describes immediate danger, always prioritize their safety: "If you are in immediate danger, please call 911. The National Domestic Violence Hotline is available 24/7 at 1-800-799-7233 (call or text) or chat at thehotline.org."
- Never minimize or question the user's experience. Believe them.
- Respect the user's autonomy — offer options, never pressure.
- Keep responses concise and clear. Survivors may be reading quickly or in stressful situations.
- This conversation is private and encrypted. Remind the user of this if they express concern about safety.
- Do not diagnose mental health conditions. You can validate symptoms and suggest professional support.
- If the user asks about a specific location for resources, ask for their city and state if not already provided.`;

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_ai_chat) {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  // Sanitize: only keep role + content, enforce limits.
  const sanitized = messages
    .slice(-MAX_MESSAGES)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? '').slice(0, MAX_CONTENT_LENGTH),
    }));

  if (!sanitized.length || sanitized[sanitized.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Last message must be from the user.' });
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: sanitized,
    });

    const text = response.content?.[0]?.text ?? '';
    return res.status(200).json({ message: text, role: 'assistant' });
  } catch (err) {
    console.error('[AiChat] Claude API error:', err.message);
    return res.status(502).json({ error: 'AI service unavailable. Please try again.' });
  }
});
