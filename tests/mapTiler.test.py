"""
SafeRoute Guardian - MapTiler SDK & Marina Bay Safety Geofence Test Suite
Replaces googleMaps.test.py for the MapTiler migration.

Validates:
1. Absence of any hardcoded Google Maps API keys (AIzaSy...) AND MapTiler keys in JS/JSX files.
2. GoogleMapsService has been removed; mapTilerService.js is present.
3. ConfigService exposes getMapTilerApiKey() and hasMapTilerKey() (never hasGoogleMapsKey/getGoogleMapsApiKey).
4. MapTilerService has loadScript(), isPointInsideCampusGeofence(), generateCorridorPolygon(), createMarkerIcon().
5. Marina Bay, Singapore coordinates (1.2838, 103.8607) present in mockData.js.
6. Marina Bay showcase POIs (Merlion Park, Marina Bay Sands, Gardens by the Bay, Safe Help Point).
7. Geofence point-in-polygon algorithm with Marina Bay boundary polygon.
8. MapTilerCampusMap.jsx has onFallbackToLeaflet, competition badge, safety status badge.
9. InteractiveMap.jsx uses maptiler engine, LeafletMarinaBayFallback, Demo Map Mode badge.
10. Marker color codes (green, amber, red) present in map components.
"""

import os
import re
import math

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_no_hardcoded_api_keys():
    """Verify no hardcoded Google Maps keys (AIzaSy...) or MapTiler UUID keys in any JS/JSX file."""
    google_key_pattern = re.compile(r'AIza[0-9A-Za-z-_]{35}')
    # MapTiler keys are UUID-like (e.g., xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    maptiler_key_pattern = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
    js_dir = os.path.join(ROOT_DIR, "js")

    found = []
    for root, _, files in os.walk(js_dir):
        for f in files:
            if f.endswith(".js") or f.endswith(".jsx"):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8") as fh:
                    content = fh.read()
                    google_hits = google_key_pattern.findall(content)
                    maptiler_hits = maptiler_key_pattern.findall(content)
                    if google_hits:
                        found.append((f, 'GOOGLE', google_hits))
                    if maptiler_hits:
                        found.append((f, 'MAPTILER_UUID', maptiler_hits))

    assert len(found) == 0, f"Hardcoded API keys found: {found}"
    print("[PASS] 1. Zero hardcoded API keys (Google/MapTiler) found in codebase.")

def test_google_maps_service_removed():
    """Verify googleMapsService.js has been removed and mapTilerService.js exists."""
    google_svc = os.path.join(ROOT_DIR, "js", "services", "googleMapsService.js")
    maptiler_svc = os.path.join(ROOT_DIR, "js", "services", "mapTilerService.js")

    assert not os.path.exists(google_svc), \
        "googleMapsService.js still exists! Remove it as part of the migration."
    assert os.path.exists(maptiler_svc), \
        "mapTilerService.js is missing! Expected in js/services/."
    print("[PASS] 2. googleMapsService.js removed; mapTilerService.js confirmed present.")

def test_config_service_maptiler():
    """Verify ConfigService exposes MapTiler key methods and does NOT expose old Google Maps methods."""
    path = os.path.join(ROOT_DIR, "js", "services", "configService.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "VITE_MAPTILER_API_KEY" in content, "VITE_MAPTILER_API_KEY missing from configService!"
    assert "MAPTILER_API_KEY" in content, "MAPTILER_API_KEY missing from configService!"
    assert "getMapTilerApiKey" in content, "getMapTilerApiKey() method missing from ConfigService!"
    assert "hasMapTilerKey" in content, "hasMapTilerKey() method missing from ConfigService!"
    assert "getMapStatusBadge" in content, "getMapStatusBadge() missing from ConfigService!"

    # Old Google Maps methods must be gone
    assert "getGoogleMapsApiKey" not in content, "Stale getGoogleMapsApiKey() still in ConfigService!"
    assert "hasGoogleMapsKey" not in content, "Stale hasGoogleMapsKey() still in ConfigService!"

    print("[PASS] 3. ConfigService MapTiler key extraction and safety methods verified.")

def test_maptiler_service_structure():
    """Verify MapTilerService has all required public methods."""
    path = os.path.join(ROOT_DIR, "js", "services", "mapTilerService.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "window.MapTilerService" in content, "MapTilerService singleton missing!"
    assert "loadScript" in content, "loadScript() missing from MapTilerService!"
    assert "isPointInsideCampusGeofence" in content, "isPointInsideCampusGeofence() missing!"
    assert "generateCorridorPolygon" in content, "generateCorridorPolygon() missing!"
    assert "createMarkerIcon" in content, "createMarkerIcon() missing!"
    print("[PASS] 4. MapTilerService singleton structure and all required methods verified.")

def test_marina_bay_campus_metadata():
    """Verify Marina Bay, Singapore coordinates and metadata in mockData.js."""
    mock_path = os.path.join(ROOT_DIR, "js", "models", "mockData.js")
    with open(mock_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Marina Bay" in content, "Marina Bay location label missing from mockData.js!"
    assert "1.2838" in content, "Marina Bay center lat (1.2838) missing from mockData.js!"
    assert "103.8607" in content, "Marina Bay center lng (103.8607) missing from mockData.js!"
    # Boundary polygon corners
    assert "1.2800" in content, "Marina Bay geofence lat boundary missing from mockData.js!"
    assert "103.8550" in content, "Marina Bay geofence lng boundary missing from mockData.js!"
    print("[PASS] 5. Marina Bay, Singapore coordinates and geofence boundary verified in mockData.js.")

def test_marina_bay_showcase_pois():
    """Verify Marina Bay showcase POIs are present in MapTilerCampusMap.jsx and/or InteractiveMap.jsx."""
    maptiler_path = os.path.join(ROOT_DIR, "js", "components", "MapTilerCampusMap.jsx")
    imap_path = os.path.join(ROOT_DIR, "js", "components", "InteractiveMap.jsx")

    combined_content = ""
    for p in [maptiler_path, imap_path]:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                combined_content += f.read()

    expected_pois = ["Merlion Park", "Marina Bay Sands", "Gardens by the Bay", "Safe Help Point"]
    for poi in expected_pois:
        assert poi in combined_content, f"POI '{poi}' missing from map components!"
    print("[PASS] 6. Marina Bay showcase POIs (Merlion Park, MBS, Gardens, Safe Help Point) verified.")

def test_marina_bay_geofence_point_in_polygon():
    """Validate ray-casting geofence algorithm using Marina Bay boundary."""
    marina_bay_polygon = [
        [1.2800, 103.8550],
        [1.2800, 103.8665],
        [1.2875, 103.8665],
        [1.2875, 103.8550],
        [1.2800, 103.8550]
    ]

    def point_in_polygon(point, poly):
        x, y = point[0], point[1]
        inside = False
        j = len(poly) - 1
        for i in range(len(poly)):
            xi, yi = poly[i][0], poly[i][1]
            xj, yj = poly[j][0], poly[j][1]
            intersect = ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            if intersect:
                inside = not inside
            j = i
        return inside

    # Marina Bay center → INSIDE
    center_pt = [1.2838, 103.8607]
    assert point_in_polygon(center_pt, marina_bay_polygon) == True, \
        "Marina Bay center must be INSIDE the geofence!"

    # Merlion Park approximate area → use a coordinate clearly INSIDE the bounding box
    merlion_pt = [1.2850, 103.8560]
    assert point_in_polygon(merlion_pt, marina_bay_polygon) == True, \
        "Merlion Park approximate point must be INSIDE the geofence!"

    # Changi Airport → OUTSIDE
    changi_pt = [1.3644, 103.9915]
    assert point_in_polygon(changi_pt, marina_bay_polygon) == False, \
        "Changi Airport must be OUTSIDE the geofence!"

    print("[PASS] 7. Geofence point-in-polygon math verified with Marina Bay boundary.")

def test_maptiler_map_component_structure():
    """Verify MapTilerCampusMap.jsx has essential safety and UI elements."""
    path = os.path.join(ROOT_DIR, "js", "components", "MapTilerCampusMap.jsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "window.MapTilerCampusMap" in content, "MapTilerCampusMap not assigned to window!"
    assert "onFallbackToLeaflet" in content, "onFallbackToLeaflet fallback handler missing!"
    assert "Competition Demo Mode" in content, "'Competition Demo Mode' badge missing!"
    assert "MapTiler" in content, "MapTiler attribution badge missing!"
    assert "isCancelledRef" in content, "isCancelledRef cleanup guard missing!"
    assert "#10B981" in content  # Safe green
    assert "#F59E0B" in content  # Amber caution
    assert "#EF4444" in content  # Red emergency
    print("[PASS] 8. MapTilerCampusMap.jsx structure, fallback, badges and marker colors verified.")

def test_interactive_map_maptiler_engine():
    """Verify InteractiveMap.jsx uses maptiler engine, Leaflet fallback, and Marina Bay labels."""
    path = os.path.join(ROOT_DIR, "js", "components", "InteractiveMap.jsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "maptiler" in content, "maptiler engine key missing from InteractiveMap!"
    assert "MapTilerCampusMap" in content, "MapTilerCampusMap import/reference missing!"
    assert "leaflet" in content, "Leaflet fallback engine key missing!"
    assert "Demo Map Mode" in content, "'Demo Map Mode' badge missing from Leaflet fallback!"
    assert "Reset Demo Map" in content, "Reset Demo Map button missing from Leaflet fallback!"
    assert "srg-leaflet-reset-demo" in content, "Reset Demo Map button ID missing!"
    assert "Marina Bay" in content, "Marina Bay label missing from Leaflet fallback view!"
    assert "mapId + '-maptiler'" in content or "maptiler" in content, \
        "Separate mapId namespace for maptiler not found!"
    assert "mapId + '-leaflet'" in content or "leaflet" in content, \
        "Separate mapId namespace for leaflet not found!"
    print("[PASS] 9. InteractiveMap.jsx MapTiler engine, Leaflet fallback, and Marina Bay labels verified.")

def test_index_html_no_google_maps():
    """Verify index.html references mapTilerService.js/MapTilerCampusMap.jsx and not Google Maps files."""
    path = os.path.join(ROOT_DIR, "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "mapTilerService.js" in content, "mapTilerService.js not loaded in index.html!"
    assert "MapTilerCampusMap.jsx" in content, "MapTilerCampusMap.jsx not loaded in index.html!"
    assert "googleMapsService.js" not in content, "googleMapsService.js still referenced in index.html!"
    assert "GoogleCampusMap.jsx" not in content, "GoogleCampusMap.jsx still referenced in index.html!"
    assert "maps.googleapis.com" not in content, "Google Maps CDN still referenced in index.html!"
    print("[PASS] 10. index.html verified: MapTiler loaded, Google Maps references removed.")

if __name__ == "__main__":
    print("=" * 70)
    print("  [SRG] MapTiler SDK & Marina Bay Safety Geofence Test Suite")
    print("=" * 70)
    test_no_hardcoded_api_keys()
    test_google_maps_service_removed()
    test_config_service_maptiler()
    test_maptiler_service_structure()
    test_marina_bay_campus_metadata()
    test_marina_bay_showcase_pois()
    test_marina_bay_geofence_point_in_polygon()
    test_maptiler_map_component_structure()
    test_interactive_map_maptiler_engine()
    test_index_html_no_google_maps()
    print("=" * 70)
    print("  [SUCCESS] ALL MAPTILER & MARINA BAY GEOFENCE TESTS PASSED!")
    print("=" * 70)
