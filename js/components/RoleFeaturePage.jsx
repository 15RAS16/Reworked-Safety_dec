/**
 * SafeRoute Guardian - Role Feature Page Component
 * Renders dedicated pages for specific workflow actions with role context and route guards.
 */

window.RoleFeaturePage = function({
  tool,
  roleId,
  orgPermission = 'staff',
  activeScenario,
  riskData,
  safeBeacon,
  timeline,
  onBack,
  onOpen
}) {
  const pages = {
    'tourist-home': ['Tourist Safety Home', 'Plan a confident trip with real-time route intelligence, safe spots, and emergency assistance.', '🧳'],
    'route-safety': ['Route Safety Intelligence', 'Review route conditions, coverage, and proactive safety guidance.', '◈'],
    'guardian-home': ['Guardian Overview', 'A focused live view of your linked dependent’s current journey and safety state.', '👨‍👩‍👧'],
    'safe-beacon': ['Safe Beacon Mode', 'Save a last-known safe location when cellular connectivity is limited.', '◈'],
    'org-home': ['Organization Operations', 'A concise operational overview for group and student safety monitoring.', '🏢'],
    'org-reports': ['Safety & Incident Reports', 'Review incident audit logs and export official safety evidence summaries.', '◷'],
    'admin-users': ['Member & Staff Management', 'Manage organization users, roles, and assigned travelers.', '👥'],
    'local-help-monitor': ['Local Help Monitor', 'Review verified local assistance requests and volunteer availability.', '🤝'],
    'helper-verification': ['Helper Verification', 'Verify trusted local helpers before they become visible to travelers.', '✓'],
    'settings': ['Account & Safety Settings', 'Configure notification thresholds, emergency contacts, and audio preferences.', '⚙']
  };

  if (tool === 'trusted-safe-spots') {
    return (
      <section className="srg-feature-page">
        <div className="srg-page-heading">
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBack}>← Back</button>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#38BDF8', fontWeight: '800' }}>SAFETY LOCATIONS</p>
            <h1 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#FFFFFF' }}>Trusted Safe Spots</h1>
          </div>
        </div>
        <window.TrustedSafeSpots riskData={riskData} />
      </section>
    );
  }

  if (tool === 'journey-timeline') {
    return (
      <section className="srg-feature-page">
        <div className="srg-page-heading">
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBack}>← Back</button>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#38BDF8', fontWeight: '800' }}>AUDIT TRAIL</p>
            <h1 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#FFFFFF' }}>Journey Evidence Timeline</h1>
          </div>
        </div>
        <window.JourneyTimeline timeline={timeline} activeScenario={activeScenario} safeBeacon={safeBeacon} />
      </section>
    );
  }

  const [title, description, icon] = pages[tool] || ['Safety Tool', 'Dedicated safety feature ready for your active workspace.', '🛡️'];

  return (
    <section className="srg-feature-page">
      <div className="srg-page-heading">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBack}>← Back</button>
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#38BDF8', fontWeight: '800' }}>
            {roleId.toUpperCase()} WORKSPACE
          </p>
          <h1 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#FFFFFF' }}>{title}</h1>
        </div>
      </div>

      <div className="srg-purpose-card">
        <span>{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
          <p className="srg-purpose-note">
            Active journey: <b>{activeScenario.travelerName}</b> • Safety score <b>{riskData.score}/100</b> ({riskData.level.label})
          </p>
        </div>
      </div>

      {tool === 'safe-beacon' && (
        <div className="srg-empty-state">
          <b>{safeBeacon ? 'Safe Beacon active' : 'No Safe Beacon saved yet'}</b>
          <p>{safeBeacon ? `Last saved at ${new Date(safeBeacon.timestamp).toLocaleTimeString()} with ${safeBeacon.networkStatus} network.` : 'When connectivity becomes limited, the app will automatically store the last known safe location.'}</p>
        </div>
      )}

      {tool === 'admin-users' && (
        <div className="srg-empty-state">
          <b>Organization User Directory</b>
          <p>Manage staff rosters, assign groups, and adjust corridor safety policies in the Organization Command Center.</p>
          <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => onOpen('org-monitor')}>
            Open Fleet Monitor
          </button>
        </div>
      )}

      {tool === 'route-safety' && (
        <div className="srg-empty-state">
          <b>Route Intelligence is Active</b>
          <p>Open Explore Safely for real-time weather warnings, connectivity dead-zone overlays, and official travel advisories.</p>
          <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => onOpen('explore-safely')}>
            Launch Explore Safely
          </button>
        </div>
      )}

      {tool === 'settings' && (
        <div className="srg-empty-state">
          <b>Safety & Notification Preferences</b>
          <p>Audio sirens, auto-escalation timeouts, and device motion sensors are active and configured for your session.</p>
        </div>
      )}
    </section>
  );
};
