/**
 * SafeRoute Guardian - MapTiler Campus Safety Map Component (v2.1)
 * Primary map using MapTiler SDK JS / MapLibre GL JS.
 * Centered on Marina Bay, Singapore (1.2838, 103.8607).
 *
 * Renders:
 *  - Outer geofence polygon (transparent green)
 *  - Approved route polyline (blue)
 *  - Route protection corridor/buffer (translucent blue)
 *  - Live traveler marker (green / amber / red based on safety state)
 *  - Showcase POI markers: Merlion Park, Marina Bay Sands, Gardens by the Bay, Safe Help Point
 *  - "Competition Demo Mode" badge + Legend
 *
 * Falls back gracefully by calling onFallbackToLeaflet() if SDK load fails or key is missing.
 *
 * SECURITY: API key is read from ConfigService (window.VITE_MAPTILER_API_KEY or MAPTILER_API_KEY).
 * Never hardcode the key here.
 */

window.MapTilerCampusMap = function({
  mapId = 'srg-maptiler-map',
  routeWaypoints = [],
  corridorWidthMeters = 100,
  currentPos = null,
  travelerName = 'Traveler',
  travelerAvatar = '🎒',
  safetyLevel = 'SAFE',
  isDeviation = false,
  originName = 'Merlion Park',
  destinationName = 'Gardens by the Bay',
  isCompact = false,
  showCampusGeofence = true,
  onFallbackToLeaflet = null
}) {
  const mapContainerRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const sourceIdsRef = React.useRef([]);
  const layerIdsRef = React.useRef([]);
  const isCancelledRef = React.useRef(false);

  const [mapState, setMapState] = React.useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorReason, setErrorReason] = React.useState('');

  // Marina Bay campus data
  const campus = (window.SRG_DATA && window.SRG_DATA.campus) || {};
  const campusCenter = campus.centerCoords || [1.2838, 103.8607];
  const campusBoundary = campus.boundaryPolygon || [
    [1.2800, 103.8550],
    [1.2800, 103.8665],
    [1.2875, 103.8665],
    [1.2875, 103.8550],
    [1.2800, 103.8550]
  ];

  // Static showcase POIs
  const showcasePOIs = [
    { coords: [1.2850, 103.8560], icon: '🦁', label: 'Merlion Park', sub: 'Iconic Singapore Landmark' },
    { coords: [1.2834, 103.8607], icon: '🏨', label: 'Marina Bay Sands', sub: 'Waterfront Landmark' },
    { coords: [1.2816, 103.8636], icon: '🌿', label: 'Gardens by the Bay', sub: 'National Garden' },
    { coords: [1.2825, 103.8618], icon: '🛡️', label: 'Safe Help Point', sub: '24/7 Security Post' }
  ];

  const getMarkerColor = (level) => {
    switch (level) {
      case 'EMERGENCY':
      case 'HIGH_RISK': return '#EF4444';
      case 'CAUTION': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const markerColor = getMarkerColor(safetyLevel);

  // Convert lat/lng array to GeoJSON [lng, lat]
  const toGeoCoord = (pt) => [pt[1], pt[0]];
  const toGeoCoords = (pts) => pts.map(toGeoCoord);

  // Generate corridor buffer polygon (simplified offset)
  const buildCorridorGeoJSON = (waypoints, bufferMeters) => {
    if (!waypoints || waypoints.length < 2) return null;
    const latOff = bufferMeters / 111320;
    const left = [], right = [];
    for (let i = 0; i < waypoints.length; i++) {
      const p = waypoints[i];
      const cosLat = Math.cos(p[0] * Math.PI / 180) || 1;
      const lngOff = bufferMeters / (111320 * cosLat);
      left.push([p[1] - lngOff, p[0] + latOff]);
      right.unshift([p[1] + lngOff, p[0] - latOff]);
    }
    const ring = [...left, ...right, left[0]];
    return { type: 'Polygon', coordinates: [ring] };
  };

  // Create DOM element marker for MapLibre
  const createDomMarker = (emoji, bgColor, size, tooltipText) => {
    const el = document.createElement('div');
    el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${bgColor};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${Math.floor(size*0.48)}px;box-shadow:0 3px 12px rgba(0,0,0,0.4);cursor:pointer;transition:transform 0.15s ease;`;
    el.textContent = emoji;
    el.title = tooltipText || emoji;
    el.onmouseenter = () => { el.style.transform = 'scale(1.15)'; };
    el.onmouseleave = () => { el.style.transform = 'scale(1)'; };
    return el;
  };

  // Add/update all map data sources and layers
  const drawLayers = (map, waypoints, bufferM, boundary) => {
    if (!map || isCancelledRef.current) return;

    // Clean up old sources / layers first
    layerIdsRef.current.forEach(id => {
      try { if (map.getLayer(id)) map.removeLayer(id); } catch (e) {}
    });
    sourceIdsRef.current.forEach(id => {
      try { if (map.getSource(id)) map.removeSource(id); } catch (e) {}
    });
    layerIdsRef.current = [];
    sourceIdsRef.current = [];

    const validWaypoints = (waypoints || []).filter(w => Array.isArray(w) && w.length >= 2);

    try {
      // 1. Outer geofence polygon
      if (showCampusGeofence && boundary && boundary.length > 2) {
        const geoRing = [...toGeoCoords(boundary), toGeoCoord(boundary[0])];
        map.addSource('srg-geofence', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [geoRing] } }
        });
        map.addLayer({
          id: 'srg-geofence-fill',
          type: 'fill',
          source: 'srg-geofence',
          paint: { 'fill-color': '#10B981', 'fill-opacity': 0.08 }
        });
        map.addLayer({
          id: 'srg-geofence-border',
          type: 'line',
          source: 'srg-geofence',
          paint: { 'line-color': '#10B981', 'line-width': 2.5, 'line-dasharray': [5, 4] }
        });
        sourceIdsRef.current.push('srg-geofence');
        layerIdsRef.current.push('srg-geofence-fill', 'srg-geofence-border');
      }

      if (validWaypoints.length >= 2) {
        // 2. Corridor buffer polygon
        const corridorGeo = buildCorridorGeoJSON(validWaypoints, bufferM);
        if (corridorGeo) {
          map.addSource('srg-corridor', {
            type: 'geojson',
            data: { type: 'Feature', geometry: corridorGeo }
          });
          map.addLayer({
            id: 'srg-corridor-fill',
            type: 'fill',
            source: 'srg-corridor',
            paint: { 'fill-color': '#38BDF8', 'fill-opacity': 0.18 }
          });
          map.addLayer({
            id: 'srg-corridor-border',
            type: 'line',
            source: 'srg-corridor',
            paint: { 'line-color': '#0284C7', 'line-width': 1.5, 'line-dasharray': [5, 8] }
          });
          sourceIdsRef.current.push('srg-corridor');
          layerIdsRef.current.push('srg-corridor-fill', 'srg-corridor-border');
        }

        // 3. Route polyline
        map.addSource('srg-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: toGeoCoords(validWaypoints) }
          }
        });
        map.addLayer({
          id: 'srg-route-line',
          type: 'line',
          source: 'srg-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2563EB', 'line-width': 5, 'line-opacity': 0.95 }
        });
        sourceIdsRef.current.push('srg-route');
        layerIdsRef.current.push('srg-route-line');

        // Fit map to route
        const allPts = validWaypoints.map(toGeoCoord);
        const minLng = Math.min(...allPts.map(c => c[0])) - 0.003;
        const maxLng = Math.max(...allPts.map(c => c[0])) + 0.003;
        const minLat = Math.min(...allPts.map(c => c[1])) - 0.003;
        const maxLat = Math.max(...allPts.map(c => c[1])) + 0.003;
        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: isCompact ? 20 : 50 });
      }
    } catch (e) {
      console.warn('[SafeRoute Guardian] MapTiler drawLayers error:', e);
    }
  };

  // Keep DOM markers in a separate state so we can update the traveler marker cleanly
  const travelerMarkerRef = React.useRef(null);

  const updateTravelerMarker = (map, pos, level, name, avatar) => {
    if (!map || !pos) return;
    const color = getMarkerColor(level);

    if (travelerMarkerRef.current) {
      travelerMarkerRef.current.remove();
      travelerMarkerRef.current = null;
    }

    const el = createDomMarker(avatar || '🎒', color, 38, `${avatar} ${name} — ${level}`);
    try {
      travelerMarkerRef.current = new window.maptilersdk.Marker({ element: el, anchor: 'center' })
        .setLngLat(toGeoCoord(pos))
        .setPopup(new window.maptilersdk.Popup({ offset: 22 })
          .setHTML(`<b>${avatar} ${name}</b><br><span style="color:${color};font-weight:bold">${level}</span><br><small>Lat: ${pos[0].toFixed(5)}, Lng: ${pos[1].toFixed(5)}</small>`)
        )
        .addTo(map);
    } catch (e) {
      console.warn('[SafeRoute Guardian] traveler marker error:', e);
    }
  };

  // Initialize MapTiler map
  React.useEffect(() => {
    isCancelledRef.current = false;

    if (!mapContainerRef.current) return;

    // Load MapTiler SDK
    window.MapTilerService.loadScript().then((sdk) => {
      if (isCancelledRef.current) return;

      const key = window.ConfigService && window.ConfigService.getMapTilerApiKey
        ? window.ConfigService.getMapTilerApiKey() : '';

      sdk.config.apiKey = key;

      // Destroy any existing map
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }

      const initialCenter = (routeWaypoints && routeWaypoints.length > 0 && routeWaypoints[0])
        ? toGeoCoord(routeWaypoints[0])
        : toGeoCoord(campusCenter);

      try {
        const map = new sdk.Map({
          container: mapContainerRef.current,
          style: sdk.MapStyle.STREETS,
          center: initialCenter,
          zoom: isCompact ? 14 : 15,
          attributionControl: false,
          logoPosition: 'bottom-right'
        });

        mapInstanceRef.current = map;

        // Auth / tile error detection
        map.on('error', (e) => {
          const msg = (e.error && e.error.message) || '';
          if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized') || msg.includes('forbidden')) {
            console.warn('[SafeRoute Guardian] MapTiler auth error. Falling back to OpenStreetMap.', e.error);
            if (onFallbackToLeaflet) {
              isCancelledRef.current = true;
              onFallbackToLeaflet();
            }
          }
        });

        map.on('load', () => {
          if (isCancelledRef.current) return;
          setMapState('ready');

          drawLayers(map, routeWaypoints, corridorWidthMeters, campusBoundary);

          // Add showcase POI markers
          showcasePOIs.forEach(poi => {
            const el = createDomMarker(poi.icon, '#FFFFFF', 30, `${poi.label} — ${poi.sub}`);
            try {
              const marker = new sdk.Marker({ element: el, anchor: 'center' })
                .setLngLat(toGeoCoord(poi.coords))
                .setPopup(new sdk.Popup({ offset: 18 }).setHTML(`<b>${poi.icon} ${poi.label}</b><br><small>${poi.sub}</small>`))
                .addTo(map);
              markersRef.current.push(marker);
            } catch (e) {}
          });

          // Add origin / destination markers
          if (routeWaypoints && routeWaypoints.length >= 2) {
            const originEl = createDomMarker('📍', '#10B981', 30, `Start: ${originName}`);
            try {
              const om = new sdk.Marker({ element: originEl, anchor: 'center' })
                .setLngLat(toGeoCoord(routeWaypoints[0]))
                .setPopup(new sdk.Popup().setHTML(`<b>Start:</b> ${originName}`))
                .addTo(map);
              markersRef.current.push(om);
            } catch (e) {}

            const destEl = createDomMarker('🏁', '#2563EB', 30, `Destination: ${destinationName}`);
            try {
              const dm = new sdk.Marker({ element: destEl, anchor: 'center' })
                .setLngLat(toGeoCoord(routeWaypoints[routeWaypoints.length - 1]))
                .setPopup(new sdk.Popup().setHTML(`<b>Destination:</b> ${destinationName}`))
                .addTo(map);
              markersRef.current.push(dm);
            } catch (e) {}
          }

          // Initial traveler marker
          if (currentPos) {
            updateTravelerMarker(map, currentPos, safetyLevel, travelerName, travelerAvatar);
          }
        });

      } catch (err) {
        console.warn('[SafeRoute Guardian] MapTiler Map init error:', err);
        if (isCancelledRef.current) return;
        setMapState('error');
        setErrorReason(err.message || 'Map init failed');
        if (onFallbackToLeaflet) onFallbackToLeaflet();
      }

    }).catch((err) => {
      if (isCancelledRef.current) return;
      console.warn('[SafeRoute Guardian] MapTiler SDK load failed:', err.message);
      setMapState('error');
      setErrorReason(err.message);
      if (onFallbackToLeaflet) onFallbackToLeaflet();
    });

    return () => {
      isCancelledRef.current = true;
      markersRef.current.forEach(m => { try { m.remove(); } catch (e) {} });
      markersRef.current = [];
      if (travelerMarkerRef.current) {
        try { travelerMarkerRef.current.remove(); } catch (e) {}
        travelerMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [mapId]);

  // React to route / geofence prop changes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mapState !== 'ready') return;
    drawLayers(map, routeWaypoints, corridorWidthMeters, campusBoundary);
  }, [routeWaypoints, corridorWidthMeters, showCampusGeofence, mapState]);

  // React to traveler position / safety level changes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mapState !== 'ready') return;
    if (!currentPos) return;
    updateTravelerMarker(map, currentPos, safetyLevel, travelerName, travelerAvatar);
    if (safetyLevel === 'EMERGENCY' || isDeviation) {
      try {
        map.panTo(toGeoCoord(currentPos), { duration: 700 });
      } catch (e) {}
    }
  }, [currentPos, safetyLevel, travelerName, travelerAvatar, isDeviation, mapState]);

  const safetyColor = markerColor;
  const safetyText = safetyLevel === 'EMERGENCY'
    ? 'SOS Active'
    : (safetyLevel === 'HIGH_RISK' || isDeviation)
    ? 'Outside Safe Corridor'
    : 'Safe — Inside Geofence';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: isCompact ? '280px' : '420px' }}>
      {/* Map container */}
      <div
        id={mapId}
        ref={mapContainerRef}
        className="srg-map-container"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading overlay */}
      {mapState === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10, 25, 47, 0.92)', borderRadius: '12px',
          color: '#94A3B8', gap: '0.6rem', zIndex: 600
        }}>
          <div style={{ fontSize: '2rem' }}>🗺️</div>
          <div style={{ color: '#38BDF8', fontWeight: '700', fontSize: '0.9rem' }}>
            Loading Marina Bay Safety Map…
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            MapTiler SDK initialising
          </div>
        </div>
      )}

      {/* Marina Bay Geofence Badge — top left */}
      {mapState === 'ready' && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(11,21,40,0.92)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px',
          padding: '5px 10px', fontSize: '11px', fontWeight: '800', color: '#38BDF8',
          display: 'flex', alignItems: 'center', gap: '6px', zIndex: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none'
        }}>
          <span>🦁</span>
          <span>Marina Bay Waterfront Safety Geofence</span>
        </div>
      )}

      {/* Competition Demo Mode badge — top right */}
      {mapState === 'ready' && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(245,158,11,0.18)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(245,158,11,0.5)', borderRadius: '8px',
          padding: '5px 10px', fontSize: '11px', fontWeight: '800', color: '#FCD34D',
          display: 'flex', alignItems: 'center', gap: '6px', zIndex: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', animation: 'srgPulse 1.5s ease-in-out infinite' }} />
          <span>Competition Demo Mode</span>
          <span style={{ fontSize: '10px', fontWeight: '600', color: '#F59E0B', opacity: 0.85 }}>MapTiler</span>
        </div>
      )}

      {/* Safety status badge — below top-right */}
      {mapState === 'ready' && (
        <div style={{
          position: 'absolute', top: '50px', right: '12px',
          background: 'rgba(11,21,40,0.88)', backdropFilter: 'blur(8px)',
          border: `1px solid ${safetyColor}`, borderRadius: '8px',
          padding: '4px 9px', fontSize: '11px', fontWeight: '700', color: safetyColor,
          display: 'flex', alignItems: 'center', gap: '5px', zIndex: 500,
          boxShadow: '0 3px 10px rgba(0,0,0,0.25)', pointerEvents: 'none'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: safetyColor, display: 'inline-block' }} />
          <span>{safetyText}</span>
        </div>
      )}

      {/* Bottom legend bar */}
      {mapState === 'ready' && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          background: 'rgba(11,21,40,0.92)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
          padding: '5px 11px', fontSize: '11px', color: '#E2E8F0',
          display: 'flex', alignItems: 'center', gap: '12px', zIndex: 500,
          flexWrap: 'wrap', pointerEvents: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '3px', background: '#2563EB', borderRadius: '1px' }} />
            <span>Approved Route</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(56,189,248,0.3)', border: '1px solid #0284C7', borderRadius: '2px' }} />
            <span>{corridorWidthMeters}m Buffer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(16,185,129,0.3)', border: '1px solid #10B981', borderRadius: '2px' }} />
            <span>Safe Geofence</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: safetyColor }} />
            <span>{travelerName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
