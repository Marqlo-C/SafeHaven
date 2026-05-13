import { useState, useEffect, useRef } from 'react';
import { Lock, Phone, Map } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import MapboxMap from './MapboxMap';
import styles from '../../styles/private-mode/aid.module.css';

const FILTERS = [
  { key: 'shelter', label: 'Shelters' },
  { key: 'legal', label: 'Legal Aid' },
  { key: 'financial', label: 'Financial' },
  { key: 'counseling', label: 'Counseling' },
];

const PLACEHOLDER_RESOURCES = {
  shelter: [
    { name: "Safe Harbor Women's Shelter", meta: '0.8 mi - Open 24 hours', latitude: 38.5694, longitude: -121.4854 },
    { name: 'Hope House Emergency Refuge', meta: '1.4 mi - Open until 9 PM', latitude: 38.5952, longitude: -121.5024 },
  ],
  legal: [
    { name: 'Community Legal Aid Society', meta: '1.1 mi - Open until 5 PM', latitude: 38.5706, longitude: -121.5066 },
  ],
  financial: [
    { name: 'Emergency Assistance Fund', meta: '0.5 mi - Open until 6 PM', latitude: 38.5772, longitude: -121.4872 },
  ],
  counseling: [
    { name: 'Trauma Recovery Counseling', meta: '1.8 mi - Open until 8 PM', latitude: 38.5638, longitude: -121.5122 },
  ],
};

export default function AidPanel() {
  const [activeFilter, setActiveFilter] = useState('shelter');
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const mapRef = useRef(null);

  const { location, startLiveLocation } = useGeolocation();

  useEffect(() => {
    startLiveLocation();
  }, [startLiveLocation]);

  // Clear selection when switching filters
  useEffect(() => {
    setSelectedResource(null);
  }, [activeFilter]);

  useEffect(() => {
    async function fetchNearbyAid() {
      if (!location) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/aid/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: location.latitude, longitude: location.longitude }),
        });
        if (!res.ok) throw new Error('Failed to fetch nearby resources.');
        setResources(await res.json());
      } catch (err) {
        console.error('[AidPanel] Fetch error:', err);
        setError('Could not load local resources. Showing defaults.');
        setResources(PLACEHOLDER_RESOURCES);
      } finally {
        setLoading(false);
      }
    }

    if (location && !resources && !loading) {
      fetchNearbyAid();
    }
  }, [location, resources, loading]);

  const handleCall = (phone) => {
    if (!phone) return;
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  const handleDirections = (address) => {
    if (!address) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCardClick = (resource) => {
    if (!resource.latitude || !resource.longitude) return;
    setSelectedResource((prev) =>
      prev?.name === resource.name ? null : resource
    );
    // Scroll map into view
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const activeResources = (resources || PLACEHOLDER_RESOURCES)[activeFilter] || [];

  return (
    <div className={styles.aidPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Search results are context-aware and not stored on this device.</span>
      </div>

      <div ref={mapRef} className={styles.resourceMap}>
        <MapboxMap
          latitude={location ? Math.round(location.latitude * 10000) / 10000 : undefined}
          longitude={location ? Math.round(location.longitude * 10000) / 10000 : undefined}
          selectedResource={selectedResource}
        />
        <div className={styles.mapCaption}>
          {selectedResource ? selectedResource.name : location ? 'Showing resources near you' : 'Finding nearby help...'}
        </div>
      </div>

      <div className={styles.filterScroller} aria-label="Resource filters">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              className={`${styles.filterButton} ${active ? styles.filterButtonActive : ''}`}
              aria-pressed={active}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {loading && !resources && (
        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
          <p>Consulting secure directory...</p>
        </div>
      )}

      <div className={styles.resourceList}>
        {activeResources.map((resource, idx) => {
          const isSelected = selectedResource?.name === resource.name;
          return (
            <article
              key={`${resource.name}-${idx}`}
              className={`${styles.resourceCard} ${isSelected ? styles.resourceCardSelected : ''} ${resource.latitude ? styles.resourceCardClickable : ''}`}
              onClick={() => handleCardClick(resource)}
              role={resource.latitude ? 'button' : undefined}
              tabIndex={resource.latitude ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(resource)}
            >
              <div className={styles.resourceInfo}>
                <h2>{resource.name}</h2>
                <p className={styles.resourceMeta}>{resource.meta}</p>
                {resource.address && <p className={styles.resourceAddress}>{resource.address}</p>}
              </div>
              <div className={styles.resourceActions}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleCall(resource.phone); }}
                  disabled={!resource.phone}
                >
                  <Phone className={styles.tinyIcon} aria-hidden="true" />
                  Call
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDirections(resource.address); }}
                  disabled={!resource.address}
                >
                  <Map className={styles.tinyIcon} aria-hidden="true" />
                  Directions
                </button>
              </div>
            </article>
          );
        })}
        {activeResources.length === 0 && !loading && (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--pm-muted-foreground)' }}>
            No specific resources found in this category.
          </p>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '11px', color: 'var(--pm-muted-foreground)', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
}
