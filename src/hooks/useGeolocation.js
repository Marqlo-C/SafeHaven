import { useCallback, useState } from 'react';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

function getBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location is not available in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS);
  });
}

async function parseError(response) {
  try {
    const body = await response.json();
    return body?.error || 'Unable to save location.';
  } catch {
    return 'Unable to save location.';
  }
}

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const fetchAndStoreLocation = useCallback(async () => {
    setStatus('requesting');
    setError('');

    try {
      const position = await getBrowserPosition();
      const { coords, timestamp } = position;

      setStatus('saving');

      const response = await fetch('/api/geolocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          altitudeAccuracy: coords.altitudeAccuracy,
          heading: coords.heading,
          speed: coords.speed,
          capturedAt: new Date(timestamp).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const body = await response.json();
      setLocation(body.location);
      setStatus('saved');
      return body.location;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to access location.');
      return null;
    }
  }, []);

  const loadStoredLocation = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/geolocation');
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const body = await response.json();
      setLocation(body.location);
      setStatus(body.location ? 'saved' : 'idle');
      return body.location;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to load location.');
      return null;
    }
  }, []);

  const clearStoredLocation = useCallback(async () => {
    setStatus('clearing');
    setError('');

    try {
      const response = await fetch('/api/geolocation', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setLocation(null);
      setStatus('idle');
      return true;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to clear location.');
      return false;
    }
  }, []);

  return {
    location,
    status,
    error,
    fetchAndStoreLocation,
    loadStoredLocation,
    clearStoredLocation,
  };
}
