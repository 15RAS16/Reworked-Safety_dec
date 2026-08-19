/**
 * SafeRoute Guardian - Interactive Leaflet Map Component
 * Visualizes approved routes, corridor geofence buffers, traveler location, and alerts.
 */

window.InteractiveMap = function({ 
  routeWaypoints = [], 
  corridorWidthMeters = 100, 
  currentPos = null, 
  travelerName = 'Traveler', 
  travelerAvatar = '👨‍🎓',
  safetyLevel = 'SAFE',
  isDeviation = false,
  originName = 'Origin',
  destinationName = 'Destination',
  isCompact = false,
  mapId = 'srg-leaflet-map'
}) {
  const mapRef = React.useRef(null);
  const leafletMapRef = React.useRef(null);
  const layersRef = React.useRef({
    routeLine: null,
    corridorBuffer: null,
    travelerMarker: null,
    originMarker: null,
    destinationMarker: null,
    deviationMarker: null,
    contextMarkers: []
  });

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
    // Convert buffer meters to rough lat/lng degrees (~111,320 meters per degree)
    const latOffset = (bufferMeters / 111320);
    const leftSide = [];
    const rightSide = [];

    for (let i = 0; i < waypoints.length; i++) {
      const p = waypoints[i];
      const lngOffset = (bufferMeters / (111320 * Math.cos(p[0] * Math.PI / 180)));
      
      leftSide.push([p[0] + latOffset, p[1] - lngOffset]);
      rightSide.unshift([p[0] - latOffset, p[1] + lngOffset]);
    }
    return leftSide.concat(rightSide);
  };

  // Initialize map
  React.useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const initialCenter = routeWaypoints.length > 0 ? routeWaypoints[0] : [37.7749, -122.4194];
    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: 15,
      zoomControl: !isCompact,
      attributionControl: false
    });

    // Dark-mode themed CartoDB / OpenStreetMap tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapId]);

  // Update Route, Corridor and Markers
  React.useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !routeWaypoints || routeWaypoints.length === 0) return;

    // 1. Draw Safe Corridor Buffer
    if (layersRef.current.corridorBuffer) {
      map.removeLayer(layersRef.current.corridorBuffer);
    }
    const corridorCoords = generateCorridorPolygon(routeWaypoints, corridorWidthMeters);
    if (corridorCoords.length > 0) {
      layersRef.current.corridorBuffer = L.polygon(corridorCoords, {
        color: '#0284C7',
        weight: 2,
        dashArray: '5, 8',
        fillColor: '#38BDF8',
        fillOpacity: 0.12
      }).addTo(map);
      layersRef.current.corridorBuffer.bindTooltip(`Approved Safe Corridor (${corridorWidthMeters}m Geofence Buffer)`, { sticky: true });
    }

    // 2. Draw Approved Route Polyline
    if (layersRef.current.routeLine) {
      map.removeLayer(layersRef.current.routeLine);
    }
    layersRef.current.routeLine = L.polyline(routeWaypoints, {
      color: '#2563EB',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 3. Origin & Destination Markers
    if (layersRef.current.originMarker) map.removeLayer(layersRef.current.originMarker);
    if (layersRef.current.destinationMarker) map.removeLayer(layersRef.current.destinationMarker);

    const origin = routeWaypoints[0];
    const destination = routeWaypoints[routeWaypoints.length - 1];

    const originIcon = L.divIcon({
      className: 'srg-map-pin-origin',
      html: `<div style="background:#10B981; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:12px; font-weight:bold;">A</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const destIcon = L.divIcon({
      className: 'srg-map-pin-dest',
      html: `<div style="background:#2563EB; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:12px; font-weight:bold;">B</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    layersRef.current.originMarker = L.marker(origin, { icon: originIcon }).addTo(map).bindPopup(`<b>Start:</b> ${originName}`);
    layersRef.current.destinationMarker = L.marker(destination, { icon: destIcon }).addTo(map).bindPopup(`<b>Destination:</b> ${destinationName}`);

    // Fit bounds smoothly
    map.fitBounds(layersRef.current.routeLine.getBounds(), { padding: isCompact ? [20, 20] : [50, 50] });

  }, [routeWaypoints, corridorWidthMeters, originName, destinationName]);

  // Update Live Traveler Position Marker
  React.useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !currentPos) return;

    const markerColor = getMarkerColor();
    const isEmergency = safetyLevel === 'EMERGENCY';

    if (layersRef.current.travelerMarker) {
      map.removeLayer(layersRef.current.travelerMarker);
    }

    const pulseClass = isEmergency ? 'srg-pulse' : '';
    const travelerHtml = `
      <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
        <div class="${pulseClass}" style="position:absolute; width:100%; height:100%; border-radius:50%; background:${markerColor}; opacity:0.3;"></div>
        <div style="width:34px; height:34px; border-radius:50%; background:${markerColor}; border:3px solid #FFFFFF; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 12px rgba(0,0,0,0.4); font-size:18px;">
          ${travelerAvatar}
        </div>
      </div>
    `;

    const travelerIcon = L.divIcon({
      className: 'srg-traveler-pin',
      html: travelerHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    layersRef.current.travelerMarker = L.marker(currentPos, { icon: travelerIcon, zIndexOffset: 1000 }).addTo(map);
    layersRef.current.travelerMarker.bindPopup(`
      <div style="font-family:sans-serif; min-width:140px;">
        <b style="color:#0F172A; font-size:14px;">${travelerName}</b><br/>
        <span style="display:inline-block; margin-top:4px; padding:2px 8px; border-radius:12px; background:${markerColor}; color:#fff; font-size:11px; font-weight:bold;">
          Status: ${safetyLevel}
        </span>
      </div>
    `);

    // Context markers make the full-screen monitoring view easier to interpret.
    layersRef.current.contextMarkers.forEach(marker => map.removeLayer(marker));
    const middle = routeWaypoints[Math.max(1, Math.floor(routeWaypoints.length / 2))] || currentPos;
    const contextPoints = [
      { point: [middle[0] + 0.00045, middle[1] - 0.00035], icon: '🛡️', label: 'Trusted Safe Spot' },
      { point: [middle[0] - 0.00035, middle[1] + 0.0005], icon: '🤝', label: 'Verified Local Helper' }
    ];
    if (isDeviation) contextPoints.push({ point: currentPos, icon: '⚠️', label: 'Route Deviation' });
    if (isEmergency) contextPoints.push({ point: currentPos, icon: '🚨', label: 'Emergency Marker' });
    layersRef.current.contextMarkers = contextPoints.map(item => L.marker(item.point, {
      icon: L.divIcon({ className: 'srg-context-map-marker', html: `<div style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#FFFFFF;border:2px solid #38BDF8;box-shadow:0 3px 10px rgba(0,0,0,.22);font-size:14px;">${item.icon}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] }),
      zIndexOffset: 700
    }).addTo(map).bindTooltip(item.label, { direction: 'top' }));

    // Center traveler on emergency or deviation
    if (isEmergency || isDeviation) {
      map.panTo(currentPos, { animate: true, duration: 0.8 });
    }
  }, [currentPos, safetyLevel, travelerName, travelerAvatar, isDeviation, routeWaypoints]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div id={mapId} ref={mapRef} className="srg-map-container" />
      
      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '11px',
        color: '#E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 500,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItem: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '3px', background: '#2563EB', marginTop: '5px' }}></span>
          <span>Approved Route</span>
        </div>
        <div style={{ display: 'flex', alignItem: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(56, 189, 248, 0.3)', border: '1px dashed #0284C7' }}></span>
          <span>{corridorWidthMeters}m Safe Corridor</span>
        </div>
        <div style={{ display: 'flex', alignItem: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: getMarkerColor() }}></span>
          <span>{travelerName} ({safetyLevel})</span>
        </div>
      </div>
    </div>
  );
};
