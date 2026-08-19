/**
 * SafeRoute Guardian - Explainable AI Safety Risk Engine
 * Computes deterministic, explainable safety risk score (0-100) using contextual safety signals.
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
    EMERGENCY: { min: 80, max: 100, key: 'EMERGENCY', label: 'Emergency / Avoid', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444' }
  },

  /**
   * Calculate geographic distance in meters between two lat/lng points using Haversine formula
   */
  getDistanceMeters: function(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  /**
   * Calculate minimum distance from a point to the polyline route waypoints
   */
  getDistanceToRoute: function(currentPos, waypoints) {
    if (!currentPos || !waypoints || waypoints.length === 0) return 0;
    let minDistance = Infinity;

    for (let i = 0; i < waypoints.length; i++) {
      const dist = this.getDistanceMeters(
        currentPos[0], currentPos[1],
        waypoints[i][0], waypoints[i][1]
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    return minDistance;
  },

  /**
   * Traveler Journey Live Risk Assessment (0 - 100)
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
      checkinStatus = 'NOT_NEEDED',
      isSosActive = false,
      destinationName = 'Destination'
    } = params;

    // 1. Immediate SOS Override
    if (isSosActive) {
      return {
        score: 100,
        level: this.LEVELS.EMERGENCY,
        isEmergency: true,
        summary: `[Demo / Simulated] EMERGENCY ALERT: ${travelerName} has triggered an active SOS panic alarm. Immediate protocol activated.`,
        factors: [
          { name: 'SOS Panic Trigger', score: 100, max: 100, description: 'Manual emergency SOS or forceful shake gesture activated', isAlert: true }
        ],
        distanceOffCorridor: 0,
        recommendation: 'Contact emergency dispatch immediately. Dispatching live location to safety network.'
      };
    }

    // 2. Check-in expired override (Escalation timeout)
    if (checkinStatus === 'EXPIRED') {
      return {
        score: 95,
        level: this.LEVELS.EMERGENCY,
        isEmergency: true,
        summary: `[Demo / Simulated] EMERGENCY ESCALATION: ${travelerName} did not respond to the safety check-in within the allowable time window.`,
        factors: [
          { name: 'Unresponsive Escalation Timeout', score: 95, max: 100, description: 'Traveler remained outside corridor without acknowledging safety', isAlert: true }
        ],
        distanceOffCorridor: 0,
        recommendation: 'Emergency protocol initiated automatically due to lack of response.'
      };
    }

    // Compute distance from centerline
    const distanceToRouteCenter = this.getDistanceToRoute(currentPos, routeWaypoints);
    const distanceOutsideCorridor = Math.max(0, distanceToRouteCenter - corridorWidthMeters);

    let totalScore = 0;
    const factors = [];

    // Factor A: Geofence Corridor Proximity & Breach (Max 35 points)
    let corridorPoints = 0;
    let corridorDesc = '';
    if (distanceOutsideCorridor === 0) {
      corridorPoints = 0;
      corridorDesc = `Within approved ${corridorWidthMeters}m safe buffer (dist: ${distanceToRouteCenter}m)`;
    } else if (distanceOutsideCorridor <= 50) {
      corridorPoints = 12;
      corridorDesc = `Slight deviation: ${distanceOutsideCorridor}m outside safe corridor`;
    } else if (distanceOutsideCorridor <= 200) {
      corridorPoints = 24;
      corridorDesc = `Moderate deviation: ${distanceOutsideCorridor}m outside safe corridor`;
    } else {
      corridorPoints = 35;
      corridorDesc = `Significant breach: ${distanceOutsideCorridor}m outside safe corridor`;
    }
    totalScore += corridorPoints;
    factors.push({
      name: 'Corridor Geofence Offset',
      score: corridorPoints,
      max: 35,
      description: corridorDesc,
      isAlert: corridorPoints > 15
    });

    // Factor B: Time Drift Outside Corridor (Max 25 points)
    let timePoints = 0;
    let timeDesc = '';
    const minutesAway = Math.floor(timeOffRouteSeconds / 60);
    if (distanceOutsideCorridor === 0 || timeOffRouteSeconds === 0) {
      timePoints = 0;
      timeDesc = 'No time spent outside corridor';
    } else if (timeOffRouteSeconds < 120) {
      timePoints = 8;
      timeDesc = `Off-route for ${timeOffRouteSeconds}s (< 2 mins)`;
    } else if (timeOffRouteSeconds < 360) {
      timePoints = 16;
      timeDesc = `Off-route for ${minutesAway} min ${timeOffRouteSeconds % 60}s`;
    } else {
      timePoints = 25;
      timeDesc = `Off-route for extended period (${minutesAway} minutes)`;
    }
    totalScore += timePoints;
    factors.push({
      name: 'Time Spent Off-Route',
      score: timePoints,
      max: 25,
      description: timeDesc,
      isAlert: timePoints > 10
    });

    // Factor C: Trajectory Vector & Movement Trend (Max 15 points)
    let vectorPoints = 0;
    let vectorDesc = '';
    if (distanceOutsideCorridor === 0) {
      vectorPoints = 0;
      vectorDesc = 'Heading directly along approved trajectory';
    } else if (isMovingFarther) {
      vectorPoints = 15;
      vectorDesc = 'Trajectory vector moving FARTHER away from safe corridor';
    } else {
      vectorPoints = 3;
      vectorDesc = 'Vector indicates traveler is returning toward the safe corridor';
    }
    totalScore += vectorPoints;
    factors.push({
      name: 'Trajectory Vector Direction',
      score: vectorPoints,
      max: 15,
      description: vectorDesc,
      isAlert: vectorPoints >= 10
    });

    // Factor D: Journey Time-of-Day Context (Max 15 points)
    let timeOfDayPoints = 0;
    let timeOfDayDesc = '';
    if (isNight) {
      timeOfDayPoints = 12;
      timeOfDayDesc = 'Night-time / low-visibility window active (heightened risk factor)';
    } else {
      timeOfDayPoints = 0;
      timeOfDayDesc = 'Standard daytime visibility conditions';
    }
    totalScore += timeOfDayPoints;
    factors.push({
      name: 'Time-of-Day Risk Factor',
      score: timeOfDayPoints,
      max: 15,
      description: timeOfDayDesc,
      isAlert: timeOfDayPoints > 0
    });

    // Factor E: Check-In Response State (Max 20 points)
    let checkinPoints = 0;
    let checkinDesc = '';
    if (checkinStatus === 'PENDING') {
      checkinPoints = 18;
      checkinDesc = 'Unanswered "Are you safe?" check-in prompt';
    } else if (checkinStatus === 'ACKNOWLEDGED') {
      checkinPoints = 0;
      checkinDesc = 'Traveler clicked "I\'m Safe" (verified responsive)';
    } else {
      checkinPoints = 0;
      checkinDesc = 'No pending check-in required';
    }
    totalScore += checkinPoints;
    factors.push({
      name: 'Safety Check-In Status',
      score: checkinPoints,
      max: 20,
      description: checkinDesc,
      isAlert: checkinPoints > 0
    });

    const finalScore = Math.min(100, Math.max(0, totalScore));

    let level = this.LEVELS.SAFE;
    if (finalScore >= this.LEVELS.EMERGENCY.min) {
      level = this.LEVELS.EMERGENCY;
    } else if (finalScore >= this.LEVELS.HIGH_RISK.min) {
      level = this.LEVELS.HIGH_RISK;
    } else if (finalScore >= this.LEVELS.CAUTION.min) {
      level = this.LEVELS.CAUTION;
    }

    let summary = '';
    let recommendation = '';

    if (level.key === 'SAFE') {
      summary = `Optimal safety status. ${travelerName} is progressing smoothly along the designated corridor toward ${destinationName}.`;
      recommendation = 'Continue standard journey tracking. No action required.';
    } else if (level.key === 'CAUTION') {
      summary = `Caution: ${travelerName} is ${distanceOutsideCorridor}m outside the designated safe corridor for ${timeOffRouteSeconds}s.`;
      recommendation = 'In-app gentle route guidance reminder dispatched to traveler.';
    } else if (level.key === 'HIGH_RISK') {
      const dirPhrase = isMovingFarther ? 'moving farther away from the corridor' : 'slowly moving back';
      summary = `High Risk: ${travelerName} is ${distanceOutsideCorridor}m outside approved corridor, off-route for ${minutesAway}m ${timeOffRouteSeconds % 60}s, and ${dirPhrase}.`;
      recommendation = 'Active check-in prompt dispatched to traveler and administrator alert triggered.';
    } else {
      summary = `Critical Risk: ${travelerName} has substantial route deviation (${distanceOutsideCorridor}m off corridor) without safety acknowledgment.`;
      recommendation = 'Prepare emergency escalation countdown and alert guardian network.';
    }

    return {
      score: finalScore,
      level: level,
      isEmergency: level.key === 'EMERGENCY',
      summary: summary,
      factors: factors,
      distanceOffCorridor: distanceOutsideCorridor,
      distanceToRouteCenter: distanceToRouteCenter,
      recommendation: recommendation
    };
  },

  /**
   * Tourist Safety Intelligence & Destination Assessment (0 - 100)
   * Evaluates environmental weather, network connectivity, official travel advisories,
   * diurnal timing, and aggregated community feedback patterns.
   */
  assessTouristSafetyScore: function(params = {}) {
    const {
      weatherSeverity = 'CAUTION', // 'NORMAL' | 'CAUTION' | 'AVOID' | 'EMERGENCY'
      hasDeadZone = true,
      officialAdvisorySeverity = 'CAUTION', // 'NORMAL' | 'CAUTION' | 'AVOID' | 'EMERGENCY'
      isNight = false,
      communityReviews = [],
      selectedRouteType = 'fastest' // 'fastest' | 'safer'
    } = params;

    let score = 0;
    const factorList = [];
    const safeActions = [];

    // If 'safer' route is selected, baseline risk is naturally lowered
    const routeDiscount = selectedRouteType === 'safer' ? 22 : 0;

    // 1. Weather Severity Points (0 - 25 pts)
    let weatherPts = 0;
    let weatherText = '';
    if (weatherSeverity === 'EMERGENCY') {
      weatherPts = 25;
      weatherText = 'Severe meteorological hazard (Flooding / Extreme Storms)';
      safeActions.push('Avoid travel during peak storm window; seek shelter.');
    } else if (weatherSeverity === 'AVOID') {
      weatherPts = 20;
      weatherText = 'High weather alert (Thunderstorms & torrential rain)';
      safeActions.push('Delay departure until weather advisory is downgraded.');
    } else if (weatherSeverity === 'CAUTION') {
      weatherPts = 12;
      weatherText = 'Moderate weather alert: Heavy rain & low visibility expected after 7 PM';
      safeActions.push('Complete travel before sunset (prior to 7:00 PM).');
    } else {
      weatherPts = 2;
      weatherText = 'Normal favorable weather conditions';
    }
    score += weatherPts;
    factorList.push({ name: 'Weather Conditions', pts: weatherPts, max: 25, desc: weatherText });

    // 2. Connectivity & Cellular Signal (0 - 20 pts)
    let connectPts = 0;
    let connectText = '';
    if (selectedRouteType === 'safer') {
      connectPts = 2;
      connectText = 'Continuous 5G / 4G coverage along main avenues';
    } else if (hasDeadZone) {
      connectPts = 14;
      connectText = 'Limited signal for 2.1 km along narrow alleyway segment';
      safeActions.push('Download offline maps and share live trip with a trusted contact.');
    } else {
      connectPts = 0;
      connectText = 'Strong continuous cellular coverage along entire route';
    }
    score += connectPts;
    factorList.push({ name: 'Network Connectivity', pts: connectPts, max: 20, desc: connectText });

    // 3. Official Travel Advisories (0 - 30 pts)
    let advisoryPts = 0;
    let advisoryText = '';
    if (officialAdvisorySeverity === 'EMERGENCY') {
      advisoryPts = 30;
      advisoryText = 'Official Emergency advisory active (Restricted Zone / Curfew)';
      safeActions.push('Avoid this area until official restrictions are lifted.');
    } else if (officialAdvisorySeverity === 'AVOID') {
      advisoryPts = 22;
      advisoryText = 'Official Avoid advisory (Civil unrest / Major disruption)';
      safeActions.push('Reroute through secondary official safe corridor.');
    } else if (officialAdvisorySeverity === 'CAUTION') {
      advisoryPts = 12;
      advisoryText = 'Official Caution advisory (Walkway maintenance & crowd congestion)';
      safeActions.push('Choose Safer Route B to bypass congested detour.');
    } else {
      advisoryPts = 0;
      advisoryText = 'Normal baseline conditions; no active official advisories';
    }
    score += advisoryPts;
    factorList.push({ name: 'Official Safety Advisories', pts: advisoryPts, max: 30, desc: advisoryText });

    // 4. Aggregated Community Safety Patterns (0 - 25 pts)
    // Note: Rule states single review does not dramatically skew score; repeated patterns are counted
    let communityPts = 0;
    const poorLightingMentions = communityReviews.filter(r => (r.tags || []).includes('Unsafe at Night') || (r.tags || []).includes('Poor Network')).length;
    const scamMentions = communityReviews.filter(r => (r.tags || []).includes('Scam Risk') || (r.tags || []).includes('Harassment Concern')).length;
    const safeSoloCount = communityReviews.filter(r => (r.tags || []).includes('Safe for Solo Travel') || (r.tags || []).includes('Well-lit')).length;

    if (poorLightingMentions >= 2) {
      communityPts += 8;
    }
    if (scamMentions >= 2) {
      communityPts += 6;
      safeActions.push('Keep belongings secure and avoid unauthorized street solicitors.');
    }
    if (safeSoloCount >= 2) {
      communityPts = Math.max(0, communityPts - 4); // Mitigate slightly if repeated positive solo tags
    }
    score += communityPts;
    factorList.push({
      name: 'Community Safety Signals',
      pts: communityPts,
      max: 25,
      desc: `${communityReviews.length} community reports analyzed (${poorLightingMentions} flag poor night lighting/network, ${safeSoloCount} report safe solo travel)`
    });

    // Apply Route Discount
    score = Math.max(5, score - routeDiscount);
    const finalScore = Math.min(100, Math.max(0, score));

    // Determine Level
    let level = this.LEVELS.SAFE;
    if (finalScore >= 80) level = this.LEVELS.EMERGENCY;
    else if (finalScore >= 60) level = this.LEVELS.HIGH_RISK;
    else if (finalScore >= 30) level = this.LEVELS.CAUTION;

    // Plain Language Explanation
    let explanation = '';
    if (level.key === 'SAFE') {
      explanation = `Low Risk (${finalScore}/100): Excellent travel conditions. Weather is stable, 100% cellular coverage, and community reports confirm well-lit pathways.`;
    } else if (level.key === 'CAUTION') {
      explanation = `Caution (${finalScore}/100): Heavy rain is expected after 7 PM, connectivity is limited for 2 km on the direct route, and recent community reviews mention sparse night lighting.`;
    } else if (level.key === 'HIGH_RISK') {
      explanation = `High Risk (${finalScore}/100): Weather warning active, notable cellular dead-zone segments, and official advisories recommend avoiding narrow alleys after dusk.`;
    } else {
      explanation = `Avoid (${finalScore}/100): Severe weather advisory and official restriction in place. Travel along this corridor is currently discouraged.`;
    }

    return {
      travelSafetyScore: finalScore,
      level: level,
      explanation: explanation,
      factors: factorList,
      safeActions: safeActions.length > 0 ? safeActions : ['Maintain standard travel awareness and follow designated corridor.']
    };
  }
};
