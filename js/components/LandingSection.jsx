/**
 * SafeRoute Guardian - Role-Selection Screen (3 Core Modes)
 * Presents the 3 distinct user workspaces: Tourist, Parent/Guardian, Organization.
 * For Organization, highlights the Administrator & Staff permission levels.
 */

window.LandingSection = function({
  onSelectRole,
  scenarios = [],
  activeScenario,
  onSelectScenario,
  currentUser
}) {
  const roles = [
    {
      id: 'tourist',
      title: 'Tourist',
      icon: '🧳',
      badge: 'Individual Traveler',
      color: '#38BDF8',
      cardClass: 'srg-role-card-tourist',
      description: 'Explore destinations safely with weather intelligence, connectivity dead-zone maps, community safety reviews, and personal live journey protection.',
      highlights: [
        'Explore Safely destination AI intelligence',
        'Fastest vs Safer route comparison & weather warnings',
        'Crowdsourced Community Reviews & Trusted Safe Spots',
        'Emergency SOS 3s hold & mobile shake gesture'
      ]
    },
    {
      id: 'parent',
      title: 'Parent / Guardian',
      icon: '👨‍👩‍👧',
      badge: 'Family Safety',
      color: '#10B981',
      cardClass: 'srg-role-card-parent',
      description: 'Monitor your child or family member along approved school or activity corridors with real-time deviation alerts and family check-ins.',
      highlights: [
        'Live Leaflet map & dependent corridor tracking',
        'Real-time child status, risk gauge & Safe Beacon',
        'Corridor deviation alerts & check-in timeline',
        'Direct family emergency network contacts'
      ]
    },
    {
      id: 'organization',
      title: 'School / Organization',
      icon: '🏢',
      badge: 'Enterprise & School Ops',
      color: '#F59E0B',
      cardClass: 'srg-role-card-org',
      description: 'Centralized safety command center for tour operators, educational institutions, field teams, and safety coordinators.',
      highlights: [
        'Staff View: Assigned travelers & incident resolution',
        'Admin View: Organization command center & roster',
        'Manage routes, corridor buffers & escalation timeouts',
        'Explainable AI Risk Engine telemetry & simulation controls'
      ]
    }
  ];

  return (
    <div className="srg-landing-container">
      {/* Hero Header */}
      <section className="srg-landing-hero">
        <div className="srg-hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          SafeRoute Guardian • AI Corridor Safety Platform
        </div>

        <h1 className="srg-hero-title">
          Select Your <span>Safety Workspace</span>
        </h1>

        <p className="srg-hero-subtitle">
          Experience AI-assisted route geofences, proactive check-ins, and multi-channel emergency escalations tailored to your operational role.
        </p>
      </section>

      {/* 3 Main Role Cards Grid */}
      <section className="srg-role-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {roles.map((role) => (
          <div
            key={role.id}
            className={`srg-role-card ${role.cardClass}`}
            style={{ borderTop: `4px solid ${role.color}` }}
          >
            <div className="srg-role-card-header">
              <div className="srg-role-icon-box" style={{ background: `${role.color}15`, color: role.color }}>
                <span style={{ fontSize: '1.85rem' }}>{role.icon}</span>
              </div>
              <span className="srg-role-badge" style={{ background: `${role.color}15`, color: role.color }}>
                {role.badge}
              </span>
            </div>

            <h2 className="srg-role-title" style={{ fontSize: '1.35rem', fontWeight: '800' }}>
              {role.title}
            </h2>
            <p className="srg-role-description">{role.description}</p>

            <div className="srg-role-highlights">
              <div className="srg-highlights-label">CORE CAPABILITIES</div>
              <ul>
                {role.highlights.map((h, i) => (
                  <li key={i}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="srg-btn srg-btn-primary srg-role-select-btn"
              onClick={() => onSelectRole(role.id)}
              style={{ background: role.color, borderColor: role.color }}
            >
              <span>Launch {role.title} Workspace</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        ))}
      </section>

      {/* Preset Journey Scenarios Switcher */}
      <section className="srg-scenarios-strip">
        <div className="srg-scenarios-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🧭</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF' }}>Preset Journey Scenarios</h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Select a pre-configured journey route to inspect route geometry and geofences</p>
            </div>
          </div>
        </div>

        <div className="srg-scenarios-grid">
          {scenarios.map((sc) => {
            const isSelected = activeScenario && activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                className={`srg-scenario-card ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectScenario(sc)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{sc.avatar}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.9rem' }}>{sc.travelerName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#38BDF8' }}>{sc.travelerRole}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1', textAlign: 'left' }}>
                  📍 {sc.routeName}
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.45rem', fontSize: '0.7rem', color: '#94A3B8' }}>
                  <span>Buffer: <b>{sc.corridorWidthMeters}m</b></span>
                  <span>•</span>
                  <span>Timeout: <b>{sc.escalationTimeoutMinutes}m</b></span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
