/**
 * SafeRoute Guardian - Map Legend Component
 * Displays an accessible, clear legend for route corridors, traveler markers, safe havens, and deviation alerts.
 */

window.MapLegend = function({ corridorWidthMeters = 100, isCompact = false }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={`srg-map-legend-overlay ${collapsed ? 'collapsed' : ''}`}>
      <div className="srg-legend-header">
        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🗺️</span>
          <span>Map Legend</span>
        </span>
        <button
          type="button"
          className="srg-legend-toggle"
          aria-label={collapsed ? 'Expand map legend' : 'Collapse map legend'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '▴' : '▾'}
        </button>
      </div>

      {!collapsed && (
        <div className="srg-legend-items">
          <div className="srg-legend-row">
            <span className="srg-legend-swatch" style={{ background: '#2563EB', height: '4px', width: '22px', borderRadius: '2px' }} />
            <span>Approved Route Line</span>
          </div>

          <div className="srg-legend-row">
            <span className="srg-legend-swatch" style={{ background: 'rgba(56, 189, 248, 0.28)', border: '1px dashed #0284C7', height: '14px', width: '22px', borderRadius: '4px' }} />
            <span>Safe Corridor ({corridorWidthMeters}m Buffer)</span>
          </div>

          <div className="srg-legend-row">
            <span className="srg-legend-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>Traveler (Safe Status)</span>
          </div>

          <div className="srg-legend-row">
            <span className="srg-legend-dot" style={{ background: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
            <span>Traveler (Caution / Off-Route)</span>
          </div>

          <div className="srg-legend-row">
            <span className="srg-legend-dot" style={{ background: '#EF4444', boxShadow: '0 0 10px #EF4444' }} />
            <span>Traveler (Emergency / SOS)</span>
          </div>

          <div className="srg-legend-row">
            <span style={{ fontSize: '1rem' }}>📍</span>
            <span>24/7 Trusted Safe Spot</span>
          </div>

          <div className="srg-legend-row">
            <span style={{ fontSize: '1rem' }}>🤝</span>
            <span>Verified Local Helper</span>
          </div>
        </div>
      )}
    </div>
  );
};
