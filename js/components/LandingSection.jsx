/**
 * SafeRoute Guardian - First Login / Role-Selection Screen
 * Presents the 5 distinct account types: Tourist, Parent/Guardian, Organization, Administrator, Traveler/User.
 */

window.LandingSection = function({
  onSelectRole,
  scenarios = [],
  activeScenario,
  onSelectScenario
}) {
  const roles = [
    {
      id: 'tourist',
      title: 'Tourist',
      icon: '🧳',
      badge: 'Explorer & Traveler',
      color: '#38BDF8',
      cardClass: 'srg-role-card-tourist',
      description: 'Explore new cities safely with destination intelligence, weather alerts, connectivity dead-zone maps, and community safety reviews.',
      highlights: [
        'Explore Safely destination AI intelligence',
        'Weather warnings & connectivity maps',
        'Crowdsourced Community Reviews',
        'Emergency SOS & 3s hold panic'
      ]
    },
    {
      id: 'parent',
      title: 'Parent / Guardian',
      icon: '👨‍👩‍👧',
      badge: 'Family Safety',
      color: '#10B981',
      cardClass: 'srg-role-card-parent',
      description: 'Monitor your child or family member along approved school or activity corridors with real-time deviation alerts.',
      highlights: [
        'Live Leaflet map & corridor tracking',
        'Real-time child status & risk gauge',
        'Deviation alerts & check-in timeline',
        'Direct emergency network contacts'
      ]
    },
    {
      id: 'organization',
      title: 'School / Organization',
      icon: '🏢',
      badge: 'Enterprise & School',
      color: '#F59E0B',
      cardClass: 'srg-role-card-org',
      description: 'Centralized safety command center for tour operators, educational institutions, field operations, and corporate travel.',
      highlights: [
        'Multi-traveler overview metrics',
        'Manage routes & corridor buffer widths',
        'Fleet monitoring & active status feed',
        'Incident audit log with export'
      ]
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: '🛡️',
      badge: 'System Admin',
      color: '#2563EB',
      cardClass: 'srg-role-card-admin',
      description: 'Full platform administrative control over geofence corridor algorithms, AI risk parameters, safety contacts, and demo tools.',
      highlights: [
        'Central map command center',
        'Manage routes & geofence buffers',
        'Explainable AI Risk Engine telemetry',
        'Interactive Demo simulation controls'
      ]
    },
    {
      id: 'traveler',
      title: 'Student / Traveler',
      icon: '📱',
      badge: 'Monitored Traveler',
      color: '#8B5CF6',
      cardClass: 'srg-role-card-traveler',
      description: 'Personal traveler mobile companion with approved route guidance, proactive "Are you safe?" check-ins, and SOS triggers.',
      highlights: [
        'Live journey guidance & destination ETA',
        '1-tap "I\'m Safe" check-in acknowledgment',
        'Hold for 3s SOS panic button',
        'DeviceMotion 3-shake emergency shortcut'
      ]
    }
  ];

  return (
    <div className="srg-landing-container">
      {/* Hero Header */}
      <section className="srg-landing-hero">
        <div className="srg-hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          SafeRoute Guardian • AI Safety Platform
        </div>

        <h1 className="srg-hero-title">
          Select Your <span>Account Workspace</span>
        </h1>

        <p className="srg-hero-desc">
          Choose an account type to access your dedicated role workspace and safety tools.
        </p>

        {/* 5-Account Cards Grid */}
        <div className="srg-five-roles-grid">
          {roles.map(r => (
            <article
              key={r.id}
              className={`srg-role-workspace-card ${r.cardClass}`}
            >
              <div className="srg-role-card-top">
                <div className="srg-role-icon-box" style={{ background: `${r.color}20`, borderColor: `${r.color}40`, color: r.color }}>
                  <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                </div>
                <span className="srg-role-type-pill" style={{ color: r.color, borderColor: `${r.color}40`, background: `${r.color}15` }}>
                  {r.badge}
                </span>
              </div>

              <h2 className="srg-role-heading">{r.title}</h2>
              <p className="srg-role-text">{r.description}</p>

              <ul className="srg-role-feature-list">
                {r.highlights.map((h, i) => (
                  <li key={i}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <button 
                className="srg-btn srg-btn-primary"
                style={{ width: '100%', background: `linear-gradient(135deg, ${r.color}, ${r.color}CC)` }}
                onClick={() => onSelectRole(r.id)}
              >
                <span>Enter {r.title} Workspace</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Preset Personas & Travelers */}
      <section className="srg-preset-scenarios">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FFFFFF' }}>Demo Traveler Profiles</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Select an active traveler profile to test specific routes and telemetry.</p>
          </div>
        </div>

        <div className="srg-presets-grid">
          {scenarios.map(sc => (
            <div 
              key={sc.id} 
              className={`srg-preset-item ${activeScenario && activeScenario.id === sc.id ? 'active' : ''}`}
              onClick={() => onSelectScenario(sc)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{sc.avatar}</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#FFFFFF' }}>{sc.travelerName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#38BDF8' }}>{sc.travelerRole}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>{sc.routeName}</div>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: activeScenario && activeScenario.id === sc.id ? '#38BDF8' : '#64748B', fontWeight: '700' }}>
                {activeScenario && activeScenario.id === sc.id ? '✓ Selected' : 'Select'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="srg-how-section">
        <div className="srg-section-header">
          <h2 className="srg-section-title">How SafeRoute Guardian Works</h2>
          <p className="srg-section-subtitle">A deterministic, 4-stage proactive protection framework</p>
        </div>

        <div className="srg-steps-grid">
          <div className="srg-step-card">
            <div className="srg-step-number">1</div>
            <div style={{ color: '#38BDF8', marginTop: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <div className="srg-step-title">Safe Corridor Definition</div>
            <div className="srg-step-desc">
              Define approved path waypoints and customizable geofence buffers (e.g. 100 meters).
            </div>
          </div>

          <div className="srg-step-card">
            <div className="srg-step-number">2</div>
            <div style={{ color: '#2DD4BF', marginTop: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div className="srg-step-title">Live Geofence Telemetry</div>
            <div className="srg-step-desc">
              Continuous position tracking computes real-time distance offset from the corridor boundary and speed vector.
            </div>
          </div>

          <div className="srg-step-card">
            <div className="srg-step-number">3</div>
            <div style={{ color: '#F59E0B', marginTop: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/></svg>
            </div>
            <div className="srg-step-title">Explainable AI Risk Engine</div>
            <div className="srg-step-desc">
              Contextual signals (distance, time off-route, vector direction, night factor, check-in responsiveness) generate a 0-100 score.
            </div>
          </div>

          <div className="srg-step-card">
            <div className="srg-step-number">4</div>
            <div style={{ color: '#EF4444', marginTop: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="srg-step-title">Intelligent Escalation</div>
            <div className="srg-step-desc">
              Gentle reminder $\to$ "Are you safe?" check-in $\to$ Countdown timeout or SOS activates sirens and notifies the safety network.
            </div>
          </div>
        </div>
      </section>

      {/* Footer Credit */}
      <footer className="srg-footer">
        <div>
          SafeRoute Guardian — AI-Assisted Geofence Safety & Emergency Escalation Platform
        </div>
        <div className="srg-footer-credit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
          Built with Google Antigravity
        </div>
      </footer>
    </div>
  );
};
