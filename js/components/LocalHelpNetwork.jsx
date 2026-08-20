/**
 * SafeRoute Guardian — Local Help Network
 * A non-emergency, consent-led channel for verified local assistance around Marina Bay & campus corridors.
 */
window.LocalHelpNetwork = function({
  activeScenario = null,
  onBackToWorkspace,
  onOpenExploreSafely,
  onOpenCommunityReviews,
  onCreateRequest = () => {},
  onUpdateRequest = () => {},
  onTriggerSos = () => {},
  requests = []
}) {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [onlyAvailable, setOnlyAvailable] = React.useState(false);
  const [selectedHelper, setSelectedHelper] = React.useState(null);
  const [profileHelper, setProfileHelper] = React.useState(null);
  const [requestText, setRequestText] = React.useState('');
  const [shareLocation, setShareLocation] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const [radarHoverHelper, setRadarHoverHelper] = React.useState(null);

  const categories = [
    { id: 'All', label: 'All Services', icon: '✨' },
    { id: 'First Aid', label: 'First Aid & Medic', icon: '🏥' },
    { id: 'Safe Escort', label: 'Safe Escort / Walk', icon: '🚶' },
    { id: 'Direction', label: 'Directions & Maps', icon: '🧭' },
    { id: 'Water', label: 'Water & Hydration', icon: '💧' },
    { id: 'Charging', label: 'Phone Charging', icon: '⚡' },
    { id: 'Transport', label: 'Transit / MRT', icon: '🚌' },
    { id: 'Safe Place', label: 'Safe Havens', icon: '🏠' }
  ];

  const presetMessages = [
    { label: '🚶 Walking Escort', text: 'I would like a verified safety escort along the waterfront promenade corridor.' },
    { label: '🧭 Directions', text: 'I need directions to the nearest verified campus/MRT landmark.' },
    { label: '🩹 First Aid', text: 'I need minor first aid assistance (bandage/antiseptic) nearby.' },
    { label: '💧 Drinking Water', text: 'I am looking for the nearest drinking water hydration station.' },
    { label: '⚡ Phone Charging', text: 'My phone battery is low; I need a power bank or charging point.' },
    { label: '🚌 Transit Guidance', text: 'Need assistance navigating Bayfront MRT station and bus connections.' }
  ];

  const helpers = (window.SRG_DATA && window.SRG_DATA.localHelpers) || (window.MockData && window.MockData.localHelpers) || [];
  const destinationName = (activeScenario && activeScenario.destinationName) || 'Marina Bay Waterfront Promenade';

  const visibleHelpers = helpers.filter(helper => {
    // Category filter
    const services = Array.isArray(helper.services) ? helper.services : [];
    const matchesCategory = selectedCategory === 'All' 
      ? true 
      : services.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()));

    // Available filter
    const matchesAvailable = !onlyAvailable || helper.isAvailable !== false;

    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      helper.name.toLowerCase().includes(query) ||
      (helper.role && helper.role.toLowerCase().includes(query)) ||
      (helper.type && helper.type.toLowerCase().includes(query)) ||
      (helper.languages && helper.languages.toLowerCase().includes(query)) ||
      (helper.note && helper.note.toLowerCase().includes(query)) ||
      services.some(s => s.toLowerCase().includes(query));

    return matchesCategory && matchesAvailable && matchesSearch;
  });

  const startRequest = (helper) => {
    if (!helper) return;
    setSelectedHelper(helper);
    const services = Array.isArray(helper.services) ? helper.services : [];
    setRequestText(
      services.includes('First Aid')
        ? 'I need first aid assistance nearby.'
        : services.includes('Safe Escort')
          ? 'I would like a verified safety escort along the promenade.'
          : services.includes('Transport') 
            ? 'I need safe transit assistance across the corridor.' 
            : services.includes('Water') 
              ? 'I need drinking water or a hydration station nearby.' 
              : 'I need directions to the nearest verified landmark.'
    );
    setShareLocation(false);
    setSubmitted(null);
  };

  const submitRequest = () => {
    if (!selectedHelper || !requestText.trim()) return;
    const request = {
      id: 'req-' + Date.now(),
      helperId: selectedHelper.id,
      helperName: selectedHelper.name,
      helperType: selectedHelper.type || selectedHelper.role || 'Volunteer',
      helperAvatar: selectedHelper.avatar || selectedHelper.icon || '👨‍💼',
      helperPhone: selectedHelper.phone || '+65 6738 8607',
      message: requestText.trim(),
      shareLocation: Boolean(shareLocation),
      status: 'REQUEST_SENT',
      createdAt: new Date().toISOString()
    };
    if (typeof onCreateRequest === 'function') {
      onCreateRequest(request);
    }
    setSubmitted(request);
    setSelectedHelper(null);
  };

  const updateStatus = (id, status) => {
    if (typeof onUpdateRequest === 'function') {
      onUpdateRequest(id, { status });
    }
    setNotice(
      status === 'CONTACT_ENDED' 
        ? 'Contact ended. Your shared location is no longer available to this helper.' 
        : status === 'HELP_ON_THE_WAY' 
          ? 'Helper accepted! A safe public meeting point (Illuminated Promenade Kiosk) has been shared.' 
          : status === 'ARRIVED'
            ? 'Helper has arrived at the designated meeting point. Look for official badge.'
            : 'Report received. Our campus safety dispatch will review this helper profile.'
    );
  };

  // Helper coordinate mapping on radar relative to center (You)
  const radarPositions = [
    { top: '35%', left: '68%' },
    { top: '65%', left: '75%' },
    { top: '25%', left: '30%' },
    { top: '70%', left: '28%' }
  ];

  return (
    <div className="srg-local-help-view">
      {/* Top Workspace Bar */}
      <div className="srg-workspace-topbar">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Tourist Workspace
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenExploreSafely}>
            🧭 Explore Safely
          </button>
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenCommunityReviews}>
            ⭐ Community Reviews
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="srg-local-help-hero">
        <div className="srg-local-hero-content">
          <div className="srg-local-eyebrow">
            <span className="srg-live-dot-beacon"></span> VERIFIED PEER & STAFF NETWORK • PRIVATE & EPHEMERAL
          </div>
          <h1>Local Help Network</h1>
          <p>
            Connect with background-checked safety marshals, first responders, and student ambassadors for non-emergency guidance, water points, phone charging, or peer walking escorts.
          </p>

          <div className="srg-local-trust-badges">
            <span className="srg-trust-badge">🔒 Private by Default</span>
            <span className="srg-trust-badge">🛡️ Verified ID & Certifications</span>
            <span className="srg-trust-badge">⚡ ~2 Mins Average Response</span>
            <span className="srg-trust-badge">📍 Near {destinationName}</span>
          </div>
        </div>

        <div className="srg-local-hero-stats">
          <div className="srg-hero-stat-card">
            <span className="srg-hero-stat-val">{helpers.length}</span>
            <span className="srg-hero-stat-lbl">Active Helpers</span>
          </div>
          <div className="srg-hero-stat-card highlight">
            <span className="srg-hero-stat-val">100%</span>
            <span className="srg-hero-stat-lbl">Verified ID</span>
          </div>
        </div>
      </div>

      {/* Safety Protocol Alert */}
      <div className="srg-local-safety-banner">
        <div className="srg-safety-banner-icon">🛡️</div>
        <div className="srg-safety-banner-text">
          <b>Safe Meeting Protocol:</b> Always meet helpers at public, illuminated corridor checkpoints (e.g. Merlion Park Kiosk or MBS Center). For immediate bodily danger or crime, use <b>Emergency SOS</b>.
        </div>
      </div>

      {/* Toast Notification */}
      {notice && (
        <div className="srg-local-toast">
          <span>✓ {notice}</span>
          <button type="button" onClick={() => setNotice(null)}>×</button>
        </div>
      )}

      {/* Confirmation of Sent Request */}
      {submitted && (
        <div className="srg-local-confirm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>✓</span>
            <div>
              <b>Request successfully sent to {submitted.helperName}</b>
              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>
                Status: Awaiting helper response. Your location {submitted.shareLocation ? 'is privately shared.' : 'is kept private.'}
              </div>
            </div>
          </div>
          <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={() => setSubmitted(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="srg-local-layout">
        {/* Left Side: Radar Visualizer, Filters & Helper Cards */}
        <section className="srg-local-main-col">
          {/* Animated Radar Visualizer */}
          <div className="srg-radar-card">
            <div className="srg-radar-head">
              <div className="srg-radar-title">
                <span className="srg-radar-pulse-dot"></span>
                <b>Live Proximity Radar & Corridor Mesh</b>
              </div>
              <span className="srg-radar-sub">4 active safety partners on shift</span>
            </div>

            <div className="srg-radar-screen">
              <div className="srg-radar-sweep"></div>
              <div className="srg-radar-ring ring-1">
                <span className="srg-ring-label">50m</span>
              </div>
              <div className="srg-radar-ring ring-2">
                <span className="srg-ring-label">150m</span>
              </div>
              <div className="srg-radar-ring ring-3">
                <span className="srg-ring-label">250m</span>
              </div>
              <div className="srg-radar-axis-h"></div>
              <div className="srg-radar-axis-v"></div>

              {/* Center User Node */}
              <div className="srg-radar-pin pin-self" title="You (Marina Bay Promenade)">
                <div className="srg-radar-pin-dot self"></div>
                <span className="srg-radar-pin-label">You</span>
              </div>

              {/* Helpers Radar Pins */}
              {helpers.map((h, idx) => {
                const pos = radarPositions[idx % radarPositions.length];
                const isHovered = radarHoverHelper && radarHoverHelper.id === h.id;
                return (
                  <div
                    key={h.id}
                    className={'srg-radar-pin pin-helper ' + (isHovered ? 'active' : '')}
                    style={{ top: pos.top, left: pos.left }}
                    onMouseEnter={() => setRadarHoverHelper(h)}
                    onMouseLeave={() => setRadarHoverHelper(null)}
                    onClick={() => startRequest(h)}
                    title={`${h.name} (${h.type}) - ${h.distance}`}
                  >
                    <div className="srg-radar-pin-dot helper">
                      <span className="srg-radar-pin-icon">{h.avatar || '👨‍💼'}</span>
                    </div>
                    <span className="srg-radar-pin-label">{h.name.split(' ')[0]} ({h.distance})</span>
                  </div>
                );
              })}

              <div className="srg-radar-legend">
                <span><span className="srg-leg-dot self"></span> You</span>
                <span><span className="srg-leg-dot helper"></span> Verified Safety Partners</span>
              </div>
            </div>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="srg-local-controls-card">
            <div className="srg-local-search-wrap">
              <span className="srg-search-icon">🔍</span>
              <input
                type="text"
                className="srg-local-search-input"
                placeholder="Search helpers by name, role, language, or assistance type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="srg-search-clear" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>

            <div className="srg-local-filters-row">
              <div className="srg-local-category-chips">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={'srg-local-chip ' + (selectedCategory === cat.id ? 'active' : '')}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <label className="srg-local-avail-toggle">
                <input 
                  type="checkbox" 
                  checked={onlyAvailable} 
                  onChange={(e) => setOnlyAvailable(e.target.checked)} 
                />
                <span>Available Now</span>
              </label>
            </div>
          </div>

          {/* Helper Results List */}
          <div className="srg-local-results-list">
            {visibleHelpers.map(helper => {
              const services = Array.isArray(helper.services) ? helper.services : [];
              const distance = helper.distance || `${helper.distanceMeters || 120} m`;
              const eta = helper.eta || `${helper.etaMinutes || 2} mins`;
              const languages = Array.isArray(helper.languages) ? helper.languages.join(', ') : (helper.languages || 'English, Mandarin');

              return (
                <article className="srg-helper-card-v2" key={helper.id}>
                  <div className="srg-helper-card-header">
                    <div className="srg-helper-avatar-box">
                      <span className="srg-helper-avatar-icon">{helper.avatar || helper.icon || '👨‍💼'}</span>
                      <span className="srg-helper-online-pulse" title="Active on shift"></span>
                    </div>

                    <div className="srg-helper-identity">
                      <div className="srg-helper-tags-top">
                        <span className="srg-helper-role-pill">✓ {helper.type || helper.role}</span>
                        {helper.badge && <span className="srg-helper-honor-badge">★ {helper.badge}</span>}
                      </div>
                      <h3 className="srg-helper-name">{helper.name}</h3>
                      <div className="srg-helper-telemetry">
                        <span>📍 {distance} away</span>
                        <span>•</span>
                        <span>◷ {eta} arrival</span>
                        <span>•</span>
                        <span>⭐ {helper.rating || 5.0} ({helper.helpCount || 40}+ assists)</span>
                      </div>
                    </div>
                  </div>

                  <div className="srg-helper-card-body">
                    <p className="srg-helper-bio">{helper.note || 'Available to assist campus & waterfront visitors.'}</p>
                    
                    <div className="srg-helper-meta-grid">
                      <div className="srg-meta-item">
                        <span className="srg-meta-lbl">Languages:</span>
                        <span className="srg-meta-val">{languages}</span>
                      </div>
                      <div className="srg-meta-item">
                        <span className="srg-meta-lbl">Status:</span>
                        <span className="srg-meta-val" style={{ color: '#10B981', fontWeight: '700' }}>
                          ● {helper.availability || 'Available Now'}
                        </span>
                      </div>
                    </div>

                    <div className="srg-helper-services-list">
                      {services.map((service, idx) => (
                        <span key={idx} className="srg-service-badge">
                          {service === 'First Aid' ? '🏥' : service === 'Water' ? '💧' : service === 'Safe Escort' ? '🚶' : service === 'Charging' ? '⚡' : '✓'} {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="srg-helper-card-footer">
                    <button
                      type="button"
                      className="srg-btn srg-btn-outline srg-btn-sm"
                      onClick={() => setProfileHelper(helper)}
                    >
                      View Profile & Certs
                    </button>

                    <button
                      type="button"
                      className="srg-btn srg-btn-teal srg-btn-sm"
                      onClick={() => startRequest(helper)}
                    >
                      🤝 Request Assistance
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {!visibleHelpers.length && (
            <div className="srg-local-empty-results">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝</div>
              <h3>No Helpers Found</h3>
              <p>No verified campus helpers match "{searchQuery || selectedCategory}".</p>
              <button 
                type="button" 
                className="srg-btn srg-btn-outline srg-btn-sm"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setOnlyAvailable(false); }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>

        {/* Right Side: My Help Requests & Emergency SOS Card */}
        <aside className="srg-local-side-col">
          {/* Active Help Requests Tracker */}
          <section className="srg-local-requests-panel">
            <div className="srg-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📋</span>
                <h3>My Active Requests</h3>
              </div>
              <span className="srg-request-count-badge">{(requests || []).length}</span>
            </div>
            <p className="srg-panel-desc">
              Track real-time helper dispatches without exposing phone or personal credentials.
            </p>

            {(!requests || requests.length === 0) ? (
              <div className="srg-empty-requests-box">
                <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📭</div>
                <b>No Active Requests</b>
                <p>Select any verified helper on the left to dispatch guidance or assistance.</p>
              </div>
            ) : (
              <div className="srg-requests-feed">
                {requests.slice(0, 4).map(request => {
                  const status = request.status || 'REQUEST_SENT';
                  const isSent = status === 'REQUEST_SENT';
                  const isAccepted = status === 'HELP_ON_THE_WAY';
                  const isArrived = status === 'ARRIVED';
                  const isEnded = status === 'CONTACT_ENDED' || status === 'REPORTED';

                  return (
                    <div className="srg-active-request-card" key={request.id}>
                      <div className="srg-req-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{request.helperAvatar || '👨‍💼'}</span>
                          <div>
                            <b>{request.helperName || 'Campus Helper'}</b>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {request.helperType || 'Volunteer'}
                            </div>
                          </div>
                        </div>

                        <span className={'srg-req-status-pill ' + status.toLowerCase()}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Multi-Step Progress Tracker */}
                      <div className="srg-req-stepper">
                        <div className={'srg-step-node ' + (isSent || isAccepted || isArrived ? 'done' : '')}>
                          <span className="srg-node-dot">1</span>
                          <span className="srg-node-lbl">Sent</span>
                        </div>
                        <div className={'srg-step-line ' + (isAccepted || isArrived ? 'done' : '')}></div>
                        <div className={'srg-step-node ' + (isAccepted || isArrived ? 'done' : '')}>
                          <span className="srg-node-dot">2</span>
                          <span className="srg-node-lbl">En Route</span>
                        </div>
                        <div className={'srg-step-line ' + (isArrived ? 'done' : '')}></div>
                        <div className={'srg-step-node ' + (isArrived ? 'done' : '')}>
                          <span className="srg-node-dot">3</span>
                          <span className="srg-node-lbl">Arrived</span>
                        </div>
                      </div>

                      <div className="srg-req-msg-box">
                        <span className="srg-msg-quote">"{request.message}"</span>
                        <div className="srg-location-sharing-tag">
                          {request.shareLocation ? '📍 Approx. location shared' : '🔒 Location not shared'}
                        </div>
                      </div>

                      {/* Simulation and Management Actions */}
                      <div className="srg-req-controls">
                        {isSent && (
                          <button
                            type="button"
                            className="srg-btn srg-btn-primary srg-btn-sm"
                            style={{ width: '100%', marginBottom: '0.4rem' }}
                            onClick={() => updateStatus(request.id, 'HELP_ON_THE_WAY')}
                          >
                            ⚡ Simulate Helper Acceptance
                          </button>
                        )}

                        {isAccepted && (
                          <button
                            type="button"
                            className="srg-btn srg-btn-teal srg-btn-sm"
                            style={{ width: '100%', marginBottom: '0.4rem' }}
                            onClick={() => updateStatus(request.id, 'ARRIVED')}
                          >
                            📍 Simulate Helper Arrived
                          </button>
                        )}

                        {!isEnded && (
                          <div className="srg-req-subactions">
                            <button 
                              type="button" 
                              className="srg-btn-subaction"
                              onClick={() => updateStatus(request.id, 'CONTACT_ENDED')}
                            >
                              End Contact & Revoke
                            </button>
                            <button 
                              type="button" 
                              className="srg-btn-subaction danger"
                              onClick={() => updateStatus(request.id, 'REPORTED')}
                            >
                              Report Helper
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Urgent Emergency SOS Box */}
          <section className="srg-local-sos-card">
            <div className="srg-sos-card-head">
              <div className="srg-sos-icon">🚨</div>
              <div>
                <h4>Immediate Danger?</h4>
                <p>Emergency SOS directly notifies waterfront security command, police, and contacts.</p>
              </div>
            </div>
            <button
              type="button"
              className="srg-btn srg-btn-emergency"
              style={{ width: '100%', padding: '0.75rem', fontWeight: '800' }}
              onClick={() => onTriggerSos('LOCAL_HELP_URGENT_ASSISTANCE')}
            >
              TRIGGER EMERGENCY SOS
            </button>
          </section>
        </aside>
      </div>

      {/* Request Help Modal */}
      {selectedHelper && (
        <div className="srg-modal-backdrop" onClick={() => setSelectedHelper(null)}>
          <div className="srg-local-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="srg-modal-close-btn" onClick={() => setSelectedHelper(null)}>×</button>

            <div className="srg-modal-header">
              <div className="srg-modal-avatar">{selectedHelper.avatar || selectedHelper.icon || '🤝'}</div>
              <div>
                <span className="srg-badge-type">{selectedHelper.type || selectedHelper.role}</span>
                <h2>Request Help from {selectedHelper.name}</h2>
                <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '700' }}>
                  ✓ Verified ID • {selectedHelper.distance || '120 m'} away • ~{selectedHelper.eta || '2 mins'} ETA
                </div>
              </div>
            </div>

            <div className="srg-modal-body">
              <label className="srg-form-label">
                <b>Choose Quick Assistance Scenario:</b>
              </label>
              <div className="srg-preset-chips-grid">
                {presetMessages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="srg-preset-chip"
                    onClick={() => setRequestText(preset.text)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <label className="srg-form-label" style={{ marginTop: '1rem' }}>
                <b>Describe what assistance you need:</b>
              </label>
              <textarea
                className="srg-local-textarea"
                value={requestText}
                onChange={e => setRequestText(e.target.value)}
                maxLength="240"
                rows="3"
                placeholder="Describe your location or specific assistance needed..."
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                {requestText.length}/240 characters
              </div>

              <label className="srg-location-consent-box">
                <input 
                  type="checkbox" 
                  checked={shareLocation} 
                  onChange={e => setShareLocation(e.target.checked)} 
                />
                <div>
                  <b>Share Approximate GPS Coordinates</b>
                  <p>Keeps your exact location private; sends approximate corridor beacon to this helper only.</p>
                </div>
              </label>

              <div className="srg-safe-meeting-tip">
                💡 <b>Safety Tip:</b> Once accepted, helper will meet you at the nearest illuminated public kiosk.
              </div>
            </div>

            <div className="srg-modal-footer">
              <button type="button" className="srg-btn srg-btn-outline" onClick={() => setSelectedHelper(null)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="srg-btn srg-btn-teal" 
                disabled={!requestText.trim()}
                onClick={submitRequest}
              >
                Send Assistance Request →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Profile & Verification Modal */}
      {profileHelper && (
        <div className="srg-modal-backdrop" onClick={() => setProfileHelper(null)}>
          <div className="srg-local-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="srg-modal-close-btn" onClick={() => setProfileHelper(null)}>×</button>

            <div className="srg-modal-header">
              <div className="srg-modal-avatar">{profileHelper.avatar || '👨‍💼'}</div>
              <div>
                <span className="srg-badge-type">{profileHelper.type || profileHelper.role}</span>
                <h2>{profileHelper.name}</h2>
                <span className="srg-verified-badge">✓ Verified Campus Safety Partner</span>
              </div>
            </div>

            <div className="srg-modal-body">
              <div className="srg-modal-info-grid">
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Trust Rating</span>
                  <strong className="srg-cell-value">⭐ {profileHelper.rating || 5.0} / 5.0</strong>
                </div>
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Completed Assists</span>
                  <strong className="srg-cell-value">{profileHelper.helpCount || 50}+ assists</strong>
                </div>
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Proximity</span>
                  <strong className="srg-cell-value">{profileHelper.distance} ({profileHelper.eta})</strong>
                </div>
                <div className="srg-info-cell">
                  <span className="srg-cell-label">Direct Hotline</span>
                  <strong className="srg-cell-value">{profileHelper.phone || '+65 6738 8607'}</strong>
                </div>
              </div>

              <div className="srg-modal-section">
                <div className="srg-section-heading">🛡️ Verified Safety Certifications</div>
                <div className="srg-modal-amenities-list">
                  {(profileHelper.certifications || ['Campus Safety Protocol', 'First Aid Certified', 'Bilingual Support']).map((cert, idx) => (
                    <div key={idx} className="srg-amenity-item">
                      <span className="srg-amenity-check">✓</span>
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="srg-modal-section">
                <div className="srg-section-heading">💬 Spoken Languages & Bio</div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                  {profileHelper.note}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <b>Fluent in:</b> {Array.isArray(profileHelper.languages) ? profileHelper.languages.join(', ') : profileHelper.languages}
                </div>
              </div>
            </div>

            <div className="srg-modal-footer">
              <button type="button" className="srg-btn srg-btn-outline" onClick={() => setProfileHelper(null)}>
                Close
              </button>
              <button 
                type="button" 
                className="srg-btn srg-btn-teal" 
                onClick={() => {
                  const h = profileHelper;
                  setProfileHelper(null);
                  startRequest(h);
                }}
              >
                🤝 Request Help from {profileHelper.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
