/**
 * SafeRoute Guardian — Full-Screen Interactive Live Map
 * High-immersion full canvas view for live route monitoring with collapsible panels.
 */
window.FullScreenMap = function({
  title = 'Live Safety Map',
  activeScenario = null,
  riskData = null,
  currentPos = null,
  journeyState = {},
  safeBeacon = null,
  onBack,
  onTriggerSos,
  onResetDemo = null
}) {
  const [focused, setFocused] = React.useState(0);
  const [leftOpen, setLeftOpen] = React.useState(true);
  const [rightOpen, setRightOpen] = React.useState(true);

  const scenario = activeScenario || {
    travelerName: 'Traveler',
    avatar: '🧭',
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

  const emergency = risk.level.key === 'EMERGENCY';
  const stageString = (journeyState.status || journeyState.stage || 'IN_TRANSIT').toString().replace(/_/g, ' ');

  return (
    <section className="srg-full-map-page">
      <div className="srg-page-heading">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBack}>
          ← Back
        </button>
        <div>
          <p>LIVE MONITORING</p>
          <h1>{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onResetDemo && (
            <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onResetDemo} title="Reset map to default MMU campus scenario">
              ↻ Reset Demo
            </button>
          )}
          <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setFocused(x => x + 1)}>
            ◎ Focus User
          </button>
        </div>
      </div>

      <div className="srg-full-map-canvas">
        <window.InteractiveMap
          mapId={'full-map-' + focused}
          routeWaypoints={scenario.routeWaypoints || []}
          corridorWidthMeters={scenario.corridorWidthMeters || 100}
          currentPos={currentPos}
          travelerName={scenario.travelerName || 'Traveler'}
          travelerAvatar={scenario.avatar || '🧭'}
          safetyLevel={risk.level.key || 'SAFE'}
          isDeviation={risk.distanceOffCorridor > 0}
          originName={scenario.originName || 'Start'}
          destinationName={scenario.destinationName || 'Destination'}
          onResetDemo={onResetDemo}
        />

        <aside className={'srg-map-float srg-map-float-left ' + (!leftOpen ? 'collapsed' : '')}>
          <button type="button" className="srg-map-collapse" onClick={() => setLeftOpen(!leftOpen)}>
            {leftOpen ? '‹' : '›'}
          </button>
          {leftOpen && (
            <>
              <p className="srg-float-label">ACTIVE JOURNEYS</p>
              <button type="button" className="srg-map-user active" onClick={() => setFocused(x => x + 1)}>
                <span>{scenario.avatar || '🧭'}</span>
                <div>
                  <b>{scenario.travelerName}</b>
                  <small>{scenario.routeName}</small>
                </div>
                <i style={{ background: risk.level.color || '#10B981' }}></i>
              </button>
              <div className="srg-map-user">
                <span>🛡️</span>
                <div>
                  <b>Safe corridor</b>
                  <small>{scenario.corridorWidthMeters || 100}m protection buffer</small>
                </div>
              </div>
              <p className="srg-float-foot">✓ MMU Mullana campus safety geofences and safe spots active.</p>
            </>
          )}
        </aside>

        <aside className={'srg-map-float srg-map-float-right ' + (!rightOpen ? 'collapsed' : '')}>
          <button type="button" className="srg-map-collapse" onClick={() => setRightOpen(!rightOpen)}>
            {rightOpen ? '›' : '‹'}
          </button>
          {rightOpen && (
            <>
              <p className="srg-float-label">SELECTED TRAVELER</p>
              <h2>{scenario.travelerName}</h2>
              <div className="srg-map-score">
                <b style={{ color: risk.level.color || '#10B981' }}>{risk.score}</b>
                <span>{risk.level.label}</span>
              </div>
              <dl>
                <div>
                  <dt>Network</dt>
                  <dd>Strong · Campus 5G</dd>
                </div>
                <div>
                  <dt>Safe Beacon</dt>
                  <dd>{safeBeacon ? 'Saved' : 'Ready'}</dd>
                </div>
                <div>
                  <dt>Route status</dt>
                  <dd>{stageString}</dd>
                </div>
              </dl>
              {emergency ? (
                <span className="srg-map-emergency">Emergency Active</span>
              ) : (
                <button
                  type="button"
                  className="srg-btn srg-btn-emergency srg-btn-sm"
                  onClick={() => onTriggerSos && onTriggerSos('MAP_EMERGENCY_ACTION')}
                >
                  Emergency SOS
                </button>
              )}
            </>
          )}
        </aside>

        <div className="srg-map-bottom">
          <span><i className="route"></i> Approved route</span>
          <span><i className="corridor"></i> Geofence corridor</span>
          <span><i className="safe"></i> Trusted safe spot</span>
          <span><i className="alert"></i> Deviation / emergency</span>
        </div>
      </div>
    </section>
  );
};
