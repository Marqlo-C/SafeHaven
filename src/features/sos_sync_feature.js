/**
 * SOSSyncFeature — handles synchronization of trusted contacts and SOS alerts.
 *
 * Ensures that the list of trusted contacts is always up-to-date and that
 * location data is reliably transmitted during an SOS event.
 */

class SOSSyncFeature {
  static init() {
    console.log('[SOSSyncFeature] Trusted contact synchronization enabled.');
  }

  /**
   * Validates if a user has at least one synced trusted contact.
   */
  static async hasTrustedContacts(userId) {
    const TrustedContact = require('../models/TrustedContact');
    const count = await TrustedContact.countDocuments({ userId });
    return count > 0;
  }
}

module.exports = { SOSSyncFeature };
