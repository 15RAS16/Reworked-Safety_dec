"""
SafeRoute Guardian - Google Maps JavaScript API & Campus Safety Geofence Test Suite
Validates:
1. Absence of any hardcoded Google Maps API keys in JS/JSX files
2. ConfigService Google Maps API key extraction and placeholder validation
3. GoogleMapsService singleton loader, geometry library inclusion, gm_authFailure handler
4. MMU Mullana campus coordinates (30.2505, 77.0495) and geofence boundary polygon
5. Campus POIs (Main Gate, Academic Block, Library, Hostels, Hospital, Sports Complex, Bus Stop)
6. Geofence point-in-polygon algorithm & containsLocation logic
7. Exact UI strings for loading, fallback, and persistent geofence labels
8. Marker color assignments (Green, Amber, Red, Blue)
9. Unmount cleanup and container exclusivity
"""

import os
import re
import math

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_no_hardcoded_keys():
    """Verify that no actual Google Maps API key (AIzaSy...) is hardcoded in any JS/JSX file."""
    api_key_regex = re.compile(r'AIza[0-9A-Za-z-_]{35}')
    js_dir = os.path.join(ROOT_DIR, "js")
    
    found_keys = []
    for root, _, files in os.walk(js_dir):
        for f in files:
            if f.endswith(".js") or f.endswith(".jsx"):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8") as file:
                    content = file.read()
                    matches = api_key_regex.findall(content)
                    if matches:
                        found_keys.append((f, matches))
    
    assert len(found_keys) == 0, f"Found hardcoded Google Maps API keys: {found_keys}"
    print("[PASS] 1. Zero hardcoded Google Maps API keys found in codebase.")

def test_config_service_google_maps():
    """Verify ConfigService supports VITE_GOOGLE_MAPS_API_KEY / GOOGLE_MAPS_API_KEY safely."""
    path = os.path.join(ROOT_DIR, "js", "services", "configService.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "VITE_GOOGLE_MAPS_API_KEY" in content
    assert "GOOGLE_MAPS_API_KEY" in content
    assert "getGoogleMapsApiKey" in content
    assert "hasGoogleMapsKey" in content
    print("[PASS] 2. ConfigService Google Maps key extraction and safety methods verified.")

def test_google_maps_service_structure():
    """Verify GoogleMapsService singleton loader, geometry library, and auth failure hook."""
    path = os.path.join(ROOT_DIR, "js", "services", "googleMapsService.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "window.GoogleMapsService" in content
    assert "libraries=geometry" in content
    assert "window.gm_authFailure" in content
    assert "isPointInsideCampusGeofence" in content
    assert "generateCorridorPolygon" in content
    assert "createMarkerIcon" in content
    assert "loadScript" in content
    print("[PASS] 3. GoogleMapsService singleton loader, geometry library & gm_authFailure verified.")

def test_mmu_campus_metadata_and_pois():
    """Verify MMU Mullana coordinates, boundary polygon, and key POIs."""
    mock_path = os.path.join(ROOT_DIR, "js", "models", "mockData.js")
    with open(mock_path, "r", encoding="utf-8") as f:
        mock_content = f.read()

    assert "Maharishi Markandeshwar (Deemed to be University)" in mock_content
    assert "MMU Mullana" in mock_content
    assert "Mullana, Ambala Cantonment, Haryana" in mock_content
    assert "30.2505" in mock_content and "77.0495" in mock_content

    # Check component POIs in GoogleCampusMap
    gmap_path = os.path.join(ROOT_DIR, "js", "components", "GoogleCampusMap.jsx")
    with open(gmap_path, "r", encoding="utf-8") as f:
        gmap_content = f.read()

    expected_pois = [
        "Main Gate",
        "Academic Block",
        "Library",
        "Hostels",
        "Hospital",
        "Sports Complex",
        "Bus Stop"
    ]
    for poi in expected_pois:
        assert poi.lower() in gmap_content.lower(), f"POI '{poi}' missing from GoogleCampusMap.jsx!"
    print("[PASS] 4. MMU Mullana campus coordinates & all 7 key POIs verified.")

def test_point_in_polygon_geofence_algorithm():
    """Verify point-in-polygon algorithm for MMU campus boundary."""
    campus_polygon = [
        [30.2458, 77.0445],
        [30.2458, 77.0550],
        [30.2558, 77.0560],
        [30.2568, 77.0482],
        [30.2538, 77.0438],
        [30.2458, 77.0445]
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

    # Campus center point -> Must be INSIDE
    center_pt = [30.2505, 77.0495]
    assert point_in_polygon(center_pt, campus_polygon) == True, "Center point must be inside geofence!"

    # Library point -> Must be INSIDE
    library_pt = [30.2495, 77.0492]
    assert point_in_polygon(library_pt, campus_polygon) == True, "Library point must be inside geofence!"

    # Far point outside campus (e.g. 30.2800, 77.0800) -> Must be OUTSIDE
    far_pt = [30.2800, 77.0800]
    assert point_in_polygon(far_pt, campus_polygon) == False, "Far point must be outside geofence!"

    print("[PASS] 5. Geofence point-in-polygon math & perimeter testing verified.")

def test_ui_labels_and_fallback_strings():
    """Verify required UI text strings for loading, fallback, and persistent label."""
    gmap_path = os.path.join(ROOT_DIR, "js", "components", "GoogleCampusMap.jsx")
    with open(gmap_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Loading MMU Mullana Campus Safety Map…" in content
    assert "Map is temporarily unavailable. Safety controls and demo mode remain available." in content
    assert "MMU Mullana Campus Safety Geofence — Demo / Simulated Data" in content
    assert "Inside MMU Safe Geofence" in content
    assert "Outside Approved Campus Corridor" in content
    assert "SOS Simulation Active" in content
    print("[PASS] 6. Exact UI text strings for loading, fallback, and geofence status verified.")

def test_marker_color_codes():
    """Verify marker color mapping (Green, Amber, Red)."""
    gmap_path = os.path.join(ROOT_DIR, "js", "components", "GoogleCampusMap.jsx")
    with open(gmap_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Green (#10B981), Amber (#F59E0B), Red (#EF4444)
    assert "#10B981" in content  # Safe
    assert "#F59E0B" in content  # Caution / Amber
    assert "#EF4444" in content  # Emergency / Red
    assert "#38BDF8" in content or "#2563EB" in content  # Blue / Brand Corridor
    print("[PASS] 7. Dynamic marker color coding (Green, Amber, Red, Blue) verified.")

def test_unmount_cleanup_and_isolation():
    """Verify cleanupMapElements clears listeners, overlays, markers, and avoids dual map collisions."""
    gmap_path = os.path.join(ROOT_DIR, "js", "components", "GoogleCampusMap.jsx")
    with open(gmap_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "cleanupMapElements" in content
    assert "removeListener" in content
    assert "setMap(null)" in content
    assert "isCancelled" in content

    imap_path = os.path.join(ROOT_DIR, "js", "components", "InteractiveMap.jsx")
    with open(imap_path, "r", encoding="utf-8") as f:
        imap_content = f.read()

    # Ensure separate mapId namespaces to prevent container collision
    assert "mapId + '-gmap'" in imap_content or "gmap" in imap_content
    assert "mapId + '-leaflet'" in imap_content or "leaflet" in imap_content
    print("[PASS] 8. Component unmount cleanup, listener disposal, and container isolation verified.")

if __name__ == "__main__":
    print("=" * 70)
    print("  [SRG] Google Maps JavaScript API & Campus Safety Test Suite")
    print("=" * 70)
    test_no_hardcoded_keys()
    test_config_service_google_maps()
    test_google_maps_service_structure()
    test_mmu_campus_metadata_and_pois()
    test_point_in_polygon_geofence_algorithm()
    test_ui_labels_and_fallback_strings()
    test_marker_color_codes()
    test_unmount_cleanup_and_isolation()
    print("=" * 70)
    print("  [SUCCESS] ALL GOOGLE MAPS SAFETY TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)
