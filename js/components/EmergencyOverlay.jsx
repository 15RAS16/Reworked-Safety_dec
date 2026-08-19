/**
 * SafeRoute Guardian - Full-Screen Emergency Overlay Component
 * High-contrast emergency display with dual-tone Web Audio siren,
 * 5-second hold cancellation progress ring, siren mute toggle, and simulated CAD logs.
 */

window.EmergencyOverlay = function({
  isOpen,
  onCancelEmergency,
  activeScenario,
  currentPos,
  riskData,
  triggerSource = 'SOS_BUTTON'
}) {
  const [cancelProgress, setCancelProgress] = React.useState(0);
  const [isHoldingCancel, setIsHoldingCancel] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  const cancelTimerRef = React.useRef(null);
  const startTimeRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      if (!isMuted && window.AudioService) {
        window.AudioService.startSiren();
      }
    } else {
      if (window.AudioService) {
        window.AudioService.stopSiren();
      }
    }
    return () => {
      if (window.AudioService) {
        window.AudioService.stopSiren();
      }
    };
  }, [isOpen, isMuted]);

  if (!isOpen) return null;

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      window.AudioService && window.AudioService.startSiren();
    } else {
      setIsMuted(true);
      window.AudioService && window.AudioService.stopSiren();
    }
  };

  // 5-second hold to cancel emergency
  const startCancelHold = () => {
    setIsHoldingCancel(true);
    startTimeRef.current = Date.now();
    window.AudioService && window.AudioService.playTick();

    cancelTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / 5000) * 100);
      setCancelProgress(pct);

      if (pct >= 100) {
        clearInterval(cancelTimerRef.current);
        setIsHoldingCancel(false);
        setCancelProgress(0);
        window.AudioService && window.AudioService.stopSiren();
        window.AudioService && window.AudioService.playSafeChime();
        onCancelEmergency();
      }
    }, 40);
  };

  const stopCancelHold = () => {
    if (cancelTimerRef.current) {
      clearInterval(cancelTimerRef.current);
    }
    setIsHoldingCancel(false);
    setCancelProgress(0);
  };

  const coordsText = currentPos ? `${currentPos[0].toFixed(5)}, ${currentPos[1].toFixed(5)}` : '37.77490, -122.41940';

  return (
    <div className="srg-emergency-overlay">
      <div className="srg-emergency-card">
        {/* Permanent Simulated Badge */}
        <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
          ⚠️ DEMO / SIMULATED EMERGENCY — No real emergency services or 911 dispatch contacted
        </div>

        {/* Emergency Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div className="srg-emergency-pulsing-icon">🚨</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#EF4444', margin: '0.3rem 0' }}>
            EMERGENCY PROTOCOL ACTIVATED
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
            Simulated high-priority alert broadcasted to emergency network & campus safety dispatch.
          </p>
        </div>

        {/* Live Incident Telemetry */}
        <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '1rem', marginBottom: '1.2rem', fontSize: '0.82rem', color: '#CBD5E1', display: 'grid', gap: '0.4rem' }}>
          <div>👤 <b>Traveler:</b> {activeScenario.travelerName} ({activeScenario.travelerRole})</div>
          <div>📍 <b>GPS Coordinates:</b> <span style={{ fontFamily: 'monospace', color: '#38BDF8' }}>{coordsText}</span></div>
          <div>🛤️ <b>Corridor:</b> {activeScenario.routeName}</div>
          <div>⚡ <b>Trigger Source:</b> {triggerSource.replace('_', ' ')}</div>
          <div>🕒 <b>Timestamp:</b> {new Date().toLocaleTimeString()}</div>
        </div>

        {/* Audio Siren Mute Control */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
          <button
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={toggleMute}
            style={{ color: '#FFFFFF', borderColor: '#475569' }}
          >
            {isMuted ? '🔊 Unmute Siren Sound' : '🔇 Mute Audio Siren'}
          </button>
        </div>

        {/* Hold for 5 Seconds to Cancel Emergency */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            className={`srg-btn srg-btn-cancel-hold ${isHoldingCancel ? 'holding' : ''}`}
            onMouseDown={startCancelHold}
            onMouseUp={stopCancelHold}
            onMouseLeave={stopCancelHold}
            onTouchStart={startCancelHold}
            onTouchEnd={stopCancelHold}
            style={{ width: '100%', position: 'relative', overflow: 'hidden', padding: '0.9rem 1.2rem', fontSize: '0.9rem', fontWeight: '800', background: '#1E293B', color: '#FFFFFF', border: '1px solid #475569', borderRadius: '10px' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${cancelProgress}%`,
                background: '#10B981',
                opacity: 0.3,
                transition: 'width 0.05s linear'
              }}
            />
            <span style={{ position: 'relative', zIndex: 2 }}>
              {isHoldingCancel ? `Holding to Cancel (${Math.round(cancelProgress)}%)...` : 'Hold for 5s to Cancel Emergency'}
            </span>
          </button>
          <small style={{ color: '#94A3B8', fontSize: '0.72rem', display: 'block', marginTop: '0.4rem' }}>
            Prevents accidental deactivation while logging resolution in audit history.
          </small>
        </div>
      </div>
    </div>
  );
};
