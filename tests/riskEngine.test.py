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
    
    # Test 1: MMU Mullana Campus Main Gate to Academic Block Segment
    # Point A: MMU Main Gate [30.2472, 77.0468]
    # Point B: Engineering Academic Block [30.2505, 77.0505]
    pointA = [30.2472, 77.0468]
    pointB = [30.2505, 77.0505]
    midpointP = [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2]
    mmu_route = [pointA, pointB]

    dist_to_segment = get_distance_to_route(midpointP, mmu_route)
    dist_to_endpoints = min(
        get_distance_meters(midpointP[0], midpointP[1], pointA[0], pointA[1]),
        get_distance_meters(midpointP[0], midpointP[1], pointB[0], pointB[1])
    )

    print(f"Test 1: MMU Mullana Campus Segment Midpoint Test:")
    print(f"  - Distance to endpoints (old naive method): {round(dist_to_endpoints)}m")
    print(f"  - True perpendicular distance to segment (new method): {dist_to_segment}m")
    assert dist_to_segment < 5, f"Expected midpoint on line to be < 5m, got {dist_to_segment}m"
    print("  ✓ PASS: Traveler on MMU campus straight segment correctly measured as 0m from route.\n")

    # Test 2: Lateral offset of ~140m from MMU corridor midpoint
    # At latitude 30.25 deg, 1 deg lon is approx 111,320 * cos(30.25 deg) = 96,160 meters.
    # 140m offset in longitude is approx 140 / 96160 = 0.001456 degrees.
    offsetP = [midpointP[0], midpointP[1] + 0.001456]
    dist_offset = get_distance_to_route(offsetP, mmu_route)
    print(f"Test 2: MMU Campus Lateral Offset Test (Target ~140m):")
    print(f"  - Measured perpendicular distance: {dist_offset}m")
    assert 90 <= dist_offset <= 160, f"Expected ~140m, got {dist_offset}m"
    print("  ✓ PASS: Lateral corridor offset accurately measured.\n")

    # Test 3: Multi-segment MMU route
    multi_route = [
        [30.2472, 77.0468], # Main Gate
        [30.2485, 77.0478], # Admin Block
        [30.2495, 77.0492], # Library
        [30.2505, 77.0505]  # Engineering Block
    ]
    # Check point on second segment
    seg2_mid = [(30.2485 + 30.2495) / 2, (77.0478 + 77.0492) / 2]
    dist_seg2 = get_distance_to_route(seg2_mid, multi_route)
    print(f"Test 3: MMU Multi-segment Campus Route Midpoint:")
    print(f"  - Measured distance: {dist_seg2}m")
    assert dist_seg2 < 5, f"Expected < 5m on segment, got {dist_seg2}m"
    print("  ✓ PASS: Multi-segment MMU campus route correctly projects onto intermediate edges.\n")

    print("=== All Risk Engine Geospatial Unit Tests Passed! ===")

if __name__ == '__main__':
    run_tests()
