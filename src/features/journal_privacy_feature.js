/**
 * JournalPrivacyFeature
 *
 * Provides logic for handling private journal entries.
 * Private entries are only visible when not in duress mode
 * and when the journal privacy feature is enabled.
 */

class JournalPrivacyFeature {
  /**
   * Checks if an entry should be visible based on the current session.
   * @param {Object} entry - The journal entry object.
   * @param {Object} session - The user session (includes duressMode).
   * @returns {boolean}
   */
  static isVisible(entry, session) {
    if (!entry.isPrivate) return true;
    
    // If it's private, only show if not in duress mode
    return session && !session.duressMode;
  }

  /**
   * Filters a list of entries based on privacy rules.
   * @param {Array} entries - List of journal entries.
   * @param {Object} session - The user session.
   * @returns {Array}
   */
  static filterEntries(entries, session) {
    return entries.filter(entry => this.isVisible(entry, session));
  }

  /**
   * Determines the query filter for MongoDB based on session state.
   * @param {Object} session - The user session.
   * @returns {Object} - MongoDB query filter fragment.
   */
  static getPrivacyFilter(session) {
    if (session && session.duressMode) {
      return { isPrivate: { $ne: true } };
    }
    return {};
  }
}

module.exports = { JournalPrivacyFeature };
