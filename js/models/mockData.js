/**
 * SafeRoute Guardian - Mock Data, 3-Role Architecture & Preset Scenarios
 * Defines the 3 Top-Level Roles: Tourist, Parent/Guardian, and Organization (with Staff & Admin tiers).
<<<<<<< HEAD
 * Centered on Marina Bay, Singapore.
=======
 * Centered on the India Gate and Kartavya Path public showcase zone, New Delhi, India.
>>>>>>> b429003ce8a0299b83ffdd9a46c682d6766b8904
 * Contains verified routes, campus geofences, waypoints, emergency contacts, reviews, and local helpers.
 */

window.SRG_DATA = {
  // Campus Metadata & Default Geofence Center
  campus: {
<<<<<<< HEAD
    name: 'Marina Bay Waterfront Sector',
    shortName: 'Marina Bay',
    location: 'Marina Bay Waterfront Promenade, Singapore',
    centerCoords: [1.2838, 103.8607],
    geofenceLabel: 'Marina Bay Waterfront Safety Geofence — Competition Demo Mode',
    boundaryPolygon: [
      [1.2800, 103.8550],
      [1.2800, 103.8665],
      [1.2875, 103.8665],
      [1.2875, 103.8550],
      [1.2800, 103.8550]
=======
    name: 'India Gate Safety Showcase Zone',
    shortName: 'India Gate, New Delhi',
    location: 'India Gate and Kartavya Path, New Delhi 110001, India',
    centerCoords: [28.6129, 77.2295],
    geofenceLabel: 'India Gate Safety Geofence — Competition Demo Data',
    boundaryPolygon: [
      [28.6088, 77.2250],
      [28.6088, 77.2345],
      [28.6170, 77.2345],
      [28.6170, 77.2250],
      [28.6088, 77.2250]
>>>>>>> b429003ce8a0299b83ffdd9a46c682d6766b8904
    ]
  },

  // Exactly 3 Top-Level Account Roles
  roles: [
    {
      id: 'tourist',
      title: 'Tourist',
      icon: '🧳',
      badge: 'Explorer & Visitor',
      color: '#38BDF8',
      cardClass: 'srg-role-card-tourist',
      description: 'Explore Marina Bay surroundings safely with weather warnings, connectivity dead-zone maps, community reviews, and personal live journey protection.',
      features: [
        { id: 'explore-safely', title: 'Explore Safely', icon: '🧭', desc: 'Destination AI safety score, weather warnings, dead-zone maps, and official advisories.', color: '#38BDF8', tag: 'AI Intelligence' },
        { id: 'tourist-journey', title: 'My Live Journey Map', icon: '🗺️', desc: 'Real-time GPS corridor navigation, destination ETA, and live safety status gauge.', color: '#10B981', tag: 'Live Navigation' },
        { id: 'community-reviews', title: 'Community Reviews', icon: '⭐', desc: 'Crowdsourced safety ratings, lighting conditions, solo travel tags, and safety warnings.', color: '#F59E0B', tag: 'Crowdsourced' },
        { id: 'local-help', title: 'Local Help Network', icon: '🤝', desc: 'Request verified local assistance for directions, water, transport, first aid, or charging.', color: '#14B8A6', tag: 'Verified Help' },
        { id: 'trusted-safe-spots', title: 'Trusted Safe Spots', icon: '📍', desc: 'Directory of verified security posts, first-aid, helpdesks, and emergency points.', color: '#8B5CF6', tag: 'Safe Havens' },
        { id: 'journey-timeline', title: 'Journey Timeline', icon: '◷', desc: 'Personal audit log of check-ins, route events, and safe beacon timestamps.', color: '#06B6D4', tag: 'Audit Log' },
        { id: 'tourist-sos', title: 'Emergency SOS & Shake', icon: '🚨', desc: 'Instant 3-second hold panic button, mobile shake shortcut, and emergency broadcast.', color: '#EF4444', tag: 'Emergency' }
      ]
    },
    {
      id: 'parent',
      title: 'Parent / Guardian',
      icon: '👨‍👩‍👧',
      badge: 'Family Safety',
      color: '#10B981',
      cardClass: 'srg-role-card-parent',
      description: 'Monitor your child or family member along approved waterfront corridors with real-time deviation alerts and emergency response.',
      features: [
        { id: 'guardian-home', title: 'Guardian Dashboard', icon: '⌂', desc: 'Overview of linked dependent profiles, current travel status, and risk telemetry.', color: '#10B981', tag: 'Family Overview' },
        { id: 'live-map', title: 'Live Route Monitor', icon: '📍', desc: 'Interactive map displaying dependent location, safe corridor buffer, and deviations.', color: '#38BDF8', tag: 'Live Tracking' },
        { id: 'traveler-status', title: 'Dependent Status & Beacon', icon: '👶', desc: 'Real-time safety score gauge, speed, corridor offset, and offline safe beacon updates.', color: '#10B981', tag: 'Status Feed' },
        { id: 'alerts-feed', title: 'Alerts & Deviations', icon: '🔔', desc: 'Real-time feed of corridor breaches, check-in responses, and historical audit logs.', color: '#F59E0B', tag: 'Safety Alerts' },
        { id: 'guardian-contacts', title: 'Family Emergency Network', icon: '📞', desc: 'Manage emergency contacts, campus safety officers, and simulated alert dispatches.', color: '#8B5CF6', tag: 'Safety Network' },
        { id: 'journey-timeline', title: 'Incident Evidence Timeline', icon: '◷', desc: 'Comprehensive chronological audit trail for linked dependent journeys.', color: '#06B6D4', tag: 'Audit Trail' }
      ]
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: '🏢',
      badge: 'Waterfront & Tour Ops',
      color: '#F59E0B',
      cardClass: 'srg-role-card-org',
      description: 'Centralized safety command center for tour operators, group guides, and park safety coordinators.',
      // Organization Staff Features
      staffFeatures: [
        { id: 'org-home', title: 'Staff Operational View', icon: '📊', desc: 'Operational overview of your assigned travelers, active journeys, and route status.', color: '#38BDF8', tag: 'Operations' },
        { id: 'org-monitor', title: 'Assigned Travelers Monitor', icon: '👥', desc: 'Live map, risk scores, and telemetry for travelers assigned to your shift.', color: '#10B981', tag: 'Assigned Fleet' },
        { id: 'org-incident-log', title: 'Incident Logs & Acknowledge', icon: '📋', desc: 'Review, acknowledge, and resolve alerts relevant to your assigned groups.', color: '#F59E0B', tag: 'Alert Center' },
        { id: 'org-contacts', title: 'Trusted Dispatch Contacts', icon: '📞', desc: 'Access directory of organization safety officers and dispatch contacts.', color: '#8B5CF6', tag: 'Safety Network' },
        { id: 'journey-timeline', title: 'Journey Audit History', icon: '◷', desc: 'View chronological audit records for assigned traveler movements.', color: '#06B6D4', tag: 'Audit Log' }
      ],
      // Organization Administrator Features (Full admin command)
      adminFeatures: [
        { id: 'org-home', title: 'Organization Command Center', icon: '🏢', desc: 'Enterprise command dashboard with multi-traveler fleet overview, safety ratios, and live status.', color: '#38BDF8', tag: 'Command Center' },
        { id: 'org-monitor', title: 'Live Fleet Monitoring Map', icon: '🖥️', desc: 'Central interactive map console with multi-layer overlays, live markers, and corridor buffers.', color: '#10B981', tag: 'Fleet Tracking' },
        { id: 'admin-users', title: 'Member & Staff Management', icon: '👥', desc: 'Manage organization users, invite team members, and assign staff to travelers and groups.', color: '#6366F1', tag: 'Roster & Access' },
        { id: 'admin-routes', title: 'Manage Routes & Corridors', icon: '🛤️', desc: 'Create and edit approved corridors, customize geofence buffer widths, and configure escalation timeouts.', color: '#F59E0B', tag: 'Geofence Config' },
        { id: 'org-incident-log', title: 'Incident Audit & Reporting', icon: '📋', desc: 'Organization-wide incident logs, deviation records, and simulated escalation dispatch feeds.', color: '#EC4899', tag: 'Incident Logs' },
        { id: 'admin-contacts', title: 'Safety Network & CAD Gateway', icon: '📇', desc: 'Organization emergency directory, safety dispatchers, and simulated CAD emergency gateway.', color: '#8B5CF6', tag: 'Dispatch Gateway' },
        { id: 'admin-ai-engine', title: 'AI Risk Engine Telemetry', icon: '🧠', desc: 'Explainable AI scoring formula, factor weight breakdown, and contextual signal telemetry.', color: '#14B8A6', tag: 'AI Engine' },
        { id: 'local-help-monitor', title: 'Local Help Requests Monitor', icon: '🤝', desc: 'Monitor community assistance requests, verified helpers, and traveler support status.', color: '#F97316', tag: 'Support Ops' },
        { id: 'admin-demo-controls', title: 'Emergency Simulation Controls', icon: '⚡', desc: 'Interactive simulation tools: Safe, Minor Deviation, High Risk Drift, Fast-Forward, SOS Panic.', color: '#EF4444', tag: 'Simulation Suite' }
      ]
    }
  ],

  // Role-Specific Quick Evaluation Demo Personas (Post-Login Only)
  demoPersonas: {
    tourist: [
      {
        id: 'persona-tourist-solo',
        name: 'Elena Rostova',
        roleTitle: 'Solo Visitor',
        avatar: '🧭',
        scenarioId: 'student-campus-commute',
        description: 'Exploring Marina Bay waterfront landmarks, Merlion Park, and Gardens by the Bay.',
        tag: 'Solo Explorer'
      }
    ],
    parent: [
      {
        id: 'persona-parent-student',
        name: 'Priya Sharma (Guardian)',
        roleTitle: 'Family Guardian',
        avatar: '👨‍👩‍👧',
        scenarioId: 'student-campus-commute',
        description: 'Tracking child traveling along Marina Bay Waterfront Promenade.',
        tag: 'Family Tracker'
      }
    ],
    organization_staff: [
      {
        id: 'persona-staff-warden',
        name: 'Sarah Jenkins',
        roleTitle: 'Tour Guide',
        avatar: '🛡️',
        scenarioId: 'student-campus-commute',
        description: 'Assisting guests in transit between Bayfront MRT and Gardens by the Bay.',
        tag: 'Assigned Group'
      }
    ],
    organization_admin: [
      {
        id: 'persona-admin-command',
        name: 'Marcus Vance',
        roleTitle: 'Chief Safety Lead',
        avatar: '🏢',
        scenarioId: 'student-campus-commute',
        description: 'Full Command Center with multi-traveler fleet tracking, geofence editors, and CAD gateway.',
        tag: 'Command Center'
      }
    ]
  },

  // Preset journey scenarios centered on Marina Bay, Singapore
  scenarios: [
    {
      id: 'student-campus-commute',
<<<<<<< HEAD
      name: 'Waterfront Promenade Walk (Elena Rostova)',
      travelerName: 'Elena Rostova',
      travelerRole: 'Visitor / Tourist',
      avatar: '🎒',
      guardianName: 'Priya Sharma (Guardian)',
      guardianPhone: '+65 6738 8607',
      routeName: 'Merlion Park → Marina Bay Promenade → Gardens by the Bay',
      originName: 'Merlion Park',
      destinationName: 'Gardens by the Bay Entrance',
      originCoords: [1.2837, 103.8607],
      destinationCoords: [1.2814, 103.8655],
=======
      name: 'Campus Commute (Aarav Sharma)',
      travelerName: 'Aarav Sharma',
      travelerRole: 'Student Visitor (India Gate Showcase)',
      avatar: '🎒',
      guardianName: 'Priya Sharma (Parent)',
      guardianPhone: '+91 98765 43210',
      routeName: 'India Gate → National War Memorial',
      originName: 'India Gate East Entrance',
      destinationName: 'National War Memorial',
      originCoords: [28.6129, 77.2295],
      destinationCoords: [28.6107, 77.2324],
>>>>>>> b429003ce8a0299b83ffdd9a46c682d6766b8904
      corridorWidthMeters: 100,
      estimatedDurationMinutes: 14,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
<<<<<<< HEAD
        [1.2837, 103.8607], // Merlion Park
        [1.2829, 103.8628], // Marina Bay promenade
        [1.2818, 103.8648], // waterfront path
        [1.2814, 103.8655]  // Gardens by the Bay entrance
      ],
      saferRouteWaypoints: [
        [1.2837, 103.8607],
        [1.2829, 103.8628],
        [1.2818, 103.8648],
        [1.2814, 103.8655]
      ],
      demoWaypoints: {
        safe: [1.2829, 103.8628],
        minorDeviation: [1.2850, 103.8575],
        severeDeviation: [1.2895, 103.8520],
        returning: [1.2822, 103.8638],
        destination: [1.2814, 103.8655]
      },
      contacts: [
        { id: 'c1', name: 'Marina Bay Support Center', relation: 'Tourist Support', phone: '+65 6738 8607', email: 'visitor-centre@marinabay.sg', notifySms: true, notifyCall: true },
        { id: 'c2', name: 'Waterfront Security Desk', relation: 'Safety Control Room', phone: '+65 6222 9999', email: 'safety-control@marinabay.sg', notifySms: true, notifyCall: false }
=======
        [28.6129, 77.2295], // India Gate
        [28.6123, 77.2304], // Kartavya Path walking corridor
        [28.6115, 77.2314], // C-Hexagon approach
        [28.6107, 77.2324]  // National War Memorial
      ],
      saferRouteWaypoints: [
        [28.6129, 77.2295],
        [28.6127, 77.2307],
        [28.6117, 77.2318],
        [28.6107, 77.2324]
      ],
      demoWaypoints: {
        safe: [28.6123, 77.2304],
        minorDeviation: [28.6135, 77.2280],
        severeDeviation: [28.6180, 77.2240],
        returning: [28.6119, 77.2310],
        destination: [28.6107, 77.2324]
      },
      contacts: [
        { id: 'c1', name: 'Priya Sharma', relation: 'Parent / Mother', phone: '+91 98765 43210', email: 'priya.sharma@example.in', notifySms: true, notifyCall: true },
        { id: 'c2', name: 'MMU Campus Security Post 1', relation: 'University Security Control', phone: '+91 1731 274475', email: 'security@mmumullana.org', notifySms: true, notifyCall: false }
      ]
    },
    {
      id: 'tourist-visitor-walk',
      name: 'India Gate Visitor Walk (Elena Rostova)',
      travelerName: 'Elena Rostova',
      travelerRole: 'International Academic Visitor',
      avatar: '🧭',
      guardianName: 'Dr. Kabir Roy (Host Liaison)',
      guardianPhone: '+91 98123 45678',
      routeName: 'University Guest House → Botanical Garden & Sports Pavilion',
      originName: 'National Stadium Gate',
      destinationName: 'India Gate',
      originCoords: [28.6139, 77.2352],
      destinationCoords: [28.6129, 77.2295],
      corridorWidthMeters: 120,
      estimatedDurationMinutes: 20,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [28.6139, 77.2352],
        [28.6134, 77.2335],
        [28.6130, 77.2315],
        [28.6129, 77.2295]
      ],
      saferRouteWaypoints: [
        [28.6139, 77.2352],
        [28.6133, 77.2338],
        [28.6129, 77.2319],
        [28.6129, 77.2295]
      ],
      demoWaypoints: {
        safe: [28.6134, 77.2335],
        minorDeviation: [28.6150, 77.2333],
        severeDeviation: [28.6165, 77.2342],
        returning: [28.6131, 77.2320],
        destination: [28.6129, 77.2295]
      },
      contacts: [
        { id: 'c3', name: 'Dr. Kabir Roy', relation: 'Faculty Host Liaison', phone: '+91 98123 45678', email: 'kroy@mmumullana.org', notifySms: true, notifyCall: true },
        { id: 'c4', name: 'MMU International Student Desk', relation: 'Visitor Safety Liaison', phone: '+91 1731 274478', email: 'international@mmumullana.org', notifySms: true, notifyCall: true }
      ]
    },
    {
      id: 'medical-night-shift',
      name: 'MM Hospital Night Duty (Dr. Maya Lin)',
      travelerName: 'Dr. Maya Lin',
      travelerRole: 'Resident Doctor (MM Super Speciality Hospital)',
      avatar: '🩺',
      guardianName: 'David Lin (Spouse)',
      guardianPhone: '+91 98980 11223',
      routeName: 'MM Super Speciality Hospital → Doctors Residential Enclave',
      originName: 'MM Super Speciality Hospital Emergency',
      destinationName: 'Doctors Residential Enclave (Block B)',
      originCoords: [28.6212, 77.2255],
      destinationCoords: [28.6129, 77.2295],
      corridorWidthMeters: 80,
      estimatedDurationMinutes: 12,
      isNightTime: true,
      escalationTimeoutMinutes: 10,
      routeWaypoints: [
        [28.6212, 77.2255],
        [28.6187, 77.2268],
        [28.6157, 77.2281],
        [28.6129, 77.2295]
      ],
      saferRouteWaypoints: [
        [28.6212, 77.2255],
        [28.6184, 77.2272],
        [28.6155, 77.2285],
        [28.6129, 77.2295]
      ],
      demoWaypoints: {
        safe: [28.6187, 77.2268],
        minorDeviation: [28.6179, 77.2300],
        severeDeviation: [28.6170, 77.2337],
        returning: [28.6158, 77.2280],
        destination: [28.6129, 77.2295]
      },
      contacts: [
        { id: 'c5', name: 'David Lin', relation: 'Spouse', phone: '+91 98980 11223', email: 'david.lin@example.in', notifySms: true, notifyCall: true },
        { id: 'c6', name: 'MM Hospital Security Control', relation: 'Hospital Night Escort Service', phone: '+91 1731 274480', email: 'hospital-security@mmumullana.org', notifySms: true, notifyCall: true }
      ]
    },
    {
      id: 'hostel-shuttle-group',
      name: 'Hostel Shuttle Group (Rohan Verma)',
      travelerName: 'Rohan Verma',
      travelerRole: 'Hostel Resident Group Leader',
      avatar: '🛡️',
      guardianName: 'Sarah Jenkins (Hostel Warden)',
      guardianPhone: '+91 98711 22334',
      routeName: 'MMU Hostels Complex → Main Gate Transit Point',
      originName: 'MMU Hostels Complex (Girls/Boys Zone)',
      destinationName: 'Main Gate Transit & Bus Stop',
      originCoords: [28.6180, 77.2427],
      destinationCoords: [28.6129, 77.2295],
      corridorWidthMeters: 100,
      estimatedDurationMinutes: 16,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [28.6180, 77.2427],
        [28.6165, 77.2388],
        [28.6146, 77.2340],
        [28.6129, 77.2295]
      ],
      saferRouteWaypoints: [
        [28.6180, 77.2427],
        [28.6161, 77.2387],
        [28.6143, 77.2340],
        [28.6129, 77.2295]
      ],
      demoWaypoints: {
        safe: [28.6165, 77.2388],
        minorDeviation: [28.6153, 77.2362],
        severeDeviation: [28.6145, 77.2260],
        returning: [28.6148, 77.2336],
        destination: [28.6129, 77.2295]
      },
      contacts: [
        { id: 'c7', name: 'Sarah Jenkins', relation: 'Hostel Chief Warden', phone: '+91 98711 22334', email: 'warden@mmumullana.org', notifySms: true, notifyCall: true },
        { id: 'c8', name: 'MMU Transport Desk', relation: 'Campus Shuttle Control', phone: '+91 1731 274485', email: 'transport@mmumullana.org', notifySms: true, notifyCall: true }
>>>>>>> b429003ce8a0299b83ffdd9a46c682d6766b8904
      ]
    }
  ],

  // Sample Organization Roster & Members (Marina Bay Safety Operations)
  sampleOrgMembers: [
    { id: 'mem-1', name: 'Marcus Vance', email: 'security.head@marinabay.sg', role: 'admin', title: 'Chief Safety Lead', assignedCount: 16 },
    { id: 'mem-2', name: 'Sarah Jenkins', email: 'guide.sarah@marinabay.sg', role: 'staff', title: 'Lead Field Guide', assignedCount: 8 },
    { id: 'mem-3', name: 'Carlos Gomez', email: 'safety.patrol@marinabay.sg', role: 'staff', title: 'Safety Patrol Supervisor', assignedCount: 6 }
  ],

  // Default initial alerts
  defaultAlerts: [
    {
      id: 'alt-001',
      travelerName: 'Elena Rostova',
      type: 'CORRIDOR_ENTRY',
      severity: 'info',
      message: 'Elena commenced waterfront walk from Merlion Park along verified promenade route.',
      timestamp: '2026-08-19T17:15:00Z',
      status: 'RESOLVED',
      resolvedBy: 'Automatic Geofence Detection'
    }
  ],

  // Crowdsourced safety reviews (Marina Bay)
  defaultCommunityReviews: [
    {
      id: 'rev-1',
      author: 'Aanya Verma',
      avatar: '🌟',
      location: 'Merlion Park → Marina Bay Sands',
      rating: 5,
      date: '2 hours ago',
      tags: ['Well-lit', 'Safe for Solo Travel', 'Crowded', 'Helpful Staff'],
      review: 'Continuous lighting and security patrols stationed along the waterfront promenade. Extremely safe for late-night walks.',
      moderationStatus: 'Verified Visitor Report'
    }
  ],

  // Verified Local Help Network Helpers (Marina Bay)
  localHelpers: [
    {
      id: 'hlp-1',
      name: 'Rohan Sharma',
      type: 'Safety Volunteer',
      role: 'Safety Volunteer & Guide',
      avatar: '👨‍💼',
      icon: '👨‍💼',
      distance: '120 m',
      distanceMeters: 120,
      eta: '2 mins',
      etaMinutes: 2,
      rating: 4.9,
      helpCount: 54,
      languages: 'English, Mandarin, Malay',
      services: ['Direction', 'Safe Place', 'Water'],
      availability: 'Available Now',
      phone: '+65 6738 8607',
      isAvailable: true,
      note: 'Available near Merlion Park for navigation assistance, peer safety walk, and emergency directions.'
    }
  ],

  // Tourist & Visitor Safety Intelligence Destinations
  touristDestinations: [
    {
      id: 'dest-mmu-campus',
      name: 'Marina Bay Waterfront Promenade',
      country: 'Singapore',
      description: 'Scenic waterfront loop featuring full LED safety illumination, integrated safety check-posts, Bayfront MRT connections, and pedestrian-only walkways.',
      safetyScore: 98,
      weather: {
        condition: 'Clear & Pleasant',
        temp: '28°C (82°F)',
        advisory: 'Optimal weather and visibility throughout the waterfront corridors.'
      },
      deadZones: [
        {
          name: 'Outer Promontory Sector',
          notes: 'Brief 25m cellular fluctuation near park trees. Automatic Safe Beacon pre-caches coordinates.'
        }
      ]
    }
  ],

  // 24/7 Verified Trusted Safe Spots (Marina Bay, Singapore)
  trustedSafeSpots: [
    {
      id: 'spot-1',
      name: 'Merlion Park Kiosk',
      category: 'Tourist & Student Help',
      status: 'Open 24/7',
      support: 'Armed security officers, SOS emergency landline, visitor registration kiosk',
      distance: '10 m',
      icon: '👮'
    },
    {
      id: 'spot-2',
      name: 'Marina Bay Sands Emergency Center',
      category: 'Medical',
      status: 'Open 24/7',
      support: '24/7 Level-1 trauma care, emergency doctors, free hydration, ambulance fleet',
      distance: '250 m',
      icon: '🏥'
    },
    {
      id: 'spot-3',
      name: 'Gardens by the Bay Help Desk',
      category: 'Tourist & Student Help',
      status: 'Open until 00:00',
      support: 'Wi-Fi connectivity, device charging, student welfare officers, safe indoor lobby',
      distance: '180 m',
      icon: 'ℹ️'
    },
    {
      id: 'spot-4',
      name: 'Safe Help Point',
      category: 'Food & Water',
      status: 'Open 24/7',
      support: 'Clean purified drinking water refill, security escort, CCTV coverage',
      distance: '160 m',
      icon: '💧'
    }
  ]
};

// Add dictionary access to roles array for backwards compatibility
if (Array.isArray(window.SRG_DATA.roles)) {
  window.SRG_DATA.roles.forEach(function(r) {
    window.SRG_DATA.roles[r.id] = r;
  });
}

// Global Alias Harmonization
window.MockData = window.SRG_DATA;
