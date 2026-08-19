/**
 * SafeRoute Guardian — Journey Evidence Timeline
 * Chronological audit log of check-ins, route events, deviations, and safe beacons.
 */
window.JourneyTimeline = function({ timeline = [], activeScenario = null, safeBeacon = null }) {
  const travelerName = (activeScenario && activeScenario.travelerName) || 'Traveler';

  const exportSummary = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      traveler: travelerName,
      lastSafeBeacon: safeBeacon,
      events: timeline
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saferoute-audit-${travelerName.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tone = {
    safe: '#10B981',
    warning: '#F59E0B',
    emergency: '#EF4444',
    system: '#94A3B8'
  };

  return (
    <section className="srg-timeline-panel">
      <div className="srg-ai-header">
        <div>
          <h3>Journey Evidence Timeline</h3>
          <p>Audited journey timestamps for {travelerName} (MMU Mullana Campus).</p>
        </div>
        <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" onClick={exportSummary}>
          Export Incident Summary
        </button>
      </div>

      {safeBeacon && (
        <div className="srg-timeline-beacon">
          <b>Latest Safe Beacon</b>
          <span>
            {(safeBeacon.travelerName || travelerName)} · {safeBeacon.networkStatus || 'Strong'} network · battery {safeBeacon.battery || 95}% · {safeBeacon.timestamp ? new Date(safeBeacon.timestamp).toLocaleTimeString() : 'Recent'}
          </span>
        </div>
      )}

      <div className="srg-timeline-list">
        {(!timeline || timeline.length === 0) ? (
          <div className="srg-empty-request">
            No recorded events yet.<br/>Events will log here automatically during journey progression.
          </div>
        ) : (
          timeline.map(event => {
            const eventType = (event.type || 'SYSTEM_EVENT').toString().replace(/_/g, ' ');
            const timeStr = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Just now';
            return (
              <div className="srg-timeline-event" key={event.id || Math.random()}>
                <i style={{ background: tone[event.tone] || tone.system }}></i>
                <div>
                  <b>{eventType}</b>
                  <span>{event.message}</span>
                </div>
                <time>{timeStr}</time>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
