/**
 * SafeRoute Guardian - Trusted Safe Spots Directory
 * 24/7 verified police check-posts, hospitals, and campus support kiosks.
 */
window.TrustedSafeSpots = function({ riskData = {}, compact = false, onBackToWorkspace }) {
  const [filter, setFilter] = React.useState('All');
  const [spot, setSpot] = React.useState(null);
  const spots = (window.SRG_DATA && window.SRG_DATA.trustedSafeSpots) || (window.MockData && window.MockData.trustedSafeSpots) || [];
  
  const visible = filter === 'All'
    ? spots
    : spots.filter(item => (item.category || '').toLowerCase().includes(filter.toLowerCase()));

  const highRisk = riskData && riskData.level && ['HIGH_RISK', 'EMERGENCY'].includes(riskData.level.key);

  const categories = ['All', 'Medical', 'Police', 'Food & Water', 'Transport', 'Shelter', 'Charging', 'Tourist'];

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
          <span>VERIFIED MMU CAMPUS LOCATIONS</span>
          <h3>Trusted Safe Spots</h3>
          {highRisk && <p className="srg-safe-urgent">Recommended now: reach the nearest verified safe spot.</p>}
        </div>
        {spot && <div className="srg-safe-route-note">✓ Follow the illuminated safety corridor to {spot.name}.</div>}
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
          <div className={'srg-safe-spot ' + (highRisk && item.distance === '120 m' ? 'recommended' : '')} key={item.id}>
            <div className="srg-safe-spot-icon">{item.icon || '📍'}</div>
            <div>
              <b>{item.name}</b>
              <span>✓ Verified · {item.category} · {item.status}</span>
              <small>{item.support}</small>
            </div>
            <div className="srg-safe-spot-action">
              <strong>{item.distance}</strong>
              <button type="button" onClick={() => setSpot(item)}>Navigate safely</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
