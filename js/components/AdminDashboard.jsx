/**
 * SafeRoute Guardian - Administrator & Organization Command Center Component
 * Provides map monitoring, safe route buffer editor, incident logs, safety contacts, and AI risk panel.
 */

window.AdminDashboard = function({
  initialTab = 'monitor',
  roleId = 'admin',
  onBackToWorkspace,
  activeScenario,
  scenarios = [],
  onSelectScenario,
  riskData,
  currentPos,
  journeyState,
  onTriggerDemoStep,
  alerts = [],
  onClearAlerts,
  contacts = [],
  onAddContact,
  onUpdateScenarioRoute,
  onTestEmergency,
  localHelpRequests = [],
  journeyTimeline = [],
  safeBeacon = null
}) {
  const [activeTab, setActiveTab] = React.useState(initialTab); // 'monitor' | 'routes' | 'alerts' | 'contacts' | 'ai-engine'
  const [showRouteModal, setShowRouteModal] = React.useState(false);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [simulatedDispatchToast, setSimulatedDispatchToast] = React.useState(null);

  // Sync tab if initialTab changes
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // New Route Form State
  const [newRouteForm, setNewRouteForm] = React.useState({
    name: 'New Custom Route',
    originName: 'Downtown Station',
    destinationName: 'Tech Campus',
    corridorWidthMeters: 100,
    escalationTimeoutMinutes: 15,
    isNightTime: false
  });

  // New Contact Form State
  const [newContactForm, setNewContactForm] = React.useState({
    name: '',
    relation: 'Guardian / Safety Contact',
    phone: '',
    email: '',
    notifySms: true,
    notifyCall: true
  });

  // Calculate Metrics
  const activeCount = scenarios.length;
  const safeCount = riskData && riskData.level.key === 'SAFE' ? 2 : 1;
  const deviationCount = riskData && (riskData.level.key === 'CAUTION' || riskData.level.key === 'HIGH_RISK') ? 1 : 0;
  const emergencyCount = riskData && riskData.level.key === 'EMERGENCY' ? 1 : 0;

  const handleTestDispatch = (contact) => {
    setSimulatedDispatchToast(`[Demo / Simulated] SMS Alert sent to ${contact.name} (${contact.phone}): "SafeRoute Guardian test alert verified."`);
    setTimeout(() => setSimulatedDispatchToast(null), 4000);
  };

  const roleTitle = roleId === 'organization' ? 'Organization Command Center' : roleId === 'parent' ? 'Parent / Guardian Monitor' : 'Administrator Command Center';

  return (
    <div className="srg-admin-view">
      {/* Top Workspace Navigation */}
      <div className="srg-workspace-topbar" style={{ marginBottom: '1.25rem' }}>
        <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Feature Workspace
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontSize: '0.85rem', fontWeight: '700' }}>
          <span>🛡️</span>
          <span>{roleTitle}</span>
        </div>
      </div>

      {/* Simulated Notice Banner */}
      <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#38BDF8', fontWeight: '700' }}>[Demo / Simulated Prototype]</span>
        <span>All emergency broadcasts, SMS dispatches, and 911 CAD transmissions are simulated in this browser interface.</span>
      </div>

      {/* Overview Metrics Bar */}
      <div className="srg-metrics-grid">
        <div className="srg-metric-card" style={{ borderLeft: '4px solid #38BDF8' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Active Journeys</span>
            <span className="srg-metric-value" style={{ color: '#FFFFFF' }}>{activeCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Safe Travelers</span>
            <span className="srg-metric-value" style={{ color: '#10B981' }}>{safeCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
        </div>

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Route Deviations</span>
            <span className="srg-metric-value" style={{ color: '#F59E0B' }}>{deviationCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Emergency Alerts</span>
            <span className="srg-metric-value" style={{ color: '#EF4444' }}>{emergencyCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
        </div>
      </div>

      {/* Demo Controls Bar */}
      <div className="srg-demo-bar">
        <div className="srg-demo-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Demo Controls:</span>
        </div>

        <div className="srg-demo-actions">
          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('SAFE_ON_ROUTE')}
            title="Move traveler safely along approved corridor"
          >
            🟢 Safe on Route
          </button>

          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('MINOR_DEVIATION')}
            title="Simulate slight drift (~140m outside corridor)"
          >
            🟡 Minor Deviation
          </button>

          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('SEVERE_DEVIATION')}
            title="Simulate significant off-route drift (~450m) triggering check-in"
          >
            🟠 High Risk Drift
          </button>

          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('RETURN_TO_ROUTE')}
            title="Simulate traveler heading back toward safe corridor"
          >
            🔄 Return to Corridor
          </button>

          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            style={{ borderColor: '#F59E0B', color: '#FCD34D' }}
            onClick={() => onTriggerDemoStep('FAST_FORWARD_TIMEOUT')}
            title="Fast forward 15-minute countdown into 20-second escalation"
          >
            ⚡ Fast-Forward Timeout
          </button>

          <button 
            className="srg-btn srg-btn-emergency srg-btn-sm"
            onClick={() => onTriggerDemoStep('SOS_TRIGGER')}
            title="Trigger instant emergency SOS panic"
          >
            🚨 SOS Panic
          </button>

          <button 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={onTestEmergency}
            title="Test full emergency flow without loud sound"
          >
            🧪 Test Emergency (Demo)
          </button>
        </div>
      </div>

      {/* Simulated Dispatch Toast */}
      {simulatedDispatchToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{simulatedDispatchToast}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="srg-tabs-bar">
        <button 
          className={`srg-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          Live Map Monitor
        </button>

        <button 
          className={`srg-tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Safe Routes ({scenarios.length})
        </button>

        <button 
          className={`srg-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          Live Alerts & Logs ({alerts.length})
        </button>

        <button 
          className={`srg-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Emergency Contacts ({contacts.length})
        </button>

        <button 
          className={`srg-tab-btn ${activeTab === 'ai-engine' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-engine')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/></svg>
          AI Risk Engine Telemetry
        </button>

        <button
          className={`srg-tab-btn ${activeTab === 'local-help' ? 'active' : ''}`}
          onClick={() => setActiveTab('local-help')}
        >
          🤝 Local Help Monitor ({localHelpRequests.length})
        </button>

        <button className={`srg-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>◷ Journey Timeline ({journeyTimeline.length})</button>
      </div>

      {/* Tab 1: Live Map Monitor */}
      {activeTab === 'monitor' && (
        <div className="srg-admin-grid">
          <div className="srg-map-wrapper">
            <div className="srg-map-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
                <span style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.9rem' }}>{activeScenario.routeName}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Corridor Buffer: <b style={{ color: '#38BDF8' }}>{activeScenario.corridorWidthMeters}m</b> | Timeout: <b style={{ color: '#F59E0B' }}>{activeScenario.escalationTimeoutMinutes}m</b>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', minHeight: '440px' }}>
              <window.InteractiveMap 
                mapId="admin-main-map"
                routeWaypoints={activeScenario.routeWaypoints}
                corridorWidthMeters={activeScenario.corridorWidthMeters}
                currentPos={currentPos}
                travelerName={activeScenario.travelerName}
                travelerAvatar={activeScenario.avatar}
                safetyLevel={riskData ? riskData.level.key : 'SAFE'}
                isDeviation={riskData && riskData.distanceOffCorridor > 0}
                originName={activeScenario.originName}
                destinationName={activeScenario.destinationName}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'var(--bg-card-dark)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{activeScenario.avatar}</span>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>{activeScenario.travelerName}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>{activeScenario.travelerRole}</div>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Corridor Offset</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: riskData.distanceOffCorridor > 0 ? '#F59E0B' : '#10B981' }}>
                    {riskData.distanceOffCorridor > 0 ? `${riskData.distanceOffCorridor}m outside` : 'Within safe corridor'}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Time Off-Route</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF' }}>
                    {journeyState.timeOffRouteSeconds} seconds
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Check-in Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: journeyState.checkinStatus === 'PENDING' ? '#F59E0B' : '#38BDF8' }}>
                    {journeyState.checkinStatus}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Risk Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: riskData.level.color, fontFamily: 'var(--font-mono)' }}>
                    {riskData.score} / 100
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderLeft: `3px solid ${riskData.level.color}`,
                padding: '0.75rem',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.82rem',
                color: '#E2E8F0',
                marginBottom: '1rem'
              }}>
                <b>AI Assessment:</b> {riskData.summary}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="srg-btn srg-btn-primary srg-btn-sm" 
                  style={{ flex: 1 }}
                  onClick={() => handleTestDispatch(contacts[0] || { name: activeScenario.guardianName, phone: activeScenario.guardianPhone })}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Alert Guardian (Simulated)
                </button>

                <button 
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  onClick={() => onTriggerDemoStep('SAFE_ON_ROUTE')}
                  title="Reset traveler position"
                >
                  Reset Position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Safe Routes Manager */}
      {activeTab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF' }}>Safe Corridors & Geofence Boundaries</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Manage approved route corridors, safe buffer widths, and default escalation limits.</p>
            </div>
            <button className="srg-btn srg-btn-primary" onClick={() => setShowRouteModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Safe Route
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {scenarios.map(sc => (
              <div 
                key={sc.id}
                style={{
                  background: 'var(--bg-card-dark)',
                  border: `1px solid ${activeScenario.id === sc.id ? '#38BDF8' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{sc.avatar}</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
                      Buffer: {sc.corridorWidthMeters}m
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.25rem' }}>{sc.routeName}</h4>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1rem' }}>
                    Assigned: <b style={{ color: '#F1F5F9' }}>{sc.travelerName}</b> ({sc.travelerRole})
                  </p>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '1rem' }}>
                    <div>📍 <b>Start:</b> {sc.originName}</div>
                    <div style={{ marginTop: '0.3rem' }}>🏁 <b>Destination:</b> {sc.destinationName}</div>
                    <div style={{ marginTop: '0.3rem' }}>⏱ <b>Escalation Window:</b> {sc.escalationTimeoutMinutes} minutes</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`srg-btn ${activeScenario.id === sc.id ? 'srg-btn-primary' : 'srg-btn-outline'} srg-btn-sm`}
                    style={{ flex: 1 }}
                    onClick={() => onSelectScenario(sc)}
                  >
                    {activeScenario.id === sc.id ? 'Active Route' : 'Set as Active'}
                  </button>

                  <button 
                    className="srg-btn srg-btn-outline srg-btn-sm"
                    onClick={() => {
                      const newWidth = prompt('Enter new corridor buffer width in meters (e.g. 50, 100, 200):', sc.corridorWidthMeters);
                      if (newWidth && !isNaN(newWidth)) {
                        onUpdateScenarioRoute(sc.id, { corridorWidthMeters: parseInt(newWidth, 10) });
                      }
                    }}
                  >
                    Edit Buffer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Live Alerts & Audit History */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF' }}>Live Incident & Audit Feed</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Real-time logs of deviations, check-in responses, SOS triggers, and cancellations.</p>
            </div>
            <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onClearAlerts}>
              Clear History
            </button>
          </div>

          <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                No active alert events recorded. All travelers are on safe routes.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {alerts.map((al, idx) => (
                  <div key={al.id || idx} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: al.severity === 'emergency' ? 'rgba(239, 68, 68, 0.2)' : al.severity === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: al.severity === 'emergency' ? '#EF4444' : al.severity === 'warning' ? '#F59E0B' : '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {al.severity === 'emergency' ? '🚨' : al.severity === 'warning' ? '⚠️' : '✅'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: '700', color: '#FFFFFF' }}>{al.travelerName}</span>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                            {new Date(al.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{al.message}</div>
                        {al.resolvedBy && (
                          <div style={{ fontSize: '0.75rem', color: '#38BDF8', marginTop: '0.25rem' }}>
                            Resolution: {al.resolvedBy}
                          </div>
                        )}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: al.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: al.status === 'ACTIVE' ? '#EF4444' : '#10B981'
                    }}>
                      {al.status || 'LOGGED'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Emergency Contacts & Dispatch */}
      {activeTab === 'contacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF' }}>Safety Network & Escalation Contacts</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Trusted guardians, school administrators, and simulated CAD authority dispatch feeds.</p>
            </div>
            <button className="srg-btn srg-btn-primary" onClick={() => setShowContactModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Safety Contact
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {contacts.map(c => (
              <div 
                key={c.id}
                style={{
                  background: 'var(--bg-card-dark)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '700' }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF' }}>{c.name}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#38BDF8' }}>{c.relation}</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '1rem' }}>
                    <div>📞 <b>Phone:</b> {c.phone}</div>
                    <div style={{ marginTop: '0.3rem' }}>✉️ <b>Email:</b> {c.email}</div>
                    <div style={{ marginTop: '0.3rem' }}>
                      ⚡ <b>Channels:</b> {c.notifySms ? '📱 SMS (Simulated) ' : ''} {c.notifyCall ? '📞 Voice ' : ''}
                    </div>
                  </div>
                </div>

                <button 
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  onClick={() => handleTestDispatch(c)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  Simulate Alert Broadcast
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: AI Risk Engine Telemetry */}
      {activeTab === 'ai-engine' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="srg-ai-panel">
            <div className="srg-ai-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
                AI Safety Risk Score
              </h3>
              <span className="srg-status-pill" style={{ background: riskData.level.bg, border: `1px solid ${riskData.level.border}`, color: riskData.level.color }}>
                {riskData.level.label}
              </span>
            </div>

            <div className="srg-ai-score-card">
              <div className="srg-ai-gauge-score" style={{ color: riskData.level.color }}>
                {riskData.score}
                <span style={{ fontSize: '1.2rem', color: '#94A3B8' }}> / 100</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                Dynamic safety assessment based on 6 contextual signals
              </div>
            </div>

            <div className="srg-ai-explanation-box">
              <div style={{ fontWeight: '700', color: '#38BDF8', marginBottom: '0.25rem' }}>Explainable Assessment</div>
              {riskData.summary}
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.75rem' }}>
                Contributing Safety Factors
              </h4>

              {riskData.factors.map((f, i) => (
                <div key={i} className="srg-factor-item">
                  <div className="srg-factor-meta">
                    <span style={{ color: '#F1F5F9', fontWeight: '600' }}>{f.name}</span>
                    <span style={{ color: f.isAlert ? '#F59E0B' : '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      {f.score} / {f.max} pts
                    </span>
                  </div>
                  <div className="srg-factor-bar-bg">
                    <div 
                      className="srg-factor-bar-fill"
                      style={{ 
                        width: `${Math.min(100, (f.score / f.max) * 100)}%`,
                        background: f.isAlert ? '#F59E0B' : '#38BDF8'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{f.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="srg-ai-panel">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>AI Risk Scoring Architecture</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6' }}>
              SafeRoute Guardian uses a deterministic contextual model calculating composite risk across geographic offset, time duration, movement vectors, diurnal hazard factors, and check-in response behavior.
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#CBD5E1' }}>
              <div style={{ color: '#38BDF8', fontWeight: '700', marginBottom: '0.5rem' }}>Formula Weights:</div>
              <div>• Corridor Geofence Offset: <b>Max 35 pts</b></div>
              <div>• Off-Route Duration Decay: <b>Max 25 pts</b></div>
              <div>• Trajectory Vector Drift: <b>Max 15 pts</b></div>
              <div>• Night / Low-Visibility Window: <b>Max 15 pts</b></div>
              <div>• Check-In Response State: <b>Max 20 pts</b></div>
              <div>• SOS / Timeout Override: <b>Instant 100 pts</b></div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.82rem',
              color: '#FCD34D'
            }}>
              <b>Prototype Safety Disclaimer (Demo / Simulated):</b><br />
              This prototype provides safety assistance and should not replace emergency services. In an immediate emergency, call local emergency services (911 / 112).
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Local Help Request Monitor */}
      {activeTab === 'local-help' && (
        <div className="srg-ai-panel">
          <div className="srg-ai-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>Local Help Request Monitor</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '0.3rem' }}>Tourist assistance requests are visible here. Exact location is visible only when a traveler explicitly approves sharing.</p>
            </div>
            <span className="srg-status-pill" style={{ background: 'rgba(20,184,166,.14)', border: '1px solid rgba(20,184,166,.35)', color: '#5EEAD4' }}>Verified Network</span>
          </div>
          {localHelpRequests.length === 0 ? (
            <div className="srg-empty-request">No Local Help requests have been submitted yet. Requests from Tourist Mode will appear here in real time.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {localHelpRequests.map(request => (
                <div key={request.id} style={{ background: 'rgba(15,23,42,.75)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}><b style={{ color: '#FFFFFF' }}>{request.travelerName}</b><span className={'srg-request-status ' + request.status.toLowerCase()}>{request.status.replaceAll('_', ' ')}</span></div>
                    <div style={{ color: '#5EEAD4', fontSize: '.78rem', marginTop: '.4rem', fontWeight: '700' }}>Helper: {request.helperName} · {request.helperType}</div>
                    <p style={{ color: '#CBD5E1', fontSize: '.82rem', margin: '.45rem 0 0' }}>“{request.message}”</p>
                  </div>
                  <div style={{ alignSelf: 'center', color: request.shareLocation ? '#6EE7B7' : '#94A3B8', fontSize: '.75rem', whiteSpace: 'nowrap' }}>{request.shareLocation ? '📍 Location shared' : '🔒 Location private'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && <window.JourneyTimeline timeline={journeyTimeline} activeScenario={activeScenario} safeBeacon={safeBeacon} />}

      {/* Modal: Create Safe Route */}
      {showRouteModal && (
        <div className="srg-modal-backdrop" onClick={() => setShowRouteModal(false)}>
          <div className="srg-checkin-modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem' }}>Create New Safe Route Corridor</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Route Title</label>
                <input 
                  type="text" 
                  value={newRouteForm.name} 
                  onChange={e => setNewRouteForm({ ...newRouteForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Origin Point</label>
                  <input 
                    type="text" 
                    value={newRouteForm.originName} 
                    onChange={e => setNewRouteForm({ ...newRouteForm, originName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Destination</label>
                  <input 
                    type="text" 
                    value={newRouteForm.destinationName} 
                    onChange={e => setNewRouteForm({ ...newRouteForm, destinationName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Corridor Buffer (Meters)</label>
                  <input 
                    type="number" 
                    value={newRouteForm.corridorWidthMeters} 
                    onChange={e => setNewRouteForm({ ...newRouteForm, corridorWidthMeters: parseInt(e.target.value, 10) || 100 })}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Escalation Timeout (Mins)</label>
                  <input 
                    type="number" 
                    value={newRouteForm.escalationTimeoutMinutes} 
                    onChange={e => setNewRouteForm({ ...newRouteForm, escalationTimeoutMinutes: parseInt(e.target.value, 10) || 15 })}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="srg-btn srg-btn-outline" onClick={() => setShowRouteModal(false)}>Cancel</button>
              <button 
                className="srg-btn srg-btn-primary"
                onClick={() => {
                  alert(`Safe Route "${newRouteForm.name}" created with ${newRouteForm.corridorWidthMeters}m corridor buffer.`);
                  setShowRouteModal(false);
                }}
              >
                Save Corridor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Safety Contact */}
      {showContactModal && (
        <div className="srg-modal-backdrop" onClick={() => setShowContactModal(false)}>
          <div className="srg-checkin-modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem' }}>Add Emergency Safety Contact</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Contact Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Elena Smith"
                  value={newContactForm.name} 
                  onChange={e => setNewContactForm({ ...newContactForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Relationship / Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Primary Guardian / Campus Dispatch"
                  value={newContactForm.relation} 
                  onChange={e => setNewContactForm({ ...newContactForm, relation: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    value={newContactForm.phone} 
                    onChange={e => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="contact@example.com"
                    value={newContactForm.email} 
                    onChange={e => setNewContactForm({ ...newContactForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="srg-btn srg-btn-outline" onClick={() => setShowContactModal(false)}>Cancel</button>
              <button 
                className="srg-btn srg-btn-primary"
                onClick={() => {
                  if (newContactForm.name && onAddContact) {
                    onAddContact({
                      id: 'c-' + Date.now(),
                      ...newContactForm
                    });
                  }
                  setShowContactModal(false);
                }}
              >
                Add to Network
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
