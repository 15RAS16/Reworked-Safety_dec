/**
 * SafeRoute Guardian — Local Help Network
 * A non-emergency, consent-led channel for verified local assistance around MMU Mullana campus.
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
  const [selectedHelper, setSelectedHelper] = React.useState(null);
  const [requestText, setRequestText] = React.useState('');
  const [shareLocation, setShareLocation] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(null);
  const [notice, setNotice] = React.useState(null);

  const categories = ['All', 'Food', 'Water', 'Direction', 'Transport', 'Charging', 'First Aid', 'Safe Place', 'Stay'];
  const helpers = (window.SRG_DATA && window.SRG_DATA.localHelpers) || (window.MockData && window.MockData.localHelpers) || [];
  
  const destinationName = (activeScenario && activeScenario.destinationName) || 'MMU Mullana Campus';

  const visibleHelpers = selectedCategory === 'All' 
    ? helpers 
    : helpers.filter(helper => {
        const services = Array.isArray(helper.services) ? helper.services : [];
        return services.includes(selectedCategory);
      });

  const startRequest = (helper) => {
    if (!helper) return;
    setSelectedHelper(helper);
    const services = Array.isArray(helper.services) ? helper.services : [];
    setRequestText(
      services.includes('Transport') 
        ? 'I need safe transport / transit assistance across campus.' 
        : services.includes('Water') 
          ? 'I need drinking water or hydration station nearby.' 
          : 'I need directions to the nearest verified campus landmark.'
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
          ? 'Helper accepted. A safe public meeting point has been shared.' 
          : 'Report received. Our campus safety team will review this helper profile.'
    );
  };

  return (
    <div className="srg-local-help-view">
      <div className="srg-workspace-topbar" style={{ marginBottom: '1.5rem' }}>
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          ← Back to Tourist Workspace
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

      <div className="srg-local-help-hero">
        <div>
          <span className="srg-local-eyebrow">VERIFIED, NON-EMERGENCY ASSISTANCE</span>
          <h1>Local Help Network</h1>
          <p>Connect with trusted campus volunteers and staff for everyday guidance—without sharing private details unless you choose to.</p>
        </div>
        <div className="srg-local-location">
          📍 Near {destinationName}<br/>
          <small>Demo location · visible only to you</small>
        </div>
      </div>

      <div className="srg-local-safety-note">
        <b>Safety first:</b> Meet helpers at public, illuminated campus locations. For immediate danger, use Emergency SOS—not Local Help.
      </div>

      {notice && (
        <div className="srg-local-toast">
          <span>✓ {notice}</span>
          <button type="button" onClick={() => setNotice(null)}>×</button>
        </div>
      )}

      <div className="srg-local-layout">
        <section>
          <div className="srg-local-map">
            <div className="srg-map-street street-a"></div>
            <div className="srg-map-street street-b"></div>
            <div className="srg-map-route">Approved MMU Corridor</div>
            <div className="srg-map-pin self">You</div>
            <div className="srg-map-pin cafe">☕</div>
            <div className="srg-map-pin taxi">🚑</div>
            <div className="srg-map-pin volunteer">👨‍💼</div>
            <div className="srg-map-pin pharmacy">🏥</div>
            <div className="srg-map-key">● You &nbsp; · &nbsp; ● Verified Campus Partners</div>
          </div>

          <div className="srg-local-filter-row">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                className={'srg-local-filter ' + (selectedCategory === category ? 'active' : '')}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="srg-local-results">
            {visibleHelpers.map(helper => {
              const services = Array.isArray(helper.services) ? helper.services : [];
              const icon = helper.icon || helper.avatar || '🤝';
              const distance = helper.distance || `${helper.distanceMeters || 120} m`;
              const eta = helper.eta || `${helper.etaMinutes || 2} mins`;
              const languages = Array.isArray(helper.languages) ? helper.languages.join(', ') : (helper.languages || 'English, Hindi');

              return (
                <article className="srg-helper-card" key={helper.id}>
                  <div className="srg-helper-icon">{icon}</div>
                  <div className="srg-helper-content">
                    <div className="srg-helper-top">
                      <div>
                        <h3>{helper.name}</h3>
                        <span className="srg-verified">✓ {helper.type || helper.role || 'Volunteer'}</span>
                      </div>
                      <b>★ {helper.rating || 5.0}</b>
                    </div>
                    <p>{helper.note || 'Available to assist campus visitors.'}</p>
                    <div className="srg-helper-meta">
                      <span>📍 {distance}</span>
                      <span>◷ {eta}</span>
                      <span>💬 {languages}</span>
                    </div>
                    <div className="srg-service-tags">
                      {services.map((service, idx) => (
                        <span key={idx}>{service}</span>
                      ))}
                    </div>
                    <div className="srg-helper-actions">
                      <span className="srg-available">● {helper.availability || 'Available Now'}</span>
                      <button type="button" className="srg-btn srg-btn-teal srg-btn-sm" onClick={() => startRequest(helper)}>
                        Request help
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="srg-local-side">
          <section className="srg-local-request-card">
            <h2>My help requests</h2>
            <p>Track assistance without exposing personal contact details by default.</p>
            {(!requests || requests.length === 0) ? (
              <div className="srg-empty-request">
                No active requests yet.<br/>Choose a verified campus helper to get started.
              </div>
            ) : (
              requests.slice(0, 3).map(request => {
                const statusStr = (request.status || 'PENDING').toString().replace(/_/g, ' ');
                return (
                  <div className="srg-request-item" key={request.id}>
                    <b>{request.helperName || 'Campus Helper'}</b>
                    <span className={'srg-request-status ' + (request.status || '').toLowerCase()}>{statusStr}</span>
                    <p>{request.message}</p>
                    {request.status === 'REQUEST_SENT' && (
                      <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => updateStatus(request.id, 'HELP_ON_THE_WAY')}>
                        Simulate helper acceptance
                      </button>
                    )}
                    {request.status !== 'CONTACT_ENDED' && (
                      <div className="srg-request-actions">
                        <button type="button" onClick={() => updateStatus(request.id, 'CONTACT_ENDED')}>End contact</button>
                        <button type="button" onClick={() => updateStatus(request.id, 'REPORTED')}>Report helper</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          <section className="srg-local-sos-card">
            <div>
              <b>Need urgent help?</b>
              <span>Emergency SOS alerts campus security and your trusted contacts immediately.</span>
            </div>
            <button type="button" className="srg-btn srg-btn-emergency srg-btn-sm" onClick={() => onTriggerSos('LOCAL_HELP_URGENT_ASSISTANCE')}>
              SOS
            </button>
          </section>
        </aside>
      </div>

      {selectedHelper && (
        <div className="srg-modal-backdrop" onClick={() => setSelectedHelper(null)}>
          <div className="srg-local-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="srg-local-close" onClick={() => setSelectedHelper(null)}>×</button>
            <div className="srg-local-modal-icon">{selectedHelper.icon || selectedHelper.avatar || '🤝'}</div>
            <h2>Request help from {selectedHelper.name}</h2>
            <p className="srg-verified">✓ {selectedHelper.type || selectedHelper.role} · {selectedHelper.distance || 'Near'} away</p>
            <label className="srg-local-label">What do you need assistance with?</label>
            <textarea
              value={requestText}
              onChange={e => setRequestText(e.target.value)}
              maxLength="240"
              placeholder="Describe what help you need..."
            />
            <label className="srg-location-consent">
              <input type="checkbox" checked={shareLocation} onChange={e => setShareLocation(e.target.checked)} />
              <span>
                <b>Share my approximate location</b>
                <small>Off by default. Shared only with this verified helper.</small>
              </span>
            </label>
            <button type="button" className="srg-btn srg-btn-teal" style={{ width: '100%' }} onClick={submitRequest}>
              Send help request
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="srg-local-confirm">
          <b>✓ Request sent to {submitted.helperName}</b>
          <span>Status: Request sent. Your details remain private; {submitted.shareLocation ? ' location sharing was enabled.' : ' location was not shared.'}</span>
          <button type="button" onClick={() => setSubmitted(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
};
