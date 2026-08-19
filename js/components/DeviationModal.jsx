/**
 * SafeRoute Guardian - Route Deviation Check-In Modal with Fast-Forward Demo
 */

window.DeviationModal = function({
  activeScenario,
  riskData,
  countdownSeconds,
  isFastForwarding,
  onAcknowledgeSafe,
  onFastForwardDemo
}) {
  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="srg-modal-backdrop">
      <div className="srg-checkin-modal">
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.2)',
          color: '#F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.8rem'
        }}>
          ⚠️
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
          Safe Corridor Deviation Detected
        </h3>

        <p style={{ color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          <b>{activeScenario.travelerName}</b> is currently <b>{riskData.distanceOffCorridor}m</b> outside the approved safe corridor.
        </p>

        {/* Explainable AI snippet */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderLeft: '3px solid #F59E0B',
          padding: '0.75rem',
          borderRadius: '0 6px 6px 0',
          textAlign: 'left',
          fontSize: '0.82rem',
          color: '#E2E8F0',
          marginBottom: '1.5rem'
        }}>
          <b>AI Risk Engine Note:</b> {riskData.summary}
        </div>

        {/* Countdown Timer Display */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Escalation to Emergency Network in:
          </div>
          <div className="srg-countdown-display">
            {formatTime(countdownSeconds)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            If unanswered, authorities and emergency contacts will be dispatched automatically.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            className="srg-btn srg-btn-teal"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            onClick={onAcknowledgeSafe}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            I'm Safe — Return to Safe Route
          </button>

          <button 
            className="srg-btn srg-btn-outline"
            style={{ borderColor: '#F59E0B', color: '#FCD34D' }}
            onClick={onFastForwardDemo}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
            {isFastForwarding ? 'Fast-Forwarding (20s Demo)...' : 'Fast-Forward Demo (20s Escalation)'}
          </button>
        </div>
      </div>
    </div>
  );
};
