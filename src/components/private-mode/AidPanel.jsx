import { useState, useEffect } from 'react';
import { Lock, MapPin, Phone, Map, Shield } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import styles from '../../styles/PrivateModeShell.module.css';

const FILTERS = [
  { key: 'shelter', label: 'Shelters' },
  { key: 'legal', label: 'Legal Aid' },
  { key: 'financial', label: 'Financial' },
  { key: 'counseling', label: 'Counseling' },
];

const PLACEHOLDER_RESOURCES = {
  shelter: [
    { name: "Safe Harbor Women's Shelter", meta: '0.8 mi - Open 24 hours' },
    { name: 'Hope House Emergency Refuge', meta: '1.4 mi - Open until 9 PM' },
  ],
  legal: [
    { name: 'Community Legal Aid Society', meta: '1.1 mi - Open until 5 PM' },
  ],
  financial: [
    { name: 'Emergency Assistance Fund', meta: '0.5 mi - Open until 6 PM' },
  ],
  counseling: [
    { name: 'Trauma Recovery Counseling', meta: '1.8 mi - Open until 8 PM' },
  ],
};

export default function AidPanel() {
  const [activeFilter, setActiveFilter] = useState('shelter');
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { location, startLiveLocation, status } = useGeolocation();

  useEffect(() => {
    // Start getting location when the panel mounts
    if (!location) {
      startLiveLocation();
    }
  }, [location, startLiveLocation]);

  useEffect(() => {
    async function fetchNearbyAid() {
      if (!location) return;
      
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/aid/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch nearby resources.');

        const data = await res.json();
        setResources(data);
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

  const activeResources = (resources || PLACEHOLDER_RESOURCES)[activeFilter] || [];

  return (
    <div className={styles.aidPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Search results are context-aware and not stored on this device.</span>
      </div>

      <div className={styles.resourceMap}>
        <div className={styles.mapPattern} aria-hidden="true" />
        <MapPin className={`${styles.resourcePin} ${styles.resourcePinOne}`} aria-hidden="true" />
        <MapPin className={`${styles.resourcePin} ${styles.resourcePinTwo}`} aria-hidden="true" />
        <MapPin className={`${styles.resourcePin} ${styles.resourcePinThree}`} aria-hidden="true" />
        {location && (
          <div className={styles.userPin} style={{ position: 'absolute', top: '50%', left: '50%' }}>
            <span className={styles.pinPulse} />
            <span className={styles.pinDot} />
          </div>
        )}
        <div className={styles.mapCaption}>
          {status === 'live' ? 'Showing resources near you' : 'Finding nearby help...'}
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
        {activeResources.map((resource, idx) => (
          <article key={`${resource.name}-${idx}`} className={styles.resourceCard}>
            <h2>{resource.name}</h2>
            <p>{resource.meta}</p>
            <div className={styles.resourceActions}>
              <button type="button">
                <Phone className={styles.tinyIcon} aria-hidden="true" />
                Call
              </button>
              <button type="button">
                <Map className={styles.tinyIcon} aria-hidden="true" />
                Directions
              </button>
            </div>
          </article>
        ))}
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
