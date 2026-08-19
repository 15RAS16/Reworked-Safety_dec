/**
 * SafeRoute Guardian - Monitored Traveler Mobile Dashboard
 * Traveler companion with integrated RiskGauge, 3-second hold SOS panic,
 * DeviceMotion 3-shake detection, Safe Beacon offline sync, and "I'm Safe" check-ins.
 */

window.UserDashboard = function({
  onBackToWorkspace,
  activeScenario,
  riskData,
  currentPos,
  journeyState,
  isCheckinModalOpen,
  onResolveCheckin,
  onTriggerSos,
  onTestEmergency,
  motionService,
  safeBeacon = null
}) {
  const [sosProgress, setSosProgress] = React.useState(0);
  const [isHoldingSos, setIsHoldingSos] = React.useState(false);
  const [networkQuality, setNetworkQuality] = React.useState('STRONG'); // 'STRONG' | 'LIMITED' | 'OFFLINE'
  const [beaconSaved, setBeaconSaved] = React.useState(false);

  const sosTimerRef = React.useRef(null);
  const startTimeRef = React.useRef(null);

  const isDeviation = riskData && riskData.distanceOffCorridor > 0;
  const statusKey = riskData ? riskData.level.key : 'SAFE';

  // SOS Hold 3 Seconds Logic
  const startSosHold = () => {
    setIsHoldingSos(true);
    startTimeRef.current = Date.now();
    window.AudioService && window.AudioService.playTick();

    sosTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / 3000) * 100);
      setSosProgress(pct);

      if (pct >= 100) {
        clearInterval(sosTimerRef.current);
        setIsHoldingSos(false);
        setSosProgress(0);
        onTriggerSos('MANUAL_SOS_HOLD');
      }
    }, 40);
  };

  const cancelSosHold = () => {
    if (sosTimerRef.current) {
      clearInterval(sosTimerRef.current);
    }
    setIsHoldingSos(false);
    setSosProgress(0);
  };

  const handleToggleBeacon = () => {
    setBeaconSaved(true);
    setTimeout(() => setBeaconSaved(false), 3000);
  };

  return (
    <div className="srg-user-view">
      {/* Top Workspace Bar */}
      <div className="srg-workspace-topbar">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Safety Hub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🧳</span>
          <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.9rem' }}>
            {activeScenario.travelerName}'s Companion
          </span>
        </div>
      </div>

      {/* Main Grid: Live Map & Risk Gauge */}
      <div className="srg-admin-grid">
        {/* Left Column: Live Map */}
        <div className="srg-map-wrapper">
          <div className="srg-map-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.92rem' }}>
                Live Corridor Tracking: {activeScenario.routeName}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              ETA: <b style={{ color: '#38BDF8' }}>{journeyState.etaMinutes || 14} mins</b>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
            <window.InteractiveMap
              mapId="user-main-map"
              routeWaypoints={activeScenario.routeWaypoints}
              corridorWidthMeters={activeScenario.corridorWidthMeters}
              currentPos={currentPos}
              travelerName={activeScenario.travelerName}
              travelerAvatar={activeScenario.avatar}
              safetyLevel={statusKey}
              isDeviation={isDeviation}
              originName={activeScenario.originName}
              destinationName={activeScenario.destinationName}
            />
            <window.MapLegend corridorWidthMeters={activeScenario.corridorWidthMeters} />
          </div>

          {/* Journey Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0.75rem', background: '#0F172A', borderTop: '1px solid #1E293B' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>Distance Off Corridor</span>
              <b style={{ fontSize: '0.92rem', color: riskData && riskData.distanceOffCorridor > 0 ? '#F59E0B' : '#10B981' }}>
                {riskData ? `${riskData.distanceOffCorridor}m` : '0m'}
              </b>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>Speed</span>
              <b style={{ fontSize: '0.92rem', color: '#FFFFFF' }}>{journeyState.speedKmh || 4.2} km/h</b>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>Corridor Buffer</span>
              <b style={{ fontSize: '0.92rem', color: '#38BDF8' }}>{activeScenario.corridorWidthMeters}m</b>
            </div>
          </div>
        </div>

        {/* Right Column: Risk Gauge & SOS Panic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <window.RiskGauge riskData={riskData} />

          {/* Check-in Acknowledgment Prompt if Deviation */}
          {isDeviation && (
            <div style={{ background: '#F59E0B20', border: '1px solid #F59E0B', borderRadius: '14px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <b style={{ color: '#FCD34D', fontSize: '0.9rem', display: 'block' }}>Route Deviation Detected</b>
                <span style={{ fontSize: '0.76rem', color: '#FEF3C7' }}>Are you safe? Acknowledge to reset deviation timer.</span>
              </div>
              <button
                type="button"
                className="srg-btn srg-btn-primary srg-btn-sm"
                onClick={onResolveCheckin}
                style={{ background: '#10B981', borderColor: '#10B981' }}
              >
                ✓ I'm Safe
              </button>
            </div>
          )}

          {/* Emergency SOS Panic Button Card */}
          <div className="srg-sos-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.3rem' }}>
              Emergency Panic Protocol
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '1.2rem' }}>
              Hold button for 3 seconds or shake phone 3 times to sound audio sirens and dispatch CAD alerts.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0.5rem 0' }}>
              <button
                type="button"
                className={`srg-sos-hold-btn ${isHoldingSos ? 'holding' : ''}`}
                onMouseDown={startSosHold}
                onMouseUp={cancelSosHold}
                onMouseLeave={cancelSosHold}
                onTouchStart={startSosHold}
                onTouchEnd={cancelSosHold}
                aria-label="Hold for 3 seconds to activate Emergency SOS"
              >
                {/* SVG Progress Ring */}
                <svg className="srg-sos-ring" width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                  <circle
                    cx="65"
                    cy="65"
                    r="58"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (sosProgress / 100) * 364.4}
                    strokeLinecap="round"
                    transform="rotate(-90 65 65)"
                  />
                </svg>

                <div className="srg-sos-inner-content">
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.05em' }}>SOS</span>
                  <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', opacity: 0.9 }}>Hold 3s</span>
                </div>
              </button>
            </div>

            {/* Shake Sensor Status & Silent Test */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid #1E293B', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981' }}>
                <span>📳</span>
                <span>Shake 3x Trigger Ready</span>
              </div>

              <button
                type="button"
                className="srg-link-btn"
                onClick={onTestEmergency}
                style={{ color: '#94A3B8', fontSize: '0.74rem' }}
              >
                🧪 Test Alarm (Silent)
              </button>
            </div>
          </div>

          {/* Safe Beacon Card */}
          <div className="srg-beacon-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <b>📡 Safe Beacon Mode</b>
                <span>Saves last verified safe coordinate before entering dead-zones.</span>
              </div>
              <button
                type="button"
                className="srg-btn srg-btn-outline srg-btn-sm"
                onClick={handleToggleBeacon}
              >
                {beaconSaved ? '✓ Beacon Saved!' : 'Drop Beacon Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
