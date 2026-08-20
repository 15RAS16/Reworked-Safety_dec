/**
 * SafeRoute Guardian - Mock Data, 3-Role Architecture & Preset Scenarios
 * Defines the 3 Top-Level Roles: Tourist, Parent/Guardian, and Organization (with Staff & Admin tiers).
 * Centered on Marina Bay, Singapore.
 * Contains verified routes, campus geofences, waypoints, emergency contacts, reviews, and local helpers.
 */

window.SRG_DATA = {
  // Campus Metadata & Default Geofence Center
  campus: {
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
      corridorWidthMeters: 100,
      estimatedDurationMinutes: 14,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
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
      services: ['Direction', 'Safe Place', 'Water', 'Safe Escort'],
      availability: 'Available Now',
      phone: '+65 6738 8607',
      isAvailable: true,
      certifications: ['Campus Safety Protocol', 'First Aid Certified', 'Bilingual Support'],
      badge: 'Verified Staff Guide',
      note: 'Available near Merlion Park for navigation assistance, peer safety walk, and emergency directions.'
    },
    {
      id: 'hlp-2',
      name: 'Aisha Tan',
      type: 'First Responder',
      role: 'Campus Emergency First Responder',
      avatar: '👩‍⚕️',
      icon: '👩‍⚕️',
      distance: '180 m',
      distanceMeters: 180,
      eta: '3 mins',
      etaMinutes: 3,
      rating: 5.0,
      helpCount: 89,
      languages: 'English, Cantonese, Malay',
      services: ['First Aid', 'Safe Place', 'Transport'],
      availability: 'Available Now',
      phone: '+65 6222 9999',
      isAvailable: true,
      certifications: ['CPR & AED Certified', 'Trauma Triage Level 2', 'Emergency Medical Tech'],
      badge: 'Certified Medic',
      note: 'Stationed near Marina Bay Sands Promenade. Equipped with comprehensive mobile first aid kit and defibrillator.'
    },
    {
      id: 'hlp-3',
      name: 'Kenji Sato',
      type: 'Campus Marshal',
      role: 'Night Safety Marshal & Guide',
      avatar: '👮‍♂️',
      icon: '👮‍♂️',
      distance: '240 m',
      distanceMeters: 240,
      eta: '4 mins',
      etaMinutes: 4,
      rating: 4.8,
      helpCount: 41,
      languages: 'English, Japanese, Hindi',
      services: ['Direction', 'Safe Escort', 'Charging', 'Safe Place'],
      availability: 'Available Now',
      phone: '+65 6738 8608',
      isAvailable: true,
      certifications: ['Night Patrol Clearance', 'De-escalation Specialist', 'Corridor Escort'],
      badge: 'Safety Marshal',
      note: 'Patrolling the Bayfront footbridge corridor. Offers night safety escorts, mobile power bank charging, and directions.'
    },
    {
      id: 'hlp-4',
      name: 'Mei-Ling Zhou',
      type: 'Tourist Ambassador',
      role: 'Student Volunteer Ambassador',
      avatar: '🙋‍♀️',
      icon: '🙋‍♀️',
      distance: '95 m',
      distanceMeters: 95,
      eta: '1 min',
      etaMinutes: 1,
      rating: 4.95,
      helpCount: 112,
      languages: 'English, Mandarin, Hokkien',
      services: ['Direction', 'Water', 'Stay', 'Transport'],
      availability: 'Available Now',
      phone: '+65 6738 8609',
      isAvailable: true,
      certifications: ['Visitor Support Lead', 'Transit Navigation Certified'],
      badge: 'Top Helper',
      note: 'Stationed at the Gardens by the Bay gateway. Provides public transit passes guidance, hydration points, and campus maps.'
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
      typeTag: 'Police & Security',
      status: 'Open 24/7',
      isOpen247: true,
      support: 'Armed security officers, SOS emergency landline, visitor registration kiosk',
      distance: '10 m',
      distanceMeters: 10,
      eta: '< 1 min walk',
      icon: '👮',
      phone: '+65 6738 8607',
      address: 'One Fullerton, 1 Fullerton Rd, Marina Bay, Singapore',
      amenities: ['Armed Security Guard', 'SOS Emergency Callbox', 'CCTV 360° Coverage', 'Free Wi-Fi Zone', 'Official Maps & Advisories'],
      operatingHours: '24 Hours / 7 Days',
      staffOnDuty: 'Officer Lim & 2 Campus Patrols'
    },
    {
      id: 'spot-2',
      name: 'Marina Bay Sands Emergency Center',
      category: 'Medical',
      typeTag: 'Hospital & Trauma Care',
      status: 'Open 24/7',
      isOpen247: true,
      support: '24/7 Level-1 trauma care, emergency doctors, free hydration, ambulance fleet',
      distance: '250 m',
      distanceMeters: 250,
      eta: '3 mins walk',
      icon: '🏥',
      phone: '+65 6688 8868',
      address: '10 Bayfront Ave, Hotel Tower 1 Level B1, Singapore',
      amenities: ['24/7 On-Duty Physicians', 'Defibrillator (AED)', 'Hydration Station', 'Air-Conditioned Safe Lobby', 'Direct Ambulance Bay'],
      operatingHours: '24 Hours / 7 Days',
      staffOnDuty: 'Dr. K. Chen & Emergency Nursing Team'
    },
    {
      id: 'spot-3',
      name: 'Gardens by the Bay Help Desk',
      category: 'Tourist & Student Help',
      typeTag: 'Information & Support',
      status: 'Open until 00:00',
      isOpen247: false,
      support: 'Wi-Fi connectivity, device charging, student welfare officers, safe indoor lobby',
      distance: '180 m',
      distanceMeters: 180,
      eta: '2 mins walk',
      icon: 'ℹ️',
      phone: '+65 6420 6848',
      address: '18 Marina Gardens Dr, Visitor Centre Lobby, Singapore',
      amenities: ['High-Speed Device Charging', 'Indoor Seating & Safe Rest', 'Multi-Language Welfare Staff', 'Lost & Found Center', 'Automated External Defibrillator'],
      operatingHours: '06:00 - 00:00 Daily',
      staffOnDuty: 'Visitor Experience Staff on Floor'
    },
    {
      id: 'spot-4',
      name: 'Safe Help Point',
      category: 'Food & Water',
      typeTag: 'Hydration & Public Safety',
      status: 'Open 24/7',
      isOpen247: true,
      support: 'Clean purified drinking water refill, security escort, CCTV coverage',
      distance: '160 m',
      distanceMeters: 160,
      eta: '2 mins walk',
      icon: '💧',
      phone: '+65 6738 8610',
      address: 'Promenade Sector 3, Waterfront Walkway, Singapore',
      amenities: ['UV Purified Cold Water Refill', 'Solar Emergency Lighting', 'Direct Security Escort Dispatch', 'First Aid Kit Box', 'CCTV Monitored'],
      operatingHours: '24 Hours / 7 Days',
      staffOnDuty: 'Waterfront Perimeter Safety Unit'
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

