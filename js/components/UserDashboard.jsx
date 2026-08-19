/**
 * SafeRoute Guardian - Monitored Traveler (User) Dashboard Component
 * Mobile-first dashboard with safety status gauge, corridor guidance, SOS hold button,
 * shake gesture shortcut, and Tourist Safety Intelligence quick card.
 */

window.UserDashboard = function({
  roleId = 'traveler',
  onBackToWorkspace,
  onOpenExploreSafely,
  onOpenCommunityReviews,
  activeScenario,
  riskData,
  currentPos,
  journeyState,
  onAcknowledgeSafe,
  onTriggerSos,
  onTestEmergency,
  motionStatus,
  onRequestMotionPermission,
  onSimulateShake
  , networkStatus = 'STRONG', safeBeacon, onSetNetworkStatus
}) {
  // SOS Hold-to-activate State (3 seconds hold)
  const [sosHoldProgress, setSosHoldProgress] = React.useState(0);
  const [isHoldingSos, setIsHoldingSos] = React.useState(false);
  const sosTimerRef = React.useRef(null);
  const startTimeRef = React.useRef(null);
  const HOLD_DURATION_MS = 3000;

  // Start SOS hold
  const handleSosStart = (e) => {
    e.preventDefault();
    setIsHoldingSos(true);
    startTimeRef.current = Date.now();

    if (window.AudioService) {
      window.AudioService.playTick();
    }

    sosTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setSosHoldProgress(progress);

      if (window.AudioService && Math.floor(elapsed / 500) % 2 === 0) {
        window.AudioService.playTick();
      }

      if (elapsed >= HOLD_DURATION_MS) {
        clearInterval(sosTimerRef.current);
        setIsHoldingSos(false);
        setSosHoldProgress(0);
        onTriggerSos('SOS_BUTTON_HOLD');
      }
    }, 40);
  };

  // End / cancel SOS hold before 3 seconds
  const handleSosEnd = (e) => {
    e.preventDefault();
    if (sosTimerRef.current) {
      clearInterval(sosTimerRef.current);
      sosTimerRef.current = null;
    }
    setIsHoldingSos(false);
    setSosHoldProgress(0);
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (sosHoldProgress / 100) * circumference;

  const isDeviation = riskData && riskData.distanceOffCorridor > 0;
  const statusClass = riskData.level.key.toLowerCase().replace('_', '-');

  return (
    <div className="srg-user-view">
      {/* Top Workspace Navigation Bar */}
      <div className="srg-workspace-topbar" style={{ marginBottom: '0.75rem' }}>
        <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Workspace
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenExploreSafely} title="Open Tourist Safety Intelligence">
            🧭 Explore Safely
          </button>
          <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenCommunityReviews} title="Trusted Safe Spots and local safety information">📍 Safe Spots</button>
        </div>
      </div>

      <div className="srg-beacon-card">
        <div><b>📡 Safe Beacon {networkStatus === 'STRONG' ? 'Ready' : 'Active'}</b><span>{safeBeacon ? 'Your latest safety beacon has been saved. It will sync when connectivity returns.' : `Network: ${networkStatus} (Demo / Simulated)`}</span></div>
        <div className="srg-network-controls">{['STRONG','LIMITED','OFFLINE'].map(status => <button key={status} className={networkStatus === status ? 'active' : ''} onClick={() => onSetNetworkStatus(status)}>{status}</button>)}</div>
      </div>

      <window.TrustedSafeSpots riskData={riskData} compact={true} />

      {/* 1. Large Hero Safety Status Card */}
      <div className={`srg-user-status-card ${statusClass}`}>
        <div className="srg-user-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="srg-user-avatar">{activeScenario.avatar}</span>
            <div>
              <div className="srg-user-name">{activeScenario.travelerName}</div>
              <div className="srg-user-role-badge">{activeScenario.travelerRole}</div>
            </div>
          </div>

          <div 
            className="srg-status-pill"
            style={{ 
              background: riskData.level.bg, 
              border: `1px solid ${riskData.level.border}`,
              color: riskData.level.color 
            }}
          >
            <span className={`srg-status-dot ${riskData.level.key === 'EMERGENCY' ? 'srg-pulse' : ''}`} style={{ background: riskData.level.color }} />
            <span>{riskData.level.label}</span>
          </div>
        </div>

        {/* Live Corridor Guidance Banner */}
        <div className="srg-journey-status-banner">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isDeviation ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isDeviation ? '#F59E0B' : '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isDeviation ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.9rem' }}>
              {isDeviation ? 'Corridor Deviation Detected' : 'Safely Inside Approved Corridor'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '2px' }}>
              {isDeviation 
                ? `You are ${riskData.distanceOffCorridor}m outside the designated safe boundary. Please return to route.`
                : `Following ${activeScenario.routeName} (${activeScenario.corridorWidthMeters}m safe buffer)`}
            </div>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="srg-user-telemetry-grid">
          <div className="srg-user-telemetry-item">
            <span className="srg-user-telemetry-label">Destination</span>
            <span className="srg-user-telemetry-val" style={{ fontSize: '0.85rem' }}>{activeScenario.destinationName}</span>
          </div>

          <div className="srg-user-telemetry-item">
            <span className="srg-user-telemetry-label">Est. Arrival (ETA)</span>
            <span className="srg-user-telemetry-val">~{activeScenario.estimatedDurationMinutes} mins</span>
          </div>

          <div className="srg-user-telemetry-item">
            <span className="srg-user-telemetry-label">Safety Risk Score</span>
            <span className="srg-user-telemetry-val" style={{ color: riskData.level.color, fontFamily: 'var(--font-mono)' }}>
              {riskData.score} / 100
            </span>
          </div>

          <div className="srg-user-telemetry-item">
            <span className="srg-user-telemetry-label">Guardian Network</span>
            <span className="srg-user-telemetry-val" style={{ color: '#38BDF8', fontSize: '0.82rem' }}>
              {activeScenario.guardianName}
            </span>
          </div>
        </div>

        {/* Action button if deviation or check-in pending */}
        {isDeviation && (
          <button 
            className="srg-btn srg-btn-teal"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            onClick={onAcknowledgeSafe}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            I'm Safe — Return to Safe Corridor
          </button>
        )}
      </div>

      {/* 2. Tourist Safety Intelligence Quick Card */}
      <div style={{
        background: 'rgba(19, 30, 53, 0.9)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            🧭
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.92rem' }}>Tourist Safety Intelligence</div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Weather: 🌧️ Rain Warning • Signal: 📶 74% Coverage</div>
          </div>
        </div>

        <button 
          className="srg-btn srg-btn-outline srg-btn-sm"
          onClick={onOpenExploreSafely}
          style={{ borderColor: '#38BDF8', color: '#38BDF8', fontSize: '0.78rem' }}
        >
          Explore Safely →
        </button>
      </div>

      {/* 3. Interactive Map Widget */}
      <div style={{
        background: 'var(--bg-card-dark)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: '240px',
        position: 'relative'
      }}>
        <window.InteractiveMap 
          mapId="user-mobile-map"
          routeWaypoints={activeScenario.routeWaypoints}
          corridorWidthMeters={activeScenario.corridorWidthMeters}
          currentPos={currentPos}
          travelerName={activeScenario.travelerName}
          travelerAvatar={activeScenario.avatar}
          safetyLevel={riskData.level.key}
          isDeviation={isDeviation}
          originName={activeScenario.originName}
          destinationName={activeScenario.destinationName}
          isCompact={true}
        />
      </div>

      {/* 4. Emergency SOS Activation Box */}
      <div className="srg-sos-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>Emergency SOS</h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>[Demo / Simulated] Activates siren and sends simulated alerts</p>
          </div>

          {/* Shake Gesture Sensor Badge */}
          <div>
            {motionStatus && motionStatus.permissionStatus === 'granted' ? (
              <span className="srg-gesture-badge" title="Shake phone 3 times to trigger emergency">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/></svg>
                Shake Shortcut Enabled
              </span>
            ) : (
              <button 
                className="srg-btn srg-btn-outline srg-btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                onClick={onRequestMotionPermission}
              >
                Enable Shake Gesture
              </button>
            )}
          </div>
        </div>

        {/* SOS Hold Button */}
        <div className="srg-sos-btn-wrapper">
          <svg className="srg-sos-progress-svg">
            <circle 
              className="srg-sos-progress-circle-bg" 
              cx="70" cy="70" r={radius} 
            />
            <circle 
              className="srg-sos-progress-circle-fill" 
              cx="70" cy="70" r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset
              }}
            />
          </svg>

          <button 
            className="srg-sos-main-btn"
            onMouseDown={handleSosStart}
            onMouseUp={handleSosEnd}
            onMouseLeave={handleSosEnd}
            onTouchStart={handleSosStart}
            onTouchEnd={handleSosEnd}
            onTouchCancel={handleSosEnd}
            aria-label="Hold for 3 seconds to activate Emergency Protocol"
          >
            <span style={{ fontSize: '1.6rem' }}>🚨</span>
            <span>SOS</span>
          </button>
        </div>

        <div className="srg-sos-hint">
          {isHoldingSos ? (
            <span style={{ color: '#EF4444', fontWeight: '800' }}>
              HOLDING... ({Math.max(1, 3 - Math.floor(sosHoldProgress / 33))}s)
            </span>
          ) : (
            <span>Hold button for <b>3 seconds</b> to activate Emergency Protocol</span>
          )}
        </div>

        {/* Demo Fallbacks & Simulation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={onSimulateShake}
            title="Simulate 3 forceful device shakes"
          >
            📱 Test Shake Gesture
          </button>

          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={onTestEmergency}
            title="Test emergency flow without loud siren"
          >
            🧪 Test Emergency (Demo Mode)
          </button>
        </div>
      </div>
    </div>
  );
};
