/**
 * SafeRoute Guardian - Mock Data, 3-Role Architecture & Preset Scenarios
 * Defines the 3 Top-Level Roles: Tourist, Parent/Guardian, and Organization (with Staff & Admin tiers).
 * Contains verified routes, safe corridors, waypoints, emergency contacts, community reviews, and local helpers.
 */

window.SRG_DATA = {
  // Exactly 3 Top-Level Account Roles
  roles: [
    {
      id: 'tourist',
      title: 'Tourist',
      icon: '🧳',
      badge: 'Explorer & Traveler',
      color: '#38BDF8',
      cardClass: 'srg-role-card-tourist',
      description: 'Explore destinations safely with weather warnings, connectivity dead-zone maps, community safety reviews, and personal live journey protection.',
      features: [
        { id: 'explore-safely', title: 'Explore Safely', icon: '🧭', desc: 'Destination AI safety score, weather warnings, dead-zone maps, and official advisories.', color: '#38BDF8', tag: 'AI Intelligence' },
        { id: 'tourist-journey', title: 'My Live Journey Map', icon: '🗺️', desc: 'Real-time GPS corridor navigation, destination ETA, and live safety status gauge.', color: '#10B981', tag: 'Live Navigation' },
        { id: 'community-reviews', title: 'Community Reviews', icon: '⭐', desc: 'Crowdsourced safety ratings, lighting conditions, solo travel tags, and scam warnings.', color: '#F59E0B', tag: 'Crowdsourced' },
        { id: 'local-help', title: 'Local Help Network', icon: '🤝', desc: 'Request verified local assistance for directions, water, transport, first aid, or charging.', color: '#14B8A6', tag: 'Verified Help' },
        { id: 'trusted-safe-spots', title: 'Trusted Safe Spots', icon: '📍', desc: 'Directory of 24/7 verified police substations, hospitals, tourist kiosks, and embassy points.', color: '#8B5CF6', tag: 'Safe Havens' },
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
      description: 'Monitor your child or family member along approved school or commute corridors with real-time deviation alerts and emergency response.',
      features: [
        { id: 'guardian-home', title: 'Guardian Dashboard', icon: '⌂', desc: 'Overview of linked dependent profiles, current travel status, and risk telemetry.', color: '#10B981', tag: 'Family Overview' },
        { id: 'live-map', title: 'Live Route Monitor', icon: '📍', desc: 'Interactive map displaying dependent location, safe corridor buffer, and deviations.', color: '#38BDF8', tag: 'Live Tracking' },
        { id: 'traveler-status', title: 'Dependent Status & Beacon', icon: '👶', desc: 'Real-time safety score gauge, speed, corridor offset, and offline safe beacon updates.', color: '#10B981', tag: 'Status Feed' },
        { id: 'alerts-feed', title: 'Alerts & Deviations', icon: '🔔', desc: 'Real-time feed of corridor breaches, check-in responses, and historical audit logs.', color: '#F59E0B', tag: 'Safety Alerts' },
        { id: 'guardian-contacts', title: 'Family Emergency Network', icon: '📞', desc: 'Manage emergency contacts, school safety officers, and simulated alert dispatches.', color: '#8B5CF6', tag: 'Safety Network' },
        { id: 'journey-timeline', title: 'Incident Evidence Timeline', icon: '◷', desc: 'Comprehensive chronological audit trail for linked dependent journeys.', color: '#06B6D4', tag: 'Audit Trail' }
      ]
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: '🏢',
      badge: 'Enterprise & School Ops',
      color: '#F59E0B',
      cardClass: 'srg-role-card-org',
      description: 'Centralized safety command center for schools, universities, tour operators, and enterprise travel coordinators.',
      // Organization Staff Features
      staffFeatures: [
        { id: 'org-home', title: 'Staff Operational View', icon: '📊', desc: 'Operational overview of your assigned travelers, active journeys, and route status.', color: '#38BDF8', tag: 'Operations' },
        { id: 'org-monitor', title: 'Assigned Travelers Monitor', icon: '👥', desc: 'Live map, risk scores, and telemetry for travelers assigned to your shift.', color: '#10B981', tag: 'Assigned Fleet' },
        { id: 'org-incident-log', title: 'Incident Logs & Acknowledge', icon: '📋', desc: 'Review, acknowledge, and resolve alerts relevant to your assigned groups.', color: '#F59E0B', tag: 'Alert Center' },
        { id: 'org-contacts', title: 'Trusted Dispatch Contacts', icon: '📞', desc: 'Access directory of organization safety officers and dispatch contacts.', color: '#8B5CF6', tag: 'Safety Network' },
        { id: 'journey-timeline', title: 'Journey Audit History', icon: '◷', desc: 'View chronological audit records for assigned traveler movements.', color: '#06B6D4', tag: 'Audit Log' }
      ],
      // Organization Administrator Features (Includes full admin capabilities)
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

  // Preset journey scenarios
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
      saferRouteWaypoints: [
        [37.7950, -122.4020],
        [37.7975, -122.3990],
        [37.8020, -122.4010],
        [37.8050, -122.4080]
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
        { id: 'c5', name: 'Tourist Police Liaison (San Francisco)', relation: 'Emergency Dispatch Kiosk', phone: '+1 (555) 911-0022', email: 'dispatch@sf-touristsafety.gov', notifySms: true, notifyCall: true }
      ]
    },
    {
      id: 'student-commute',
      name: 'Student Commute (Aarav Sharma)',
      travelerName: 'Aarav Sharma',
      travelerRole: 'High School Student',
      avatar: '🎒',
      guardianName: 'Priya Sharma (Parent)',
      guardianPhone: '+1 (555) 234-5678',
      routeName: 'Oakwood High → Central Youth Center',
      originName: 'Oakwood High School',
      destinationName: 'Central Youth Center',
      originCoords: [37.7749, -122.4194],
      destinationCoords: [37.7833, -122.4167],
      corridorWidthMeters: 100,
      estimatedDurationMinutes: 20,
      isNightTime: false,
      escalationTimeoutMinutes: 15,
      routeWaypoints: [
        [37.7749, -122.4194], // Origin: Oakwood High
        [37.7770, -122.4185], // Market & 8th
        [37.7795, -122.4175], // Mission Plaza
        [37.7833, -122.4167]  // Destination: Youth Center
      ],
      saferRouteWaypoints: [
        [37.7749, -122.4194],
        [37.7775, -122.4160],
        [37.7810, -122.4150],
        [37.7833, -122.4167]
      ],
      demoWaypoints: {
        safe: [37.7770, -122.4185],
        minorDeviation: [37.7778, -122.4158],
        severeDeviation: [37.7790, -122.4110],
        returning: [37.7785, -122.4178],
        destination: [37.7833, -122.4167]
      },
      contacts: [
        { id: 'c1', name: 'Priya Sharma', relation: 'Parent / Mother', phone: '+1 (555) 234-5678', email: 'priya.sharma@example.com', notifySms: true, notifyCall: true },
        { id: 'c2', name: 'Oakwood Campus Safety', relation: 'School Safety Dispatch', phone: '+1 (555) 876-5432', email: 'safety@oakwood.edu', notifySms: true, notifyCall: false }
      ]
    },
    {
      id: 'healthcare-night',
      name: 'Night Healthcare Shift (Maya Lin)',
      travelerName: 'Maya Lin',
      travelerRole: 'Night-shift ICU Nurse',
      avatar: '🩺',
      guardianName: 'David Lin (Spouse)',
      guardianPhone: '+1 (555) 789-0123',
      routeName: 'Metro Health Hospital → Eastside Transit Hub',
      originName: 'Metro Health Hospital',
      destinationName: 'Eastside Transit Hub',
      originCoords: [37.7600, -122.4350],
      destinationCoords: [37.7680, -122.4280],
      corridorWidthMeters: 80,
      estimatedDurationMinutes: 18,
      isNightTime: true,
      escalationTimeoutMinutes: 10,
      routeWaypoints: [
        [37.7600, -122.4350], // Hospital Main Gate
        [37.7625, -122.4325], // 16th Street Well-Lit Corridor
        [37.7655, -122.4300], // Valencia Safety Hub
        [37.7680, -122.4280]  // Eastside Transit Hub
      ],
      saferRouteWaypoints: [
        [37.7600, -122.4350],
        [37.7630, -122.4310],
        [37.7660, -122.4290],
        [37.7680, -122.4280]
      ],
      demoWaypoints: {
        safe: [37.7625, -122.4325],
        minorDeviation: [37.7635, -122.4305],
        severeDeviation: [37.7650, -122.4250],
        returning: [37.7640, -122.4318],
        destination: [37.7680, -122.4280]
      },
      contacts: [
        { id: 'c6', name: 'David Lin', relation: 'Spouse', phone: '+1 (555) 789-0123', email: 'david.lin@example.com', notifySms: true, notifyCall: true },
        { id: 'c7', name: 'Hospital Staff Escort Service', relation: 'Security Operations', phone: '+1 (555) 444-0199', email: 'escort@metrohealth.org', notifySms: true, notifyCall: true }
      ]
    }
  ],

  // Sample Organization Roster & Members
  sampleOrgMembers: [
    { id: 'mem-1', name: 'Marcus Vance', email: 'mvance@apextours.com', role: 'admin', title: 'Director of Safety Ops', assignedCount: 12 },
    { id: 'mem-2', name: 'Sarah Jenkins', email: 'sjenkins@apextours.com', role: 'staff', title: 'Lead Field Guide', assignedCount: 6 },
    { id: 'mem-3', name: 'Carlos Gomez', email: 'cgomez@apextours.com', role: 'staff', title: 'Night Shift Coordinator', assignedCount: 4 }
  ],

  // Default initial alerts
  defaultAlerts: [
    {
      id: 'alt-001',
      travelerName: 'Aarav Sharma',
      type: 'CORRIDOR_ENTRY',
      severity: 'info',
      message: 'Aarav began commute from Oakwood High along verified corridor.',
      timestamp: '2026-08-19T17:15:00Z',
      status: 'RESOLVED',
      resolvedBy: 'Automatic Geofence Detection'
    },
    {
      id: 'alt-002',
      travelerName: 'Elena Rostova',
      type: 'WEATHER_ADVISORY',
      severity: 'warning',
      message: 'Dense sea fog advisory active along Bayfront Promenade. Visual safety buffer increased by +25m.',
      timestamp: '2026-08-19T17:22:00Z',
      status: 'RESOLVED',
      resolvedBy: 'AI Weather Telemetry'
    }
  ],

  // Crowdsourced safety reviews
  defaultCommunityReviews: [
    {
      id: 'rev-1',
      author: 'Sophia K. (Solo Traveler)',
      avatar: '🌟',
      location: 'Historic Plaza → Heritage Lane',
      rating: 5,
      date: '2 hours ago',
      tags: ['Well-Lit', 'High Foot Traffic', 'Police Kiosk Nearby', 'Safe for Solo Travelers'],
      comment: 'Very pleasant walking route with constant ambient street lighting and tourist police stationed near the plaza entrance. Highly recommended for evening walks.',
      moderationStatus: 'Verified Community Report'
    },
    {
      id: 'rev-2',
      author: 'David L. (Night Commuter)',
      avatar: '🛡️',
      location: '16th Street Well-Lit Corridor',
      rating: 4,
      date: 'Yesterday',
      tags: ['Active Security', 'CCTV Covered', 'Good Cellular Signal'],
      comment: 'Excellent cellular reception (5G throughout) and emergency call boxes visible every 200 meters. Slightly quieter past 11 PM but well monitored.',
      moderationStatus: 'Verified Community Report'
    },
    {
      id: 'rev-3',
      author: 'Liam Chen (Student)',
      avatar: '🎒',
      location: 'Mission Plaza Shortcut Alley',
      rating: 2,
      date: '3 days ago',
      tags: ['Poor Lighting', 'Low Visibility at Night', 'Scam / Pickpocket Alert'],
      comment: 'The side alley has flickering streetlights and few pedestrians after dark. Stick to the main Grand Avenue boulevard recommended by the app.',
      moderationStatus: 'Verified Hazard Warning'
    }
  ],

  // Verified Local Help Network Helpers
  localHelpers: [
    {
      id: 'hlp-1',
      name: 'Maria Santos',
      role: 'Verified Local Resident & Safety Volunteer',
      avatar: '👩‍💼',
      distanceMeters: 180,
      etaMinutes: 3,
      rating: 4.9,
      helpCount: 42,
      languages: ['English', 'Spanish'],
      services: ['Directions & Safe Escort', 'Emergency Water / First Aid', 'Safe Haven Waiting Spot'],
      phone: '+1 (555) 432-8877',
      isAvailable: true
    },
    {
      id: 'hlp-2',
      name: 'Kenji Takahashi',
      role: 'Heritage Cafe Owner & Safe Spot Ambassador',
      avatar: '☕',
      distanceMeters: 320,
      etaMinutes: 5,
      rating: 5.0,
      helpCount: 88,
      languages: ['English', 'Japanese'],
      services: ['Device Charging Station', 'Emergency WiFi / Calling', 'Safe Seating & First Aid'],
      phone: '+1 (555) 876-1122',
      isAvailable: true
    }
  ]
};
