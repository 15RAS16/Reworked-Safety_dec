/**
 * SafeRoute Guardian — Local Help Network
 * A non-emergency, consent-led channel for verified local assistance.
 */
window.LocalHelpNetwork = function({ activeScenario, onBackToWorkspace, onOpenExploreSafely, onOpenCommunityReviews, onCreateRequest, onUpdateRequest, requests = [] }) {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [selectedHelper, setSelectedHelper] = React.useState(null);
  const [requestText, setRequestText] = React.useState('');
  const [shareLocation, setShareLocation] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const categories = ['All', 'Food', 'Water', 'Direction', 'Transport', 'Charging', 'First Aid', 'Safe Place', 'Stay'];
  const helpers = window.SRG_DATA.localHelpers || [];
  const visibleHelpers = selectedCategory === 'All' ? helpers : helpers.filter(helper => helper.services.includes(selectedCategory));

  const startRequest = (helper) => {
    setSelectedHelper(helper);
    setRequestText(helper.services.includes('Transport') ? 'I need safe transport to my hotel.' : helper.services.includes('Water') ? 'I need drinking water nearby.' : 'I am lost and need safe directions.');
    setShareLocation(false);
    setSubmitted(null);
  };
  const submitRequest = () => {
    if (!selectedHelper || !requestText.trim()) return;
    const request = { helperId: selectedHelper.id, helperName: selectedHelper.name, helperType: selectedHelper.type, message: requestText.trim(), shareLocation, status: 'REQUEST_SENT' };
    onCreateRequest(request);
    setSubmitted(request);
    setSelectedHelper(null);
  };
  const updateStatus = (id, status) => {
    onUpdateRequest(id, { status });
    setNotice(status === 'CONTACT_ENDED' ? 'Contact ended. Your shared location is no longer available to this helper.' : status === 'HELP_ON_THE_WAY' ? 'Helper accepted. A safe public meeting point has been shared.' : 'Report received. Our safety team will review this helper profile.');
  };

  return <div className="srg-local-help-view">
    <div className="srg-workspace-topbar" style={{ marginBottom: '1.5rem' }}>
      <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>← Back to Tourist Workspace</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
        <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenExploreSafely}>🧭 Explore Safely</button>
        <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenCommunityReviews}>⭐ Community Reviews</button>
      </div>
    </div>

    <div className="srg-local-help-hero">
      <div><span className="srg-local-eyebrow">VERIFIED, NON-EMERGENCY ASSISTANCE</span><h1>Local Help Network</h1><p>Connect with trusted local partners for everyday travel help—without sharing your details unless you choose to.</p></div>
      <div className="srg-local-location">📍 Near {activeScenario.destinationName}<br/><small>Demo location · visible only to you</small></div>
    </div>
    <div className="srg-local-safety-note"><b>Safety first:</b> Meet helpers at public, verified locations. For accommodation, use registered partners only. For immediate danger, use Emergency SOS—not Local Help.</div>
    {notice && <div className="srg-local-toast">✓ {notice}<button onClick={() => setNotice(null)}>×</button></div>}

    <div className="srg-local-layout">
      <section>
        <div className="srg-local-map"><div className="srg-map-street street-a"></div><div className="srg-map-street street-b"></div><div className="srg-map-route">Your safe route</div><div className="srg-map-pin self">You</div><div className="srg-map-pin cafe">☕</div><div className="srg-map-pin taxi">🚕</div><div className="srg-map-pin volunteer">🧭</div><div className="srg-map-pin pharmacy">✚</div><div className="srg-map-key">● You &nbsp; · &nbsp; ● Verified local partners</div></div>
        <div className="srg-local-filter-row">{categories.map(category => <button key={category} type="button" className={'srg-local-filter ' + (selectedCategory === category ? 'active' : '')} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
        <div className="srg-local-results">{visibleHelpers.map(helper => <article className="srg-helper-card" key={helper.id}><div className="srg-helper-icon">{helper.icon}</div><div className="srg-helper-content"><div className="srg-helper-top"><div><h3>{helper.name}</h3><span className="srg-verified">✓ {helper.type}</span></div><b>★ {helper.rating}</b></div><p>{helper.note}</p><div className="srg-helper-meta"><span>📍 {helper.distance}</span><span>◷ {helper.eta}</span><span>💬 {helper.languages}</span></div><div className="srg-service-tags">{helper.services.map(service => <span key={service}>{service}</span>)}</div><div className="srg-helper-actions"><span className="srg-available">● {helper.availability}</span><button className="srg-btn srg-btn-teal srg-btn-sm" onClick={() => startRequest(helper)}>Request help</button></div></div></article>)}</div>
      </section>
      <aside className="srg-local-side">
        <section className="srg-local-request-card"><h2>My help requests</h2><p>Track assistance without exposing personal details by default.</p>{requests.length === 0 ? <div className="srg-empty-request">No active requests yet.<br/>Choose a verified helper to get started.</div> : requests.slice(0, 3).map(request => <div className="srg-request-item" key={request.id}><b>{request.helperName}</b><span className={'srg-request-status ' + request.status.toLowerCase()}>{request.status.replaceAll('_', ' ')}</span><p>{request.message}</p>{request.status === 'REQUEST_SENT' && <button className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => updateStatus(request.id, 'HELP_ON_THE_WAY')}>Simulate helper acceptance</button>}{request.status !== 'CONTACT_ENDED' && <div className="srg-request-actions"><button onClick={() => updateStatus(request.id, 'CONTACT_ENDED')}>End contact</button><button onClick={() => updateStatus(request.id, 'REPORTED')}>Report helper</button></div>}</div>)}</section>
        <section className="srg-local-sos-card"><div><b>Need urgent help?</b><span>Emergency SOS shares your safety alert with your trusted network.</span></div><button className="srg-btn srg-btn-emergency srg-btn-sm" onClick={() => setNotice('Emergency SOS is available from the traveler dashboard.')}>SOS</button></section>
      </aside>
    </div>

    {selectedHelper && <div className="srg-modal-backdrop"><div className="srg-local-modal"><button className="srg-local-close" onClick={() => setSelectedHelper(null)}>×</button><div className="srg-local-modal-icon">{selectedHelper.icon}</div><h2>Request help from {selectedHelper.name}</h2><p className="srg-verified">✓ {selectedHelper.type} · {selectedHelper.distance} away</p><label className="srg-local-label">What do you need?</label><textarea value={requestText} onChange={e => setRequestText(e.target.value)} maxLength="240" placeholder="Describe the help you need..." />
      <label className="srg-location-consent"><input type="checkbox" checked={shareLocation} onChange={e => setShareLocation(e.target.checked)} /><span><b>Share my live location</b><small>Off by default. Your exact location is shared only after you approve.</small></span></label>{selectedHelper.services.includes('Stay') && <div className="srg-stay-warning">For your safety, choose verified stays, meet in public where possible, and share trip details with a trusted contact.</div>}<button className="srg-btn srg-btn-teal" style={{ width: '100%' }} onClick={submitRequest}>Send help request</button></div></div>}
    {submitted && <div className="srg-local-confirm"><b>✓ Request sent to {submitted.helperName}</b><span>Status: Request sent. This demo keeps your contact details private; {submitted.shareLocation ? ' live location sharing was approved.' : ' live location was not shared.'}</span><button onClick={() => setSubmitted(null)}>Dismiss</button></div>}
  </div>;
};
