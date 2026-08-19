/**
 * SafeRoute Guardian - Organization Command Center & Admin Dashboard
 * Provides Live Map Monitoring, Safe Route Corridor Editor, Incident Logs,
 * Emergency Contacts, AI Risk Engine Telemetry, Organization Member Roster, and Simulation Controls.
 */

window.AdminDashboard = function({
  initialTab = 'monitor',
  roleId = 'organization',
  orgPermission = 'admin',
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
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [showRouteModal, setShowRouteModal] = React.useState(false);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [showMemberModal, setShowMemberModal] = React.useState(false);
  const [simulatedDispatchToast, setSimulatedDispatchToast] = React.useState(null);

  // Organization Members State
  const [orgMembers, setOrgMembers] = React.useState(() => window.StorageService.getOrgMembers());
  const [newMemberForm, setNewMemberForm] = React.useState({
    name: '',
    email: '',
    role: 'staff',
    title: 'Field Safety Officer'
  });

  // Sync tab if initialTab changes
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // New Route Form State
  const [newRouteForm, setNewRouteForm] = React.useState({
    name: 'New Campus Corridor',
    originName: 'West Gate Terminal',
    destinationName: 'Main Science Complex',
    corridorWidthMeters: 100,
    escalationTimeoutMinutes: 15,
    isNightTime: false
  });

  // New Contact Form State
  const [newContactForm, setNewContactForm] = React.useState({
    name: '',
    relation: 'Safety Officer / Dispatch',
    phone: '',
    email: '',
    notifySms: true,
    notifyCall: true
  });

  // Metrics
  const activeCount = scenarios.length;
  const safeCount = riskData && riskData.level.key === 'SAFE' ? 2 : 1;
  const deviationCount = riskData && (riskData.level.key === 'CAUTION' || riskData.level.key === 'HIGH_RISK') ? 1 : 0;
  const emergencyCount = riskData && riskData.level.key === 'EMERGENCY' ? 1 : 0;

  const handleTestDispatch = (contact) => {
    setSimulatedDispatchToast(`[Demo / Simulated] SMS Alert sent to ${contact.name} (${contact.phone}): "SafeRoute Guardian test alert verified."`);
    setTimeout(() => setSimulatedDispatchToast(null), 4000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberForm.name || !newMemberForm.email) return;
    const created = window.StorageService.addOrgMember('default', newMemberForm);
    setOrgMembers(prev => [created, ...prev]);
    setShowMemberModal(false);
    setNewMemberForm({ name: '', email: '', role: 'staff', title: 'Field Safety Officer' });
  };

  const handleRemoveMember = (memberId) => {
    const updated = window.StorageService.removeOrgMember('default', memberId);
    setOrgMembers(updated);
  };

  const roleTitle = roleId === 'parent'
    ? 'Parent / Guardian Family Monitor'
    : (orgPermission === 'admin' ? 'Organization Command Center (Admin)' : 'Staff Monitoring Console');

  return (
    <div className="srg-admin-view">
      {/* Top Workspace Navigation */}
      <div className="srg-workspace-topbar" style={{ marginBottom: '1.25rem' }}>
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Feature Workspace
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontSize: '0.85rem', fontWeight: '700' }}>
          <span>🛡️</span>
          <span>{roleTitle}</span>
        </div>
      </div>

      {/* Simulated Notice Banner */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        marginBottom: '1.25rem',
        fontSize: '0.78rem',
        color: '#94A3B8',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ color: '#38BDF8', fontWeight: '700' }}>[Demo / Simulated Prototype]</span>
        <span>All emergency broadcasts, SMS dispatches, CAD 911/112 transmissions, and sensor triggers are simulated for browser demonstration.</span>
      </div>

      {/* Overview Metrics Bar */}
      <div className="srg-metrics-grid">
        <div className="srg-metric-card" style={{ borderLeft: '4px solid #38BDF8' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Active Monitored Journeys</span>
            <span className="srg-metric-value" style={{ color: '#FFFFFF' }}>{activeCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Safe in Corridor</span>
            <span className="srg-metric-value" style={{ color: '#10B981' }}>{safeCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
        </div>

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Corridor Deviations</span>
            <span className="srg-metric-value" style={{ color: '#F59E0B' }}>{deviationCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Emergency Alerts</span>
            <span className="srg-metric-value" style={{ color: '#EF4444' }}>{emergencyCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Demo Controls Bar (Always available for interactive evaluation) */}
      <div className="srg-demo-bar">
        <div className="srg-demo-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Simulation Suite:</span>
        </div>

        <div className="srg-demo-actions">
          <button 
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('SAFE_ON_ROUTE')}
            title="Move traveler safely along approved corridor"
          >
            🟢 Safe on Route
          </button>

          <button 
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('MINOR_DEVIATION')}
            title="Simulate slight drift (~140m outside corridor)"
          >
            🟡 Minor Deviation
          </button>

          <button 
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('SEVERE_DEVIATION')}
            title="Simulate significant off-route drift (~450m) triggering check-in"
          >
            🟠 High Risk Drift
          </button>

          <button 
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('RETURN_TO_ROUTE')}
            title="Simulate traveler heading back toward safe corridor"
          >
            🔄 Return to Corridor
          </button>

          <button 
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            style={{ borderColor: '#F59E0B', color: '#FCD34D' }}
            onClick={() => onTriggerDemoStep('FAST_FORWARD_TIMEOUT')}
            title="Fast forward 15-minute countdown into 20-second escalation"
          >
            ⚡ Fast-Forward Timeout
          </button>

          <button 
            type="button"
            className="srg-btn srg-btn-emergency srg-btn-sm"
            onClick={() => onTriggerDemoStep('SOS_TRIGGER')}
            title="Trigger instant emergency SOS panic"
          >
            🚨 SOS Panic
          </button>

          <button 
            type="button"
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{simulatedDispatchToast}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="srg-tabs-bar">
        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          Live Map Monitor
        </button>

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Safe Routes ({scenarios.length})
        </button>

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          Live Alerts & Logs ({alerts.length})
        </button>

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Safety Network ({contacts.length})
        </button>

        {orgPermission === 'admin' && (
          <button
            type="button"
            className={`srg-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            👥 Member & Staff Roster ({orgMembers.length})
          </button>
        )}

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'ai-engine' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-engine')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4"/>
            <path d="m4.93 4.93 2.83 2.83"/>
            <path d="M2 12h4"/>
            <path d="m4.93 19.07 2.83-2.83"/>
            <path d="M12 22v-4"/>
            <path d="m19.07 19.07-2.83-2.83"/>
            <path d="M22 12h-4"/>
            <path d="m19.07 4.93-2.83 2.83"/>
          </svg>
          AI Risk Telemetry
        </button>

        <button
          type="button"
          className={`srg-tab-btn ${activeTab === 'local-help' ? 'active' : ''}`}
          onClick={() => setActiveTab('local-help')}
        >
          🤝 Local Help Monitor ({localHelpRequests.length})
        </button>

        <button
          type="button"
          className={`srg-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          ◷ Journey Timeline ({journeyTimeline.length})
        </button>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div style={{ background: '#0F172A', padding: '0.65rem', borderRadius: '8px', border: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem' }}>Risk Score</span>
                  <b style={{ color: riskData.level.color, fontSize: '1.1rem' }}>{riskData.score} / 100</b>
                </div>
                <div style={{ background: '#0F172A', padding: '0.65rem', borderRadius: '8px', border: '1px solid #1E293B' }}>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem' }}>Corridor Offset</span>
                  <b style={{ color: riskData.distanceOffCorridor > 0 ? '#F59E0B' : '#10B981', fontSize: '1.1rem' }}>
                    {riskData.distanceOffCorridor > 0 ? `${riskData.distanceOffCorridor}m outside` : '0m (Within corridor)'}
                  </b>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.45' }}>
                <b>Primary Risk Factor:</b> {riskData.primaryFactor}
              </div>
            </div>

            {/* Quick Emergency Gateway Dispatches */}
            <div style={{
              background: 'var(--bg-card-dark)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.75rem' }}>
                Simulated Safety Broadcast Contacts
              </h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {contacts.slice(0, 2).map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#0F172A', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <div>
                      <b style={{ color: '#FFFFFF' }}>{c.name}</b>
                      <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem' }}>{c.relation} ({c.phone})</span>
                    </div>
                    <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={() => handleTestDispatch(c)}>
                      Test SMS
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Safe Routes & Corridor Editor */}
      {activeTab === 'routes' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>Approved Safe Routes & Corridors</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Configure geofence buffers (50m–500m) and default escalation timeout thresholds.</p>
            </div>
            <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setShowRouteModal(true)}>
              + Add Custom Route
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {scenarios.map((sc) => (
              <div key={sc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{sc.avatar}</span>
                    <b style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{sc.routeName}</b>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                      {sc.travelerName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Origin: {sc.originName} → Destination: {sc.destinationName}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Corridor Width</div>
                    <b style={{ color: '#38BDF8' }}>{sc.corridorWidthMeters} meters</b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Timeout</div>
                    <b style={{ color: '#F59E0B' }}>{sc.escalationTimeoutMinutes} mins</b>
                  </div>
                  <button
                    type="button"
                    className="srg-btn srg-btn-outline srg-btn-sm"
                    onClick={() => {
                      const newWidth = prompt(`Enter new corridor buffer width in meters for ${sc.routeName}:`, sc.corridorWidthMeters);
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

      {/* Tab 3: Alerts Feed & Incident Audit Log */}
      {activeTab === 'alerts' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>Live Alert Feed & Audit History</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Immutable audit log of geofence departures, check-in requests, and emergency triggers.</p>
            </div>
            <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onClearAlerts}>
              Clear History Log
            </button>
          </div>

          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {alerts.map((al) => (
              <div key={al.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: al.severity === 'emergency' ? 'rgba(239, 68, 68, 0.1)' : '#0F172A',
                border: `1px solid ${al.severity === 'emergency' ? 'rgba(239, 68, 68, 0.35)' : '#1E293B'}`,
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{al.severity === 'emergency' ? '🚨' : al.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <b style={{ color: al.severity === 'emergency' ? '#FCA5A5' : '#FFFFFF', fontSize: '0.88rem' }}>{al.type}</b>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({al.travelerName || 'Traveler'})</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>{al.message}</div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <div>{new Date(al.timestamp).toLocaleTimeString()}</div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.25rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    background: al.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: al.status === 'ACTIVE' ? '#EF4444' : '#10B981'
                  }}>
                    {al.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Emergency Contacts & CAD Gateway */}
      {activeTab === 'contacts' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>Emergency Contacts & Dispatch Roster</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Manage guardian details, safety coordinators, and simulated 911 CAD emergency gateway.</p>
            </div>
            <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setShowContactModal(true)}>
              + Add Safety Contact
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {contacts.map((c) => (
              <div key={c.id} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <b style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>{c.name}</b>
                    <div style={{ fontSize: '0.78rem', color: '#38BDF8', marginTop: '0.1rem' }}>{c.relation}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                    Active
                  </span>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#CBD5E1', display: 'grid', gap: '0.25rem' }}>
                  <div>📞 {c.phone}</div>
                  <div>✉️ {c.email || 'N/A'}</div>
                </div>

                <button
                  type="button"
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  onClick={() => handleTestDispatch(c)}
                  style={{ width: '100%', marginTop: '0.85rem' }}
                >
                  🧪 Test Dispatch SMS (Demo)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Member & Staff Roster (Admin only) */}
      {activeTab === 'members' && orgPermission === 'admin' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>Organization Member & Staff Management</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Manage organization users, grant Admin/Staff permissions, and assign travelers.</p>
            </div>
            <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setShowMemberModal(true)}>
              + Invite Member
            </button>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {orgMembers.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: m.role === 'admin' ? '#38BDF820' : '#10B98120', display: 'grid', placeItems: 'center', color: m.role === 'admin' ? '#38BDF8' : '#10B981', fontWeight: '800' }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{m.name}</b>
                      <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: m.role === 'admin' ? '#38BDF818' : '#10B98118', color: m.role === 'admin' ? '#38BDF8' : '#10B981', fontWeight: '700' }}>
                        {m.role === 'admin' ? '👑 Org Admin' : '🛡️ Staff'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{m.email} • {m.title}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Assigned Travelers: <b style={{ color: '#FFFFFF' }}>{m.assignedCount || 0}</b>
                  </span>
                  {m.role !== 'admin' && (
                    <button
                      type="button"
                      className="srg-btn srg-btn-outline srg-btn-sm"
                      onClick={() => handleRemoveMember(m.id)}
                      style={{ color: '#EF4444', borderColor: '#EF444440' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: AI Risk Engine Telemetry */}
      {activeTab === 'ai-engine' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>AI Safety Risk Scoring Telemetry</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Deterministic, explainable formula evaluating 6 contextual safety signals in real time.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {(riskData.factors || []).map((f, idx) => (
              <div key={idx} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <b style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>{f.name}</b>
                  <span style={{ color: f.score > 0 ? '#F59E0B' : '#10B981', fontWeight: '800' }}>+{f.score} pts</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: '1.4' }}>{f.detail}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '8px', border: '1px solid #1E293B', fontSize: '0.82rem', color: '#CBD5E1' }}>
            <b>Total Calculated Score:</b> <span style={{ color: riskData.level.color, fontWeight: '800', fontSize: '1.1rem' }}>{riskData.score} / 100</span> ({riskData.level.label})
            <p style={{ marginTop: '0.4rem', color: '#94A3B8', fontSize: '0.76rem' }}>
              Formula: Geofence Offset (35%) + Time Drift (25%) + Trajectory Vector (15%) + Night Hazard (15%) + Check-in Responsiveness (20%) + SOS Override (100).
            </p>
          </div>
        </div>
      )}

      {/* Tab 7: Local Help Monitor */}
      {activeTab === 'local-help' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>Local Help Network Dispatch Monitor</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Real-time overview of community support requests submitted by tourists and travelers.</p>
          </div>

          {localHelpRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
              No active local help requests currently logged.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {localHelpRequests.map((req) => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px' }}>
                  <div>
                    <b style={{ color: '#FFFFFF' }}>{req.serviceType || 'General Assistance'}</b>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Traveler: {req.travelerName} • Helper: {req.helperName}</div>
                  </div>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontSize: '0.74rem' }}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Journey Evidence Timeline */}
      {activeTab === 'timeline' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>Chronological Journey Evidence Timeline</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Time-stamped audit events, beacon synchronizations, and incident records.</p>
          </div>
          <window.JourneyTimeline timeline={journeyTimeline} activeScenario={activeScenario} safeBeacon={safeBeacon} />
        </div>
      )}

      {/* Modal: Invite Member */}
      {showMemberModal && (
        <div className="srg-modal-backdrop">
          <div className="srg-modal-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#172A46', marginBottom: '1rem' }}>
              Invite Organization Member
            </h3>
            <form onSubmit={handleAddMember}>
              <label>
                Full Name
                <input
                  type="text"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="e.g. Carlos Gomez"
                  required
                />
              </label>
              <label>
                Email Address
                <input
                  type="email"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  placeholder="name@organization.com"
                  required
                />
              </label>
              <label>
                Role & Access Level
                <select
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                >
                  <option value="staff">Organization Staff (Assigned Travelers only)</option>
                  <option value="admin">Organization Administrator (Full Org Access)</option>
                </select>
              </label>
              <label>
                Job Title
                <input
                  type="text"
                  value={newMemberForm.title}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, title: e.target.value })}
                  placeholder="e.g. Campus Safety Officer"
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
                <button type="button" className="srg-btn srg-btn-outline" onClick={() => setShowMemberModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="srg-btn srg-btn-primary">
                  Send Invite →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Safety Contact */}
      {showContactModal && (
        <div className="srg-modal-backdrop">
          <div className="srg-modal-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#172A46', marginBottom: '1rem' }}>
              Add Emergency Safety Contact
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newContactForm.name && newContactForm.phone) {
                onAddContact({ id: 'c-' + Date.now(), ...newContactForm });
                setShowContactModal(false);
                setNewContactForm({ name: '', relation: 'Safety Officer', phone: '', email: '', notifySms: true, notifyCall: true });
              }
            }}>
              <label>
                Contact Name
                <input
                  type="text"
                  value={newContactForm.name}
                  onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                  placeholder="e.g. Campus Security"
                  required
                />
              </label>
              <label>
                Relationship / Department
                <input
                  type="text"
                  value={newContactForm.relation}
                  onChange={(e) => setNewContactForm({ ...newContactForm, relation: e.target.value })}
                  placeholder="e.g. Dispatcher / Guardian"
                  required
                />
              </label>
              <label>
                Phone Number (SMS Alert Broadcast)
                <input
                  type="tel"
                  value={newContactForm.phone}
                  onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </label>
              <label>
                Email Address
                <input
                  type="email"
                  value={newContactForm.email}
                  onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                  placeholder="dispatch@safety.org"
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
                <button type="button" className="srg-btn srg-btn-outline" onClick={() => setShowContactModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="srg-btn srg-btn-primary">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
