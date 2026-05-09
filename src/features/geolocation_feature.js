/**
 * GeolocationFeature — opt-in latest-location storage.
 *
 * Exact coordinates are collected only when a signed-in user explicitly asks
 * the browser for location access. The API stores one latest location per user
 * and overwrites it on each update; it does not keep a movement history.
 *
 * Future friend/trusted-contact sharing can read this same model after adding
 * relationship and consent checks.
 */

class GeolocationFeature {
  static init() {
    console.log('[GeolocationFeature] Opt-in latest-location storage enabled.');
  }
}

module.exports = { GeolocationFeature };
