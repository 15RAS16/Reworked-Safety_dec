/**
 * SafeRoute Guardian - Unified Campus Safety Map Orchestrator (v2.1)
 * Uses Google Maps JavaScript API (GoogleCampusMap) as the primary map component.
 * Provides Leaflet / OpenStreetMap as an automatic fallback when:
 *   - No GOOGLE_MAPS_API_KEY is configured, OR
 *   - Google Maps API key fails / auth error / network offline.
 * Guarantees zero blank screens, clean unmount cleanup, and no dual-map container conflicts.
 * Adds a polished "Demo Map Mode" badge and "Reset Demo Map" button on the fallback map.
 */

window.InteractiveMap = function({
  routeWaypoints = [],
  corridorWidthMeters = 100,
  currentPos = null,
  travelerName = 'Traveler',
  travelerAvatar = '👨‍🎓',
  safetyLevel = 'SAFE',
  isDeviation = false,
  originName = 'MMU Main Gate',
  destinationName = 'Academic Block',
  isCompact = false,
  mapId = 'srg-campus-map',
  showCampusGeofence = true,
  onResetDemo = null
}) {
  // Determine initial engine: use Google only when a key is actually configured.
  const hasKey = window.ConfigService && window.ConfigService.hasGoogleMapsKey && window.ConfigService.hasGoogleMapsKey();
  const [activeEngine, setActiveEngine] = React.useState(hasKey ? 'google' : 'leaflet');

  // If active engine is Google Maps, render GoogleCampusMap with fallback handler
  if (activeEngine === 'google' && window.GoogleCampusMap) {
    return (
      <window.GoogleCampusMap
        mapId={mapId + '-gmap'}
        routeWaypoints={routeWaypoints}
        corridorWidthMeters={corridorWidthMeters}
        currentPos={currentPos}
        travelerName={travelerName}
        travelerAvatar={travelerAvatar}
        safetyLevel={safetyLevel}
        isDeviation={isDeviation}
        originName={originName}
        destinationName={destinationName}
        isCompact={isCompact}
        showCampusGeofence={showCampusGeofence}
        onFallbackToLeaflet={() => setActiveEngine('leaflet')}
      />
    );
  }

  // Secondary Leaflet / OpenStreetMap Fallback Component
  return (
    <LeafletCampusFallback
      mapId={mapId + '-leaflet'}
      routeWaypoints={routeWaypoints}
      corridorWidthMeters={corridorWidthMeters}
      currentPos={currentPos}
      travelerName={travelerName}
      travelerAvatar={travelerAvatar}
      safetyLevel={safetyLevel}
      isDeviation={isDeviation}
      originName={originName}
      destinationName={destinationName}
      isCompact={isCompact}
      showCampusGeofence={showCampusGeofence}
      onSwitchToGoogle={hasKey ? () => setActiveEngine('google') : null}
      onResetDemo={onResetDemo}
    />
  );
};

/**
 * Isolated Leaflet / OpenStreetMap Fallback Component
 * Renders the full MMU campus map experience using open-source tiles.
 */
function LeafletCampusFallback({
  routeWaypoints = [],
  corridorWidthMeters = 100,
  currentPos = null,
  travelerName = 'Traveler',
  travelerAvatar = '👨‍🎓',
  safetyLevel = 'SAFE',
  isDeviation = false,
  originName = 'MMU Main Gate',
  destinationName = 'Academic Block',
  isCompact = false,
  mapId = 'srg-leaflet-fallback',
  showCampusGeofence = true,
  onSwitchToGoogle,
  onResetDemo
}) {
  const mapContainerRef = React.useRef(null);
  const leafletMapRef = React.useRef(null);
  const [mapLoadError, setMapLoadError] = React.useState(false);

  const layersRef = React.useRef({
    routeLine: null,
    corridorBuffer: null,
    campusGeofence: null,
    travelerMarker: null,
    originMarker: null,
    destinationMarker: null,
    contextMarkers: []
  });

  const defaultCampusCenter = (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.centerCoords) || [28.6129, 77.2295];
  const campusBoundary = (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.boundaryPolygon) || [
    [30.2458, 77.0445],
    [30.2458, 77.0550],
    [30.2558, 77.0560],
    [30.2568, 77.0482],
    [30.2538, 77.0438],
    [30.2458, 77.0445]
  ];

  // Fixed campus POIs always displayed regardless of traveler position
  const campusPOIs = [
    { point: [28.6129, 77.2295], icon: '🛡️', label: 'India Gate Safety Point', category: 'Showcase Start Point' },
    { point: [28.6107, 77.2324], icon: '📍', label: 'National War Memorial', category: 'Verified Landmark' },
    { point: [28.6145, 77.2290], icon: '🆘', label: 'Kartavya Path Help Point', category: 'Safety Assistance' },
    { point: [28.6139, 77.2352], icon: '🏟️', label: 'National Stadium', category: 'Public Landmark' },
    { point: [28.6212, 77.2255], icon: '🏛️', label: 'Patiala House Court', category: 'Public Landmark' },
    { point: [28.6180, 77.2427], icon: '🚇', label: 'Pragati Maidan', category: 'Transit Landmark' }
  ];

  const getMarkerColor = () => {
    switch (safetyLevel) {
      case 'EMERGENCY': return '#EF4444';
      case 'HIGH_RISK': return '#EF4444';
      case 'CAUTION': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const generateCorridorPolygon = (waypoints, bufferMeters) => {
    if (!waypoints || waypoints.length < 2) return [];
    const latOffset = (bufferMeters / 111320);
    const leftSide = [];
    const rightSide = [];

    for (let i = 0; i < waypoints.length; i++) {
      const p = waypoints[i];
      if (!p || p.length < 2) continue;
      const cosLat = Math.cos(p[0] * Math.PI / 180) || 1;
      const lngOffset = (bufferMeters / (111320 * cosLat));

      leftSide.push([p[0] + latOffset, p[1] - lngOffset]);
      rightSide.unshift([p[0] - latOffset, p[1] + lngOffset]);
    }
    return leftSide.concat(rightSide);
  };

  // Cleanup all Leaflet layers safely
  const cleanupLayers = (map) => {
    if (!map || !window.L) return;
    const layers = layersRef.current;
    ['routeLine','corridorBuffer','campusGeofence','travelerMarker','originMarker','destinationMarker'].forEach(k => {
      if (layers[k]) {
        try { map.removeLayer(layers[k]); } catch(e) {}
        layers[k] = null;
      }
    });
    if (layers.contextMarkers && layers.contextMarkers.length > 0) {
      layers.contextMarkers.forEach(m => { try { map.removeLayer(m); } catch(e) {} });
      layers.contextMarkers = [];
    }
  };

  // Initialize Leaflet Map + draw static campus POIs
  React.useEffect(() => {
    if (!mapContainerRef.current) return;

    if (typeof window.L === 'undefined') {
      setMapLoadError(true);
      return;
    }

    if (leafletMapRef.current) {
      try { leafletMapRef.current.remove(); } catch (e) {}
      leafletMapRef.current = null;
    }

    try {
      const initialCenter = (routeWaypoints && routeWaypoints.length > 0 && routeWaypoints[0])
        ? routeWaypoints[0]
        : defaultCampusCenter;

      const map = window.L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 16,
        zoomControl: !isCompact,
        attributionControl: false
      });

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      leafletMapRef.current = map;
      setMapLoadError(false);

      // Draw static campus POIs immediately after map init
      layersRef.current.contextMarkers = campusPOIs.map(item =>
        window.L.marker(item.point, {
          icon: window.L.divIcon({
            className: 'srg-context-map-marker',
            html: `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#FFFFFF;border:2px solid #38BDF8;box-shadow:0 3px 10px rgba(0,0,0,.22);font-size:13px;" title="${item.label}">${item.icon}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          }),
          zIndexOffset: 700
        }).addTo(map).bindTooltip(`<b>${item.icon} ${item.label}</b><br><small>${item.category}</small>`, { direction: 'top' })
      );
    } catch (err) {
      console.warn('[SafeRoute Guardian] Leaflet fallback initialization failed:', err);
      setMapLoadError(true);
    }

    return () => {
      if (leafletMapRef.current) {
        try {
          cleanupLayers(leafletMapRef.current);
          leafletMapRef.current.remove();
        } catch (e) {}
        leafletMapRef.current = null;
      }
    };
  }, [mapId]);

  // Update Route, Corridor, Geofence Overlays
  React.useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;

    try {
      if (layersRef.current.campusGeofence) map.removeLayer(layersRef.current.campusGeofence);
      if (showCampusGeofence && campusBoundary && campusBoundary.length > 2) {
        layersRef.current.campusGeofence = window.L.polygon(campusBoundary, {
          color: '#10B981',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#10B981',
          fillOpacity: 0.05
        }).addTo(map).bindTooltip('MMU Mullana Campus Geofence', { sticky: true });
      }

      if (layersRef.current.corridorBuffer) map.removeLayer(layersRef.current.corridorBuffer);
      if (layersRef.current.routeLine) map.removeLayer(layersRef.current.routeLine);
      if (layersRef.current.originMarker) map.removeLayer(layersRef.current.originMarker);
      if (layersRef.current.destinationMarker) map.removeLayer(layersRef.current.destinationMarker);

      const validWaypoints = (routeWaypoints || []).filter(w => Array.isArray(w) && w.length >= 2);
      if (validWaypoints.length >= 2) {
        const corridorCoords = generateCorridorPolygon(validWaypoints, corridorWidthMeters);
        if (corridorCoords.length > 0) {
          layersRef.current.corridorBuffer = window.L.polygon(corridorCoords, {
            color: '#0284C7',
            weight: 2,
            dashArray: '5, 8',
            fillColor: '#38BDF8',
            fillOpacity: 0.16
          }).addTo(map).bindTooltip(`${corridorWidthMeters}m Safety Corridor Buffer`, { sticky: true });
        }

        layersRef.current.routeLine = window.L.polyline(validWaypoints, {
          color: '#2563EB',
          weight: 5,
          opacity: 0.95
        }).addTo(map);

        const origin = validWaypoints[0];
        const destination = validWaypoints[validWaypoints.length - 1];

        layersRef.current.originMarker = window.L.marker(origin, {
          icon: window.L.divIcon({
            className: 'srg-map-pin-origin',
            html: `<div style="background:#10B981;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:bold;">A</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        }).addTo(map).bindPopup(`<b>Start:</b> ${originName}`);

        layersRef.current.destinationMarker = window.L.marker(destination, {
          icon: window.L.divIcon({
            className: 'srg-map-pin-dest',
            html: `<div style="background:#2563EB;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:bold;">B</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        }).addTo(map).bindPopup(`<b>Destination:</b> ${destinationName}`);

        map.fitBounds(layersRef.current.routeLine.getBounds(), { padding: isCompact ? [20, 20] : [45, 45] });
      }
    } catch (e) {
      console.warn('[SafeRoute Guardian] Error drawing Leaflet layers:', e);
    }
  }, [routeWaypoints, corridorWidthMeters, originName, destinationName, showCampusGeofence]);

  // Update Traveler Marker
  React.useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !window.L || !currentPos) return;

    try {
      const markerColor = getMarkerColor();
      if (layersRef.current.travelerMarker) {
        map.removeLayer(layersRef.current.travelerMarker);
      }

      const travelerHtml = `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
          <div style="width:34px;height:34px;border-radius:50%;background:${markerColor};border:3px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.4);font-size:18px;">
            ${travelerAvatar || '🧭'}
          </div>
        </div>
      `;

      const travelerIcon = window.L.divIcon({
        className: 'srg-traveler-pin',
        html: travelerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      layersRef.current.travelerMarker = window.L.marker(currentPos, { icon: travelerIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<b>${travelerAvatar} ${travelerName}</b><br><span style="color:${markerColor};font-weight:bold;">${safetyLevel}</span><br><small>Lat: ${currentPos[0].toFixed(5)}, Lng: ${currentPos[1].toFixed(5)}</small>`);

      if (safetyLevel === 'EMERGENCY' || isDeviation) {
        map.panTo(currentPos, { animate: true, duration: 0.7 });
      }
    } catch (e) {
      console.warn('[SafeRoute Guardian] Error updating Leaflet traveler marker:', e);
    }
  }, [currentPos, safetyLevel, travelerName, travelerAvatar, isDeviation]);

  if (mapLoadError) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🛡️</div>
        <b style={{ color: '#F59E0B', fontSize: '1rem', marginBottom: '0.3rem' }}>
          Map temporarily unavailable. Safety controls remain active.
        </b>
        <p style={{ fontSize: '0.82rem', maxWidth: '400px', margin: '0 0 1rem 0', color: '#CBD5E1' }}>
          Corridor: {originName} &rarr; {destinationName} ({corridorWidthMeters}m geofence buffer).
        </p>
        <div style={{ background: '#1E293B', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.78rem', color: '#10B981' }}>
          &#10003; Active Position: {currentPos ? `${currentPos[0].toFixed(4)}, ${currentPos[1].toFixed(4)}` : 'On Route'}
        </div>
      </div>
    );
  }

  const safetyColor = safetyLevel === 'EMERGENCY' ? '#EF4444' : isDeviation ? '#F59E0B' : '#10B981';
  const safetyText = safetyLevel === 'EMERGENCY' ? 'SOS Active' : isDeviation ? 'Outside Corridor' : 'Safe in Geofence';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div id={mapId} ref={mapContainerRef} className="srg-map-container" />

      {/* MMU Campus Geofence Title Badge — top left */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px',
        background: 'rgba(11, 21, 40, 0.92)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px',
        padding: '5px 10px', fontSize: '11px', fontWeight: '800', color: '#38BDF8',
        display: 'flex', alignItems: 'center', gap: '6px', zIndex: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none'
      }}>
        <span>🏛️</span>
        <span>{(window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.geofenceLabel) || 'Safety Geofence — Demo Data'}</span>
      </div>

      {/* DEMO MAP MODE badge — top right (polished, competition-visible) */}
      <div style={{
        position: 'absolute', top: '12px', right: '12px',
        background: 'rgba(245, 158, 11, 0.18)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '8px',
        padding: '5px 10px', fontSize: '11px', fontWeight: '800', color: '#FCD34D',
        display: 'flex', alignItems: 'center', gap: '6px', zIndex: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', animation: 'srgPulse 1.5s ease-in-out infinite' }} />
        <span>Demo Map Mode</span>
        <span style={{ fontSize: '10px', fontWeight: '600', color: '#F59E0B', opacity: 0.85 }}>OpenStreetMap</span>
      </div>

      {/* Safety level status badge — middle right */}
      <div style={{
        position: 'absolute', top: '50px', right: '12px',
        background: 'rgba(11, 21, 40, 0.88)', backdropFilter: 'blur(8px)',
        border: `1px solid ${safetyColor}`, borderRadius: '8px',
        padding: '4px 9px', fontSize: '11px', fontWeight: '700', color: safetyColor,
        display: 'flex', alignItems: 'center', gap: '5px', zIndex: 500,
        boxShadow: '0 3px 10px rgba(0,0,0,0.25)', pointerEvents: 'none'
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: safetyColor, display: 'inline-block' }} />
        <span>{safetyText}</span>
      </div>

      {/* Reset Demo button — bottom right */}
      {onResetDemo && (
        <button
          type="button"
          id="srg-leaflet-reset-demo"
          onClick={onResetDemo}
          style={{
            position: 'absolute', bottom: '44px', right: '12px', zIndex: 500,
            background: 'rgba(11, 21, 40, 0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '8px',
            padding: '5px 10px', fontSize: '11px', fontWeight: '700', color: '#38BDF8',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.25)'
          }}
          title="Reset demo map to default MMU campus scenario"
        >
          <span>&#8635;</span>
          <span>Reset Demo Map</span>
        </button>
      )}

      {/* Bottom legend bar */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '12px',
        background: 'rgba(11, 21, 40, 0.92)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
        padding: '5px 11px', fontSize: '11px', color: '#E2E8F0',
        display: 'flex', alignItems: 'center', gap: '12px', zIndex: 500,
        flexWrap: 'wrap', pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '3px', background: '#2563EB', borderRadius: '1px' }}></span>
          <span>Approved Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(56,189,248,0.3)', border: '1px solid #0284C7', borderRadius: '2px' }}></span>
          <span>{corridorWidthMeters}m Buffer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: getMarkerColor() }}></span>
          <span>{travelerName} ({safetyLevel})</span>
        </div>
      </div>
    </div>
  );
}
