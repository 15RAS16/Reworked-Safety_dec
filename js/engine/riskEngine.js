/**
 * SafeRoute Guardian - Explainable AI Safety Risk Engine (v2.0)
 * Computes deterministic, explainable safety risk scores (0-100) using 6 contextual safety signals.
 * Implements high-precision Point-to-Polyline-Segment geodesic projection to prevent false deviations on long spans.
 * Includes Traveler Journey Risk Assessment and Tourist Destination Safety Intelligence.
 */

window.RiskEngine = {
  /**
   * Risk Level Thresholds
   */
  LEVELS: {
    SAFE: { min: 0, max: 29, key: 'SAFE', label: 'Safe / Low Risk', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981' },
    CAUTION: { min: 30, max: 59, key: 'CAUTION', label: 'Caution', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B' },
    HIGH_RISK: { min: 60, max: 79, key: 'HIGH_RISK', label: 'High Risk', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', border: '#F97316' },
    EMERGENCY: { min: 80, max: 100, key: 'EMERGENCY', label: 'Emergency', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444' }
  },

  /**
   * Calculate great-circle distance in meters between two lat/lng points using Haversine formula
   */
  getDistanceMeters: function(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's mean radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Calculate minimum perpendicular distance in meters from a point P to a polyline segment AB.
   * Uses equirectangular projection for high accuracy across city corridor scales.
   */
  getDistanceToSegmentMeters: function(pLat, pLon, aLat, aLon, bLat, bLon) {
    const rad = Math.PI / 180;
    const meanLat = ((aLat + bLat) / 2) * rad;
    const R = 6371000;

    // Convert spherical coordinates to planar meters relative to point A
    const cosMeanLat = Math.cos(meanLat);
    const px = (pLon - aLon) * rad * R * cosMeanLat;
    const py = (pLat - aLat) * rad * R;
    const bx = (bLon - aLon) * rad * R * cosMeanLat;
    const by = (bLat - aLat) * rad * R;

    const segmentLenSq = bx * bx + by * by;
    if (segmentLenSq === 0) {
      // Segment A and B are identical
      return Math.sqrt(px * px + py * py);
    }

    // Projection parameter t clamped to segment [0, 1]
    const t = Math.max(0, Math.min(1, (px * bx + py * by) / segmentLenSq));
    const projX = t * bx;
    const projY = t * by;

    const dx = px - projX;
    const dy = py - projY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Calculate minimum distance in meters from a point to the entire polyline route.
   * Iterates through every segment [waypoints[i], waypoints[i+1]] to find the closest orthogonal distance.
   */
  getDistanceToRoute: function(currentPos, waypoints) {
    if (!currentPos || !waypoints || waypoints.length === 0) return 0;
    if (waypoints.length === 1) {
      return Math.round(this.getDistanceMeters(currentPos[0], currentPos[1], waypoints[0][0], waypoints[0][1]));
    }

    let minDistance = Infinity;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const segDist = this.getDistanceToSegmentMeters(
        currentPos[0], currentPos[1],
        waypoints[i][0], waypoints[i][1],
        waypoints[i + 1][0], waypoints[i + 1][1]
      );
      if (segDist < minDistance) {
        minDistance = segDist;
      }
    }

    return Math.round(minDistance);
  },

  /**
   * Traveler Journey Live Risk Assessment (0 - 100)
   * Evaluates 6 contextual signals with transparent explainability:
   * 1. Geofence Corridor Offset (0 - 35 pts)
   * 2. Time Drift Outside Corridor (0 - 25 pts)
   * 3. Trajectory Vector Direction (0 - 15 pts)
   * 4. Time-of-Day Hazard (0 - 15 pts)
   * 5. Safety Check-in Responsiveness (0 - 20 pts)
   * 6. Emergency SOS / Timeout Override (100 pts)
   */
  assessRisk: function(params) {
    const {
      travelerName = 'Traveler',
      currentPos,
      routeWaypoints = [],
      corridorWidthMeters = 100,
      timeOffRouteSeconds = 0,
      isMovingFarther = false,
      isNight = false,
      checkinStatus = 'NOT_NEEDED', // 'NOT_NEEDED' | 'PENDING' | 'ACKNOWLEDGED' | 'EXPIRED'
      isSosActive = false,
      destinationName = 'Destination'
    } = params;

    // 1. Immediate SOS Override (Max Priority)
    if (isSosActive) {
      return {
        score: 100,
        level: this.LEVELS.EMERGENCY,
        isEmergency: true,
        summary: `[Demo / Simulated] EMERGENCY ALERT: ${travelerName} has triggered an active SOS panic alarm. Safety network and dispatch alerted.`,
        factors: [
          { name: 'SOS Panic Trigger', score: 100, max: 100, detail: 'Manual 3s hold panic button or 3-shake hardware gesture activated.', isAlert: true }
        ],
        distanceToRouteCenter: 0,
        distanceOffCorridor: 0,
        primaryFactor: 'Active SOS Emergency Trigger',
        plainExplanation: 'Emergency protocol is active. Sirens and emergency broadcasts are running.',
        recommendedAction: 'Keep your phone on. If safe to do so, stay in a well-lit location or hold for 5s to cancel if triggered by mistake.'
      };
    }

    // 2. Unresponsive Check-in Expired Override
    if (checkinStatus === 'EXPIRED') {
      return {
        score: 95,
        level: this.LEVELS.EMERGENCY,
        isEmergency: true,
        summary: `[Demo / Simulated] EMERGENCY ESCALATION: ${travelerName} did not respond to the safety check-in within the timeout window.`,
        factors: [
          { name: 'Unresponsive Check-in Timeout', score: 95, max: 100, detail: 'Safety check-in expired without traveler acknowledgment.', isAlert: true }
        ],
        distanceToRouteCenter: 0,
        distanceOffCorridor: 0,
        primaryFactor: 'Safety Check-in Timeout Escalation',
        plainExplanation: 'You did not respond to the "Are you safe?" check-in. Emergency contacts have been notified.',
        recommendedAction: 'Tap "I\'m Safe" immediately or hold for 5s to cancel the escalation broadcast.'
      };
    }

    // Compute precise point-to-polyline-segment distance
    const distanceToRouteCenter = this.getDistanceToRoute(currentPos, routeWaypoints);
    const distanceOffCorridor = Math.max(0, distanceToRouteCenter - corridorWidthMeters);

    let totalScore = 0;
    const factors = [];

    // Factor A: Geofence Corridor Offset (Max 35 points)
    let corridorPoints = 0;
    let corridorDetail = '';
    if (distanceOffCorridor === 0) {
      corridorPoints = 0;
      corridorDetail = `Safely within approved ${corridorWidthMeters}m corridor buffer (offset: ${distanceToRouteCenter}m).`;
    } else if (distanceOffCorridor <= 50) {
      corridorPoints = 12;
      corridorDetail = `Slight deviation: ${distanceOffCorridor}m outside safe corridor boundary.`;
    } else if (distanceOffCorridor <= 200) {
      corridorPoints = 24;
      corridorDetail = `Moderate deviation: ${distanceOffCorridor}m outside safe corridor boundary.`;
    } else {
      corridorPoints = 35;
      corridorDetail = `Significant breach: ${distanceOffCorridor}m outside safe corridor boundary.`;
    }
    totalScore += corridorPoints;
    factors.push({
      name: 'Corridor Geofence Offset',
      score: corridorPoints,
      max: 35,
      detail: corridorDetail,
      isAlert: corridorPoints > 15
    });

    // Factor B: Time Drift Outside Corridor (Max 25 points)
    let timePoints = 0;
    let timeDetail = '';
    const minutesAway = Math.floor(timeOffRouteSeconds / 60);
    if (distanceOffCorridor === 0 || timeOffRouteSeconds === 0) {
      timePoints = 0;
      timeDetail = 'Zero time spent outside approved corridor.';
    } else if (timeOffRouteSeconds < 120) {
      timePoints = 8;
      timeDetail = `Off-route for ${timeOffRouteSeconds}s (< 2 minutes).`;
    } else if (timeOffRouteSeconds < 360) {
      timePoints = 16;
      timeDetail = `Off-route for ${minutesAway}m ${timeOffRouteSeconds % 60}s.`;
    } else {
      timePoints = 25;
      timeDetail = `Off-route for extended period (${minutesAway} minutes).`;
    }
    totalScore += timePoints;
    factors.push({
      name: 'Time Spent Off-Route',
      score: timePoints,
      max: 25,
      detail: timeDetail,
      isAlert: timePoints > 10
    });

    // Factor C: Trajectory Vector Direction (Max 15 points)
    let trajectoryPoints = 0;
    let trajectoryDetail = '';
    if (distanceOffCorridor === 0) {
      trajectoryPoints = 0;
      trajectoryDetail = 'Traveling on approved route trajectory.';
    } else if (isMovingFarther) {
      trajectoryPoints = 15;
      trajectoryDetail = 'Trajectory vector heading farther away from safe corridor.';
    } else {
      trajectoryPoints = 4;
      trajectoryDetail = 'Trajectory vector returning toward approved corridor.';
    }
    totalScore += trajectoryPoints;
    factors.push({
      name: 'Trajectory Vector Direction',
      score: trajectoryPoints,
      max: 15,
      detail: trajectoryDetail,
      isAlert: trajectoryPoints >= 10
    });

    // Factor D: Time-of-Day Hazard (Max 15 points)
    let nightPoints = 0;
    let nightDetail = '';
    if (isNight) {
      nightPoints = distanceOffCorridor > 0 ? 15 : 6;
      nightDetail = 'Night-time / low ambient lighting conditions active.';
    } else {
      nightPoints = 0;
      nightDetail = 'Daylight journey with good visibility.';
    }
    totalScore += nightPoints;
    factors.push({
      name: 'Time-of-Day Hazard',
      score: nightPoints,
      max: 15,
      detail: nightDetail,
      isAlert: nightPoints >= 10
    });

    // Factor E: Safety Check-in Status (Max 20 points)
    let checkinPoints = 0;
    let checkinDetail = '';
    if (checkinStatus === 'PENDING') {
      checkinPoints = 20;
      checkinDetail = '"Are you safe?" check-in prompt is awaiting response.';
    } else if (checkinStatus === 'ACKNOWLEDGED') {
      checkinPoints = 0;
      checkinDetail = 'Traveler acknowledged "I\'m Safe" check-in.';
    } else {
      checkinPoints = 0;
      checkinDetail = 'No active check-in required.';
    }
    totalScore += checkinPoints;
    factors.push({
      name: 'Check-in Responsiveness',
      score: checkinPoints,
      max: 20,
      detail: checkinDetail,
      isAlert: checkinPoints > 0
    });

    // Clamp score to 0 - 100
    const clampedScore = Math.min(100, Math.max(0, totalScore));

    // Determine Level
    let level = this.LEVELS.SAFE;
    if (clampedScore >= this.LEVELS.EMERGENCY.min) {
      level = this.LEVELS.EMERGENCY;
    } else if (clampedScore >= this.LEVELS.HIGH_RISK.min) {
      level = this.LEVELS.HIGH_RISK;
    } else if (clampedScore >= this.LEVELS.CAUTION.min) {
      level = this.LEVELS.CAUTION;
    }

    // Identify primary contributing factor
    let maxFactor = factors[0];
    for (let i = 1; i < factors.length; i++) {
      if (factors[i].score > maxFactor.score) {
        maxFactor = factors[i];
      }
    }

    // Plain-language explanation
    let plainExplanation = 'You are traveling safely along the designated corridor.';
    let recommendedAction = `Continue along the approved route toward ${destinationName}.`;

    if (level.key === 'EMERGENCY') {
      plainExplanation = `Critical risk detected (${clampedScore}/100): ${maxFactor.name}.`;
      recommendedAction = 'Move to a well-lit safe spot or contact emergency contacts.';
    } else if (level.key === 'HIGH_RISK') {
      plainExplanation = `Significant off-route deviation (${distanceOffCorridor}m outside corridor).`;
      recommendedAction = 'Acknowledge the safety check-in prompt and return toward the approved corridor.';
    } else if (level.key === 'CAUTION') {
      plainExplanation = `Minor route deviation detected (${distanceOffCorridor}m from safe buffer).`;
      recommendedAction = 'Adjust your heading to return to the designated corridor.';
    }

    return {
      score: clampedScore,
      level: level,
      isEmergency: level.key === 'EMERGENCY',
      distanceToRouteCenter: distanceToRouteCenter,
      distanceOffCorridor: distanceOffCorridor,
      factors: factors,
      primaryFactor: maxFactor.score > 0 ? maxFactor.name : 'Normal On-Route Travel',
      plainExplanation: plainExplanation,
      recommendedAction: recommendedAction,
      summary: `${level.label} (${clampedScore}/100) — ${plainExplanation}`
    };
  }
};

// Export for Node / CommonJS test suites
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.RiskEngine;
}
