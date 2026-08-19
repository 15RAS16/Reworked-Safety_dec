/**
 * SafeRoute Guardian - Organization Staff Operations Dashboard
 * Focused operational dashboard for Organization Staff / Field Guides.
 * Displays only assigned travelers, status filters, and incident acknowledgment.
 */

window.StaffDashboard = function({
  onBackToWorkspace,
  activeScenario = null,
  scenarios = [],
  onSelectScenario = () => {},
  riskData = null,
  currentPos = null,
  journeyState = {},
  alerts = [],
  contacts = [],
  journeyTimeline = [],
  onTriggerSos,
  safeBeacon
}) {
  const [filterLevel, setFilterLevel] = React.useState('ALL'); // 'ALL' | 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'EMERGENCY'
  const [ackToast, setAckToast] = React.useState(null);

  const scenario = activeScenario || {
    travelerName: 'Traveler',
    avatar: '🛡️',
    routeName: 'MMU Campus Corridor',
    corridorWidthMeters: 100,
    routeWaypoints: [],
    originName: 'Origin',
    destinationName: 'Destination'
  };

  const risk = riskData || {
    score: 0,
    level: { key: 'SAFE', label: 'Safe', color: '#10B981' },
    distanceOffCorridor: 0
  };

  // Sample assigned travelers for the staff member
  const assignedTravelers = (scenarios && scenarios.length > 0 ? scenarios : [scenario]).map((sc, i) => ({
    id: sc.id,
    name: sc.travelerName,
    role: sc.travelerRole,
    avatar: sc.avatar,
    routeName: sc.routeName,
    corridorWidth: sc.corridorWidthMeters,
    riskScore: i === 0 ? risk.score : (i === 1 ? 12 : 68),
    levelKey: i === 0 ? risk.level.key : (i === 1 ? 'SAFE' : 'HIGH_RISK'),
    lastActivity: i === 0 ? (risk.distanceOffCorridor > 0 ? `${risk.distanceOffCorridor}m deviation` : 'On route') : 'Safe in corridor',
    scenario: sc
  }));

  const filteredTravelers = assignedTravelers.filter(t => {
    if (filterLevel === 'ALL') return true;
    return t.levelKey === filterLevel;
  });

  const handleAcknowledge = (travelerName) => {
    setAckToast(`[Logged] Incident acknowledged for ${travelerName}. Status recorded in audit feed.`);
    setTimeout(() => setAckToast(null), 3500);
  };

  return (
    <div className="srg-staff-view">
      {/* Top Workspace Bar */}
      <div className="srg-workspace-topbar">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Workspace Hub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🛡️</span>
          <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.9rem' }}>Organization Staff Operations</span>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="srg-staff-hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: '800', letterSpacing: '0.08em' }}>
              MMU CAMPUS FIELD MONITORING ASSIGNMENT
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#FFFFFF', margin: '0.2rem 0' }}>
              Assigned Travelers & Incident Feed
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              Monitoring active travelers assigned to your operational campus group.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: '#0F172A', padding: '0.4rem', borderRadius: '10px', border: '1px solid #1E293B' }}>
            {['ALL', 'SAFE', 'CAUTION', 'HIGH_RISK', 'EMERGENCY'].map(lvl => (
              <button
                key={lvl}
                type="button"
                className={`srg-filter-btn ${filterLevel === lvl ? 'active' : ''}`}
                onClick={() => setFilterLevel(lvl)}
              >
                {lvl.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {ackToast && (
        <div style={{ background: '#10B981', color: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '700' }}>
          ✓ {ackToast}
        </div>
      )}

      {/* Main Grid: Assigned Table & Live Map */}
      <div className="srg-admin-grid">
        {/* Left Column: Assigned Travelers Table */}
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem' }}>
            Assigned Travelers Roster ({filteredTravelers.length})
          </h3>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredTravelers.map((t) => {
              const isSelected = scenario && scenario.id === t.id;
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: isSelected ? 'rgba(56, 189, 248, 0.1)' : '#0F172A',
                    border: `1px solid ${isSelected ? '#38BDF8' : '#1E293B'}`,
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectScenario(t.scenario)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{t.avatar}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <b style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{t.name}</b>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>({t.role})</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#CBD5E1', marginTop: '2px' }}>
                        📍 {t.routeName}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        background: t.levelKey === 'SAFE' ? '#10B98120' : t.levelKey === 'HIGH_RISK' ? '#F9731620' : '#F59E0B20',
                        color: t.levelKey === 'SAFE' ? '#10B981' : t.levelKey === 'HIGH_RISK' ? '#F97316' : '#F59E0B'
                      }}>
                        {t.levelKey.replace('_', ' ')} ({t.riskScore}/100)
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                        {t.lastActivity}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="srg-btn srg-btn-outline srg-btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleAcknowledge(t.name); }}
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Map of Selected Traveler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="srg-map-wrapper">
            <div className="srg-map-header">
              <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.88rem' }}>
                {scenario.travelerName}'s Live Route
              </span>
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: '340px' }}>
              <window.InteractiveMap
                mapId="staff-main-map"
                routeWaypoints={scenario.routeWaypoints || []}
                corridorWidthMeters={scenario.corridorWidthMeters || 100}
                currentPos={currentPos}
                travelerName={scenario.travelerName}
                travelerAvatar={scenario.avatar}
                safetyLevel={risk.level.key || 'SAFE'}
                isDeviation={risk.distanceOffCorridor > 0}
                originName={scenario.originName}
                destinationName={scenario.destinationName}
              />
              <window.MapLegend corridorWidthMeters={scenario.corridorWidthMeters || 100} />
            </div>
          </div>

          <window.RiskGauge riskData={risk} compact={true} />
        </div>
      </div>
    </div>
  );
};
