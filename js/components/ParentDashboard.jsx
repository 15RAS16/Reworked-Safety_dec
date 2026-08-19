/**
 * SafeRoute Guardian - Parent / Guardian Family Safety Dashboard
 * Calm, reassuring interface displaying linked dependents, live route tracking,
 * risk gauges, Safe Beacon updates, and family emergency contacts for MMU Mullana campus.
 */

window.ParentDashboard = function({
  onBackToWorkspace,
  activeScenario = null,
  riskData = null,
  currentPos = null,
  journeyState = {},
  safeBeacon = null,
  alerts = [],
  contacts = [],
  journeyTimeline = [],
  onTriggerSos
}) {
  const [dependents, setDependents] = React.useState(() => {
    return (window.StorageService && typeof window.StorageService.getLinkedDependents === 'function')
      ? window.StorageService.getLinkedDependents()
      : [{ id: 'dep-1', name: 'Aarav Sharma', relation: 'Son (15 yrs)', school: 'MMU Mullana Campus', battery: 88 }];
  });
  const [selectedDependent, setSelectedDependent] = React.useState(() => dependents[0] || null);
  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [linkForm, setLinkForm] = React.useState({ name: '', relation: 'Son / Daughter', school: 'MMU Mullana Campus' });
  const [generatedInvite, setGeneratedInvite] = React.useState(null);

  const scenario = activeScenario || {
    travelerName: 'Aarav Sharma',
    avatar: '🎒',
    routeName: 'MMU Main Gate → Central Library & Academic Block',
    corridorWidthMeters: 100,
    routeWaypoints: [],
    originName: 'MMU Main Gate',
    destinationName: 'Academic Block'
  };

  const isDeviation = riskData && riskData.distanceOffCorridor > 0;
  const statusKey = riskData ? riskData.level.key : 'SAFE';

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    if (!linkForm.name) return;
    if (window.FirebaseService && typeof window.FirebaseService.createDependentInviteToken === 'function') {
      const invite = await window.FirebaseService.createDependentInviteToken('parent-user', linkForm);
      setGeneratedInvite(invite);
    } else {
      setGeneratedInvite({ token: 'LINK-' + Math.floor(100000 + Math.random() * 900000), ...linkForm, dependentName: linkForm.name });
    }
  };

  const handleConfirmLink = async () => {
    if (!generatedInvite) return;
    const linkObj = {
      name: generatedInvite.dependentName,
      relation: generatedInvite.relation,
      school: generatedInvite.school
    };
    if (window.FirebaseService && typeof window.FirebaseService.approveDependentLink === 'function') {
      const linked = await window.FirebaseService.approveDependentLink('parent-user', linkObj);
      if (window.StorageService && typeof window.StorageService.addLinkedDependent === 'function') {
        window.StorageService.addLinkedDependent(linked);
        setDependents(window.StorageService.getLinkedDependents());
      }
    }
    setShowLinkModal(false);
    setGeneratedInvite(null);
  };

  return (
    <div className="srg-parent-view">
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
          <span style={{ fontSize: '1.2rem' }}>👨‍👩‍👧</span>
          <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.9rem' }}>Family Guardian Dashboard</span>
        </div>
      </div>

      {/* Hero Family Overview Banner */}
      <div className="srg-parent-hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '800', letterSpacing: '0.08em' }}>
              FAMILY PROTECTION ACTIVE
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FFFFFF', margin: '0.2rem 0' }}>
              Your Family is Monitored & Safe
            </h1>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8' }}>
              Real-time geofence tracking along approved university and daily commute corridors with proactive check-ins.
            </p>
          </div>

          <button
            type="button"
            className="srg-btn srg-btn-primary srg-btn-sm"
            onClick={() => setShowLinkModal(true)}
          >
            + Link Family Member
          </button>
        </div>

        {/* Linked Dependents Horizontal Cards */}
        <div className="srg-parent-dependents-list">
          {dependents.map((dep) => {
            const isSelected = selectedDependent && selectedDependent.id === dep.id;
            return (
              <div
                key={dep.id}
                className={`srg-dependent-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedDependent(dep)}
              >
                <div style={{ fontSize: '1.8rem' }}>🎒</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <b style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{dep.name}</b>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700' }}>
                      🔋 {dep.battery || 88}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                    {dep.relation} • {dep.school}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Live Map & Telemetry Gauge */}
      <div className="srg-admin-grid">
        {/* Left Column: Live Map */}
        <div className="srg-map-wrapper">
          <div className="srg-map-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.92rem' }}>
                {scenario.travelerName}'s Live Journey: {scenario.routeName}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Corridor Buffer: <b style={{ color: '#38BDF8' }}>{scenario.corridorWidthMeters || 100}m</b>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: '440px' }}>
            <window.InteractiveMap 
              mapId="parent-main-map"
              routeWaypoints={scenario.routeWaypoints || []}
              corridorWidthMeters={scenario.corridorWidthMeters || 100}
              currentPos={currentPos}
              travelerName={scenario.travelerName}
              travelerAvatar={scenario.avatar}
              safetyLevel={statusKey}
              isDeviation={isDeviation}
              originName={scenario.originName}
              destinationName={scenario.destinationName}
            />
            <window.MapLegend corridorWidthMeters={scenario.corridorWidthMeters || 100} />
          </div>
        </div>

        {/* Right Column: Risk Gauge & Dependent Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <window.RiskGauge riskData={riskData} />

          {/* Safe Beacon Card */}
          <div className="srg-beacon-card">
            <div>
              <b>📡 Last Safe Beacon</b>
              <span>
                {safeBeacon
                  ? `Saved at ${new Date(safeBeacon.timestamp).toLocaleTimeString()} with ${safeBeacon.networkStatus} network.`
                  : 'Connectivity normal. Safe beacon activates when entering limited cellular coverage.'}
              </span>
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px', padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.75rem' }}>
              Family Emergency Directory
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {contacts.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: '#1E293B50', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div>
                    <b style={{ color: '#FFFFFF' }}>{c.name}</b>
                    <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>{c.relation} ({c.phone})</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: '700' }}>
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Incident & Journey Timeline */}
      <div style={{ marginTop: '1.5rem', background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem' }}>
          Chronological Journey Timeline
        </h3>
        <window.JourneyTimeline timeline={journeyTimeline} activeScenario={scenario} safeBeacon={safeBeacon} />
      </div>

      {/* Modal: Link Family Member */}
      {showLinkModal && (
        <div className="srg-modal-backdrop" onClick={() => setShowLinkModal(false)}>
          <div className="srg-modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Link a Dependent Family Member
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1.2rem' }}>
              Generate a single-use linking token for consent confirmation.
            </p>

            {!generatedInvite ? (
              <form onSubmit={handleGenerateLink}>
                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                  Family Member's Full Name
                  <input
                    type="text"
                    className="srg-insta-input"
                    value={linkForm.name}
                    onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    style={{ marginTop: '0.25rem' }}
                    required
                  />
                </label>
                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                  Relationship
                  <input
                    type="text"
                    className="srg-insta-input"
                    value={linkForm.relation}
                    onChange={(e) => setLinkForm({ ...linkForm, relation: e.target.value })}
                    placeholder="e.g. Son (15 yrs)"
                    style={{ marginTop: '0.25rem' }}
                    required
                  />
                </label>
                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                  Campus / School Destination
                  <input
                    type="text"
                    className="srg-insta-input"
                    value={linkForm.school}
                    onChange={(e) => setLinkForm({ ...linkForm, school: e.target.value })}
                    placeholder="e.g. MMU Mullana Campus"
                    style={{ marginTop: '0.25rem' }}
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
                  <button type="button" className="srg-btn srg-btn-outline" onClick={() => setShowLinkModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="srg-btn srg-btn-primary">
                    Generate Consent Token →
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ background: '#064E3B', border: '1px solid #10B981', padding: '1rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0' }}>
                  <span style={{ fontSize: '0.74rem', color: '#6EE7B7', fontWeight: '800', display: 'block' }}>
                    SINGLE-USE EXPIRING LINKING TOKEN
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.1em', margin: '0.4rem 0' }}>
                    {generatedInvite.token}
                  </div>
                  <small style={{ color: '#A7F3D0', fontSize: '0.72rem' }}>
                    Valid for 24 hours. Enter this token on {generatedInvite.dependentName}'s mobile companion.
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
                  <button type="button" className="srg-btn srg-btn-outline" onClick={() => setGeneratedInvite(null)}>
                    Back
                  </button>
                  <button type="button" className="srg-btn srg-btn-primary" onClick={handleConfirmLink}>
                    Confirm & Complete Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
