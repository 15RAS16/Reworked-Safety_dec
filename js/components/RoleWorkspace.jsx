/**
 * SafeRoute Guardian - Role Workspace Hub Component
 * Displays dedicated feature cards tailored to the active role and organization permission level.
 */

window.RoleWorkspace = function({
  roleId,
  orgPermission = 'staff',
  onBackToRoles,
  onLaunchFeature,
  activeScenario,
  riskData
}) {
  const roleMeta = (window.SRG_DATA.roles || []).find(r => r.id === roleId) || {
    id: roleId,
    title: 'Workspace',
    icon: '🛡️',
    badge: 'Account Role',
    description: 'Access role-specific safety features and monitoring tools.',
    features: []
  };

  // Determine feature list
  let featureList = roleMeta.features || [];
  if (roleId === 'organization') {
    featureList = orgPermission === 'admin' ? (roleMeta.adminFeatures || []) : (roleMeta.staffFeatures || []);
  }

  const roleTitle = roleId === 'organization'
    ? (orgPermission === 'admin' ? 'Organization Administrator' : 'Organization Staff')
    : roleMeta.title;

  return (
    <div className="srg-workspace-container">
      {/* Top Header & Back Button */}
      <div className="srg-workspace-topbar">
        <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToRoles}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Workspace Selection
        </button>

        <div className="srg-workspace-role-tag">
          <span style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>{roleMeta.icon}</span>
          <span style={{ fontWeight: '700', color: '#FFFFFF' }}>{roleTitle} Workspace</span>
        </div>
      </div>

      {/* Hero Role Summary */}
      <div className="srg-workspace-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="srg-workspace-icon-large">
            <span>{roleMeta.icon}</span>
          </div>
          <div>
            <h1 className="srg-workspace-title">{roleTitle} Hub</h1>
            <p className="srg-workspace-desc">{roleMeta.description}</p>
          </div>
        </div>

        {/* Quick Active Traveler Indicator */}
        {activeScenario && (
          <div className="srg-workspace-active-pill">
            <span>Active Journey:</span>
            <b>{activeScenario.avatar} {activeScenario.travelerName}</b>
            <span style={{ color: '#94A3B8' }}>({activeScenario.routeName})</span>
          </div>
        )}
      </div>

      {/* Section Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>
          Select a Safety Feature or Monitoring Tool
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Click any card below to launch its dedicated monitoring dashboard, intelligence feed, or administration tool.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="srg-feature-cards-grid">
        {featureList.map(feat => (
          <button
            key={feat.id}
            type="button"
            className="srg-feature-card"
            onClick={() => onLaunchFeature(roleId, feat.id)}
            aria-label={`Open ${feat.title}`}
          >
            <div className="srg-feature-card-header">
              <div
                className="srg-feature-icon-box"
                style={{ background: `${feat.color}20`, color: feat.color, borderColor: `${feat.color}40` }}
              >
                <span style={{ fontSize: '1.5rem' }}>{feat.icon}</span>
              </div>
              <span
                className="srg-feature-tag"
                style={{ color: feat.color, borderColor: `${feat.color}40`, background: `${feat.color}15` }}
              >
                {feat.tag}
              </span>
            </div>

            <h3 className="srg-feature-title">{feat.title}</h3>
            <p className="srg-feature-desc">{feat.desc}</p>

            <div className="srg-feature-card-footer">
              <span style={{ color: feat.color, fontWeight: '700', fontSize: '0.85rem' }}>
                Launch Tool →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
