/**
 * SafeRoute Guardian - Interactive Leaflet Map Component (v2.0)
 * Visualizes:
 * - Maharishi Markandeshwar (Deemed to be University), Mullana, Ambala, Haryana campus geofencing
 * - Approved safe corridors (with buffer polygon)
 * - Live traveler position (with status color pulse)
 * - Campus landmarks, safe spots, and verified local helpers
 * - Non-crashing graceful fallback if Leaflet or tile servers are unreachable
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
  mapId = 'srg-leaflet-map',
  showCampusGeofence = true
}) {
  const mapContainerRef = React.useRef(null);
  const leafletMapRef = React.useRef(null);
  const [mapLoadError, setMapLoadError] = React.useState(false);
  const [isTileLoading, setIsTileLoading] = React.useState(true);

  const layersRef = React.useRef({
    routeLine: null,
    corridorBuffer: null,
    campusGeofence: null,
    travelerMarker: null,
    originMarker: null,
    destinationMarker: null,
    contextMarkers: []
  });

  // Default campus center: MMU Mullana, Ambala Cantonment, Haryana
  const defaultCampusCenter = (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.centerCoords) || [30.2505, 77.0495];
  const campusBoundary = (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.boundaryPolygon) || [
    [30.2458, 77.0445],
    [30.2458, 77.0550],
    [30.2558, 77.0560],
    [30.2568, 77.0482],
    [30.2538, 77.0438],
    [30.2458, 77.0445]
  ];

  // Color mapping based on safety level
  const getMarkerColor = () => {
    switch (safetyLevel) {
      case 'EMERGENCY': return '#EF4444';
      case 'HIGH_RISK': return '#F97316';
      case 'CAUTION': return '#F59E0B';
      default: return '#10B981';
    }
  };

  // Generate corridor polygon buffer around route waypoints
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

  // Initialize Map with defensive safety
  React.useEffect(() => {
    if (!mapContainerRef.current) return;

    if (typeof window.L === 'undefined') {
      console.warn('[SafeRoute Guardian] Leaflet library not detected. Rendering graceful fallback.');
      setMapLoadError(true);
      return;
    }

    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.remove();
      } catch (e) {}
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

      // Dark-mode themed CartoDB / OpenStreetMap tile layer
      const tileLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      });

      tileLayer.on('load', () => setIsTileLoading(false));
      tileLayer.on('tileerror', () => {
        setIsTileLoading(false);
        // Non-crashing tile warning
      });

      tileLayer.addTo(map);
      leafletMapRef.current = map;
      setMapLoadError(false);
    } catch (err) {
      console.error('[SafeRoute Guardian] Map initialization failed:', err);
      setMapLoadError(true);
    }

    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {}
        leafletMapRef.current = null;
      }
    };
  }, [mapId]);

  // Update Campus Geofence, Route Corridor, and Markers
  React.useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;

    try {
      // 1. Draw Campus Perimeter Geofence Polygon
      if (layersRef.current.campusGeofence) {
        map.removeLayer(layersRef.current.campusGeofence);
      }
      if (showCampusGeofence && campusBoundary && campusBoundary.length > 2) {
        layersRef.current.campusGeofence = window.L.polygon(campusBoundary, {
          color: '#10B981',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#10B981',
          fillOpacity: 0.04
        }).addTo(map);
        layersRef.current.campusGeofence.bindTooltip('🏛️ MMU Mullana Campus Safety Geofence — Demo Data', { sticky: true });
      }

      // 2. Draw Safe Corridor Buffer
      if (layersRef.current.corridorBuffer) {
        map.removeLayer(layersRef.current.corridorBuffer);
      }
      const validWaypoints = (routeWaypoints || []).filter(w => Array.isArray(w) && w.length >= 2);
      if (validWaypoints.length >= 2) {
        const corridorCoords = generateCorridorPolygon(validWaypoints, corridorWidthMeters);
        if (corridorCoords.length > 0) {
          layersRef.current.corridorBuffer = window.L.polygon(corridorCoords, {
            color: '#0284C7',
            weight: 2,
            dashArray: '5, 8',
            fillColor: '#38BDF8',
            fillOpacity: 0.14
          }).addTo(map);
          layersRef.current.corridorBuffer.bindTooltip(`Approved Safe Corridor (${corridorWidthMeters}m Geofence Buffer)`, { sticky: true });
        }

        // 3. Draw Route Polyline
        if (layersRef.current.routeLine) {
          map.removeLayer(layersRef.current.routeLine);
        }
        layersRef.current.routeLine = window.L.polyline(validWaypoints, {
          color: '#2563EB',
          weight: 5,
          opacity: 0.92,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        // 4. Origin & Destination Markers
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

        // Smooth Bounds
        map.fitBounds(layersRef.current.routeLine.getBounds(), { padding: isCompact ? [20, 20] : [45, 45] });
      }
    } catch (e) {
      console.warn('[SafeRoute Guardian] Error drawing route layers:', e);
    }
  }, [routeWaypoints, corridorWidthMeters, originName, destinationName, showCampusGeofence]);

  // Update Live Traveler Position & Context Markers
  React.useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !window.L || !currentPos) return;

    try {
      const markerColor = getMarkerColor();
      const isEmergency = safetyLevel === 'EMERGENCY';

      if (layersRef.current.travelerMarker) {
        map.removeLayer(layersRef.current.travelerMarker);
      }

      const pulseClass = isEmergency ? 'srg-pulse' : '';
      const travelerHtml = `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div class="${pulseClass}" style="position:absolute; width:100%; height:100%; border-radius:50%; background:${markerColor}; opacity:0.35;"></div>
          <div style="width:34px; height:34px; border-radius:50%; background:${markerColor}; border:3px solid #FFFFFF; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 12px rgba(0,0,0,0.4); font-size:18px;">
            ${travelerAvatar || '🧭'}
          </div>
        </div>
      `;

      const travelerIcon = window.L.divIcon({
        className: 'srg-traveler-pin',
        html: travelerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      layersRef.current.travelerMarker = window.L.marker(currentPos, { icon: travelerIcon, zIndexOffset: 1000 }).addTo(map);
      layersRef.current.travelerMarker.bindPopup(`
        <div style="font-family:sans-serif; min-width:150px;">
          <b style="color:#0F172A; font-size:13px;">${travelerName}</b><br/>
          <span style="display:inline-block; margin-top:4px; padding:2px 8px; border-radius:12px; background:${markerColor}; color:#fff; font-size:11px; font-weight:bold;">
            Status: ${safetyLevel}
          </span>
          <div style="font-size:10px; color:#64748B; margin-top:4px;">
            Simulated GPS: ${currentPos[0].toFixed(4)}, ${currentPos[1].toFixed(4)}
          </div>
        </div>
      `);

      // Campus Context Safe Spot Markers
      layersRef.current.contextMarkers.forEach(marker => map.removeLayer(marker));
      const contextPoints = [
        { point: [30.2530, 77.0535], icon: '🏥', label: 'MM Hospital Emergency Center' },
        { point: [30.2472, 77.0468], icon: '👮', label: 'MMU Gate 1 Security Post' },
        { point: [30.2495, 77.0510], icon: 'ℹ️', label: 'Central Library Helpdesk' },
        { point: [30.2468, 77.0460], icon: '🚆', label: 'Campus Bus Terminus' }
      ];

      if (isDeviation) contextPoints.push({ point: currentPos, icon: '⚠️', label: 'Simulated Route Deviation' });
      if (isEmergency) contextPoints.push({ point: currentPos, icon: '🚨', label: 'Active SOS Panic Marker' });

      layersRef.current.contextMarkers = contextPoints.map(item => window.L.marker(item.point, {
        icon: window.L.divIcon({ className: 'srg-context-map-marker', html: `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#FFFFFF;border:2px solid #38BDF8;box-shadow:0 3px 10px rgba(0,0,0,.22);font-size:13px;">${item.icon}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
        zIndexOffset: 700
      }).addTo(map).bindTooltip(item.label, { direction: 'top' }));

      // Smooth pan on deviation or emergency
      if (isEmergency || isDeviation) {
        map.panTo(currentPos, { animate: true, duration: 0.7 });
      }
    } catch (e) {
      console.warn('[SafeRoute Guardian] Error updating traveler position:', e);
    }
  }, [currentPos, safetyLevel, travelerName, travelerAvatar, isDeviation]);

  if (mapLoadError) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🗺️</div>
        <b style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '0.3rem' }}>MMU Mullana Campus Safety Map</b>
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
        background: 'rgba(11, 21, 40, 0.9)',
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
        <span>MMU Mullana Campus Safety Geofence — Demo Data</span>
      </div>

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(11, 21, 40, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '11px',
        color: '#E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 500,
        flexWrap: 'wrap',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '3px', background: '#2563EB', borderRadius: '1px' }}></span>
          <span>Approved Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(56, 189, 248, 0.25)', border: '1px dashed #0284C7', borderRadius: '2px' }}></span>
          <span>{corridorWidthMeters}m Geofence Buffer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: getMarkerColor() }}></span>
          <span>{travelerName} ({safetyLevel})</span>
        </div>
      </div>
    </div>
  );
};
