/**
 * SafeRoute Guardian - Organization Administrator Command Center
 * High-quality executive command dashboard with KPI metrics, live fleet map,
 * roster management, route editor, AI telemetry, and clearly labeled simulation tools.
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
  onResetDemo,
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

  // Organization Members
  const [orgMembers, setOrgMembers] = React.useState(() => window.StorageService.getOrgMembers());
  const [newMemberForm, setNewMemberForm] = React.useState({
    name: '',
    email: '',
    role: 'staff',
    title: 'Safety Operations Officer'
  });
  const [generatedInvite, setGeneratedInvite] = React.useState(null);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const scenario = activeScenario || {
    id: 'student-campus-commute',
    travelerName: 'Aarav Sharma',
    avatar: '🎒',
    routeName: 'MMU Main Gate → Central Library & Academic Block',
    corridorWidthMeters: 100,
    escalationTimeoutMinutes: 15,
    routeWaypoints: [],
    originName: 'MMU Main Gate',
    destinationName: 'Academic Block'
  };

  const risk = riskData || {
    score: 0,
    level: { key: 'SAFE', label: 'Safe', color: '#10B981' },
    distanceOffCorridor: 0,
    factors: []
  };

  // Route Form State
  const [newRouteForm, setNewRouteForm] = React.useState({
    name: 'MMU Academic Corridor',
    originName: 'MMU Main Gate (Ambala Road)',
    destinationName: 'Engineering Academic Block 3',
    corridorWidthMeters: 100,
    escalationTimeoutMinutes: 15,
    isNightTime: false
  });

  // Contact Form State
  const [newContactForm, setNewContactForm] = React.useState({
    name: '',
    relation: 'Campus Safety Coordinator',
    phone: '',
    email: '',
    notifySms: true,
    notifyCall: true
  });

  // Metrics
  const activeCount = scenarios.length;
  const safeCount = risk.level.key === 'SAFE' ? 2 : 1;
  const deviationCount = (risk.level.key === 'CAUTION' || risk.level.key === 'HIGH_RISK') ? 1 : 0;
  const emergencyCount = risk.level.key === 'EMERGENCY' ? 1 : 0;
  const unresolvedAlerts = (alerts || []).filter(a => a.status === 'ACTIVE').length;

  const handleTestDispatch = (contact) => {
    setSimulatedDispatchToast(`[Demo / Simulated] SMS Broadcast sent to ${contact.name} (${contact.phone}): "SafeRoute Guardian verified alert test."`);
    setTimeout(() => setSimulatedDispatchToast(null), 4000);
  };

  const handleCreateMemberInvite = async (e) => {
    e.preventDefault();
    if (!newMemberForm.name || !newMemberForm.email) return;
    const invitation = await window.FirebaseService.createOrgInvitation('default-org', newMemberForm.email, newMemberForm.role);
    setGeneratedInvite(invitation);
    const created = window.StorageService.addOrgMember('default', newMemberForm);
    setOrgMembers(window.StorageService.getOrgMembers());
  };

  const handleRemoveMember = (memberId) => {
    const updated = window.StorageService.removeOrgMember('default', memberId);
    setOrgMembers(updated);
  };

  return (
    <div className="srg-admin-view">
      {/* Top Workspace Navigation Bar */}
      <div className="srg-workspace-topbar">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Command Hub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>👑</span>
          <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.9rem' }}>
            Organization Administrator Console
          </span>
        </div>
      </div>

      {/* KPI Metrics Summary Bar */}
      <div className="srg-metrics-grid">
        <div className="srg-metric-card" style={{ borderLeft: '4px solid #38BDF8' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Active Journeys</span>
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

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #EC4899' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Unresolved Alerts</span>
            <span className="srg-metric-value" style={{ color: '#F472B6' }}>{unresolvedAlerts}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
        </div>

        <div className="srg-metric-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="srg-metric-info">
            <span className="srg-metric-label">Active Emergencies</span>
            <span className="srg-metric-value" style={{ color: '#EF4444' }}>{emergencyCount}</span>
          </div>
          <div className="srg-metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Clearly Demarcated Demo Simulation Controls Bar */}
      <div className="srg-demo-bar">
        <div className="srg-demo-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Demo Simulation Suite (Simulated Events Only):</span>
        </div>

        <div className="srg-demo-actions">
          <button 
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('SAFE_ON_ROUTE')}
            title="Move active traveler safely inside approved corridor"
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
            title="Simulate high-risk off-route drift (~450m) triggering check-in"
          >
            🟠 High Risk Drift
          </button>

          <button 
            type="button"
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => onTriggerDemoStep('RETURN_TO_ROUTE')}
            title="Simulate heading vector returning toward corridor"
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
            title="Test silent emergency flow"
          >
            🧪 Test Emergency (Silent)
          </button>

          {onResetDemo && (
            <button
              type="button"
              className="srg-btn srg-btn-outline srg-btn-sm"
              onClick={onResetDemo}
              title="Reset demo to default MMU campus scenario"
              style={{ borderColor: '#38BDF8', color: '#38BDF8' }}
            >
              &#8635; Reset Demo
            </button>
          )}
        </div>
      </div>

      {simulatedDispatchToast && (
        <div style={{ background: '#10B981', color: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: '700' }}>
          ✓ {simulatedDispatchToast}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="srg-tabs-bar">
        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          🖥️ Live Fleet Monitor
        </button>

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          🛤️ Safe Routes ({scenarios.length})
        </button>

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          📋 Incident Logs ({alerts.length})
        </button>

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          📇 Dispatch Network ({contacts.length})
        </button>

        <button
          type="button"
          className={`srg-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Member & Staff Roster ({orgMembers.length})
        </button>

        <button 
          type="button"
          className={`srg-tab-btn ${activeTab === 'ai-engine' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-engine')}
        >
          🧠 AI Risk Telemetry
        </button>

        <button
          type="button"
          className={`srg-tab-btn ${activeTab === 'local-help' ? 'active' : ''}`}
          onClick={() => setActiveTab('local-help')}
        >
          🤝 Local Help ({localHelpRequests.length})
        </button>

        <button
          type="button"
          className={`srg-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          ◷ Audit History ({journeyTimeline.length})
        </button>

        <button
          type="button"
          className={`srg-tab-btn ${activeTab === 'system-status' ? 'active' : ''}`}
          onClick={() => setActiveTab('system-status')}
        >
          ⚙️ System Status
        </button>
      </div>

      {/* Tab 1: Live Map Monitor */}
      {activeTab === 'monitor' && (
        <div className="srg-admin-grid">
          <div className="srg-map-wrapper">
            <div className="srg-map-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }} />
                <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.92rem' }}>
                  {scenario.travelerName}'s Corridor: {scenario.routeName}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Buffer: <b style={{ color: '#38BDF8' }}>{scenario.corridorWidthMeters}m</b> | Timeout: <b style={{ color: '#F59E0B' }}>{scenario.escalationTimeoutMinutes}m</b>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', minHeight: '460px' }}>
              <window.InteractiveMap
                mapId="admin-main-map"
                routeWaypoints={scenario.routeWaypoints || []}
                corridorWidthMeters={scenario.corridorWidthMeters || 100}
                currentPos={currentPos}
                travelerName={scenario.travelerName}
                travelerAvatar={scenario.avatar}
                safetyLevel={risk.level.key || 'SAFE'}
                isDeviation={risk.distanceOffCorridor > 0}
                originName={scenario.originName}
                destinationName={scenario.destinationName}
                onResetDemo={onResetDemo}
              />
              <window.MapLegend corridorWidthMeters={scenario.corridorWidthMeters || 100} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <window.RiskGauge riskData={risk} />

            {/* Quick Traveler Switcher */}
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px', padding: '1.2rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.75rem' }}>
                Fleet Traveler Selection
              </h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {scenarios.map(sc => (
                  <button
                    key={sc.id}
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: `1px solid ${scenario.id === sc.id ? '#38BDF8' : '#1E293B'}`,
                      background: scenario.id === sc.id ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectScenario(sc)}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{sc.avatar}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <b style={{ fontSize: '0.84rem', display: 'block' }}>{sc.travelerName}</b>
                      <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>{sc.routeName}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Safe Routes & Corridor Editor */}
      {activeTab === 'routes' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>Approved Safe Routes & Corridors</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Customize geofence buffer widths (50m–500m) and escalation timeout thresholds.</p>
            </div>
            <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setShowRouteModal(true)}>
              + Add Custom Corridor
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {scenarios.map((sc) => (
              <div key={sc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{sc.avatar}</span>
                  <div>
                    <b style={{ color: '#FFFFFF', fontSize: '0.96rem' }}>{sc.routeName}</b>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {sc.originName} → {sc.destinationName} ({sc.travelerName})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>Buffer Width</span>
                    <b style={{ color: '#38BDF8', fontSize: '0.95rem' }}>{sc.corridorWidthMeters}m</b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>Timeout</span>
                    <b style={{ color: '#F59E0B', fontSize: '0.95rem' }}>{sc.escalationTimeoutMinutes}m</b>
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

      {/* Tab 3: Alerts & Incident Audit Logs */}
      {activeTab === 'alerts' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>Incident Log & Compliance Audit</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Immutable records of corridor breaches, check-in confirmations, and emergency triggers.</p>
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
                borderRadius: '10px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span>{al.severity === 'emergency' ? '🚨' : al.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <b style={{ color: al.severity === 'emergency' ? '#FCA5A5' : '#FFFFFF', fontSize: '0.88rem' }}>{al.type}</b>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({al.travelerName})</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>{al.message}</div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <div>{new Date(al.timestamp).toLocaleTimeString()}</div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.25rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    background: al.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: al.status === 'ACTIVE' ? '#EF4444' : '#10B981',
                    fontWeight: '700'
                  }}>
                    {al.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Dispatch Network Contacts */}
      {activeTab === 'contacts' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>Organization Safety Dispatch Directory</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Manage safety officers, campus security liaisons, and simulated 911 CAD emergency gateways.</p>
            </div>
            <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setShowContactModal(true)}>
              + Add Dispatch Contact
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {contacts.map((c) => (
              <div key={c.id} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <b style={{ fontSize: '0.96rem', color: '#FFFFFF' }}>{c.name}</b>
                    <div style={{ fontSize: '0.78rem', color: '#38BDF8', marginTop: '0.1rem' }}>{c.relation}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: '700' }}>
                    Active
                  </span>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#CBD5E1', display: 'grid', gap: '0.25rem' }}>
                  <div>📞 {c.phone}</div>
                  <div>✉️ {c.email || 'dispatch@saferoute.org'}</div>
                </div>

                <button
                  type="button"
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  onClick={() => handleTestDispatch(c)}
                  style={{ width: '100%', marginTop: '0.85rem' }}
                >
                  🧪 Test Dispatch Broadcast (Demo)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Member & Staff Management */}
      {activeTab === 'members' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>Member & Staff Roster Management</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Issue cryptographically secure invitation tokens and manage staff assignments.</p>
            </div>
            <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setShowMemberModal(true)}>
              + Invite Team Member
            </button>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {orgMembers.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: m.role === 'admin' ? '#38BDF825' : '#10B98125', display: 'grid', placeItems: 'center', color: m.role === 'admin' ? '#38BDF8' : '#10B981', fontWeight: '800' }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '0.94rem' }}>{m.name}</b>
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

      {/* Tab 6: AI Risk Telemetry */}
      {activeTab === 'ai-engine' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>Explainable AI Risk Engine Telemetry</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Real-time evaluation of all 6 contextual signals with transparent formula weights.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {(risk.factors || []).map((f, idx) => (
              <div key={idx} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <b style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>{f.name}</b>
                  <span style={{ color: f.score > 0 ? (f.isAlert ? '#EF4444' : '#F59E0B') : '#10B981', fontWeight: '800' }}>
                    +{f.score} / {f.max} pts
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: '1.45' }}>{f.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Local Help Monitor */}
      {activeTab === 'local-help' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>Local Help Requests Monitor</h3>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.2rem' }}>Review volunteer dispatch and traveler support requests in real time.</p>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {localHelpRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No active local help requests.</div>
            ) : (
              localHelpRequests.map(req => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px' }}>
                  <div>
                    <b style={{ color: '#FFFFFF' }}>{req.serviceType}</b>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Traveler: {req.travelerName} • Helper: {req.helperName}</div>
                  </div>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontSize: '0.74rem' }}>
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 8: Audit Timeline */}
      {activeTab === 'timeline' && (
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem' }}>
            Chronological Journey Audit History
          </h3>
          <window.JourneyTimeline timeline={journeyTimeline} activeScenario={activeScenario} safeBeacon={safeBeacon} />
        </div>
      )}

      {/* Modal: Invite Member */}
      {showMemberModal && (
        <div className="srg-modal-backdrop">
          <div className="srg-modal-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#172A46', marginBottom: '0.5rem' }}>
              Invite Organization Member
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.2rem' }}>
              Issue a single-use 7-day cryptographic invitation token.
            </p>

            {!generatedInvite ? (
              <form onSubmit={handleCreateMemberInvite}>
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
                    placeholder="carlos@organization.com"
                    required
                  />
                </label>
                <label>
                  Access Level
                  <select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  >
                    <option value="staff">Organization Staff (Assigned travelers only)</option>
                    <option value="admin">Organization Administrator (Full org command)</option>
                  </select>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
                  <button type="button" className="srg-btn srg-btn-outline" onClick={() => setShowMemberModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="srg-btn srg-btn-primary">
                    Generate Invitation Token →
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0' }}>
                  <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: '800', display: 'block' }}>
                    SINGLE-USE EXPIRING INVITATION TOKEN
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#166534', fontFamily: 'monospace', letterSpacing: '0.08em', margin: '0.4rem 0' }}>
                    {generatedInvite.token}
                  </div>
                  <small style={{ color: '#15803D', fontSize: '0.72rem' }}>
                    Valid for 7 days. Send this token to {generatedInvite.email}.
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
                  <button type="button" className="srg-btn srg-btn-primary" onClick={() => { setShowMemberModal(false); setGeneratedInvite(null); }}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Safety Contact */}
      {showContactModal && (
        <div className="srg-modal-backdrop">
          <div className="srg-modal-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#172A46', marginBottom: '1rem' }}>
              Add Emergency Dispatch Contact
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newContactForm.name && newContactForm.phone) {
                onAddContact({ id: 'c-' + Date.now(), ...newContactForm });
                setShowContactModal(false);
                setNewContactForm({ name: '', relation: 'Safety Coordinator', phone: '', email: '', notifySms: true, notifyCall: true });
              }
            }}>
              <label>
                Contact Name
                <input
                  type="text"
                  value={newContactForm.name}
                  onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                  placeholder="e.g. Metro Campus Security"
                  required
                />
              </label>
              <label>
                Department / Role
                <input
                  type="text"
                  value={newContactForm.relation}
                  onChange={(e) => setNewContactForm({ ...newContactForm, relation: e.target.value })}
                  placeholder="e.g. Dispatch Lead"
                  required
                />
              </label>
              <label>
                Phone Number (SMS Broadcast)
                <input
                  type="tel"
                  value={newContactForm.phone}
                  onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  required
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

/**
 * System Status Diagnostic Panel
 * Non-intrusive admin-only panel showing Firebase mode, map provider, and demo data status.
 * Never exposes API keys or credential values.
 */
function SystemStatusPanel({ scenarios, alerts, contacts, journeyTimeline, localHelpRequests }) {
  const firebaseBadge = (window.ConfigService && window.ConfigService.getFirebaseStatusBadge)
    ? window.ConfigService.getFirebaseStatusBadge()
    : { label: 'Unknown', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', detail: 'ConfigService unavailable.' };

  const mapBadge = (window.ConfigService && window.ConfigService.getMapStatusBadge)
    ? window.ConfigService.getMapStatusBadge()
    : { label: 'Unknown', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', detail: 'ConfigService unavailable.' };

  const isFirebaseLive = window.FirebaseService && window.FirebaseService.isLive && window.FirebaseService.isLive();
  const isDemo = !isFirebaseLive;

  const statusItems = [
    { label: 'Authentication', value: isFirebaseLive ? 'Firebase Connected' : 'Demo Mode (Local Storage)', color: isFirebaseLive ? '#10B981' : '#F59E0B', icon: isFirebaseLive ? '🔥' : '⚡' },
    { label: 'Map Provider', value: mapBadge.label, color: mapBadge.color, icon: mapBadge.mode === 'google' ? '🗺️' : '🌍' },
    { label: 'Demo Data', value: `${scenarios.length} routes, ${alerts.length} alerts, ${contacts.length} contacts`, color: '#38BDF8', icon: '📊' },
    { label: 'Timeline Events', value: `${journeyTimeline.length} logged`, color: '#94A3B8', icon: '📋' },
    { label: 'Help Requests', value: `${localHelpRequests.length} active`, color: '#94A3B8', icon: '🤝' },
    { label: 'Emergency Dispatch', value: 'SIMULATED — No real alerts sent', color: '#10B981', icon: '🛡️' },
  ];

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* Firebase Mode Badge */}
      <div style={{
        background: firebaseBadge.bg, border: `1px solid ${firebaseBadge.color}40`,
        borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem'
      }}>
        <span style={{ fontSize: '1.8rem' }}>{isFirebaseLive ? '🔥' : '⚡'}</span>
        <div>
          <div style={{ fontWeight: '800', color: firebaseBadge.color, fontSize: '1rem', marginBottom: '0.25rem' }}>
            {firebaseBadge.label}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5' }}>
            {firebaseBadge.detail}
          </div>
          {isDemo && (
            <div style={{ fontSize: '0.78rem', color: '#F59E0B', marginTop: '0.4rem', fontWeight: '700' }}>
              &#9888; Demo accounts are stored in isolated browser localStorage. No real accounts are created.
            </div>
          )}
        </div>
      </div>

      {/* Map Provider Badge */}
      <div style={{
        background: mapBadge.bg, border: `1px solid ${mapBadge.color}40`,
        borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem'
      }}>
        <span style={{ fontSize: '1.8rem' }}>{mapBadge.mode === 'google' ? '🗺️' : '🌍'}</span>
        <div>
          <div style={{ fontWeight: '800', color: mapBadge.color, fontSize: '1rem', marginBottom: '0.25rem' }}>
            Map Provider: {mapBadge.label}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5' }}>
            {mapBadge.detail}
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {statusItems.map((item, i) => (
          <div key={i} style={{
            background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px',
            padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
              <div style={{ fontSize: '0.88rem', color: item.color, fontWeight: '700', marginTop: '2px' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Security notice */}
      <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '0.78rem', color: '#6EE7B7' }}>
        &#128274; API keys, Firebase credentials, and service account tokens are never exposed in this panel or in the browser console.
        This panel is for competition judging transparency only.
      </div>
    </div>
  );
}
