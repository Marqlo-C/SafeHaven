import { useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

export default function LocationCapture() {
  const {
    location,
    status,
    error,
    isWatching,
    startLiveLocation,
    stopLiveLocation,
    loadStoredLocation,
    clearStoredLocation,
  } = useGeolocation();

  useEffect(() => {
    loadStoredLocation();
  }, [loadStoredLocation]);

  const busy = ['loading', 'clearing'].includes(status);
  const savedAt = location?.updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      }).format(new Date(location.updatedAt))
    : null;

  return (
    <section style={panelStyle} aria-label="Location sharing">
      <div style={contentStyle}>
        <div style={copyStyle}>
          <strong style={titleStyle}>Location</strong>
          <span style={detailStyle}>
            {location
              ? `${isWatching ? 'Live' : 'Saved'} ${savedAt}${location.accuracy ? ` · ${Math.round(location.accuracy)}m accuracy` : ''}`
              : 'No location saved'}
          </span>
          {location && (
            <span style={coordinateStyle}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </span>
          )}
          {error && <span style={errorStyle}>{error}</span>}
        </div>

        <div style={actionsStyle}>
          <button
            type="button"
            onClick={isWatching ? stopLiveLocation : startLiveLocation}
            disabled={busy}
            style={primaryButtonStyle}
          >
            {isWatching ? 'Stop live' : status === 'requesting' ? 'Starting...' : 'Live coordinates'}
          </button>
          {location && (
            <button
              type="button"
              onClick={clearStoredLocation}
              disabled={busy}
              style={secondaryButtonStyle}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

const panelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: 'min(100% - 32px, 720px)',
  margin: '16px auto',
  padding: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.06)',
};

const contentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  minWidth: 0,
  flex: 1,
};

const copyStyle = {
  display: 'grid',
  gap: '3px',
  minWidth: 0,
};

const titleStyle = {
  fontSize: '14px',
};

const detailStyle = {
  color: 'rgba(240,240,245,0.65)',
  fontSize: '13px',
};

const coordinateStyle = {
  color: 'rgba(240,240,245,0.5)',
  fontSize: '12px',
};

const errorStyle = {
  color: '#ffb4b4',
  fontSize: '13px',
};

const actionsStyle = {
  display: 'flex',
  gap: '8px',
  flexShrink: 0,
};

const primaryButtonStyle = {
  minHeight: '36px',
  padding: '0 12px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.28)',
  background: '#f0f0f5',
  color: '#111118',
  cursor: 'pointer',
  fontSize: '13px',
};

const secondaryButtonStyle = {
  minHeight: '36px',
  padding: '0 12px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.22)',
  background: 'transparent',
  color: '#f0f0f5',
  cursor: 'pointer',
  fontSize: '13px',
};
