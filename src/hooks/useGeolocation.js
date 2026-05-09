import { useCallback, useEffect, useRef, useState } from 'react';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 0,
};

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
  const [isWatching, setIsWatching] = useState(false);
  const watcherIdRef = useRef(null);

  const storePosition = useCallback(async (position) => {
    const { coords, timestamp } = position;
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
    return body.location;
  }, []);

  const startLiveLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      setError('Location is not available in this browser.');
      return false;
    }

    if (watcherIdRef.current !== null) {
      return true;
    }

    setStatus('requesting');
    setError('');
    setIsWatching(true);

    watcherIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          setStatus('saving');
          await storePosition(position);
          setStatus('live');
        } catch (err) {
          setStatus('error');
          setError(err.message || 'Unable to save live location.');
        }
      },
      (err) => {
        setStatus('error');
        setError(err.message || 'Unable to access live location.');
        setIsWatching(false);
        if (watcherIdRef.current !== null) {
          navigator.geolocation.clearWatch(watcherIdRef.current);
        }
        watcherIdRef.current = null;
      },
      GEOLOCATION_OPTIONS
    );

    return true;
  }, [storePosition]);

  const stopLiveLocation = useCallback(() => {
    if (watcherIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watcherIdRef.current);
      watcherIdRef.current = null;
    }

    setIsWatching(false);
    setStatus((currentStatus) => (currentStatus === 'live' ? 'saved' : currentStatus));
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
    stopLiveLocation();
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
  }, [stopLiveLocation]);

  useEffect(() => stopLiveLocation, [stopLiveLocation]);

  return {
    location,
    status,
    error,
    isWatching,
    startLiveLocation,
    stopLiveLocation,
    loadStoredLocation,
    clearStoredLocation,
  };
}
