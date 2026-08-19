/**
 * SafeRoute Guardian - Google Maps JavaScript API Service (v2.0)
 * Manages singleton asynchronous script loading with geometry library,
 * Google Maps authentication failure handling, campus geofencing calculations via
 * google.maps.geometry.poly.containsLocation (with mathematical fallback),
 * and clean lifecycle coordination.
 * 
 * SECURITY RULES:
 * - Never hardcode API keys. Key is read via ConfigService from VITE_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY.
 * - Restrict key in Google Cloud Console: HTTP referrers (localhost + Vercel production domain).
 * - Restrict API usage to "Maps JavaScript API".
 */

window.GoogleMapsService = (function() {
  'use strict';

  var loadPromise = null;
  var authFailed = false;
  var authFailureListeners = [];

  // Global Google Maps authentication failure hook
  window.gm_authFailure = function() {
    console.warn('[SafeRoute Guardian] Google Maps Authentication Failure detected (invalid key, referrer blocked, or quota exceeded). Gracefully activating fallback.');
    authFailed = true;
    for (var i = 0; i < authFailureListeners.length; i++) {
      try {
        authFailureListeners[i]('AUTH_FAILURE');
      } catch (e) {
        console.error('[SafeRoute Guardian] Auth listener error:', e);
      }
    }
  };

  /**
   * Check if Google Maps with Geometry library is fully loaded and ready
   */
  function isLoaded() {
    return !!(
      typeof window.google !== 'undefined' &&
      window.google.maps &&
      window.google.maps.Map &&
      window.google.maps.geometry &&
      window.google.maps.geometry.poly &&
      !authFailed
    );
  }

  /**
   * Load Google Maps JS API script asynchronously as a singleton
   */
  function loadScript(explicitKey) {
    if (isLoaded()) {
      return Promise.resolve(window.google.maps);
    }

    if (authFailed) {
      return Promise.reject(new Error('Google Maps authentication failed or key is blocked.'));
    }

    if (loadPromise) {
      return loadPromise;
    }

    var key = explicitKey || (window.ConfigService && window.ConfigService.getGoogleMapsApiKey && window.ConfigService.getGoogleMapsApiKey()) || '';

    if (!key || key.length < 6) {
      return Promise.reject(new Error('Missing or placeholder Google Maps API Key. Set VITE_GOOGLE_MAPS_API_KEY in environment variables.'));
    }

    loadPromise = new Promise(function(resolve, reject) {
      var timeoutId = setTimeout(function() {
        if (!isLoaded()) {
          loadPromise = null;
          reject(new Error('Google Maps script loading timed out.'));
        }
      }, 9000);

      // Unique callback name
      var callbackName = '__googleMapsCallback_' + Math.floor(Math.random() * 1000000);
      window[callbackName] = function() {
        clearTimeout(timeoutId);
        delete window[callbackName];
        if (isLoaded()) {
          resolve(window.google.maps);
        } else {
          // If geometry didn't attach yet, give it a tiny tick
          setTimeout(function() {
            if (window.google && window.google.maps) {
              resolve(window.google.maps);
            } else {
              reject(new Error('Google Maps initialized without geometry library.'));
            }
          }, 50);
        }
      };

      // Check for existing script tag to prevent duplicate injection
      var existingScript = document.getElementById('srg-google-maps-script');
      if (existingScript) {
        if (existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      }

      var script = document.createElement('script');
      script.id = 'srg-google-maps-script';
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&libraries=geometry&callback=' + callbackName;
      script.async = true;
      script.defer = true;

      script.onerror = function(err) {
        clearTimeout(timeoutId);
        loadPromise = null;
        if (window[callbackName]) delete window[callbackName];
        reject(new Error('Failed to download Google Maps JavaScript SDK (network error or blocked).'));
      };

      document.head.appendChild(script);
    });

    return loadPromise;
  }

  /**
   * Subscribe to Google Maps authentication failure event
   */
  function onAuthFailure(callback) {
    if (typeof callback === 'function') {
      authFailureListeners.push(callback);
      if (authFailed) {
        callback('AUTH_FAILURE');
      }
    }
  }

  /**
   * Mathematical Ray-Casting Point-in-Polygon check (for fallback or pre-Google validation)
   */
  function pointInPolygonMath(point, polygon) {
    if (!point || !polygon || polygon.length < 3) return false;
    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i][0], yi = polygon[i][1];
      var xj = polygon[j][0], yj = polygon[j][1];
      var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Check if a coordinate [lat, lng] is inside the MMU campus geofence polygon
   * Uses google.maps.geometry.poly.containsLocation when available, or mathematical fallback
   */
  function isPointInsideCampusGeofence(point, boundaryPolygon) {
    if (!point || point.length < 2) return false;
    var coords = boundaryPolygon || (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.boundaryPolygon) || [];
    if (!coords || coords.length < 3) return false;

    // 1. Try native Google Maps Geometry Poly API
    if (isLoaded() && window.google.maps.geometry && window.google.maps.geometry.poly) {
      try {
        var latLng = new window.google.maps.LatLng(point[0], point[1]);
        var polyPaths = coords.map(function(c) {
          return new window.google.maps.LatLng(c[0], c[1]);
        });
        var poly = new window.google.maps.Polygon({ paths: polyPaths });
        return window.google.maps.geometry.poly.containsLocation(latLng, poly);
      } catch (e) {
        console.warn('[SafeRoute Guardian] google.maps.geometry.poly error, falling back to math:', e);
      }
    }

    // 2. Mathematical Ray-Casting fallback
    return pointInPolygonMath(point, coords);
  }

  /**
   * Calculate corridor buffer polygon coordinates around a route polyline
   */
  function generateCorridorPolygon(waypoints, bufferMeters) {
    if (!waypoints || waypoints.length < 2) return [];
    var buffer = bufferMeters || 100;
    var latOffset = (buffer / 111320);
    var leftSide = [];
    var rightSide = [];

    for (var i = 0; i < waypoints.length; i++) {
      var p = waypoints[i];
      if (!p || p.length < 2) continue;
      var cosLat = Math.cos(p[0] * Math.PI / 180) || 1;
      var lngOffset = (buffer / (111320 * cosLat));

      leftSide.push({ lat: p[0] + latOffset, lng: p[1] - lngOffset });
      rightSide.unshift({ lat: p[0] - latOffset, lng: p[1] + lngOffset });
    }
    return leftSide.concat(rightSide);
  }

  /**
   * Generate SVG Data URI for crisp Google Maps custom pins
   */
  function createMarkerIcon(emoji, bgColor, size, pulse) {
    var s = size || 36;
    var radius = Math.floor(s / 2);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">' +
      '<circle cx="' + radius + '" cy="' + radius + '" r="' + (radius - 2) + '" fill="' + bgColor + '" stroke="#FFFFFF" stroke-width="2.5" />' +
      '<text x="50%" y="54%" font-size="' + Math.floor(s * 0.48) + '" text-anchor="middle" dominant-baseline="middle">' + emoji + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  return {
    loadScript: loadScript,
    isLoaded: isLoaded,
    onAuthFailure: onAuthFailure,
    isPointInsideCampusGeofence: isPointInsideCampusGeofence,
    generateCorridorPolygon: generateCorridorPolygon,
    createMarkerIcon: createMarkerIcon
  };
})();
