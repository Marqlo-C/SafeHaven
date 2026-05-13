import { useEffect, useRef } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DEFAULT_CENTER = [-121.4944, 38.5816];

function makeMarkerEl(color) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: color,
    border: '3px solid white',
    boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
    cursor: 'default',
  });
  return el;
}

export default function MapboxMap({ latitude, longitude, selectedResource }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const resourceMarkerRef = useRef(null);
  const coordsRef = useRef({ latitude, longitude });
  coordsRef.current = { latitude, longitude };

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    async function init() {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: DEFAULT_CENTER,
        zoom: 14,
        scrollZoom: false,
        attributionControl: false,
      });

      map.once('load', () => {
        if (cancelled) return;
        const { latitude: lat, longitude: lng } = coordsRef.current;
        if (lat && lng) {
          map.setCenter([lng, lat]);
          userMarkerRef.current = new mapboxgl.Marker({ element: makeMarkerEl('#1A73E8') })
            .setLngLat([lng, lat])
            .addTo(map);
        }
        mapRef.current = map;
      });

      const observer = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          const { latitude: lat, longitude: lng } = coordsRef.current;
          if (lat && lng) mapRef.current.setCenter([lng, lat]);
        }
      });
      observer.observe(containerRef.current);
      containerRef.current._mapObserver = observer;
    }

    init();

    return () => {
      cancelled = true;
      if (containerRef.current?._mapObserver) {
        containerRef.current._mapObserver.disconnect();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      userMarkerRef.current = null;
      resourceMarkerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update user pin when location changes
  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([longitude, latitude]);
    } else {
      import('mapbox-gl').then(({ default: mapboxgl }) => {
        if (!mapRef.current) return;
        userMarkerRef.current = new mapboxgl.Marker({ element: makeMarkerEl('#1A73E8') })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      });
    }

    // Only re-center on user if no resource is selected
    if (!resourceMarkerRef.current) {
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14, duration: 800 });
    }
  }, [latitude, longitude]);

  // Show/hide red resource pin and fit bounds
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous resource marker
    if (resourceMarkerRef.current) {
      resourceMarkerRef.current.remove();
      resourceMarkerRef.current = null;
    }

    if (!selectedResource?.latitude || !selectedResource?.longitude) {
      // Deselected — fly back to user
      const { latitude: lat, longitude: lng } = coordsRef.current;
      if (lat && lng) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 600 });
      }
      return;
    }

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (!mapRef.current) return;

      resourceMarkerRef.current = new mapboxgl.Marker({ color: '#E53935' })
        .setLngLat([selectedResource.longitude, selectedResource.latitude])
        .addTo(mapRef.current);

      const { latitude: userLat, longitude: userLng } = coordsRef.current;
      if (userLat && userLng) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userLng, userLat]);
        bounds.extend([selectedResource.longitude, selectedResource.latitude]);
        mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
      } else {
        mapRef.current.flyTo({
          center: [selectedResource.longitude, selectedResource.latitude],
          zoom: 14,
          duration: 800,
        });
      }
    });
  }, [selectedResource]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
