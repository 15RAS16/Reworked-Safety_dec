/**
 * SafeRoute Guardian - Unified Campus Safety Map Orchestrator (v2.0)
 * Uses Google Maps JavaScript API (GoogleCampusMap) as the primary map component.
 * Provides Leaflet / OpenStreetMap strictly as an isolated secondary fallback.
 * Guarantees zero blank screens, clean unmount cleanup, and no dual-map container conflicts.
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
  showCampusGeofence = true
}) {
  // If Google Maps API key is configured or GoogleCampusMap is ready, use it as primary
  const hasKey = window.ConfigService && window.ConfigService.hasGoogleMapsKey && window.ConfigService.hasGoogleMapsKey();
  const [activeEngine, setActiveEngine] = React.useState(hasKey ? 'google' : 'google'); // default google, switches to leaflet on explicit fallback

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
      onSwitchToGoogle={() => setActiveEngine('google')}
    />
  );
};

/**
 * Isolated Leaflet / OpenStreetMap Fallback Component
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
  onSwitchToGoogle
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

  const defaultCampusCenter = (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.centerCoords) || [30.2505, 77.0495];
  const campusBoundary = (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.boundaryPolygon) || [
    [30.2458, 77.0445],
    [30.2458, 77.0550],
    [30.2558, 77.0560],
    [30.2568, 77.0482],
    [30.2538, 77.0438],
    [30.2458, 77.0445]
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

  // Initialize Leaflet Map
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

      const tileLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      });

      tileLayer.addTo(map);
      leafletMapRef.current = map;
      setMapLoadError(false);
    } catch (err) {
      console.warn('[SafeRoute Guardian] Leaflet fallback initialization failed:', err);
      setMapLoadError(true);
    }

    return () => {
      if (leafletMapRef.current) {
        try { leafletMapRef.current.remove(); } catch (e) {}
        leafletMapRef.current = null;
      }
    };
  }, [mapId]);

  // Update Overlays
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
        }).addTo(map);
      }

      if (layersRef.current.corridorBuffer) map.removeLayer(layersRef.current.corridorBuffer);
      if (layersRef.current.routeLine) map.removeLayer(layersRef.current.routeLine);

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
          }).addTo(map);
        }

        layersRef.current.routeLine = window.L.polyline(validWaypoints, {
          color: '#2563EB',
          weight: 5,
          opacity: 0.95
        }).addTo(map);

        if (layersRef.current.originMarker) map.removeLayer(layersRef.current.originMarker);
        if (layersRef.current.destinationMarker) map.removeLayer(layersRef.current.destinationMarker);

        const origin = validWaypoints[0];
        const destination = validWaypoints[validWaypoints.length - 1];

        const originIcon = window.L.divIcon({
          className: 'srg-map-pin-origin',
          html: `<div style="background:#10B981; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:12px; font-weight:bold;">A</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const destIcon = window.L.divIcon({
          className: 'srg-map-pin-dest',
          html: `<div style="background:#2563EB; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:12px; font-weight:bold;">B</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        layersRef.current.originMarker = window.L.marker(origin, { icon: originIcon }).addTo(map).bindPopup(`<b>Start:</b> ${originName}`);
        layersRef.current.destinationMarker = window.L.marker(destination, { icon: destIcon }).addTo(map).bindPopup(`<b>Destination:</b> ${destinationName}`);

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
      const isEmergency = safetyLevel === 'EMERGENCY';

      if (layersRef.current.travelerMarker) {
        map.removeLayer(layersRef.current.travelerMarker);
      }

      const travelerHtml = `
        <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
          <div style="width:34px; height:34px; border-radius:50%; background:${markerColor}; border:3px solid #FFFFFF; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 12px rgba(0,0,0,0.4); font-size:18px;">
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

      layersRef.current.travelerMarker = window.L.marker(currentPos, { icon: travelerIcon, zIndexOffset: 1000 }).addTo(map);

      // Context POIs
      layersRef.current.contextMarkers.forEach(m => map.removeLayer(m));
      const contextPoints = [
        { point: [30.2530, 77.0535], icon: '🏥', label: 'MM Hospital Emergency Center' },
        { point: [30.2472, 77.0468], icon: '🏛️', label: 'MMU Main Gate Security Post' },
        { point: [30.2495, 77.0492], icon: '📚', label: 'Central Library Helpdesk' },
        { point: [30.2468, 77.0460], icon: '🚌', label: 'Campus Bus Stop' }
      ];

      layersRef.current.contextMarkers = contextPoints.map(item => window.L.marker(item.point, {
        icon: window.L.divIcon({ className: 'srg-context-map-marker', html: `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#FFFFFF;border:2px solid #38BDF8;box-shadow:0 3px 10px rgba(0,0,0,.22);font-size:13px;">${item.icon}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
        zIndexOffset: 700
      }).addTo(map).bindTooltip(item.label, { direction: 'top' }));

      if (isEmergency || isDeviation) {
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
          Map is temporarily unavailable. Safety controls and demo mode remain available.
        </b>
        <p style={{ fontSize: '0.82rem', maxWidth: '400px', margin: '0 0 1rem 0', color: '#CBD5E1' }}>
          Corridor: {originName} → {destinationName} ({corridorWidthMeters}m geofence buffer).
        </p>
        <div style={{ background: '#1E293B', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.78rem', color: '#10B981' }}>
          ✓ Active Position: {currentPos ? `${currentPos[0].toFixed(4)}, ${currentPos[1].toFixed(4)}` : 'On Route'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div id={mapId} ref={mapContainerRef} className="srg-map-container" />
      
      {/* MMU Campus Geofence Title Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(11, 21, 40, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '800',
        color: '#38BDF8',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        pointerEvents: 'none'
      }}>
        <span>🏛️</span>
        <span>MMU Mullana Campus Safety Geofence — Demo / Simulated Data</span>
      </div>

      {/* Fallback Notice */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(15, 23, 42, 0.88)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '4px 8px',
        fontSize: '10px',
        color: '#94A3B8',
        zIndex: 500
      }}>
        OpenStreetMap Fallback Mode
      </div>
    </div>
  );
}
