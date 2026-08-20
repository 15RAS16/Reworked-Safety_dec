/**
 * SafeRoute Guardian - MapTiler JavaScript SDK Service (v2.1)
 * Manages MapTiler SDK script and stylesheet loading, Marina Bay geofencing calculations,
 * and mathematical ray-casting fallback checks.
 * 
 * SECURITY RULES:
 * - Never hardcode API keys. Key is read via ConfigService from VITE_MAPTILER_API_KEY or MAPTILER_API_KEY.
 */

window.MapTilerService = (function() {
  'use strict';

  var loadPromise = null;

  /**
   * Check if MapTiler SDK is loaded
   */
  function isLoaded() {
    return !!(window.maptilersdk && window.maptilersdk.Map);
  }

  /**
   * Load MapTiler SDK JS and CSS asynchronously as a singleton
   */
  function loadScript() {
    if (isLoaded()) {
      return Promise.resolve(window.maptilersdk);
    }

    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = new Promise(function(resolve, reject) {
      var key = (window.ConfigService && window.ConfigService.getMapTilerApiKey && window.ConfigService.getMapTilerApiKey()) || '';
      
      // If we don't have a key, we cannot load MapTiler tiles. Let's reject early to trigger the Leaflet fallback.
      if (!key || key.length < 5) {
        reject(new Error('MapTiler key is unconfigured. Running in offline/fallback mode.'));
        return;
      }

      var timeoutId = setTimeout(function() {
        if (!isLoaded()) {
          loadPromise = null;
          reject(new Error('MapTiler script loading timed out.'));
        }
      }, 9000);

      // Prevent duplicate CSS loading
      var existingCss = document.getElementById('srg-maptiler-css');
      if (!existingCss) {
        var link = document.createElement('link');
        link.id = 'srg-maptiler-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.0/maptiler-sdk.css';
        document.head.appendChild(link);
      }

      // Prevent duplicate script loading
      var existingScript = document.getElementById('srg-maptiler-script');
      if (existingScript) {
        if (existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      }

      var script = document.createElement('script');
      script.id = 'srg-maptiler-script';
      script.type = 'text/javascript';
      script.src = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.0/maptiler-sdk.umd.min.js';
      script.async = true;
      script.defer = true;

      script.onload = function() {
        clearTimeout(timeoutId);
        if (isLoaded()) {
          window.maptilersdk.config.apiKey = key;
          resolve(window.maptilersdk);
        } else {
          reject(new Error('MapTiler SDK loaded but Map class is missing.'));
        }
      };

      script.onerror = function(err) {
        clearTimeout(timeoutId);
        loadPromise = null;
        reject(new Error('Failed to download MapTiler JavaScript SDK.'));
      };

      document.head.appendChild(script);
    });

    return loadPromise;
  }

  /**
   * Mathematical Ray-Casting Point-in-Polygon check
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
   * Check if a coordinate [lat, lng] is inside the Marina Bay geofence polygon
   */
  function isPointInsideCampusGeofence(point, boundaryPolygon) {
    if (!point || point.length < 2) return false;
    var coords = boundaryPolygon || (window.SRG_DATA && window.SRG_DATA.campus && window.SRG_DATA.campus.boundaryPolygon) || [];
    if (!coords || coords.length < 3) return false;
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

      leftSide.push([p[0] + latOffset, p[1] - lngOffset]);
      rightSide.unshift([p[0] - latOffset, p[1] + lngOffset]);
    }
    return leftSide.concat(rightSide);
  }

  /**
   * Generate SVG Data URI for crisp map custom pins
   */
  function createMarkerIcon(emoji, bgColor, size) {
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
    isPointInsideCampusGeofence: isPointInsideCampusGeofence,
    generateCorridorPolygon: generateCorridorPolygon,
    createMarkerIcon: createMarkerIcon
  };
})();
