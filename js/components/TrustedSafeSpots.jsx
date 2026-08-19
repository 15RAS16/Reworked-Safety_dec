window.TrustedSafeSpots = function({ riskData = {}, compact = false }) {
  const [filter, setFilter] = React.useState('All');
  const [spot, setSpot] = React.useState(null);
  const spots = window.SRG_DATA.trustedSafeSpots || [];
  const visible = filter === 'All' ? spots : spots.filter(item => item.category === filter);
  const highRisk = riskData.level && ['HIGH_RISK', 'EMERGENCY'].includes(riskData.level.key);
  return <section className={'srg-safe-spots ' + (compact ? 'compact' : '')}>
    <div className="srg-safe-spots-head"><div><span>VERIFIED PUBLIC LOCATIONS</span><h3>Trusted Safe Spots</h3>{highRisk && <p className="srg-safe-urgent">Recommended now: reach the nearest verified safe spot.</p>}</div>{spot && <div className="srg-safe-route-note">✓ Follow the blue safety route to {spot.name}.</div>}</div>
    <div className="srg-safe-spot-filters">{['All','Medical','Police','Food & Water','Transport','Shelter','Charging','Tourist Help'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="srg-safe-spot-list">{visible.map(item => <div className={'srg-safe-spot ' + (highRisk && item.distance === '180 m' ? 'recommended' : '')} key={item.id}><div className="srg-safe-spot-icon">{item.icon}</div><div><b>{item.name}</b><span>✓ Verified · {item.category} · {item.status}</span><small>{item.support}</small></div><div className="srg-safe-spot-action"><strong>{item.distance}</strong><button onClick={() => setSpot(item)}>Navigate safely</button></div></div>)}</div>
  </section>;
};
