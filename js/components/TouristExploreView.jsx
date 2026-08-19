/**
 * SafeRoute Guardian - Tourist Explore Safely AI Intelligence Hub
 * Destination safety score, weather warnings, cellular dead-zone intelligence,
 * fastest vs safer route comparison, community reviews, and safe havens for MMU Mullana.
 */

window.TouristExploreView = function({
  onBackToWorkspace,
  activeScenario,
  onOpenSafeSpots,
  onOpenCommunityReviews,
  onOpenLocalHelp,
  onStartLiveJourney,
  onCompareRoutes,
  selectedRouteType = 'safer'
}) {
  const [activeRoute, setActiveRoute] = React.useState(selectedRouteType); // 'safer' | 'fastest'
  const destination = ((window.SRG_DATA && window.SRG_DATA.touristDestinations) || (window.MockData && window.MockData.touristDestinations) || [])[0] || {
    id: 'dest-mmu-campus',
    name: 'MMU Mullana University Campus Corridor',
    country: 'India (Ambala, Haryana)',
    description: 'Expansive multidisciplinary university campus featuring continuous LED safety illumination, integrated security check-posts, 24/7 super-speciality hospital, and pedestrian-only academic corridors.',
    safetyScore: 95,
    weather: {
      condition: 'Clear & Pleasant',
      temp: '28°C (82°F)',
      advisory: 'Optimal visibility conditions throughout the designated walking corridor with active campus safety patrols.'
    },
    deadZones: [
      {
        name: 'Outer Sports Ground Sector',
        notes: 'Brief 25m cellular fluctuation near sports boundary trees. Automatic Safe Beacon pre-caches GPS coordinates.'
      }
    ]
  };

  return (
    <div className="srg-tourist-view">
      {/* Top Workspace Bar */}
      <div className="srg-workspace-topbar">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Workspace
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🏛️</span>
          <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.9rem' }}>
            Explore Safely Intelligence
          </span>
        </div>
      </div>

      {/* Destination Hero Card */}
      <div className="srg-destination-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.2rem' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: '800', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              CAMPUS & VISITOR SAFETY INTELLIGENCE • {destination.country.toUpperCase()}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
              {destination.name}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: '1.5' }}>
              {destination.description}
            </p>
          </div>

          <div style={{ background: '#0F172A90', border: '1px solid #38BDF850', borderRadius: '16px', padding: '1rem 1.4rem', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.05em' }}>
              CAMPUS SAFETY INDEX
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#10B981', lineHeight: '1.1', margin: '0.2rem 0' }}>
              {destination.safetyScore}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700' }}>
              ✓ Verified Safe Campus Corridor
            </div>
          </div>
        </div>
      </div>

      {/* Fastest vs Safer Route Comparison Card */}
      <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>
              ⚡ Fastest vs 🛡️ Safer Route Comparison
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8' }}>
              AI evaluates corridor lighting, security check-posts, and CCTV surveillance.
            </p>
          </div>

          <button
            type="button"
            className="srg-btn srg-btn-primary srg-btn-sm"
            onClick={() => onStartLiveJourney(activeRoute)}
          >
            Start Journey with {activeRoute === 'safer' ? 'Safer' : 'Fastest'} Route →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
          {/* Safer Route Card */}
          <div
            style={{
              background: activeRoute === 'safer' ? 'rgba(16, 185, 129, 0.1)' : '#0F172A',
              border: `2px solid ${activeRoute === 'safer' ? '#10B981' : '#1E293B'}`,
              borderRadius: '14px',
              padding: '1.2rem',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => setActiveRoute('safer')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.74rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#10B98125', color: '#10B981', fontWeight: '800' }}>
                🛡️ RECOMMENDED BY GUARDIAN
              </span>
              <b style={{ color: '#10B981', fontSize: '0.88rem' }}>Safety Score: 95/100</b>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>
              Main Academic Boulevard (Well-Lit)
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.8rem' }}>
              14 mins • 900 m • +2 mins vs fastest
            </div>

            <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.78rem', color: '#CBD5E1' }}>
              <div>✓ 100% continuous high-illumination LED street lighting</div>
              <div>✓ 3 verified 24/7 security booths & central library helpdesk</div>
              <div>✓ Active student foot traffic & campus emergency callboxes</div>
            </div>
          </div>

          {/* Fastest Route Card */}
          <div
            style={{
              background: activeRoute === 'fastest' ? 'rgba(56, 189, 248, 0.1)' : '#0F172A',
              border: `2px solid ${activeRoute === 'fastest' ? '#38BDF8' : '#1E293B'}`,
              borderRadius: '14px',
              padding: '1.2rem',
              cursor: 'pointer'
            }}
            onClick={() => setActiveRoute('fastest')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.74rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#38BDF825', color: '#38BDF8', fontWeight: '800' }}>
                ⚡ DIRECT COMMUTE
              </span>
              <b style={{ color: '#F59E0B', fontSize: '0.88rem' }}>Safety Score: 72/100</b>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>
              Outer Sports Field Perimeter Pathway
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.8rem' }}>
              12 mins • 750 m • Saves 2 minutes
            </div>

            <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.78rem', color: '#CBD5E1' }}>
              <div>⚠️ Partial tree canopy shadows after 20:00</div>
              <div>⚠️ 1 cellular dead-zone near sports boundary trees</div>
              <div>✓ Shortest walking distance between Main Gate and Hostels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Weather & Dead-Zone Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Weather Intelligence Card */}
        <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🌤️</span>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>Weather & Visibility Advisory</h4>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{destination.weather.condition} • {destination.weather.temp}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.45', marginBottom: '0.8rem' }}>
            {destination.weather.advisory}
          </p>
          <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '700' }}>
            Sunset: 19:10 • Clear visibility on all academic paths
          </div>
        </div>

        {/* Connectivity Dead-Zone Card */}
        <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📡</span>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>Cellular Dead-Zone Intel</h4>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Safe Beacon Pre-Cache Active</span>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.45', marginBottom: '0.8rem' }}>
            {destination.deadZones[0] ? `Caution near ${destination.deadZones[0].name}: ${destination.deadZones[0].notes}` : 'Continuous campus 5G coverage on main corridors.'}
          </p>
          <div style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: '700' }}>
            Auto-Beacon will save your coordinates upon entry.
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <button
          type="button"
          className="srg-role-card"
          onClick={onOpenSafeSpots}
          style={{ textAlign: 'left', padding: '1.2rem' }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📍</div>
          <b style={{ color: '#FFFFFF', fontSize: '0.95rem', display: 'block' }}>Trusted Safe Spots</b>
          <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            24/7 verified MMU security posts, hospital emergency, and student helpdesks.
          </p>
        </button>

        <button
          type="button"
          className="srg-role-card"
          onClick={onOpenCommunityReviews}
          style={{ textAlign: 'left', padding: '1.2rem' }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⭐</div>
          <b style={{ color: '#FFFFFF', fontSize: '0.95rem', display: 'block' }}>Community Reviews</b>
          <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            Read verified campus student and faculty reviews.
          </p>
        </button>

        <button
          type="button"
          className="srg-role-card"
          onClick={onOpenLocalHelp}
          style={{ textAlign: 'left', padding: '1.2rem' }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🤝</div>
          <b style={{ color: '#FFFFFF', fontSize: '0.95rem', display: 'block' }}>Local Help Network</b>
          <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            Request student safety volunteers or medical dispatch escort.
          </p>
        </button>
      </div>
    </div>
  );
};
