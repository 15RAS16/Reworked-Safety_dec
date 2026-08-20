/**
 * SafeRoute Guardian - Trusted Safe Spots Directory
 * 24/7 verified police check-posts, hospitals, and campus support kiosks.
 */
window.TrustedSafeSpots = function({ riskData = {}, compact = false, onBackToWorkspace }) {
  const [filter, setFilter] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [only247, setOnly247] = React.useState(false);
  const [selectedSpot, setSelectedSpot] = React.useState(null);
  const [modalSpot, setModalSpot] = React.useState(null);
  const [routeReady, setRouteReady] = React.useState(false);
  const [copyFeedback, setCopyFeedback] = React.useState(false);

  const spots = (window.SRG_DATA && window.SRG_DATA.trustedSafeSpots) || (window.MockData && window.MockData.trustedSafeSpots) || [];
  
  const highRisk = riskData && riskData.level && ['HIGH_RISK', 'EMERGENCY'].includes(riskData.level.key);
  const nearestSpot = spots[0] || null;

  const categories = [
    { id: 'All', label: 'All Havens', icon: '📍', count: spots.length },
    { id: 'Medical', label: 'Medical & Trauma', icon: '🏥', count: spots.filter(s => (s.category || '').toLowerCase().includes('medical')).length },
    { id: 'Tourist', label: 'Security & Info', icon: '👮', count: spots.filter(s => (s.category || '').toLowerCase().includes('tourist')).length },
    { id: 'Food & Water', label: 'Hydration & Food', icon: '💧', count: spots.filter(s => (s.category || '').toLowerCase().includes('food') || (s.category || '').toLowerCase().includes('water')).length }
  ];

  const visible = spots.filter(item => {
    // Category filter
    const matchesCategory = filter === 'All' 
      ? true 
      : (item.category || '').toLowerCase().includes(filter.toLowerCase());
    
    // 24/7 filter
    const matches247 = !only247 || item.isOpen247 || (item.status || '').includes('24/7');

    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      item.name.toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query) ||
      (item.support || '').toLowerCase().includes(query) ||
      (item.address && item.address.toLowerCase().includes(query)) ||
      (Array.isArray(item.amenities) && item.amenities.some(a => a.toLowerCase().includes(query)));

    return matchesCategory && matches247 && matchesSearch;
  });

  const startSafeRoute = (spot) => {
    setSelectedSpot(spot);
    setRouteReady(true);
  };

  const handleCopyAddress = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <section className={'srg-safe-spots ' + (compact ? 'compact' : '')}>
      {!compact && onBackToWorkspace && (
        <div className="srg-workspace-topbar" style={{ marginBottom: '1.25rem' }}>
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Tourist Workspace
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
            <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.88rem' }}>
              Verified Safe Havens Network
            </span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="srg-safe-hero-card">
        <div className="srg-safe-hero-main">
          <div className="srg-safe-eyebrow">
            <span className="srg-live-dot-beacon"></span> MARINA BAY VERIFIED SAFETY DIRECTORY
          </div>
          <h2>Trusted Safe Spots & Havens</h2>
          <p>
            {highRisk 
              ? '⚠️ High Risk Detected: Follow the verified safe corridor to reach the nearest security check-post or trauma center immediately.' 
              : 'Official network of 24/7 security kiosks, medical centers, hydration stations, and welfare hubs equipped with emergency landlines and direct CAD response.'}
          </p>
        </div>

        {/* Quick Summary Metrics Grid */}
        <div className="srg-safe-stats-grid">
          <div className="srg-safe-stat-box">
            <span className="srg-stat-num">{spots.length}</span>
            <span className="srg-stat-lbl">Verified Havens</span>
          </div>
          <div className="srg-safe-stat-box highlight-safe">
            <span className="srg-stat-num">{spots.filter(s => s.isOpen247 || (s.status || '').includes('24/7')).length}</span>
            <span className="srg-stat-lbl">24/7 Active</span>
          </div>
          <div className="srg-safe-stat-box highlight-brand">
            <span className="srg-stat-num">{nearestSpot ? nearestSpot.distance : '10 m'}</span>
            <span className="srg-stat-lbl">Nearest Haven</span>
          </div>
        </div>
      </div>

      {/* Route Guidance Banner when a Safe Spot is Selected */}
      {selectedSpot && (
        <div className="srg-safe-nav-banner">
          <div className="srg-nav-banner-icon">{selectedSpot.icon || '📍'}</div>
          <div className="srg-nav-banner-info">
            <div className="srg-nav-banner-title">
              <b>Safe Corridor Route Active:</b> {selectedSpot.name}
            </div>
            <div className="srg-nav-banner-sub">
              <span>📍 {selectedSpot.distance} away</span>
              <span>•</span>
              <span>◷ {selectedSpot.eta || '< 2 mins walk'}</span>
              <span>•</span>
              <span>✓ Continuous LED lighting & CCTV corridor coverage</span>
            </div>
          </div>
          <div className="srg-nav-banner-actions">
            <button 
              type="button" 
              className="srg-btn srg-btn-outline srg-btn-sm"
              onClick={() => setModalSpot(selectedSpot)}
            >
              Spot Details
            </button>
            <button 
              type="button" 
              className="srg-btn srg-btn-primary srg-btn-sm"
              onClick={() => { setSelectedSpot(null); setRouteReady(false); }}
            >
              Clear Route
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="srg-safe-control-bar">
        <div className="srg-safe-search-wrap">
          <span className="srg-search-icon">🔍</span>
          <input
            type="text"
            className="srg-safe-search-input"
            placeholder="Search havens by name, service, or amenity (e.g. CCTV, Doctor, Water, Charging)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="srg-search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="srg-safe-filters-row">
          <div className="srg-safe-category-chips">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={'srg-category-chip ' + (filter === cat.id ? 'active' : '')}
                onClick={() => setFilter(cat.id)}
              >
                <span className="srg-chip-icon">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="srg-chip-count">{cat.count}</span>
              </button>
            ))}
          </div>

          <label className="srg-safe-247-toggle">
            <input 
              type="checkbox" 
              checked={only247} 
              onChange={(e) => setOnly247(e.target.checked)} 
            />
            <span className="srg-toggle-label">24/7 Open Only</span>
          </label>
        </div>
      </div>

      {/* Safe Spots Cards Grid */}
      <div className="srg-safe-cards-grid">
        {visible.map(item => {
          const isSelected = selectedSpot && selectedSpot.id === item.id;
          const isNearest = item === nearestSpot;
          const isHighPriority = (highRisk && isNearest) || isSelected;
          const isOpen = item.isOpen247 || (item.status || '').includes('24/7');

          return (
            <article 
              className={'srg-safe-haven-card ' + (isHighPriority ? 'active-priority ' : '') + (isSelected ? 'selected-route ' : '')}
              key={item.id}
            >
              <div className="srg-haven-card-head">
                <div className="srg-haven-avatar-wrap">
                  <span className="srg-haven-icon">{item.icon || '📍'}</span>
                  {isOpen && <span className="srg-online-indicator" title="Open 24/7"></span>}
                </div>

                <div className="srg-haven-title-area">
                  <div className="srg-haven-badges">
                    <span className="srg-badge-type">{item.typeTag || item.category}</span>
                    <span className={'srg-badge-status ' + (isOpen ? 'status-open-247' : 'status-open-limited')}>
                      {isOpen ? '● 24/7 Open' : `● ${item.status || 'Open'}`}
                    </span>
                  </div>
                  <h3 className="srg-haven-name">{item.name}</h3>
                  <div className="srg-haven-location">
                    📍 {item.address || 'Marina Bay Waterfront Corridor'}
                  </div>
                </div>

                <div className="srg-haven-distance-box">
                  <strong className="srg-dist-val">{item.distance}</strong>
                  <span className="srg-dist-eta">{item.eta || '< 2 mins'}</span>
                </div>
              </div>

              <div className="srg-haven-body">
                <p className="srg-haven-support-text">
                  {item.support}
                </p>

                {item.amenities && Array.isArray(item.amenities) && (
                  <div className="srg-haven-amenities">
                    {item.amenities.slice(0, 4).map((amenity, idx) => (
                      <span key={idx} className="srg-amenity-tag">✓ {amenity}</span>
                    ))}
                    {item.amenities.length > 4 && (
                      <span className="srg-amenity-tag-more">+{item.amenities.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="srg-haven-foot">
                <div className="srg-haven-contact-quick">
                  <a 
                    href={`tel:${(item.phone || '+6567388607').replace(/[^0-9+]/g, '')}`} 
                    className="srg-haven-phone-link"
                    title="Direct Safety Hotline"
                  >
                    📞 {item.phone || '+65 6738 8607'}
                  </a>
                </div>

                <div className="srg-haven-actions">
                  <button
                    type="button"
                    className="srg-btn srg-btn-outline srg-btn-sm"
                    onClick={() => setModalSpot(item)}
                  >
                    Details & Amenities
                  </button>

                  <button
                    type="button"
                    className={'srg-btn srg-btn-sm ' + (isSelected ? 'srg-btn-primary active' : 'srg-btn-primary')}
                    onClick={() => startSafeRoute(item)}
                  >
                    {isSelected ? '✓ Corridor Selected' : '🧭 Navigate Safely'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty Search / Filter Results */}
      {!visible.length && (
        <div className="srg-safe-empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
          <h3>No Safe Spots Found</h3>
          <p>No verified safety havens match "{searchQuery || filter}".</p>
          <button 
            type="button" 
            className="srg-btn srg-btn-outline srg-btn-sm"
            onClick={() => { setSearchQuery(''); setFilter('All'); setOnly247(false); }}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Interactive Safe Spot Details Modal */}
      {modalSpot && (
        <div className="srg-modal-backdrop" onClick={() => setModalSpot(null)}>
          <div className="srg-safe-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="srg-modal-close-btn" onClick={() => setModalSpot(null)}>×</button>

            <div className="srg-modal-header">
              <div className="srg-modal-avatar">{modalSpot.icon || '📍'}</div>
              <div>
                <div className="srg-badge-type">{modalSpot.typeTag || modalSpot.category}</div>
                <h2>{modalSpot.name}</h2>
                <span className="srg-verified-badge">✓ Official Verified Safety Haven</span>
              </div>
            </div>

            <div className="srg-modal-body">
              <div className="srg-modal-info-grid">
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Operating Hours</span>
                  <strong className="srg-cell-value">{modalSpot.operatingHours || modalSpot.status || '24 Hours / 7 Days'}</strong>
                </div>
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Distance & ETA</span>
                  <strong className="srg-cell-value">{modalSpot.distance} • {modalSpot.eta || '< 2 mins'}</strong>
                </div>
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Staff on Duty</span>
                  <strong className="srg-cell-value">{modalSpot.staffOnDuty || 'Campus Security Patrol on Deck'}</strong>
                </div>
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Direct Helpline</span>
                  <strong className="srg-cell-value">
                    <a href={`tel:${modalSpot.phone || '+6567388607'}`} style={{ color: '#38BDF8', textDecoration: 'none' }}>
                      {modalSpot.phone || '+65 6738 8607'}
                    </a>
                  </strong>
                </div>
              </div>

              <div className="srg-modal-section">
                <div className="srg-section-heading">📍 Location & Safe Address</div>
                <div className="srg-address-box">
                  <span>{modalSpot.address || 'Marina Bay Waterfront Promenade'}</span>
                  <button 
                    type="button" 
                    className="srg-copy-btn"
                    onClick={() => handleCopyAddress(modalSpot.address || modalSpot.name)}
                  >
                    {copyFeedback ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="srg-modal-section">
                <div className="srg-section-heading">🛡️ Verified Facilities & Amenities</div>
                <div className="srg-modal-amenities-list">
                  {(modalSpot.amenities || ['Armed Security Guard', 'SOS Emergency Callbox', 'CCTV 360° Coverage', 'Free Wi-Fi Zone', 'Official Maps']).map((amenity, idx) => (
                    <div key={idx} className="srg-amenity-item">
                      <span className="srg-amenity-check">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="srg-modal-section">
                <div className="srg-section-heading">🧭 Corridor Navigation Advisory</div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Access this haven via the designated well-lit waterfront corridor. In emergency situations, pressing the SOS button will alert this station immediately.
                </p>
              </div>
            </div>

            <div className="srg-modal-footer">
              <button 
                type="button" 
                className="srg-btn srg-btn-outline" 
                onClick={() => setModalSpot(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="srg-btn srg-btn-primary" 
                onClick={() => {
                  startSafeRoute(modalSpot);
                  setModalSpot(null);
                }}
              >
                🧭 Set Safe Corridor Route to {modalSpot.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
