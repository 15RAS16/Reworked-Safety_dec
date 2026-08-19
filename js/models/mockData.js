/**
 * SafeRoute Guardian - Mock Data & Default Scenarios
 * Includes realistic route points, safe corridors, personas, safety network contacts,
 * Tourist Safety Intelligence datasets, and Community Reviews.
 */

window.SRG_DATA = {
  // 5 Account Roles Definition & Feature Mappings
  roles: [
    {
      id: 'tourist',
      title: 'Tourist',
      icon: '🧳',
      badge: 'Traveler & Explorer',
      description: 'Explore destinations safely with weather intelligence, connectivity checks, community reviews, and route guidance.',
      features: [
        { id: 'explore-safely', title: 'Explore Safely', icon: '🧭', desc: 'AI-assisted destination safety score, weather warnings, connectivity maps, and advisories.', color: '#38BDF8', tag: 'AI Intelligence' },
        { id: 'tourist-journey', title: 'My Safe Journey', icon: '🗺️', desc: 'Real-time GPS corridor navigation, destination ETA, and live safety status.', color: '#10B981', tag: 'Live Navigation' },
        { id: 'community-reviews', title: 'Community Reviews', icon: '⭐', desc: 'Crowdsourced safety ratings, lighting conditions, solo travel tags, and scam warnings.', color: '#F59E0B', tag: 'Crowdsourced' },
        { id: 'local-help', title: 'Local Help Network', icon: '🤝', desc: 'Request verified local help for food, water, directions, transport, charging, or first aid.', color: '#14B8A6', tag: 'Verified Help' },
        { id: 'tourist-sos', title: 'Emergency SOS', icon: '🚨', desc: 'Instant 3-second hold panic button, mobile shake shortcut, and simulated emergency dispatch.', color: '#EF4444', tag: 'Emergency' }
      ]
    },
    {
      id: 'parent',
      title: 'Parent / Guardian',
      icon: '👨‍👩‍👧',
      badge: 'Family Guardian',
      description: 'Monitor your child or elderly family member along approved school or commute corridors with real-time alerts.',
      features: [
        { id: 'live-map', title: 'Live Journey Map', icon: '📍', desc: 'Interactive map displaying child location, safe corridor buffer, and breadcrumb trails.', color: '#38BDF8', tag: 'Live Tracking' },
        { id: 'traveler-status', title: 'Child / Traveler Status', icon: '👶', desc: 'Live safety status card, corridor offset distance, and speed telemetry.', color: '#10B981', tag: 'Status Feed' },
        { id: 'alerts-feed', title: 'Alerts & Check-ins', icon: '🔔', desc: 'Real-time logs of corridor deviations, check-in responses, and historical incident audit.', color: '#F59E0B', tag: 'Safety Alerts' },
        { id: 'guardian-contacts', title: 'Emergency Contacts', icon: '📞', desc: 'Manage guardian network, safety officers, and simulated alert test dispatches.', color: '#8B5CF6', tag: 'Safety Network' }
      ]
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: '🏢',
      badge: 'Enterprise & School Ops',
      description: 'Coordinate student commutes, tour groups, or field worker teams with centralized safety management.',
      features: [
        { id: 'org-command', title: 'Safety Command Center', icon: '📊', desc: 'High-level operational overview, active journeys count, safe users ratio, and critical incidents.', color: '#38BDF8', tag: 'Operations' },
        { id: 'org-travelers', title: 'Manage Travelers', icon: '👥', desc: 'Active team member status list, assigned corridors, and individual risk scores.', color: '#10B981', tag: 'Fleet Monitor' },
        { id: 'org-routes', title: 'Routes & Corridors', icon: '🛤️', desc: 'Create and edit approved corridors, customize geofence buffer widths, and set timeouts.', color: '#F59E0B', tag: 'Geofence Config' },
        { id: 'org-incident-log', title: 'Incident Log & Audit', icon: '📋', desc: 'Comprehensive safety logs, deviation records, and simulated escalation dispatch feeds.', color: '#EC4899', tag: 'Audit Log' }
      ]
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: '🛡️',
      badge: 'System Administrator',
      description: 'Full platform control over corridor algorithms, safety signals, emergency dispatch gateways, and simulation tools.',
      features: [
        { id: 'admin-monitor', title: 'Dashboard Monitoring', icon: '🖥️', desc: 'Full central map console with multi-layer overlays, live traveler markers, and corridor buffers.', color: '#38BDF8', tag: 'Command Center' },
        { id: 'admin-routes', title: 'Manage Routes & Buffers', icon: '📐', desc: 'Geographic waypoint editor, corridor width adjustments, and timeout parameters.', color: '#10B981', tag: 'Route Config' },
        { id: 'admin-contacts', title: 'Manage Safety Network', icon: '📇', desc: 'Guardian directory, school safety dispatchers, and simulated CAD emergency gateway.', color: '#8B5CF6', tag: 'Dispatch Gateway' },
        { id: 'admin-ai-engine', title: 'AI Risk Engine Telemetry', icon: '🧠', desc: 'Explainable AI scoring formula, factor weight breakdown, and contextual signal monitors.', color: '#F59E0B', tag: 'AI Engine' },
        { id: 'admin-demo-controls', title: 'Emergency Demo Controls', icon: '⚡', desc: 'Interactive simulation tools: Safe, Minor Deviation, High Risk Drift, Fast-Forward, SOS.', color: '#EF4444', tag: 'Demo Tools' }
      ]
    },
    {
      id: 'traveler',
      title: 'Traveler / User',
      icon: '📱',
      badge: 'Monitored Traveler',
      description: 'Personal traveler view with route guidance, proactive "Are you safe?" check-ins, and one-touch SOS panic.',
      features: [
        { id: 'traveler-start', title: 'Start My Journey', icon: '🚀', desc: 'Select active approved route, preview waypoints, and begin monitored travel.', color: '#38BDF8', tag: 'Journey Setup' },
        { id: 'traveler-live-status', title: 'Live Safety Status', icon: '🟢', desc: 'Large color-coded status gauge, destination ETA, speed, and corridor guidance tips.', color: '#10B981', tag: 'Telemetry' },
        { id: 'traveler-checkin', title: 'I’m Safe Check-in', icon: '✅', desc: 'Proactive and manual "I\'m Safe" check-in acknowledgment to clear deviation warnings.', color: '#F59E0B', tag: 'Check-in' },
        { id: 'traveler-sos', title: 'Emergency SOS (3s Hold)', icon: '🚨', desc: 'High-visibility red panic button with circular progress animation and siren trigger.', color: '#EF4444', tag: 'Emergency' },
        { id: 'traveler-shake', title: 'Shake Gesture Emergency', icon: '📳', desc: 'DeviceMotion hardware shortcut: shake device 3 times within 5s to activate emergency protocol.', color: '#8B5CF6', tag: 'Motion Sensor' }
      ]
    }
  ],

  // Preset scenarios
  scenarios: [
    {
      id: 'tourist-group',
      name: 'Tourist Heritage Walk (Elena Rostova)',
      travelerName: 'Elena Rostova',
      travelerRole: 'International Tourist',
      avatar: '🧭',
      guardianName: 'Marcus Vance (Tour Director)',
      guardianPhone: '+1 (555) 345-6789',
      routeName: 'Historic Plaza → Bayfront Promenade',
      originName: 'Historic Plaza',
      destinationName: 'Bayfront Promenade',
      originCoords: [37.7950, -122.4020],
      destinationCoords: [37.8050, -122.4080],
      corridorWidthMeters: 150,
      estimatedDurationMinutes: 35,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [37.7950, -122.4020], // Historic Plaza
        [37.7980, -122.4035], // Heritage Lane
        [37.8010, -122.4050], // Marina Gate
        [37.8050, -122.4080]  // Bayfront Promenade
      ],
      // Alternative Safer Route Waypoints (Route B)
      saferRouteWaypoints: [
        [37.7950, -122.4020], // Historic Plaza
        [37.7975, -122.3990], // Grand Avenue (Well-lit Boulevard)
        [37.8020, -122.4010], // Waterfront Esplanade
        [37.8050, -122.4080]  // Bayfront Promenade
      ],
      demoWaypoints: {
        safe: [37.7980, -122.4035],
        minorDeviation: [37.7995, -122.4005],
        severeDeviation: [37.8030, -122.3950],
        returning: [37.8005, -122.4045],
        destination: [37.8050, -122.4080]
      },
      contacts: [
        { id: 'c4', name: 'Marcus Vance', relation: 'Tour Director (Apex Tours)', phone: '+1 (555) 345-6789', email: 'mvance@apextours.com', notifySms: true, notifyCall: true },
        { id: 'c5', name: 'Hotel Concierge & Security', relation: 'Grand Harbor Hotel', phone: '+1 (555) 456-7890', email: 'security@grandharbor.com', notifySms: true, notifyCall: false }
      ]
    },
    {
      id: 'student-commute',
      name: 'Student Commute (Aarav Sharma)',
      travelerName: 'Aarav Sharma',
      travelerRole: 'Student (Age 15)',
      avatar: '👨‍🎓',
      guardianName: 'Priya Sharma (Mother)',
      guardianPhone: '+1 (555) 234-5678',
      routeName: 'Oakwood High School → Central Youth Center',
      originName: 'Oakwood High School',
      destinationName: 'Central Youth Center',
      originCoords: [37.7749, -122.4194],
      destinationCoords: [37.7845, -122.4014],
      corridorWidthMeters: 100,
      estimatedDurationMinutes: 25,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [37.7749, -122.4194], // Oakwood High School
        [37.7770, -122.4150], // Civic Park Walkway
        [37.7795, -122.4105], // Market & 7th St Crossing
        [37.7820, -122.4060], // 5th Street Safe Corridor
        [37.7845, -122.4014]  // Central Youth Center
      ],
      saferRouteWaypoints: [
        [37.7749, -122.4194],
        [37.7780, -122.4140],
        [37.7810, -122.4080],
        [37.7845, -122.4014]
      ],
      demoWaypoints: {
        safe: [37.7780, -122.4130],
        minorDeviation: [37.7792, -122.4170],
        severeDeviation: [37.7810, -122.4235],
        returning: [37.7785, -122.4125],
        destination: [37.7845, -122.4014]
      },
      contacts: [
        { id: 'c1', name: 'Priya Sharma', relation: 'Mother / Primary Guardian', phone: '+1 (555) 234-5678', email: 'priya.sharma@example.com', notifySms: true, notifyCall: true },
        { id: 'c2', name: 'Oakwood Campus Safety Desk', relation: 'School Safety Dispatch', phone: '+1 (555) 987-6543', email: 'safety@oakwoodhigh.edu', notifySms: true, notifyCall: false },
        { id: 'c3', name: 'City Central Police Dispatch (CAD)', relation: 'Local Emergency Dispatch (Demo / Simulated)', phone: '911 / 112', email: 'cad-dispatch@safecity.gov', notifySms: true, notifyCall: true }
      ]
    },
    {
      id: 'night-worker',
      name: 'Night Healthcare Commute (David Kim)',
      travelerName: 'David Kim',
      travelerRole: 'Night Shift Nurse',
      avatar: '🩺',
      guardianName: 'Sarah Kim (Spouse)',
      guardianPhone: '+1 (555) 567-8901',
      routeName: 'Metropolitan Medical Center → Westside Metro Station',
      originName: 'Metropolitan Medical Center',
      destinationName: 'Westside Metro Station',
      originCoords: [37.7600, -122.4350],
      destinationCoords: [37.7680, -122.4220],
      corridorWidthMeters: 80,
      estimatedDurationMinutes: 18,
      isNightTime: true,
      escalationTimeoutMinutes: 10,
      routeWaypoints: [
        [37.7600, -122.4350], // Medical Center Gate
        [37.7630, -122.4300], // Well-lit Avenue 12
        [37.7655, -122.4260], // Hospital Transit Hub
        [37.7680, -122.4220]  // Westside Metro Station
      ],
      saferRouteWaypoints: [
        [37.7600, -122.4350],
        [37.7640, -122.4290],
        [37.7680, -122.4220]
      ],
      demoWaypoints: {
        safe: [37.7630, -122.4300],
        minorDeviation: [37.7645, -122.4340],
        severeDeviation: [37.7670, -122.4390],
        returning: [37.7640, -122.4285],
        destination: [37.7680, -122.4220]
      },
      contacts: [
        { id: 'c6', name: 'Sarah Kim', relation: 'Spouse', phone: '+1 (555) 567-8901', email: 'sarah.kim@example.com', notifySms: true, notifyCall: true },
        { id: 'c7', name: 'Hospital Security Control', relation: 'Hospital Security Hub', phone: '+1 (555) 678-9012', email: 'security@metromedical.org', notifySms: true, notifyCall: false }
      ]
    }
  ],

  // Tourist Safety Intelligence Data (Environmental, Connectivity & Advisories)
  touristSafetyData: {
    weather: {
      temperature: '19°C / 66°F',
      condition: 'Overcast with Incoming Rain',
      icon: '🌧️',
      precipitationChance: 78,
      windSpeed: '24 km/h Gusts',
      warning: 'Heavy rain & low-visibility expected after 7:00 PM along coastal corridor.',
      warningSeverity: 'CAUTION', // 'NORMAL' | 'CAUTION' | 'AVOID' | 'EMERGENCY'
      lastUpdated: '12 minutes ago (Demo / Simulated Feed)'
    },
    connectivity: {
      overallStatus: 'Limited (2.1 km Dead Zone)',
      coveragePercent: 74,
      signalBars: 2,
      recommendation: 'Limited cellular signal detected between Marina Gate and 4th Avenue. Download offline maps and share route before departure.',
      deadZones: [
        { segment: 'Heritage Alleyway to Marina Gate (0.8 km - 2.9 km)', signal: 'No Signal / Edge', alert: true },
        { segment: 'Bayfront Promenade approach (3.0 km - 3.8 km)', signal: 'Good (5G / 4G)', alert: false }
      ],
      lastUpdated: 'Real-time simulated telemetry'
    },
    officialAdvisories: [
      {
        id: 'adv-01',
        title: 'Waterfront Promenade Construction & Detour',
        status: 'Caution',
        severity: 'CAUTION',
        source: 'Municipal Transport & Safety Authority',
        timestamp: 'Today, 09:30 AM',
        confidence: 'High Confidence (Verified Official Dispatch)',
        details: 'Pedestrian walkway reduced to single lane due to seawall maintenance. Expect evening crowding.',
        isOfficial: true
      },
      {
        id: 'adv-02',
        title: 'Special Event Crowd Notice — Bayfront Festival',
        status: 'Normal',
        severity: 'NORMAL',
        source: 'City Tourism Safety Bureau',
        timestamp: 'Today, 08:00 AM',
        confidence: 'Verified City Bulletin',
        details: 'Increased security presence and well-lit emergency kiosks active from 4 PM to 10 PM.',
        isOfficial: true
      }
    ],
    routeComparison: {
      fastest: {
        name: 'Fastest Route (Direct Alleyway Corridor)',
        durationMinutes: 22,
        distanceKm: '2.4 km',
        riskLevel: 'Caution',
        riskScore: 48,
        lighting: 'Poor in narrow segments',
        connectivity: 'Limited (Dead zone for 1.2 km)',
        crowdDensity: 'Low / Isolated'
      },
      safer: {
        name: 'Safer Route (Grand Boulevard & Promenade)',
        durationMinutes: 29,
        distanceKm: '3.1 km',
        riskLevel: 'Low Risk',
        riskScore: 14,
        lighting: '100% Well-Lit Main Avenues',
        connectivity: 'Full 5G / 4G Coverage',
        crowdDensity: 'Moderate / Family Friendly'
      }
    }
  },

  // Local Help Network — all profiles are simulated for this prototype.
  localHelpers: [
    { id: 'helper-cafe', name: 'Harbourlight Cafe', type: 'Verified Business', icon: '☕', distance: '180 m', eta: '2 min', availability: 'Open now', languages: 'English, Hindi', rating: 4.8, services: ['Food', 'Water', 'Charging', 'Safe Place'], note: 'Water refill, charging point, and a staffed indoor waiting area.' },
    { id: 'helper-volunteer', name: 'Asha, Tourism Volunteer', type: 'Verified Volunteer', icon: '🧭', distance: '320 m', eta: '5 min', availability: 'Available', languages: 'English, Hindi, Marathi', rating: 4.9, services: ['Direction', 'Language', 'Safe Place'], note: 'Can guide visitors to the main boulevard and tourism desk.' },
    { id: 'helper-taxi', name: 'CitySafe Taxi Partner', type: 'Tourism Partner', icon: '🚕', distance: '450 m', eta: '6 min', availability: '3 vehicles nearby', languages: 'English, Hindi', rating: 4.7, services: ['Transport'], note: 'Licensed pickup partner. Meeting point is shared after confirmation.' },
    { id: 'helper-pharmacy', name: 'Seaside Pharmacy', type: 'Verified Business', icon: '✚', distance: '600 m', eta: '8 min', availability: 'Open until 11 PM', languages: 'English, Hindi', rating: 4.6, services: ['First Aid', 'Water'], note: 'First-aid supplies and trained pharmacist on duty.' },
    { id: 'helper-hostel', name: 'Bayfront Hostel Desk', type: 'Tourism Partner', icon: '⌂', distance: '750 m', eta: '10 min', availability: 'Reception open', languages: 'English, Spanish, Hindi', rating: 4.8, services: ['Stay', 'Safe Place', 'Charging'], note: 'Registered accommodation partner with a public reception desk.' }
  ],

  trustedSafeSpots: [
    { id: 'spot-police', name: 'Bayfront Police Assistance Booth', category: 'Police', distance: '220 m', status: 'Open now', icon: '🛡️', support: 'Officers, safe waiting area, directions' },
    { id: 'spot-clinic', name: 'Seaside Medical Clinic', category: 'Medical', distance: '510 m', status: 'Open now', icon: '✚', support: 'First aid, nurse on duty, water' },
    { id: 'spot-cafe', name: 'Harbourlight Cafe', category: 'Food & Water', distance: '180 m', status: 'Open now', icon: '☕', support: 'Water, charging, staffed safe place' },
    { id: 'spot-hotel', name: 'Bayfront Hotel Reception', category: 'Shelter', distance: '690 m', status: '24 hours', icon: '⌂', support: 'Public reception, charging, transport desk' },
    { id: 'spot-tourism', name: 'Tourism Information Centre', category: 'Tourist Help', distance: '350 m', status: 'Open until 9 PM', icon: '🧭', support: 'Directions, language help, verified transport' },
    { id: 'spot-petrol', name: 'Marina Fuel & Service Point', category: 'Transport', distance: '800 m', status: 'Open 24 hours', icon: '⛽', support: 'Staffed forecourt, water, taxi pickup' }
  ],

  // Default Community Reviews for Crowdsourced Safety Intelligence
  defaultCommunityReviews: [
    {
      id: 'rev-01',
      author: 'Maya S. (Solo Traveler)',
      avatar: '👩‍🌾',
      location: 'Historic Plaza to Heritage Lane',
      date: '2 days ago',
      rating: 4,
      tags: ['Safe for Solo Travel', 'Well-lit', 'Helpful Staff'],
      review: 'Felt very safe during daylight! Street vendors are friendly and there is noticeable security near the plaza.',
      moderationStatus: 'Verified Traveler'
    },
    {
      id: 'rev-02',
      author: 'Liam C. (Backpacker)',
      avatar: '🎒',
      location: 'Marina Gate Alleyway segment',
      date: '3 days ago',
      rating: 2,
      tags: ['Poor Network', 'Unsafe at Night', 'Isolated'],
      review: 'Network dropped completely for about 15 minutes in the narrow street. Lighting is sparse after 8 PM, recommend taking the main boulevard.',
      moderationStatus: 'Community Report'
    },
    {
      id: 'rev-03',
      author: 'Ananya R. (Women Solo Explorer)',
      avatar: '👩‍💻',
      location: 'Grand Waterfront Esplanade',
      date: 'Yesterday',
      rating: 5,
      tags: ['Safe for Solo Travel', 'Well-lit', 'Crowded', 'Helpful Staff'],
      review: 'Wide open promenade, brightly illuminated at night with clear signs and police assistance booths.',
      moderationStatus: 'Verified Traveler'
    },
    {
      id: 'rev-04',
      author: 'Carlos M. (Tourist)',
      avatar: '🧭',
      location: 'Market Crossing Zone',
      date: '5 days ago',
      rating: 3,
      tags: ['Scam Risk', 'Crowded'],
      review: 'Watch out for counterfeit ticket sellers near the old entrance gate. Keep your bags closed in the crowded section.',
      moderationStatus: 'Community Report'
    }
  ],

  // Initial alert history logs (tagged as Demo / Simulated)
  defaultAlerts: [
    {
      id: 'alt-101',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      travelerName: 'Elena Rostova',
      type: 'DEVIATION_WARNING',
      severity: 'warning',
      message: '[Demo / Simulated] Elena moved 120m outside the Heritage Lane corridor. Route reminder sent.',
      status: 'RESOLVED',
      resolvedBy: 'Traveler acknowledged safe'
    },
    {
      id: 'alt-102',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      travelerName: 'David Kim',
      type: 'SAFE_CHECKIN',
      severity: 'info',
      message: '[Demo / Simulated] David Kim successfully completed journey to Westside Metro Station on safe route.',
      status: 'COMPLETED',
      resolvedBy: 'Arrived at Destination'
    }
  ]
};
