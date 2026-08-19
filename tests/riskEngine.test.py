import math
import sys

# Configure UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_distance_meters(lat1, lon1, lat2, lon2):
    R = 6371000
    rad = math.pi / 180
    dLat = (lat2 - lat1) * rad
    dLon = (lon2 - lon1) * rad
    a = math.sin(dLat / 2) ** 2 + math.cos(lat1 * rad) * math.cos(lat2 * rad) * math.sin(dLon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_distance_to_segment_meters(pLat, pLon, aLat, aLon, bLat, bLon):
    rad = math.pi / 180
    meanLat = ((aLat + bLat) / 2) * rad
    R = 6371000

    cosMeanLat = math.cos(meanLat)
    px = (pLon - aLon) * rad * R * cosMeanLat
    py = (pLat - aLat) * rad * R
    bx = (bLon - aLon) * rad * R * cosMeanLat
    by = (bLat - aLat) * rad * R

    segmentLenSq = bx * bx + by * by
    if segmentLenSq == 0:
        return math.sqrt(px * px + py * py)

    t = max(0.0, min(1.0, (px * bx + py * by) / segmentLenSq))
    projX = t * bx
    projY = t * by

    dx = px - projX
    dy = py - projY
    return math.sqrt(dx * dx + dy * dy)

def get_distance_to_route(current_pos, waypoints):
    if not current_pos or not waypoints or len(waypoints) == 0:
        return 0
    if len(waypoints) == 1:
        return round(get_distance_meters(current_pos[0], current_pos[1], waypoints[0][0], waypoints[0][1]))

    min_dist = float('inf')
    for i in range(len(waypoints) - 1):
        seg_dist = get_distance_to_segment_meters(
            current_pos[0], current_pos[1],
            waypoints[i][0], waypoints[i][1],
            waypoints[i + 1][0], waypoints[i + 1][1]
        )
        if seg_dist < min_dist:
            min_dist = seg_dist
    return round(min_dist)

def run_tests():
    print("=== Running Risk Engine & Point-to-Polyline Geospatial Tests ===")
    
    # Test 1: Long straight segment with midpoint traveler
    # Waypoint A: (37.7749, -122.4194), Waypoint B: (37.7849, -122.4194) (approx 1.11 km north)
    # Midpoint P: (37.7799, -122.4194) (directly on segment, ~555m from A and B)
    pointA = (37.7749, -122.4194)
    pointB = (37.7849, -122.4194)
    midpointP = (37.7799, -122.4194)
    waypoints = [pointA, pointB]

    dist_to_segment = get_distance_to_route(midpointP, waypoints)
    dist_to_endpoints = min(
        get_distance_meters(midpointP[0], midpointP[1], pointA[0], pointA[1]),
        get_distance_meters(midpointP[0], midpointP[1], pointB[0], pointB[1])
    )

    print(f"Test 1: Long Segment Midpoint Test:")
    print(f"  - Distance to endpoints (old naive method): {round(dist_to_endpoints)}m")
    print(f"  - True perpendicular distance to segment (new method): {dist_to_segment}m")
    assert dist_to_segment < 5, f"Expected midpoint on line to be < 5m, got {dist_to_segment}m"
    print("  ✓ PASS: Traveler on long straight segment correctly measured as 0m from route.\n")

    # Test 2: Lateral offset of 140m from midpoint
    # Shifting longitude slightly east at lat 37.78
    # 1 deg lon at 37.78 lat is approx 88,140 meters. 140m is approx 140 / 88140 = 0.001588 degrees.
    offsetP = (37.7799, -122.4194 + 0.001588)
    dist_offset = get_distance_to_route(offsetP, waypoints)
    print(f"Test 2: Lateral Offset Test (Target ~140m):")
    print(f"  - Measured perpendicular distance: {dist_offset}m")
    assert 130 <= dist_offset <= 150, f"Expected ~140m, got {dist_offset}m"
    print("  ✓ PASS: Lateral offset accurately measured.\n")

    # Test 3: Multi-segment route
    multi_route = [
        [37.7749, -122.4194],
        [37.7770, -122.4185],
        [37.7795, -122.4175],
        [37.7833, -122.4167]
    ]
    # Check point right on second segment
    seg2_mid = [(37.7770 + 37.7795) / 2, (-122.4185 + -122.4175) / 2]
    dist_seg2 = get_distance_to_route(seg2_mid, multi_route)
    print(f"Test 3: Multi-segment Route Midpoint:")
    print(f"  - Measured distance: {dist_seg2}m")
    assert dist_seg2 < 5, f"Expected < 5m on segment, got {dist_seg2}m"
    print("  ✓ PASS: Multi-segment route correctly projects onto intermediate edges.\n")

    print("=== All Risk Engine Geospatial Unit Tests Passed! ===")

if __name__ == '__main__':
    run_tests()
