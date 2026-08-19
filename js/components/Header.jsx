/**
 * SafeRoute Guardian - Header & Top Navigation Component
 * Supports 3-role navigation, scenario switcher, live safety risk score pill,
 * audio mute control, and auth status display.
 */

window.Header = function({
  currentView = 'landing',
  currentRole = 'tourist',
  orgPermission = 'staff',
  activeTool = null,
  onSelectRole,
  onBackToRoles,
  onOpenExploreSafely,
  onOpenCommunityReviews,
  onOpenLocalHelp,
  activeScenario,
  scenarios = [],
  onSelectScenario,
  safetyScore = 0,
  safetyLevel = { key: 'SAFE', label: 'Safe', color: '#10B981' },
  isMuted = false,
  onToggleMute,
  currentUser
}) {
  const currentRoleMeta = (window.SRG_DATA.roles || []).find(r => r.id === currentRole) || {
    title: 'Workspace',
    icon: '🛡️'
  };

  const roleLabel = currentRole === 'organization'
    ? (orgPermission === 'admin' ? 'Org Admin' : 'Org Staff')
    : currentRoleMeta.title;

  return (
    <header className="srg-header">
      {/* Brand & Logo */}
      <button
        type="button"
        className="srg-brand"
        onClick={onBackToRoles}
        title="Return to Workspace Selection Screen"
        aria-label="SafeRoute Guardian home"
      >
        <div className="srg-logo-shield">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div>
          <div className="srg-brand-title">SafeRoute Guardian</div>
          <div className="srg-brand-subtitle">AI Corridor & Safety Platform</div>
        </div>
      </button>

      {/* Center Navigation Actions */}
      <nav className="srg-nav-center">
        {currentView !== 'landing' ? (
          <button 
            type="button"
            className="srg-role-btn active"
            onClick={onBackToRoles}
            title="Return to 3-workspace selection screen"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Workspaces</span>
          </button>
        ) : null}

        {currentView === 'workspace' && (
          <span className="srg-nav-context" aria-current="page">
            {currentRoleMeta.icon} {roleLabel}
          </span>
        )}

        {currentView === 'tool' && (
          <span className="srg-nav-context" aria-current="page">
            {currentRoleMeta.icon} {activeTool ? activeTool.replace(/-/g, ' ') : 'Dashboard'}
          </span>
        )}

        {/* Tourist Intelligence Shortcuts */}
        <button 
          type="button"
          className="srg-role-btn"
          onClick={onOpenExploreSafely}
          title="Tourist Safety Intelligence (Weather, Connectivity, Advisories)"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <span>🧭</span>
          <span>Explore Safely</span>
        </button>

        <button 
          type="button"
          className="srg-role-btn"
          onClick={onOpenCommunityReviews}
          title="Crowdsourced Community Safety Reviews"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <span>⭐</span>
          <span>Community Reviews</span>
        </button>

        <button
          type="button"
          className="srg-role-btn"
          onClick={onOpenLocalHelp}
          title="Verified local assistance network"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <span>🤝</span>
          <span>Local Help</span>
        </button>
      </nav>

      {/* Right Controls: Scenario Dropdown, Status Pill & Sound */}
      <div className="srg-header-actions">
        {/* Scenario Dropdown */}
        <select 
          className="srg-scenario-select"
          value={activeScenario ? activeScenario.id : ''}
          onChange={(e) => {
            const sc = scenarios.find(s => s.id === e.target.value);
            if (sc) onSelectScenario(sc);
          }}
          title="Select active travel scenario persona"
          aria-label="Active traveler persona"
        >
          {scenarios.map(sc => (
            <option key={sc.id} value={sc.id}>
              {sc.avatar} {sc.travelerName} ({sc.travelerRole})
            </option>
          ))}
        </select>

        {/* Safety Score Status Pill */}
        <div 
          className="srg-status-pill"
          style={{
            background: safetyLevel.bg || 'rgba(16, 185, 129, 0.15)',
            borderColor: safetyLevel.border || '#10B981',
            color: safetyLevel.color || '#10B981'
          }}
          title={`AI Risk Score: ${safetyScore}/100 (${safetyLevel.label})`}
        >
          <span 
            className={`srg-status-dot ${safetyLevel.key === 'EMERGENCY' ? 'srg-pulse' : ''}`}
            style={{ background: safetyLevel.color }}
          />
          <span>{safetyLevel.label} ({safetyScore})</span>
        </div>

        {/* Audio Mute / Unmute Toggle */}
        <button
          type="button"
          className={`srg-audio-toggle ${isMuted ? 'muted' : ''}`}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Emergency Sirens & Sounds' : 'Mute Emergency Sirens & Sounds'}
          aria-label="Toggle Siren Audio"
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
