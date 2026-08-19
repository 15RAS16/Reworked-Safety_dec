/**
 * SafeRoute Guardian - Dedicated Test & Demo Simulation Panel Modal
 * Controlled competition demonstration panel for all authenticated roles.
 * Includes safe simulations:
 * - Normal safe route
 * - Minor route deviation
 * - High-risk deviation
 * - Safety check-in prompt
 * - Emergency SOS simulation
 * - Return to route
 * - Fast demo timeout
 * - Reset Demo
 * 
 * GUARANTEES:
 * - Zero real SMS or 911/emergency dispatch
 * - Zero real user GPS overrides
 * - Safe mock data restoration on Reset
 */

window.TestDemoModal = function({
  isOpen,
  onClose,
  currentRole = 'tourist',
  orgPermission = 'staff',
  activeScenario,
  onTriggerDemoStep,
  onResetDemo
}) {
  if (!isOpen) return null;

  const travelerName = (activeScenario && activeScenario.travelerName) || 'Traveler';

  const handleAction = (stepKey) => {
    if (onTriggerDemoStep) {
      onTriggerDemoStep(stepKey);
    }
  };

  const handleReset = () => {
    if (onResetDemo) {
      onResetDemo();
    } else if (onTriggerDemoStep) {
      onTriggerDemoStep('SAFE_ON_ROUTE');
    }
  };

  return (
    <div className="srg-modal-backdrop" onClick={onClose}>
      <div className="srg-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '1.8rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>⚡</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                Test & Demo Simulation Suite
              </h2>
              <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: '700' }}>
                Active Target: {travelerName} ({currentRole.toUpperCase()})
              </span>
            </div>
          </div>
          <button
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={onClose}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.85rem' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Safety & Simulation Notice */}
        <div className="srg-competition-notice" style={{ margin: '0.5rem 0 1.2rem 0' }}>
          <span>🛡️</span>
          <span>
            <b>Demo / Competition Mode</b> — All simulation actions are completely isolated. No emergency services, police, or SMS broadcasts are contacted.
          </span>
        </div>

        {/* Simulation Actions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {/* Action 1: Normal safe route */}
          <button
            type="button"
            className="srg-sim-action-btn"
            onClick={() => handleAction('SAFE_ON_ROUTE')}
          >
            <span style={{ fontSize: '1.4rem' }}>🟢</span>
            <div>
              <b style={{ color: '#FFFFFF', display: 'block' }}>Normal Safe Route</b>
              <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Position traveler safely within corridor buffer</small>
            </div>
          </button>

          {/* Action 2: Minor route deviation */}
          <button
            type="button"
            className="srg-sim-action-btn"
            onClick={() => handleAction('MINOR_DEVIATION')}
          >
            <span style={{ fontSize: '1.4rem' }}>🟡</span>
            <div>
              <b style={{ color: '#FFFFFF', display: 'block' }}>Minor Route Deviation</b>
              <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Simulate slight drift (~120m outside corridor)</small>
            </div>
          </button>

          {/* Action 3: High-risk deviation */}
          <button
            type="button"
            className="srg-sim-action-btn"
            onClick={() => handleAction('SEVERE_DEVIATION')}
          >
            <span style={{ fontSize: '1.4rem' }}>🟠</span>
            <div>
              <b style={{ color: '#FFFFFF', display: 'block' }}>High-Risk Deviation</b>
              <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Simulate severe drift (~450m) & check-in prompt</small>
            </div>
          </button>

          {/* Action 4: Return to route */}
          <button
            type="button"
            className="srg-sim-action-btn"
            onClick={() => handleAction('RETURN_TO_ROUTE')}
          >
            <span style={{ fontSize: '1.4rem' }}>🔄</span>
            <div>
              <b style={{ color: '#FFFFFF', display: 'block' }}>Return to Route</b>
              <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Heading vector returns toward safe corridor</small>
            </div>
          </button>

          {/* Action 5: Fast demo timeout */}
          <button
            type="button"
            className="srg-sim-action-btn fast"
            onClick={() => handleAction('FAST_FORWARD_TIMEOUT')}
          >
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
            <div>
              <b style={{ color: '#FCD34D', display: 'block' }}>Fast Demo Timeout</b>
              <small style={{ color: '#FDE68A', fontSize: '0.72rem' }}>Accelerate countdown to 20-second escalation</small>
            </div>
          </button>

          {/* Action 6: Emergency SOS */}
          <button
            type="button"
            className="srg-sim-action-btn emergency"
            onClick={() => handleAction('SOS_TRIGGER')}
          >
            <span style={{ fontSize: '1.4rem' }}>🚨</span>
            <div>
              <b style={{ color: '#FCA5A5', display: 'block' }}>Emergency SOS Simulation</b>
              <small style={{ color: '#FECACA', fontSize: '0.72rem' }}>Trigger full siren panic & emergency overlay</small>
            </div>
          </button>
        </div>

        {/* Footer: Reset Demo & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.4rem', paddingTop: '1rem', borderTop: '1px solid #1E293B' }}>
          <button
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={handleReset}
            style={{ color: '#94A3B8' }}
          >
            🔄 Reset Demo Scenario
          </button>

          <button
            type="button"
            className="srg-btn srg-btn-primary srg-btn-sm"
            onClick={onClose}
          >
            Done Testing
          </button>
        </div>
      </div>
    </div>
  );
};
