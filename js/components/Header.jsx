/**
 * SafeRoute Guardian - Header & Top Navigation Component
 * Supports 5-role workspaces, back navigation, Explore Safely, Community Reviews, and live status pill.
 */

window.Header = function({
  currentView = 'landing', // 'landing' | 'workspace' | 'tool'
  currentRole = 'tourist',
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
  onToggleMute
}) {
  const currentRoleMeta = (window.SRG_DATA.roles || []).find(r => r.id === currentRole) || {
    title: 'Workspace',
    icon: '🛡️'
  };

  return (
    <header className="srg-header">
      {/* Brand & Logo */}
      <button type="button" className="srg-brand" onClick={onBackToRoles} title="Return to Role Selection Screen" aria-label="SafeRoute Guardian home">
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
            className="srg-role-btn active"
            onClick={onBackToRoles}
            title="Return to 5-account selection screen"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            <span>Roles</span>
          </button>
        ) : null}

        {currentView === 'workspace' && (
          <span className="srg-nav-context" aria-current="page">
            {currentRoleMeta.icon} {currentRoleMeta.title}
          </span>
        )}

        {currentView === 'tool' && (
          <span className="srg-nav-context" aria-current="page">
            {currentRoleMeta.icon} {activeTool ? 'Feature open' : 'Dashboard'}
          </span>
        )}

        {/* Explore Safely shortcut */}
        <button 
          className="srg-role-btn"
          onClick={onOpenExploreSafely}
          title="Tourist Safety Intelligence (Weather, Connectivity, Advisories)"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <span>🧭</span>
          <span>Explore Safely</span>
        </button>

        {/* Community Reviews shortcut */}
        <button 
          className="srg-role-btn"
          onClick={onOpenCommunityReviews}
          title="Crowdsourced Community Safety Reviews"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <span>⭐</span>
          <span>Community Reviews</span>
        </button>

        <button className="srg-role-btn" onClick={onOpenLocalHelp} title="Verified local assistance for tourists" style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
          <span>🤝</span><span>Local Help</span>
        </button>
      </nav>

      {/* Right Controls: Scenario Dropdown, Status Pill & Sound */}
      <div className="srg-header-actions">
        {/* Scenario Dropdown */}
        <select 
          className="srg-scenario-select"
          value={activeScenario ? activeScenario.id : ''}
          onChange={(e) => {
            const found = scenarios.find(s => s.id === e.target.value);
            if (found && onSelectScenario) onSelectScenario(found);
          }}
          title="Select active traveler persona and route"
        >
          {scenarios.map(sc => (
            <option key={sc.id} value={sc.id}>
              {sc.avatar} {sc.travelerName}
            </option>
          ))}
        </select>

        {/* Live Safety Status Pill */}
        <div 
          className="srg-status-pill"
          style={{ 
            background: safetyLevel.key === 'EMERGENCY' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(30, 41, 59, 0.9)', 
            border: `1px solid ${safetyLevel.color}`,
            color: safetyLevel.color 
          }}
        >
          <span 
            className={`srg-status-dot ${safetyLevel.key === 'EMERGENCY' ? 'srg-pulse' : ''}`} 
            style={{ background: safetyLevel.color }}
          />
          <span>{safetyLevel.label} ({safetyScore})</span>
        </div>

        {/* Sound Toggle Button */}
        <button 
          className="srg-icon-btn" 
          onClick={onToggleMute}
          title={isMuted ? "Unmute Audio (Emergency Siren & Alerts Enabled)" : "Mute Audio Alerts"}
          style={{ color: isMuted ? '#94A3B8' : '#38BDF8' }}
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" x2="1" y1="1" y2="23"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          )}
        </button>
      </div>
    </header>
  );
};
