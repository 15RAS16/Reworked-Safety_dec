/**
 * SafeRoute Guardian - Mock Data, 3-Role Architecture & Preset Scenarios
 * Defines the 3 Top-Level Roles: Tourist, Parent/Guardian, and Organization (with Staff & Admin tiers).
 * Centered on Maharishi Markandeshwar (Deemed to be University), Mullana, Ambala Cantonment, Haryana, India.
 * Contains verified routes, campus geofences, waypoints, emergency contacts, reviews, and local helpers.
 */

window.SRG_DATA = {
  // Campus Metadata & Default Geofence Center
  campus: {
    name: 'Maharishi Markandeshwar (Deemed to be University)',
    shortName: 'MMU Mullana',
    location: 'Mullana, Ambala Cantonment, Haryana 133207, India',
    centerCoords: [30.2505, 77.0495],
    geofenceLabel: 'MMU Mullana Campus Safety Geofence — Demo Data',
    boundaryPolygon: [
      [30.2458, 77.0445],
      [30.2458, 77.0550],
      [30.2558, 77.0560],
      [30.2568, 77.0482],
      [30.2538, 77.0438],
      [30.2458, 77.0445]
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
      description: 'Explore campus and local surroundings safely with weather warnings, connectivity dead-zone maps, community reviews, and personal live journey protection.',
      features: [
        { id: 'explore-safely', title: 'Explore Safely', icon: '🧭', desc: 'Destination AI safety score, weather warnings, dead-zone maps, and official advisories.', color: '#38BDF8', tag: 'AI Intelligence' },
        { id: 'tourist-journey', title: 'My Live Journey Map', icon: '🗺️', desc: 'Real-time GPS corridor navigation, destination ETA, and live safety status gauge.', color: '#10B981', tag: 'Live Navigation' },
        { id: 'community-reviews', title: 'Community Reviews', icon: '⭐', desc: 'Crowdsourced safety ratings, lighting conditions, solo travel tags, and safety warnings.', color: '#F59E0B', tag: 'Crowdsourced' },
        { id: 'local-help', title: 'Local Help Network', icon: '🤝', desc: 'Request verified local assistance for directions, water, transport, first aid, or charging.', color: '#14B8A6', tag: 'Verified Help' },
        { id: 'trusted-safe-spots', title: 'Trusted Safe Spots', icon: '📍', desc: 'Directory of 24/7 verified security posts, hospitals, helpdesks, and emergency points.', color: '#8B5CF6', tag: 'Safe Havens' },
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
      description: 'Monitor your child or family member along approved university corridors with real-time deviation alerts and emergency response.',
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
      badge: 'Campus & Enterprise Ops',
      color: '#F59E0B',
      cardClass: 'srg-role-card-org',
      description: 'Centralized safety command center for university security, wardens, tour operators, and fleet coordinators.',
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
        roleTitle: 'Solo International Visitor',
        avatar: '🧭',
        scenarioId: 'tourist-visitor-walk',
        description: 'Exploring MMU Mullana campus landmarks, botanical gardens, and campus cafe pavilions.',
        tag: 'Solo Explorer'
      },
      {
        id: 'persona-tourist-guest',
        name: 'Dr. Kabir Roy',
        roleTitle: 'Guest Academic Delegate',
        avatar: '🎓',
        scenarioId: 'student-campus-commute',
        description: 'Navigating from MMU Main Gate to the Central Auditorium & Academic Complex.',
        tag: 'Visiting Scholar'
      },
      {
        id: 'persona-tourist-heritage',
        name: 'Ananya Deshmukh',
        roleTitle: 'Campus Visitor',
        avatar: '🌸',
        scenarioId: 'tourist-visitor-walk',
        description: 'Walking the illuminated university library corridor and open cultural pavilion.',
        tag: 'Campus Visitor'
      }
    ],
    parent: [
      {
        id: 'persona-parent-student',
        name: 'Priya Sharma (Guardian)',
        roleTitle: 'Student Parent Monitoring Dependent',
        avatar: '👨‍👩‍👧',
        scenarioId: 'student-campus-commute',
        description: 'Monitoring Aarav Sharma (B.Tech Student) walking between MMU Hostels and Academic Block.',
        tag: 'Campus Student'
      },
      {
        id: 'persona-parent-medical',
        name: 'Rajesh Kumar (Parent)',
        roleTitle: 'Medical Student Guardian',
        avatar: '🩺',
        scenarioId: 'medical-night-shift',
        description: 'Tracking evening commute from MMU Bus Terminal to MM Super Speciality Hospital.',
        tag: 'Medical Intern'
      }
    ],
    organization_staff: [
      {
        id: 'persona-staff-warden',
        name: 'Sarah Jenkins',
        roleTitle: 'Hostel Safety Warden',
        avatar: '🛡️',
        scenarioId: 'hostel-shuttle-group',
        description: 'Monitoring assigned traveler group between Girls/Boys Hostel Complex and Academic Blocks.',
        tag: 'Assigned Group'
      },
      {
        id: 'persona-staff-patrol',
        name: 'Carlos Gomez',
        roleTitle: 'Campus Security Supervisor',
        avatar: '👮',
        scenarioId: 'student-campus-commute',
        description: 'Monitoring active student transit along Ambala Highway entrance corridor.',
        tag: 'Patrol Shift'
      }
    ],
    organization_admin: [
      {
        id: 'persona-admin-command',
        name: 'Marcus Vance',
        roleTitle: 'Chief Security Officer / Org Lead',
        avatar: '🏢',
        scenarioId: 'student-campus-commute',
        description: 'Full MMU Mullana Command Center with multi-traveler fleet tracking, geofence editors, and CAD gateway.',
        tag: 'Command Center'
      },
      {
        id: 'persona-admin-dean',
        name: 'Dr. Sunita Mehta',
        roleTitle: 'Director of Student Safety & Welfare',
        avatar: '👑',
        scenarioId: 'hostel-shuttle-group',
        description: 'Campus-wide risk analytics, audit logs, team rosters, and automated check-in policies.',
        tag: 'University Lead'
      }
    ]
  },

  // Preset journey scenarios centered on MMU Mullana, Ambala, Haryana, India
  scenarios: [
    {
      id: 'student-campus-commute',
      name: 'Campus Commute (Aarav Sharma)',
      travelerName: 'Aarav Sharma',
      travelerRole: 'Engineering Student (MMU Mullana)',
      avatar: '🎒',
      guardianName: 'Priya Sharma (Parent)',
      guardianPhone: '+91 98765 43210',
      routeName: 'MMU Main Gate → Central Library & Academic Block',
      originName: 'MMU Main Gate (Ambala Road)',
      destinationName: 'Engineering Academic Block 3',
      originCoords: [30.2472, 77.0468],
      destinationCoords: [30.2505, 77.0505],
      corridorWidthMeters: 100,
      estimatedDurationMinutes: 14,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [30.2472, 77.0468], // MMU Main Gate Entrance
        [30.2485, 77.0478], // Administrative Complex Boulevard
        [30.2495, 77.0492], // Central Library Junction
        [30.2505, 77.0505]  // Engineering Block 3
      ],
      saferRouteWaypoints: [
        [30.2472, 77.0468],
        [30.2482, 77.0482],
        [30.2498, 77.0498],
        [30.2505, 77.0505]
      ],
      demoWaypoints: {
        safe: [30.2485, 77.0478],
        minorDeviation: [30.2492, 77.0460],
        severeDeviation: [30.2520, 77.0425],
        returning: [30.2490, 77.0485],
        destination: [30.2505, 77.0505]
      },
      contacts: [
        { id: 'c1', name: 'Priya Sharma', relation: 'Parent / Mother', phone: '+91 98765 43210', email: 'priya.sharma@example.in', notifySms: true, notifyCall: true },
        { id: 'c2', name: 'MMU Campus Security Post 1', relation: 'University Security Control', phone: '+91 1731 274475', email: 'security@mmumullana.org', notifySms: true, notifyCall: false }
      ]
    },
    {
      id: 'tourist-visitor-walk',
      name: 'MMU Campus Visitor Walk (Elena Rostova)',
      travelerName: 'Elena Rostova',
      travelerRole: 'International Academic Visitor',
      avatar: '🧭',
      guardianName: 'Dr. Kabir Roy (Host Liaison)',
      guardianPhone: '+91 98123 45678',
      routeName: 'University Guest House → Botanical Garden & Sports Pavilion',
      originName: 'University Guest House',
      destinationName: 'MMU Sports Pavilion & Grounds',
      originCoords: [30.2480, 77.0515],
      destinationCoords: [30.2540, 77.0475],
      corridorWidthMeters: 120,
      estimatedDurationMinutes: 20,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [30.2480, 77.0515], // University Guest House
        [30.2495, 77.0510], // Central Library Corridor
        [30.2515, 77.0495], // Student Activity Center
        [30.2540, 77.0475]  // Sports Pavilion & Athletic Track
      ],
      saferRouteWaypoints: [
        [30.2480, 77.0515],
        [30.2500, 77.0508],
        [30.2525, 77.0488],
        [30.2540, 77.0475]
      ],
      demoWaypoints: {
        safe: [30.2495, 77.0510],
        minorDeviation: [30.2505, 77.0530],
        severeDeviation: [30.2545, 77.0555],
        returning: [30.2510, 77.0500],
        destination: [30.2540, 77.0475]
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
      originCoords: [30.2530, 77.0535],
      destinationCoords: [30.2555, 77.0505],
      corridorWidthMeters: 80,
      estimatedDurationMinutes: 12,
      isNightTime: true,
      escalationTimeoutMinutes: 10,
      routeWaypoints: [
        [30.2530, 77.0535], // MM Hospital Emergency Portico
        [30.2538, 77.0522], // Medical College Well-Lit Walkway
        [30.2548, 77.0512], // Faculty Enclave Security Barrier
        [30.2555, 77.0505]  // Residential Block B
      ],
      saferRouteWaypoints: [
        [30.2530, 77.0535],
        [30.2540, 77.0520],
        [30.2550, 77.0510],
        [30.2555, 77.0505]
      ],
      demoWaypoints: {
        safe: [30.2538, 77.0522],
        minorDeviation: [30.2545, 77.0538],
        severeDeviation: [30.2570, 77.0560],
        returning: [30.2542, 77.0518],
        destination: [30.2555, 77.0505]
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
      originCoords: [30.2520, 77.0450],
      destinationCoords: [30.2468, 77.0460],
      corridorWidthMeters: 100,
      estimatedDurationMinutes: 16,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [30.2520, 77.0450], // MMU Hostels Gate
        [30.2505, 77.0465], // Sports Ground Road
        [30.2485, 77.0462], // Campus Cafeteria Walkway
        [30.2468, 77.0460]  // Main Gate Bus Terminus
      ],
      saferRouteWaypoints: [
        [30.2520, 77.0450],
        [30.2500, 77.0460],
        [30.2480, 77.0460],
        [30.2468, 77.0460]
      ],
      demoWaypoints: {
        safe: [30.2505, 77.0465],
        minorDeviation: [30.2512, 77.0435],
        severeDeviation: [30.2530, 77.0410],
        returning: [30.2495, 77.0462],
        destination: [30.2468, 77.0460]
      },
      contacts: [
        { id: 'c7', name: 'Sarah Jenkins', relation: 'Hostel Chief Warden', phone: '+91 98711 22334', email: 'warden@mmumullana.org', notifySms: true, notifyCall: true },
        { id: 'c8', name: 'MMU Transport Desk', relation: 'Campus Shuttle Control', phone: '+91 1731 274485', email: 'transport@mmumullana.org', notifySms: true, notifyCall: true }
      ]
    }
  ],

  // Sample Organization Roster & Members (MMU Safety Operations)
  sampleOrgMembers: [
    { id: 'mem-1', name: 'Marcus Vance', email: 'security.head@mmumullana.org', role: 'admin', title: 'Chief Security Officer (CSO)', assignedCount: 16 },
    { id: 'mem-2', name: 'Sarah Jenkins', email: 'warden.girls@mmumullana.org', role: 'staff', title: 'Lead Hostel Safety Warden', assignedCount: 8 },
    { id: 'mem-3', name: 'Carlos Gomez', email: 'patrol.lead@mmumullana.org', role: 'staff', title: 'Night Shift Patrol Supervisor', assignedCount: 6 },
    { id: 'mem-4', name: 'Dr. Sunita Mehta', email: 'dean.welfare@mmumullana.org', role: 'admin', title: 'Dean of Student Safety', assignedCount: 24 }
  ],

  // Default initial alerts
  defaultAlerts: [
    {
      id: 'alt-001',
      travelerName: 'Aarav Sharma',
      type: 'CORRIDOR_ENTRY',
      severity: 'info',
      message: 'Aarav commenced campus walk from MMU Main Gate along verified Academic Corridor.',
      timestamp: '2026-08-19T17:15:00Z',
      status: 'RESOLVED',
      resolvedBy: 'Automatic Campus Geofence Detection'
    },
    {
      id: 'alt-002',
      travelerName: 'Elena Rostova',
      type: 'WEATHER_ADVISORY',
      severity: 'warning',
      message: 'Evening thunderstorm advisory active in Ambala/Haryana district. Campus corridor lighting set to maximum output.',
      timestamp: '2026-08-19T17:22:00Z',
      status: 'RESOLVED',
      resolvedBy: 'AI Weather Telemetry'
    }
  ],

  // Crowdsourced safety reviews (MMU Mullana Campus)
  defaultCommunityReviews: [
    {
      id: 'rev-1',
      author: 'Aanya Verma (B.Tech 3rd Yr)',
      avatar: '🌟',
      location: 'Central Library → Hostels Boulevard',
      rating: 5,
      date: '2 hours ago',
      tags: ['Well-lit', 'Safe for Solo Travel', 'Crowded', 'Helpful Staff'],
      review: 'Continuous high-illumination LED streetlights and security guards stationed every 150m between Library and Hostels. Extremely safe for late-night study walks.',
      moderationStatus: 'Verified Student Report'
    },
    {
      id: 'rev-2',
      author: 'Dr. Rohit Singla (MM Hospital)',
      avatar: '🛡️',
      location: 'Medical College & Hospital Enclave',
      rating: 5,
      date: 'Yesterday',
      tags: ['Well-lit', 'CCTV Covered', 'Active Security', 'Safe for Solo Travel'],
      review: '24/7 CCTV surveillance, active campus ambulance bay, and dedicated security barrier at hospital portico. Strong 5G cellular coverage throughout.',
      moderationStatus: 'Verified Faculty Report'
    },
    {
      id: 'rev-3',
      author: 'Vikram Sethi (Visitor)',
      avatar: '🎒',
      location: 'Outer Sports Ground Perimeter Road',
      rating: 3,
      date: '3 days ago',
      tags: ['Isolated', 'Unsafe at Night', 'Poor Network'],
      review: 'Slight cellular signal drop near the outer sports boundary after 21:00. Recommend using the central campus boulevard illuminated corridor instead.',
      moderationStatus: 'Verified Hazard Warning'
    }
  ],

  // Verified Local Help Network Helpers (MMU Mullana Campus)
  localHelpers: [
    {
      id: 'hlp-1',
      name: 'Rohan Sharma',
      type: 'Student Safety Volunteer',
      role: 'Student Safety Volunteer & NSS Head',
      avatar: '👨‍💼',
      icon: '👨‍💼',
      distance: '120 m',
      distanceMeters: 120,
      eta: '2 mins',
      etaMinutes: 2,
      rating: 4.9,
      helpCount: 54,
      languages: 'Hindi, English, Punjabi',
      services: ['Direction', 'Safe Place', 'Water', 'Directions & Safe Escort', 'Safe Haven Waiting Spot'],
      availability: 'Available Now',
      phone: '+91 98111 22334',
      isAvailable: true,
      note: 'Available near Central Library for navigation assistance, peer safety walk, and emergency campus directions.'
    },
    {
      id: 'hlp-2',
      name: 'MMU Campus Ambulance & First Aid Desk',
      type: 'Medical Emergency Escort',
      role: 'MMU Hospital Paramedic Unit',
      avatar: '🚑',
      icon: '🚑',
      distance: '240 m',
      distanceMeters: 240,
      eta: '3 mins',
      etaMinutes: 3,
      rating: 5.0,
      helpCount: 128,
      languages: 'Hindi, English',
      services: ['First Aid', 'Transport', 'Safe Place', 'Emergency First Aid', 'Medical Escort'],
      availability: '24/7 Standby',
      phone: '+91 1731 274480',
      isAvailable: true,
      note: 'Rapid response medical ambulance and trauma first-aid stationed at MM Super Speciality Hospital gate.'
    },
    {
      id: 'hlp-3',
      name: 'Campus Cafe & Student Hub',
      type: 'Verified Safe Haven Spot',
      role: 'Safe Haven Ambassador',
      avatar: '☕',
      icon: '☕',
      distance: '180 m',
      distanceMeters: 180,
      eta: '3 mins',
      etaMinutes: 3,
      rating: 4.8,
      helpCount: 92,
      languages: 'Hindi, English',
      services: ['Food', 'Water', 'Charging', 'Safe Place', 'Device Charging', 'Clean Water Refill'],
      availability: 'Open until 23:00',
      phone: '+91 1731 274490',
      isAvailable: true,
      note: 'Verified student cafeteria with high-speed charging stations, free drinking water, and safe waiting seating.'
    }
  ],

  // Tourist & Visitor Safety Intelligence Destinations
  touristDestinations: [
    {
      id: 'dest-mmu-campus',
      name: 'MMU Mullana University Campus Corridor',
      country: 'India (Ambala, Haryana)',
      description: 'Expansive multidisciplinary university campus featuring continuous LED safety illumination, integrated security check-posts, 24/7 super-speciality hospital, and pedestrian-only academic corridors.',
      safetyScore: 95,
      weather: {
        condition: 'Clear & Pleasant',
        temp: '28°C (82°F)',
        advisory: 'Optimal weather and visibility throughout the campus academic and residential corridors.'
      },
      deadZones: [
        {
          name: 'Outer Sports Ground Sector',
          notes: 'Brief 25m cellular fluctuation near sports boundary trees. Automatic Safe Beacon pre-caches GPS coordinates.'
        }
      ]
    }
  ],

  // 24/7 Verified Trusted Safe Spots (MMU Mullana Campus, Ambala, Haryana)
  trustedSafeSpots: [
    {
      id: 'spot-1',
      name: 'MMU Main Gate Security Post (Gate 1)',
      category: 'Police & Security',
      status: '24/7 Monitored',
      support: 'Armed security officers, SOS emergency landline, visitor registration kiosk',
      distance: '120 m',
      icon: '👮'
    },
    {
      id: 'spot-2',
      name: 'MM Super Speciality Hospital Emergency Trauma Center',
      category: 'Medical',
      status: 'Open 24/7',
      support: '24/7 Level-1 trauma care, emergency doctors, free hydration, ambulance fleet',
      distance: '250 m',
      icon: '🏥'
    },
    {
      id: 'spot-3',
      name: 'Central Library Student Help & Security Kiosk',
      category: 'Tourist & Student Help',
      status: 'Open until 00:00',
      support: 'Wi-Fi connectivity, device charging, student welfare officers, safe indoor lobby',
      distance: '180 m',
      icon: 'ℹ️'
    },
    {
      id: 'spot-4',
      name: 'MMU Campus Bus Terminus & Transit Center',
      category: 'Transport',
      status: '24/7 Monitored',
      support: 'Ambala/Chandigarh highway transit stop, security escort, CCTV coverage',
      distance: '350 m',
      icon: '🚆'
    },
    {
      id: 'spot-5',
      name: 'Campus Central Cafeteria & Hydration Station',
      category: 'Food & Water',
      status: 'Open 24/7',
      support: 'Clean purified RO drinking water refill, packaged food, emergency shelter',
      distance: '160 m',
      icon: '💧'
    },
    {
      id: 'spot-6',
      name: 'Student Activity Center Mobile Charging Hub',
      category: 'Charging',
      status: 'Active 24/7',
      support: 'Multi-port high speed device charging, safe lighting, SOS call terminal',
      distance: '210 m',
      icon: '🔋'
    },
    {
      id: 'spot-7',
      name: 'Girls & Boys Hostel Gate 2 Security Booth',
      category: 'Shelter',
      status: '24/7 Guarded',
      support: 'Biometric access gate, female warden on duty, direct intercom to security command',
      distance: '290 m',
      icon: '🏢'
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
