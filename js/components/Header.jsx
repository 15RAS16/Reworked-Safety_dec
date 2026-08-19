/**
 * SafeRoute Guardian - Header Navigation Bar Component
 * Displays system status, active role pill, demo mode banner, audio controls, and secure logout.
 */

window.Header = function({
  currentRole = 'tourist',
  orgPermission = 'staff',
  safetyLevel = 'SAFE',
  onSignOut,
  currentUser = null,
  onOpenRoles
}) {
  const [isAudioMuted, setIsAudioMuted] = React.useState(() => window.AudioService ? window.AudioService.isMuted : false);

  const toggleSound = () => {
    if (window.AudioService) {
      const next = !isAudioMuted;
      window.AudioService.isMuted = next;
      setIsAudioMuted(next);
      if (!next) window.AudioService.playSafeChime();
    }
  };

  const roleLabel = currentRole === 'tourist'
    ? '🧳 Tourist'
    : currentRole === 'parent'
      ? '👨‍👩‍👧 Parent / Guardian'
      : `🏢 Organization (${orgPermission === 'admin' ? '👑 Admin' : '🛡️ Staff'})`;

  return (
    <header className="srg-header">
      <div className="srg-header-inner">
        {/* Left: Brand Identity */}
        <div className="srg-brand-box">
          <div className="srg-brand-logo">🛡️</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="srg-brand-title">SafeRoute Guardian</span>
              <span className="srg-brand-badge">PRO v2.0</span>
            </div>
            <span className="srg-brand-sub">AI Corridor Protection • Antigravity</span>
          </div>
        </div>

        {/* Center: Active Role Indicator */}
        <div className="srg-header-center">
          <div className="srg-role-pill" onClick={onOpenRoles} title="Active Workspace Role">
            <span className="srg-status-dot" style={{ background: '#10B981' }} />
            <span>{roleLabel}</span>
          </div>

          {/* Permanent Demo / Simulated Badge */}
          {window.ConfigService && window.ConfigService.isDemoModeEnabled() && (
            <div className="srg-demo-pill" title="Isolated Simulation Mode">
              <span>⚡ Simulated Demo</span>
            </div>
          )}
        </div>

        {/* Right: Controls & User Profile */}
        <div className="srg-header-right">
          {/* Sound Toggle */}
          <button
            type="button"
            className="srg-icon-btn"
            onClick={toggleSound}
            aria-label={isAudioMuted ? 'Unmute Audio Sounds' : 'Mute Audio Sounds'}
            title={isAudioMuted ? 'Sound Muted' : 'Sound Active'}
          >
            {isAudioMuted ? '🔇' : '🔊'}
          </button>

          {/* User Profile / Logout */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ textAlign: 'right', display: 'none', md: 'block' }} className="srg-user-meta">
                <b style={{ color: '#FFFFFF', fontSize: '0.82rem', display: 'block' }}>
                  {currentUser.displayName || 'Traveler'}
                </b>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{currentUser.email}</span>
              </div>

              <button
                type="button"
                className="srg-btn srg-btn-outline srg-btn-sm"
                onClick={onSignOut}
                title="Sign out of SafeRoute Guardian"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
