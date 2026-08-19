/**
 * SafeRoute Guardian - GoogleCampusMap Component (v2.0)
 * Modern, resilient Google Maps JavaScript API integration for MMU Mullana Campus.
 * Features:
 * - Asynchronous singleton loader with loading & graceful in-page fallback states
 * - MMU Mullana Campus Safety Geofence polygon & POI markers
 * - Safe walking corridors (Polyline) & geofence buffer (Polygon)
 * - Dynamic moving traveler marker with color codes (Green, Amber, Red, Blue)
 * - Real-time geofence evaluation via google.maps.geometry.poly.containsLocation
 * - Full unmount cleanup to avoid memory leaks or listener retention
 */

window.GoogleCampusMap = function({
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
  mapId = 'srg-google-campus-map',
  showCampusGeofence = true,
  onFallbackToLeaflet = null
}) {
  const mapContainerRef = React.useRef(null);
  const googleMapInstanceRef = React.useRef(null);
  const elementsRef = React.useRef({
    campusPolygon: null,
    corridorPolygon: null,
    routePolyline: null,
    travelerMarker: null,
    originMarker: null,
    destinationMarker: null,
    poiMarkers: [],
    infoWindow: null,
    listeners: []
  });

  const [mapState, setMapState] = React.useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isInsideGeofence, setIsInsideGeofence] = React.useState(true);

  // MMU Mullana Campus Metadata
  const defaultCampusCenter = { lat: 30.2505, lng: 77.0495 };
  const campusBoundaryCoords = (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.boundaryPolygon) || [
    [30.2458, 77.0445],
    [30.2458, 77.0550],
    [30.2558, 77.0560],
    [30.2568, 77.0482],
    [30.2538, 77.0438],
    [30.2458, 77.0445]
  ];

  // Campus Key POI Points
  const campusPOIs = [
    { name: 'MMU Main Gate (Gate 1)', coords: { lat: 30.2472, lng: 77.0468 }, icon: '🏛️', category: 'Campus Security & Entry' },
    { name: 'Academic Block 3 (Engineering)', coords: { lat: 30.2505, lng: 77.0505 }, icon: '🎓', category: 'Academic Zone' },
    { name: 'Central Library & Help Kiosk', coords: { lat: 30.2495, lng: 77.0492 }, icon: '📚', category: 'Library & Student Desk' },
    { name: 'Hostels Complex (Girls & Boys)', coords: { lat: 30.2520, lng: 77.0450 }, icon: '🏢', category: 'Residential Campus' },
    { name: 'MM Super Speciality Hospital', coords: { lat: 30.2530, lng: 77.0535 }, icon: '🏥', category: '24/7 Medical & Trauma' },
    { name: 'MMU Sports Complex & Arena', coords: { lat: 30.2540, lng: 77.0475 }, icon: '⚽', category: 'Sports & Recreation' },
    { name: 'MMU Bus Stop & Transit Point', coords: { lat: 30.2468, lng: 77.0460 }, icon: '🚌', category: 'Transit Hub' }
  ];

  // Dynamic Marker Color mapping
  const getMarkerColor = () => {
    switch (safetyLevel) {
      case 'EMERGENCY': return '#EF4444'; // Red
      case 'HIGH_RISK': return '#EF4444'; // Red
      case 'CAUTION': return '#F59E0B';   // Amber
      default: return '#10B981';          // Green
    }
  };

  // Helper to remove all map overlays and listeners cleanly
  const cleanupMapElements = () => {
    const el = elementsRef.current;
    if (!el) return;

    if (el.listeners && el.listeners.length > 0) {
      el.listeners.forEach(l => {
        try {
          if (window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.removeListener(l);
          }
        } catch (e) {}
      });
      el.listeners = [];
    }

    if (el.infoWindow) {
      try { el.infoWindow.close(); } catch (e) {}
      el.infoWindow = null;
    }

    if (el.campusPolygon) {
      try { el.campusPolygon.setMap(null); } catch (e) {}
      el.campusPolygon = null;
    }

    if (el.corridorPolygon) {
      try { el.corridorPolygon.setMap(null); } catch (e) {}
      el.corridorPolygon = null;
    }

    if (el.routePolyline) {
      try { el.routePolyline.setMap(null); } catch (e) {}
      el.routePolyline = null;
    }

    if (el.travelerMarker) {
      try { el.travelerMarker.setMap(null); } catch (e) {}
      el.travelerMarker = null;
    }

    if (el.originMarker) {
      try { el.originMarker.setMap(null); } catch (e) {}
      el.originMarker = null;
    }

    if (el.destinationMarker) {
      try { el.destinationMarker.setMap(null); } catch (e) {}
      el.destinationMarker = null;
    }

    if (el.poiMarkers && el.poiMarkers.length > 0) {
      el.poiMarkers.forEach(m => {
        try { m.setMap(null); } catch (e) {}
      });
      el.poiMarkers = [];
    }
  };

  // Step 1: Initialize Google Maps SDK and container
  React.useEffect(() => {
    let isCancelled = false;

    // Listen to Google Maps Auth Failures
    if (window.GoogleMapsService && window.GoogleMapsService.onAuthFailure) {
      window.GoogleMapsService.onAuthFailure(() => {
        if (!isCancelled) {
          setMapState('error');
          setErrorMessage('Google Maps API key is invalid, unconfigured, or restricted by domain.');
        }
      });
    }

    const initMap = async () => {
      try {
        setMapState('loading');
        
        if (!window.GoogleMapsService) {
          throw new Error('GoogleMapsService is unavailable.');
        }

        // Load SDK via singleton
        await window.GoogleMapsService.loadScript();

        if (isCancelled || !mapContainerRef.current) return;

        // Clean any pre-existing instance in container
        if (googleMapInstanceRef.current) {
          cleanupMapElements();
          googleMapInstanceRef.current = null;
        }

        const mapOptions = {
          center: (routeWaypoints && routeWaypoints.length > 0 && routeWaypoints[0]) 
            ? { lat: routeWaypoints[0][0], lng: routeWaypoints[0][1] }
            : defaultCampusCenter,
          zoom: 16,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          zoomControl: !isCompact,
          fullscreenControl: !isCompact,
          mapTypeControl: !isCompact,
          streetViewControl: false,
          rotateControl: false,
          scaleControl: true,
          gestureHandling: 'greedy',
          styles: [
            { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'on' }] }
          ]
        };

        const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
        googleMapInstanceRef.current = map;
        elementsRef.current.infoWindow = new window.google.maps.InfoWindow();

        setMapState('ready');
      } catch (err) {
        if (isCancelled) return;
        console.warn('[SafeRoute Guardian] Google Maps could not load:', err.message);
        setMapState('error');
        setErrorMessage(err.message || 'Map is temporarily unavailable.');
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      cleanupMapElements();
      googleMapInstanceRef.current = null;
    };
  }, [mapId]);

  // Step 2: Render Campus Geofence, Route Corridor, POIs
  React.useEffect(() => {
    const map = googleMapInstanceRef.current;
    if (mapState !== 'ready' || !map || !window.google || !window.google.maps) return;

    try {
      const el = elementsRef.current;
      const infoWindow = el.infoWindow || new window.google.maps.InfoWindow();
      el.infoWindow = infoWindow;

      // 1. Draw Campus Boundary Polygon
      if (el.campusPolygon) el.campusPolygon.setMap(null);
      if (showCampusGeofence && campusBoundaryCoords && campusBoundaryCoords.length > 2) {
        const polyPaths = campusBoundaryCoords.map(c => ({ lat: c[0], lng: c[1] }));
        el.campusPolygon = new window.google.maps.Polygon({
          paths: polyPaths,
          strokeColor: '#10B981',
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: '#10B981',
          fillOpacity: 0.05,
          map: map,
          zIndex: 1
        });

        const clickListener = el.campusPolygon.addListener('click', (e) => {
          infoWindow.setContent(`
            <div style="font-family:sans-serif; padding:6px; color:#0F172A;">
              <b style="font-size:13px; color:#10B981;">🏛️ MMU Mullana Campus Geofence</b>
              <p style="font-size:11px; margin:4px 0 0 0; color:#475569;">
                Official University Safety Corridor Perimeter (Demo / Simulated Data)
              </p>
            </div>
          `);
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
        });
        el.listeners.push(clickListener);
      }

      // 2. Draw Safe Corridor Buffer & Walking Route Polyline
      if (el.corridorPolygon) el.corridorPolygon.setMap(null);
      if (el.routePolyline) el.routePolyline.setMap(null);

      const validWaypoints = (routeWaypoints || []).filter(w => Array.isArray(w) && w.length >= 2);
      if (validWaypoints.length >= 2) {
        const googleCoords = validWaypoints.map(w => ({ lat: w[0], lng: w[1] }));

        // Corridor Buffer Polygon
        if (window.GoogleMapsService && window.GoogleMapsService.generateCorridorPolygon) {
          const bufferCoords = window.GoogleMapsService.generateCorridorPolygon(validWaypoints, corridorWidthMeters);
          if (bufferCoords.length > 0) {
            el.corridorPolygon = new window.google.maps.Polygon({
              paths: bufferCoords,
              strokeColor: '#0284C7',
              strokeOpacity: 0.85,
              strokeWeight: 2,
              fillColor: '#38BDF8',
              fillOpacity: 0.16,
              map: map,
              zIndex: 2
            });
          }
        }

        // Active Route Polyline
        el.routePolyline = new window.google.maps.Polyline({
          path: googleCoords,
          geodesic: true,
          strokeColor: '#2563EB',
          strokeOpacity: 0.95,
          strokeWeight: 5,
          map: map,
          zIndex: 3
        });

        // 3. Origin & Destination Markers
        if (el.originMarker) el.originMarker.setMap(null);
        if (el.destinationMarker) el.destinationMarker.setMap(null);

        const origin = googleCoords[0];
        const destination = googleCoords[googleCoords.length - 1];

        el.originMarker = new window.google.maps.Marker({
          position: origin,
          map: map,
          title: `Start: ${originName}`,
          label: { text: 'A', color: '#FFFFFF', fontWeight: 'bold', fontSize: '12px' },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2.5
          },
          zIndex: 5
        });

        el.destinationMarker = new window.google.maps.Marker({
          position: destination,
          map: map,
          title: `Destination: ${destinationName}`,
          label: { text: 'B', color: '#FFFFFF', fontWeight: 'bold', fontSize: '12px' },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2.5
          },
          zIndex: 5
        });

        // Smooth Fit Bounds
        const bounds = new window.google.maps.LatLngBounds();
        googleCoords.forEach(c => bounds.extend(c));
        map.fitBounds(bounds, isCompact ? 30 : 50);
      }

      // 4. Campus POI Markers
      if (el.poiMarkers && el.poiMarkers.length > 0) {
        el.poiMarkers.forEach(m => m.setMap(null));
        el.poiMarkers = [];
      }

      campusPOIs.forEach(poi => {
        const marker = new window.google.maps.Marker({
          position: poi.coords,
          map: map,
          title: poi.name,
          icon: {
            url: (window.GoogleMapsService && window.GoogleMapsService.createMarkerIcon) 
              ? window.GoogleMapsService.createMarkerIcon(poi.icon, '#FFFFFF', 30)
              : undefined,
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 15)
          },
          zIndex: 4
        });

        const poiClickListener = marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="font-family:sans-serif; padding:6px; color:#0F172A; min-width:160px;">
              <b style="font-size:13px; color:#0284C7;">${poi.icon} ${poi.name}</b>
              <div style="font-size:11px; color:#64748B; margin-top:3px;">${poi.category}</div>
              <div style="font-size:10px; color:#10B981; font-weight:700; margin-top:4px;">✓ Verified MMU Safety Station</div>
            </div>
          `);
          infoWindow.open(map, marker);
        });
        el.listeners.push(poiClickListener);
        el.poiMarkers.push(marker);
      });

    } catch (e) {
      console.warn('[SafeRoute Guardian] Error rendering Google Maps overlays:', e);
    }
  }, [mapState, routeWaypoints, corridorWidthMeters, originName, destinationName, showCampusGeofence]);

  // Step 3: Update Traveler Marker and Geofence status
  React.useEffect(() => {
    const map = googleMapInstanceRef.current;
    if (mapState !== 'ready' || !map || !window.google || !window.google.maps || !currentPos) return;

    try {
      const el = elementsRef.current;
      const infoWindow = el.infoWindow || new window.google.maps.InfoWindow();
      const markerColor = getMarkerColor();
      const isEmergency = safetyLevel === 'EMERGENCY';
      const posObj = { lat: currentPos[0], lng: currentPos[1] };

      // Geofence check using google.maps.geometry.poly.containsLocation
      let inside = true;
      if (window.GoogleMapsService && window.GoogleMapsService.isPointInsideCampusGeofence) {
        inside = window.GoogleMapsService.isPointInsideCampusGeofence(currentPos, campusBoundaryCoords);
      }
      setIsInsideGeofence(inside);

      // Remove existing traveler marker
      if (el.travelerMarker) {
        el.travelerMarker.setMap(null);
      }

      // Create high-visibility traveler marker
      const travelerIconUrl = (window.GoogleMapsService && window.GoogleMapsService.createMarkerIcon)
        ? window.GoogleMapsService.createMarkerIcon(travelerAvatar || '🧭', markerColor, 40)
        : undefined;

      el.travelerMarker = new window.google.maps.Marker({
        position: posObj,
        map: map,
        title: `${travelerName} (${safetyLevel})`,
        icon: travelerIconUrl ? {
          url: travelerIconUrl,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        } : undefined,
        zIndex: 1000
      });

      const travelerClickListener = el.travelerMarker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="font-family:sans-serif; padding:6px; color:#0F172A; min-width:180px;">
            <b style="font-size:14px; color:#0F172A;">${travelerAvatar} ${travelerName}</b>
            <div style="display:inline-block; margin-top:4px; padding:2px 8px; border-radius:12px; background:${markerColor}; color:#fff; font-size:11px; font-weight:bold;">
              Status: ${safetyLevel}
            </div>
            <div style="font-size:10px; color:#64748B; margin-top:6px;">
              Lat: ${currentPos[0].toFixed(5)}, Lng: ${currentPos[1].toFixed(5)}
            </div>
            <div style="font-size:10px; color:${inside ? '#10B981' : '#EF4444'}; font-weight:bold; margin-top:2px;">
              ${inside ? '✓ Inside MMU Safe Geofence' : '⚠️ Outside Campus Perimeter'}
            </div>
          </div>
        `);
        infoWindow.open(map, el.travelerMarker);
      });
      el.listeners.push(travelerClickListener);

      // Pan to deviation or emergency
      if (isEmergency || isDeviation) {
        map.panTo(posObj);
      }
    } catch (e) {
      console.warn('[SafeRoute Guardian] Error updating Google Maps traveler marker:', e);
    }
  }, [mapState, currentPos, safetyLevel, travelerName, travelerAvatar, isDeviation]);

  // Loading State
  if (mapState === 'loading') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '340px',
        background: '#0B1528',
        border: '1px solid #1E293B',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid #1E293B',
          borderTopColor: '#38BDF8',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <b style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '0.4rem' }}>
          Loading MMU Mullana Campus Safety Map…
        </b>
        <p style={{ fontSize: '0.82rem', color: '#94A3B8', maxWidth: '380px', margin: 0 }}>
          Initializing Google Maps JavaScript API with high-precision campus corridors and safety geofence geometry.
        </p>
      </div>
    );
  }

  // Error & Graceful In-Page Fallback State (Zero Crashes)
  if (mapState === 'error') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '340px',
        background: '#0B1528',
        border: '1px solid #334155',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#CBD5E1',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🛡️</div>
        <b style={{ color: '#F59E0B', fontSize: '1rem', marginBottom: '0.4rem' }}>
          Map is temporarily unavailable. Safety controls and demo mode remain available.
        </b>
        <p style={{ fontSize: '0.82rem', maxWidth: '460px', margin: '0 0 1rem 0', color: '#94A3B8', lineHeight: '1.4' }}>
          {errorMessage || 'Google Maps key is not configured or network connection is offline. Full corridor telemetry and emergency alerts continue to operate.'}
        </p>

        {/* Live Corridor Telemetry Summary Card */}
        <div style={{
          background: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '10px',
          padding: '0.8rem 1.2rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'left',
          fontSize: '0.8rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ color: '#94A3B8' }}>Corridor:</span>
            <b style={{ color: '#FFFFFF' }}>{originName} → {destinationName}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ color: '#94A3B8' }}>Geofence Buffer:</span>
            <b style={{ color: '#38BDF8' }}>{corridorWidthMeters}m Protected</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94A3B8' }}>Simulated Location:</span>
            <b style={{ color: '#10B981' }}>
              {currentPos ? `${currentPos[0].toFixed(4)}, ${currentPos[1].toFixed(4)}` : 'Campus Route Active'}
            </b>
          </div>
        </div>

        {onFallbackToLeaflet && (
          <button
            type="button"
            className="srg-btn srg-btn-primary srg-btn-sm"
            onClick={onFallbackToLeaflet}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            🗺️ Switch to OpenStreetMap Fallback
          </button>
        )}
      </div>
    );
  }

  // Active Google Maps Render
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div id={mapId} ref={mapContainerRef} className="srg-map-container" style={{ width: '100%', height: '100%', borderRadius: '12px' }} />

      {/* Top Persistent Campus Geofence Label */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(11, 21, 40, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '800',
        color: '#38BDF8',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        pointerEvents: 'none'
      }}>
        <span>🏛️</span>
        <span>MMU Mullana Campus Safety Geofence — Demo / Simulated Data</span>
      </div>

      {/* Top Right Geofence & Status Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(11, 21, 40, 0.92)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${safetyLevel === 'EMERGENCY' ? '#EF4444' : isDeviation ? '#F59E0B' : '#10B981'}`,
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '11px',
        fontWeight: '700',
        color: safetyLevel === 'EMERGENCY' ? '#EF4444' : isDeviation ? '#FCD34D' : '#10B981',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        pointerEvents: 'none'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: safetyLevel === 'EMERGENCY' ? '#EF4444' : isDeviation ? '#F59E0B' : '#10B981',
          display: 'inline-block'
        }} />
        <span>
          {safetyLevel === 'EMERGENCY' ? 'SOS Simulation Active' :
           isDeviation ? 'Outside Approved Campus Corridor' :
           isInsideGeofence ? 'Inside MMU Safe Geofence' : 'Outside Campus Perimeter'}
        </span>
      </div>

      {/* Bottom Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(11, 21, 40, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        padding: '6px 12px',
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
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(56, 189, 248, 0.3)', border: '1px solid #0284C7', borderRadius: '2px' }}></span>
          <span>{corridorWidthMeters}m Corridor Buffer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: getMarkerColor() }}></span>
          <span>{travelerName} ({safetyLevel})</span>
        </div>
      </div>
    </div>
  );
};
