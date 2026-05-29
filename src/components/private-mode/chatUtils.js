/**
 * chatUtils — Shared utilities for chat components.
 *
 * Functions:
 *  - initialsForName: Generate 2-letter initials from display name
 *  - normalizeFriend: Transform API friend object to component format
 *  - normalizeApiMessages: Transform API messages to component format
 *  - isRealId: Check if ID is a valid MongoDB ObjectId
 */

const MONGO_ID_RE = /^[a-f0-9]{24}$/i;

export const isRealId = (id) => MONGO_ID_RE.test(String(id));

/**
 * initialsForName — Generates 2-letter initials from display name.
 * @param {string} displayName - User's display name
 * @returns {string} Uppercase 2-letter initials or 'FR' as fallback
 */
export function initialsForName(displayName) {
  return (
    String(displayName || 'Friend')
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || 'FR'
  );
}

/**
 * normalizeFriend — Transforms API friend object into component format.
 * Determines relationship status and trusted status.
 * @param {Object} apiFriend - Raw friend object from API
 * @param {Set} trustedFriendIds - Set of trusted contact IDs
 * @returns {Object} Normalized friend with id, displayName, emoji, status, isTrusted
 */
export function normalizeFriend(apiFriend, trustedFriendIds = new Set()) {
  const isPending = apiFriend.status === 'pending';
  return {
    id: apiFriend.id,
    displayName: apiFriend.friend?.displayName || 'Anonymous',
    emoji: initialsForName(apiFriend.friend?.displayName),
    status:
      apiFriend.status === 'accepted'
        ? 'accepted'
        : apiFriend.direction === 'incoming' && isPending
          ? 'incoming'
          : 'outgoing',
    isTrusted: trustedFriendIds.has(apiFriend.id),
  };
}

/**
 * normalizeApiMessages — Transforms API message objects into component format.
 * Standardizes message structure with normalized fields.
 * @param {Array} apiMessages - Message array from API
 * @returns {Array} Normalized messages with id, from, text, time
 */
export function normalizeApiMessages(apiMessages) {
  return apiMessages.map((m) => ({
    id: m.id,
    from: m.fromMe ? 'me' : 'them',
    text: m.text,
    time: m.time,
  }));
}
