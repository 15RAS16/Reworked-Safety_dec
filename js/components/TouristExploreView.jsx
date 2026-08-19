/**
 * SafeRoute Guardian - Tourist Safety Intelligence ("Explore Safely") Component
 * Combines weather conditions, cellular connectivity, official travel advisories,
 * route comparison (Fastest vs Safer Route), and explainable AI safety scores.
 */

window.TouristExploreView = function({
  activeScenario,
  onBackToWorkspace,
  onOpenCommunityReviews,
  communityReviews = []
}) {
  const [selectedRouteType, setSelectedRouteType] = React.useState('fastest'); // 'fastest' | 'safer'
  const [downloadedOfflineMap, setDownloadedOfflineMap] = React.useState(false);
  const [sharedTripStatus, setSharedTripStatus] = React.useState(null);

  const intelligenceData = window.SRG_DATA.touristSafetyData;
  const weather = intelligenceData.weather;
  const connectivity = intelligenceData.connectivity;
  const advisories = intelligenceData.officialAdvisories;
  const comparison = intelligenceData.routeComparison;

  // Calculate Tourist Travel Safety Score using AI Risk Engine
  const touristScoreResult = React.useMemo(() => {
    return window.RiskEngine.assessTouristSafetyScore({
      weatherSeverity: weather.warningSeverity,
      hasDeadZone: true,
      officialAdvisorySeverity: 'CAUTION',
      isNight: activeScenario.isNightTime || false,
      communityReviews: communityReviews,
      selectedRouteType: selectedRouteType
    });
  }, [weather, activeScenario, communityReviews, selectedRouteType]);

  const handleDownloadMap = () => {
    setDownloadedOfflineMap(true);
    setTimeout(() => {
      alert('Offline Corridor Map & GPS Waypoints downloaded successfully for offline use.');
    }, 400);
  };

  const handleShareTrip = () => {
    setSharedTripStatus('Live corridor link copied & shared with trusted contact.');
    setTimeout(() => setSharedTripStatus(null), 4000);
  };

  return (
    <div className="srg-explore-view">
      {/* Top Header & Navigation */}
      <div className="srg-workspace-topbar" style={{ marginBottom: '1.5rem' }}>
        <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Tourist Workspace
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenCommunityReviews}>
            <span style={{ marginRight: '4px' }}>⭐</span> Community Reviews ({communityReviews.length})
          </button>
        </div>
      </div>

      {/* Main Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          <span>🧭</span> Tourist Safety Intelligence & Route Advisor
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF' }}>
          Explore Safely: {activeScenario.destinationName}
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
          Pre-travel environmental assessment, connectivity dead-zone detection, and official advisories for <b>{activeScenario.travelerName}</b>.
        </p>
      </div>

      {/* Shared Trip Toast */}
      {sharedTripStatus && (
        <div style={{ background: '#10B981', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{sharedTripStatus}</span>
        </div>
      )}

      {/* Hero Travel Safety Score Card */}
      <div className="srg-ai-panel" style={{ marginBottom: '1.75rem', background: 'linear-gradient(145deg, #131E35 0%, #0F172A 100%)', border: `1px solid ${touristScoreResult.level.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
              AI Travel Safety Assessment
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.2rem' }}>
              Travel Safety Score: <span style={{ color: touristScoreResult.level.color }}>{touristScoreResult.travelSafetyScore} / 100</span>
            </div>
          </div>

          <div className="srg-status-pill" style={{ background: touristScoreResult.level.bg, border: `1px solid ${touristScoreResult.level.border}`, color: touristScoreResult.level.color, fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
            <span className="srg-status-dot" style={{ background: touristScoreResult.level.color }} />
            <span>{touristScoreResult.level.label}</span>
          </div>
        </div>

        {/* Explainable Natural Language Note */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderLeft: `4px solid ${touristScoreResult.level.color}`, padding: '1rem', borderRadius: '0 8px 8px 0', fontSize: '0.95rem', color: '#E2E8F0', lineHeight: '1.5' }}>
          <b>Explainable Intelligence:</b> {touristScoreResult.explanation}
        </div>

        {/* Recommended Safe Actions */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.6rem' }}>
            Recommended Safe Actions Before Departure:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {touristScoreResult.safeActions.map((act, i) => (
              <span key={i} style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                ✓ {act}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Route Comparison: Fastest vs. Safer Route */}
      <window.TrustedSafeSpots riskData={{ level: touristScoreResult.level }} />

      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.85rem' }}>
          Route Selection: Fastest vs. Safer Route
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Fastest Route Card */}
          <div 
            style={{
              background: 'var(--bg-card-dark)',
              border: `2px solid ${selectedRouteType === 'fastest' ? '#F59E0B' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onClick={() => setSelectedRouteType('fastest')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '800', color: '#F59E0B', fontSize: '1.05rem' }}>Route A (Fastest)</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
                Caution (Score: 48)
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
              22 mins <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>(2.4 km)</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
              <div>🏮 <b>Lighting:</b> Poor in narrow alleyway segments</div>
              <div>📶 <b>Connectivity:</b> Limited (2.1 km cellular dead zone)</div>
              <div>👥 <b>Crowd:</b> Low / Isolated in evening</div>
            </div>
            <button className={`srg-btn ${selectedRouteType === 'fastest' ? 'srg-btn-primary' : 'srg-btn-outline'} srg-btn-sm`} style={{ width: '100%' }}>
              {selectedRouteType === 'fastest' ? '✓ Currently Selected' : 'Select Route A'}
            </button>
          </div>

          {/* Safer Route Card */}
          <div 
            style={{
              background: 'var(--bg-card-dark)',
              border: `2px solid ${selectedRouteType === 'safer' ? '#10B981' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onClick={() => setSelectedRouteType('safer')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '800', color: '#10B981', fontSize: '1.05rem' }}>Route B (Recommended Safer Route)</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
                Low Risk (Score: 14)
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
              29 mins <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>(3.1 km)</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
              <div>🏮 <b>Lighting:</b> 100% Well-Lit Main Grand Boulevard</div>
              <div>📶 <b>Connectivity:</b> Full continuous 5G / 4G Coverage</div>
              <div>👥 <b>Crowd:</b> Moderate / Active safety kiosks</div>
            </div>
            <button className={`srg-btn ${selectedRouteType === 'safer' ? 'srg-btn-teal' : 'srg-btn-outline'} srg-btn-sm`} style={{ width: '100%' }}>
              {selectedRouteType === 'safer' ? '✓ Currently Selected (Recommended)' : 'Select Route B (Safer)'}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Intelligence Cards: Weather, Connectivity & Official Advisories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Card 1: Weather Conditions */}
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{weather.icon}</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>Weather Conditions</h3>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{weather.lastUpdated}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
              {weather.warningSeverity}
            </span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>
            {weather.temperature}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem' }}>
            {weather.condition} • {weather.windSpeed} • Rain Chance: <b>{weather.precipitationChance}%</b>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#FCD34D' }}>
            ⚠️ <b>Weather Advisory:</b> {weather.warning}
          </div>
        </div>

        {/* Card 2: Connectivity & Signal Dead Zones */}
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>📶</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>Network Connectivity</h3>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{connectivity.lastUpdated}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
              {connectivity.coveragePercent}% Coverage
            </span>
          </div>

          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F59E0B', marginBottom: '0.4rem' }}>
            {connectivity.overallStatus}
          </div>
          <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '1rem', lineHeight: '1.5' }}>
            {connectivity.recommendation}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="srg-btn srg-btn-primary srg-btn-sm" 
              style={{ flex: 1, fontSize: '0.78rem' }}
              onClick={handleDownloadMap}
            >
              {downloadedOfflineMap ? '✓ Maps Saved Offline' : '📥 Download Offline Maps'}
            </button>
            <button 
              className="srg-btn srg-btn-outline srg-btn-sm"
              style={{ fontSize: '0.78rem' }}
              onClick={handleShareTrip}
            >
              🔗 Share Route
            </button>
          </div>
        </div>

        {/* Card 3: Official Safety Advisories */}
        <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🏛️</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>Official Advisories</h3>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Verified Public Feeds (Demo / Simulated)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {advisories.map(adv => (
              <div key={adv.id} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.85rem' }}>{adv.title}</span>
                  <span style={{ fontSize: '0.7rem', color: adv.severity === 'CAUTION' ? '#F59E0B' : '#10B981', fontWeight: '700', textTransform: 'uppercase' }}>
                    {adv.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Source: <b>{adv.source}</b> • {adv.timestamp}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                  {adv.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
