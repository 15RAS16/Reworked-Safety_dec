/**
 * SafeRoute Guardian - Trusted Safe Spots Directory
 * 24/7 verified police check-posts, hospitals, and campus support kiosks.
 */
window.TrustedSafeSpots = function({ riskData = {}, compact = false, onBackToWorkspace }) {
  const [filter, setFilter] = React.useState('All');
  const [spot, setSpot] = React.useState(null);
  const [routeReady, setRouteReady] = React.useState(false);
  const spots = (window.SRG_DATA && window.SRG_DATA.trustedSafeSpots) || (window.MockData && window.MockData.trustedSafeSpots) || [];
  
  const visible = filter === 'All'
    ? spots
    : spots.filter(item => (item.category || '').toLowerCase().includes(filter.toLowerCase()));

  const highRisk = riskData && riskData.level && ['HIGH_RISK', 'EMERGENCY'].includes(riskData.level.key);

  const categories = ['All', 'Medical', 'Food & Water', 'Tourist'];
  const nearestSpot = spots[0] || null;

  const startSafeRoute = (selectedSpot) => {
    setSpot(selectedSpot);
    setRouteReady(true);
  };

  return (
    <section className={'srg-safe-spots ' + (compact ? 'compact' : '')}>
      {!compact && onBackToWorkspace && (
        <div className="srg-workspace-topbar" style={{ marginBottom: '1.25rem' }}>
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
            ← Back to Tourist Workspace
          </button>
        </div>
      )}

      <div className="srg-safe-spots-head">
        <div>
          <span>MARINA BAY VERIFIED SAFE LOCATIONS</span>
          <h3>Trusted Safe Spots</h3>
          <p>{highRisk ? 'Recommended now: reach the nearest verified safe spot.' : 'Choose a verified place for help, shelter, water, charging, or medical support.'}</p>
        </div>
        <div className="srg-safe-route-note">
          {routeReady && spot ? `✓ Safe route prepared to ${spot.name}.` : nearestSpot ? `Nearest verified point: ${nearestSpot.name} (${nearestSpot.distance})` : 'Verified locations load here.'}
        </div>
      </div>

      <div className="srg-safe-spot-filters">
        {categories.map(item => (
          <button
            key={item}
            type="button"
            className={filter === item ? 'active' : ''}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="srg-safe-spot-list">
        {visible.map(item => (
          <div className={'srg-safe-spot ' + ((spot && spot.id === item.id) || (highRisk && item === nearestSpot) ? 'recommended' : '')} key={item.id}>
            <div className="srg-safe-spot-icon">{item.icon || '📍'}</div>
            <div>
              <b>{item.name}</b>
              <span>✓ Verified · {item.category} · {item.status}</span>
              <small>{item.support}</small>
            </div>
            <div className="srg-safe-spot-action">
              <strong>{item.distance}</strong>
              <button type="button" onClick={() => startSafeRoute(item)}>
                {spot && spot.id === item.id ? 'Route selected' : 'Navigate safely'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!visible.length && (
        <div className="srg-safe-route-note" role="status">No safe spots match this filter. Choose “All” to view every verified location.</div>
      )}

      {spot && !compact && (
        <div className="srg-safe-route-note" role="status" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span><b>{spot.name}</b> · {spot.distance} away · {spot.status}</span>
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={() => { setSpot(null); setRouteReady(false); }}>
            Clear route
          </button>
        </div>
      )}
    </section>
  );
};
