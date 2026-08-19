/**
 * SafeRoute Guardian - Full Screen Emergency Protocol Overlay Component
 * Clearly labeled as Demo / Simulated prototype emergency response.
 */

window.EmergencyOverlay = function({
  activeScenario,
  currentPos,
  emergencyTriggerSource = 'MANUAL_SOS',
  onCancelEmergency,
  isMuted = false,
  onToggleMute
}) {
  const [cancelHoldProgress, setCancelHoldProgress] = React.useState(0);
  const [isHoldingCancel, setIsHoldingCancel] = React.useState(false);
  const cancelTimerRef = React.useRef(null);
  const startTimeRef = React.useRef(null);
  const CANCEL_HOLD_MS = 5000;

  const [dispatchLogs, setDispatchLogs] = React.useState([]);

  React.useEffect(() => {
    const initialLogs = [
      `[${new Date().toLocaleTimeString()}] 🚨 [DEMO / SIMULATED] EMERGENCY PROTOCOL ACTIVATED via ${emergencyTriggerSource}`,
      `[${new Date().toLocaleTimeString()}] 📍 [SIMULATED] High-accuracy GPS broadcast: ${currentPos ? currentPos.map(c => c.toFixed(5)).join(', ') : '37.7792, -122.4170'}`,
    ];
    setDispatchLogs(initialLogs);

    const t1 = setTimeout(() => {
      setDispatchLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 📱 [SIMULATED SMS] Dispatched to Guardian: ${activeScenario.guardianName} (${activeScenario.guardianPhone})`
      ]);
    }, 1000);

    const t2 = setTimeout(() => {
      setDispatchLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🏢 [SIMULATED CONSOLE ALERT] Transmitted to School & Organization Safety Console`
      ]);
    }, 2200);

    const t3 = setTimeout(() => {
      setDispatchLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🚓 [SIMULATED CAD DISPATCH] CAD packet sent to Local Emergency Dispatch (911 / 112 Gateway)`
      ]);
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [emergencyTriggerSource, activeScenario]);

  const handleCancelStart = (e) => {
    e.preventDefault();
    setIsHoldingCancel(true);
    startTimeRef.current = Date.now();

    cancelTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, (elapsed / CANCEL_HOLD_MS) * 100);
      setCancelHoldProgress(progress);

      if (elapsed >= CANCEL_HOLD_MS) {
        clearInterval(cancelTimerRef.current);
        setIsHoldingCancel(false);
        setCancelHoldProgress(0);
        onCancelEmergency('User confirmed safe - Held cancel button for 5s');
      }
    }, 40);
  };

  const handleCancelEnd = (e) => {
    e.preventDefault();
    if (cancelTimerRef.current) {
      clearInterval(cancelTimerRef.current);
      cancelTimerRef.current = null;
    }
    setIsHoldingCancel(false);
    setCancelHoldProgress(0);
  };

  return (
    <div className="srg-emergency-overlay">
      <div className="srg-emergency-card">
        {/* Animated Siren Waveform */}
        <div className="srg-siren-wave-anim">
          <div className="srg-siren-bar" style={{ animationDelay: '0.1s' }} />
          <div className="srg-siren-bar" style={{ animationDelay: '0.3s' }} />
          <div className="srg-siren-bar" style={{ animationDelay: '0.2s' }} />
          <div className="srg-siren-bar" style={{ animationDelay: '0.4s' }} />
          <div className="srg-siren-bar" style={{ animationDelay: '0.15s' }} />
          <div className="srg-siren-bar" style={{ animationDelay: '0.35s' }} />
          <div className="srg-siren-bar" style={{ animationDelay: '0.25s' }} />
        </div>

        <div className="srg-emergency-title">EMERGENCY ACTIVATED</div>
        <p style={{ color: '#FCA5A5', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
          <b>[Demo / Simulated Alert]</b> Emergency Protocol is active. Simulated location and telemetry broadcasted to safety network.
        </p>

        {/* Traveler Incident Details Box */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          textAlign: 'left',
          fontSize: '0.82rem',
          color: '#FEE2E2',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div><b>Traveler:</b> {activeScenario.travelerName}</div>
          <div><b>Trigger Source:</b> {emergencyTriggerSource}</div>
          <div><b>Destination:</b> {activeScenario.destinationName}</div>
          <div><b>Coordinates:</b> {currentPos ? currentPos.map(c => c.toFixed(5)).join(', ') : '37.7792, -122.4170'}</div>
        </div>

        {/* Real-time Dispatch Logs Feed */}
        <div className="srg-dispatch-feed">
          <div style={{ color: '#EF4444', fontWeight: '700', marginBottom: '0.4rem' }}>
            [LIVE SIMULATED DISPATCH BROADCAST FEED]
          </div>
          {dispatchLogs.map((log, i) => (
            <div key={i} className="srg-dispatch-item">
              <span>{log}</span>
            </div>
          ))}
        </div>

        {/* Audio Siren Warning & Mute Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem 0.85rem',
          borderRadius: '6px',
          marginBottom: '1.25rem',
          fontSize: '0.78rem',
          color: '#94A3B8'
        }}>
          <span>🔊 Dual-tone Web Audio siren is pulsing (Simulated prototype).</span>
          <button 
            onClick={onToggleMute}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {isMuted ? 'Unmute Siren' : 'Mute Siren'}
          </button>
        </div>

        {/* 5-Second Hold to Cancel Emergency Action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${cancelHoldProgress}%`,
              background: 'rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              transition: 'width 0.05s linear'
            }} />

            <button 
              className="srg-cancel-hold-btn"
              style={{ width: '100%', position: 'relative', zIndex: 2 }}
              onMouseDown={handleCancelStart}
              onMouseUp={handleCancelEnd}
              onMouseLeave={handleCancelEnd}
              onTouchStart={handleCancelStart}
              onTouchEnd={handleCancelEnd}
              onTouchCancel={handleCancelEnd}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span>
                {isHoldingCancel 
                  ? `HOLDING TO CANCEL... (${Math.max(1, 5 - Math.floor(cancelHoldProgress / 20))}s)` 
                  : 'Hold for 5 seconds to Cancel Emergency'}
              </span>
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748B', maxWidth: '440px', marginTop: '0.5rem' }}>
            Disclaimer: This project is a prototype. No real SMS, phone calls, or emergency dispatch calls are made.
          </div>
        </div>
      </div>
    </div>
  );
};
